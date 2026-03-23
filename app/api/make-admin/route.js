import { NextResponse } from "next/server";
import mongoose from "mongoose";

export async function GET(request) {
  // Remove this route immediately after using it!
  const secret = request.nextUrl.searchParams.get("secret");
  if (secret !== "your-temp-secret-123") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await mongoose.connect(process.env.MONGODB_URI);
  
  const result = await mongoose.connection.db
    .collection("users")
    .updateOne(
      { email: ".com" },
      { $set: { role: "admin", isAdmin: true } }
    );

  return NextResponse.json({ result });
}