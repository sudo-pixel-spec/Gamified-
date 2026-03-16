"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyGoogleCredential = verifyGoogleCredential;
const google_auth_library_1 = require("google-auth-library");
let client = null;
function getClient() {
    if (!client)
        client = new google_auth_library_1.OAuth2Client();
    return client;
}
async function verifyGoogleCredential(idToken) {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (!googleClientId)
        throw new Error("Missing env: GOOGLE_CLIENT_ID");
    const ticket = await getClient().verifyIdToken({
        idToken,
        audience: googleClientId
    });
    const payload = ticket.getPayload();
    if (!payload)
        throw new Error("Invalid Google token payload");
    return {
        sub: payload.sub,
        email: payload.email,
        emailVerified: payload.email_verified,
        name: payload.name,
        picture: payload.picture
    };
}