import { NextAuthOptions } from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials"

import bcrypt from "bcryptjs"

import dbConnect from "../../../lib/dbConnect";

import UserModel from "../../../model/User";
import Email from "next-auth/providers/email";


export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "example@example.com" }, // ✅ Added placeholder for better UX
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<any> {
        // ✅ Ensure credentials are provided before proceeding
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        await dbConnect(); // ✅ Ensure database connection before querying

        try {
          const user = await UserModel.findOne({ email: credentials.email });
          if (!user) {
            throw new Error("No user found with this email"); // ✅ More descriptive error message
          }

          if (!user.isVerified) {
            throw new Error("Please verify your account before logging in");
          }

          const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password);
          if (!isPasswordCorrect) {
            throw new Error("Incorrect password");
          }

          return user;
        } catch (error: any) {
          console.error("Authorization Error:", error.message); // ✅ Logs error message for debugging
          throw new Error("Authentication failed"); // ✅ Prevents exposing internal errors to the user
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token._id = user._id?.toString();
        token.isVerified = user.isVerified;
        token.isAcceptingMessages = user.isAcceptingMessages;
        token.username = user.username;
      }
      return token;
    },

    async session({ session, token }) {
      if (!session.user) {
        session.user = {} as any; // ✅ Ensures session.user is always defined
      }

      // ✅ Ensuring token properties are correctly mapped to the session
      session.user._id = token._id;
      session.user.isVerified = token.isVerified;
      session.user.isAcceptingMessages = token.isAcceptingMessages;
      session.user.username = token.username;

      return session;
    },
  },

  pages: {
    signIn: "/sign-in", // ✅ Defines the custom sign-in page
  },

  session: {
    strategy: "jwt", // ✅ Uses JWT strategy for session management
  },

  secret: process.env.NEXTAUTH_SECRET, // ✅ Reads secret from environment variables
};