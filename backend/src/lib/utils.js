import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

export const generateToken = (userId, res) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
    httpOnly: true, // Prevent client-side JS access
    sameSite: "strict", // Prevent CSRF
    secure: process.env.NODE_ENV === "production", // HTTPS only in prod
  });

  return token;
};
