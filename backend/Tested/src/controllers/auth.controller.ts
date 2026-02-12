import { Request, Response } from "express";
import { z } from "zod";
import { ok, fail } from "../utils/apiResponse";
import { createOtp, verifyOtp as verifyOtpSvc } from "../services/otpService";
import { DevConsoleEmailProvider } from "../services/emailProvider";
import { User } from "../models/User";
import { RefreshToken } from "../models/RefreshToken";
import { signAccessToken, signRefreshToken, hashToken, verifyToken, compareToken } from "../services/authTokens";
import { env } from "../config/env";

const emailProvider = new DevConsoleEmailProvider();

const RequestOtpSchema = z.object({ email: z.string().email() });
const VerifyOtpSchema = z.object({ email: z.string().email(), otp: z.string().min(6).max(6) });

function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie("refresh_token", refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: env.COOKIE_SECURE,
    path: "/v1/auth",
    maxAge: env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000
  });
}

export async function requestOtp(req: Request, res: Response) {
  const parsed = RequestOtpSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(fail("VALIDATION", "Invalid email", parsed.error.flatten()));

  const { email } = parsed.data;
  const otp = await createOtp(email, req.ip);

  await emailProvider.sendOtp(email, otp);
  return res.json(ok({ message: "OTP sent" }));
}

export async function verifyOtp(req: Request, res: Response) {
  const parsed = VerifyOtpSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(fail("VALIDATION", "Invalid payload", parsed.error.flatten()));

  const { email, otp } = parsed.data;

  const result = await verifyOtpSvc(email, otp);
  if (!result.ok) return res.status(401).json(fail(result.reason, "OTP verification failed", result));

  let user = await User.findOne({ email });
  if (!user) user = await User.create({ email, role: "learner" });

  const accessToken = signAccessToken({ sub: String(user._id), role: user.role });
  const refreshToken = signRefreshToken({ sub: String(user._id), role: user.role });

  const tokenHash = await hashToken(refreshToken);
  await RefreshToken.create({
    userId: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
    createdIp: req.ip,
    userAgent: req.get("user-agent")
  });

  setRefreshCookie(res, refreshToken);

  return res.json(
    ok({
      accessToken,
      user: {
        id: String(user._id),
        email: user.email,
        role: user.role,
        profileComplete: user.profileComplete
      }
    })
  );
}

export async function refresh(req: Request, res: Response) {
  const token = req.cookies?.refresh_token;
  if (!token) return res.status(401).json(fail("NO_REFRESH", "Missing refresh token"));

  let decoded: { sub: string; role: string };
  try {
    decoded = verifyToken(token);
  } catch {
    return res.status(401).json(fail("INVALID_REFRESH", "Invalid refresh token"));
  }

  const sessions = await RefreshToken.find({ userId: decoded.sub, revokedAt: null });
  const matching = await (async () => {
    for (const s of sessions) {
      const okMatch = await compareToken(token, s.tokenHash);
      if (okMatch) return s;
    }
    return null;
  })();

  if (!matching) {
    await RefreshToken.updateMany({ userId: decoded.sub }, { revokedAt: new Date() });
    return res.status(401).json(fail("REFRESH_REUSE", "Refresh token reuse detected"));
  }

  matching.revokedAt = new Date();
  await matching.save();

  const newRefresh = signRefreshToken({ sub: decoded.sub, role: decoded.role });
  const newHash = await hashToken(newRefresh);
  await RefreshToken.create({
    userId: decoded.sub,
    tokenHash: newHash,
    expiresAt: new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000),
    createdIp: req.ip,
    userAgent: req.get("user-agent")
  });

  setRefreshCookie(res, newRefresh);

  const accessToken = signAccessToken({ sub: decoded.sub, role: decoded.role });
  return res.json(ok({ accessToken }));
}

export async function logout(req: Request, res: Response) {
  const token = req.cookies?.refresh_token;
  if (token) {
    const sessions = await RefreshToken.find({ revokedAt: null });
    for (const s of sessions) {
      const okMatch = await compareToken(token, s.tokenHash);
      if (okMatch) {
        s.revokedAt = new Date();
        await s.save();
        break;
      }
    }
  }

  res.clearCookie("refresh_token", { path: "/v1/auth" });
  return res.json(ok({ message: "Logged out" }));
}
