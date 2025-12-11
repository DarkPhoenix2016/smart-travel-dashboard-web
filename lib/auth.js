import { google } from "googleapis"

export const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL,
)

export function getAuthUrl() {
  const scopes = ["https://www.googleapis.com/auth/userinfo.email", "https://www.googleapis.com/auth/userinfo.profile"]

  const url = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: scopes,
  })

  return url
}

export async function getTokenFromCode(code) {
  try {
    const { tokens } = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    return tokens
  } catch (error) {
    console.error("Error getting token from code:", error)
    throw error
  }
}

export async function getUserInfo(tokens) {
  try {
    oauth2Client.setCredentials(tokens)
    const people = google.people({ version: "v1", auth: oauth2Client })
    const response = await people.people.get({
      resourceName: "people/me",
      personFields: "emailAddresses,names,photos",
    })

    const email = response.data.emailAddresses?.[0]?.value
    const name = response.data.names?.[0]?.displayName || "User"
    const profileImage = response.data.photos?.[0]?.url
    const googleId = response.data.resourceName?.split("/")?.[1]

    return {
      email,
      name,
      profileImage,
      googleId,
    }
  } catch (error) {
    console.error("Error getting user info:", error)
    throw error
  }
}
