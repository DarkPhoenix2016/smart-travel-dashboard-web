import connectDB from "@/lib/db";
import User from "@/models/User";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account.provider === "google") {
        const { name, email, image } = user;
        try {
          await connectDB();
          // Check if user exists, if not create them
          const userExists = await User.findOne({ email });

          if (!userExists) {
            await User.create({
              name,
              email,
              profileImage: image,
              googleId: account.providerAccountId,
            });
          }
          return true;
        } catch (error) {
          console.log("Error checking if user exists: ", error);
          return false;
        }
      }
      return true;
    },
    async session({ session }) {
      // Add user ID from MongoDB to the session so we can use it in the frontend
      const sessionUser = await User.findOne({ email: session.user.email });
      if (sessionUser) {
        session.user.id = sessionUser._id.toString();
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

