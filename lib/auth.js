import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import jwt from "jsonwebtoken";

export async function getAuthenticatedUser(request) {
  // 1. Try next-auth session first
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      return { userId: session.user.id };
    }
  } catch (error) {
    console.error("Auth helper: next-auth check failed:", error);
  }

  // 2. Fallback to custom JWT token cookie
  try {
    const token = request.cookies.get("token")?.value;
    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret");
      if (decoded?.userId) {
        return { userId: decoded.userId };
      }
    }
  } catch (error) {
    console.error("Auth helper: custom token check failed:", error);
  }

  return null;
}
