import { NextResponse } from "next/server"
import connectDB from "@/lib/db"
import User from "@/models/User"
import { getTokenFromCode, getUserInfo } from "@/lib/auth"

export async function GET(request) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login?error=no_code", request.nextUrl))
  }

  try {
    await connectDB()

    // Get tokens from authorization code
    const tokens = await getTokenFromCode(code)

    // Get user info from Google
    const userInfo = await getUserInfo(tokens)

    // Find or create user
    let user = await User.findOne({ email: userInfo.email })

    if (!user) {
      user = await User.create({
        email: userInfo.email,
        name: userInfo.name,
        googleId: userInfo.googleId,
        profileImage: userInfo.profileImage,
      })
    } else {
      // Update existing user with Google info
      user.googleId = userInfo.googleId
      user.profileImage = userInfo.profileImage
      await user.save()
    }

    // Create session - in production, use proper session management
    const response = NextResponse.redirect(new URL("/dashboard", request.nextUrl))
    response.cookies.set("user_id", user._id.toString(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return response
  } catch (error) {
    console.error("Auth callback error:", error)
    return NextResponse.redirect(new URL("/auth/login?error=auth_failed", request.nextUrl))
  }
}
