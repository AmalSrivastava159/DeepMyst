import { NextAuthOptions } from "next-auth";

import CredentialsProvider from "next-auth/providers/credentials"

import bcrypt from "bcryptjs"

import dbConnect from "@/app/lib/dbConnect";

import UserModel from "@/app/model/User";
import Email from "next-auth/providers/email";

export const authOptions: NextAuthOptions = {
    providers: [
      CredentialsProvider({
        id: "credentials",
        name: "credentials",
        credentials: {
          email: { label: "Email", type: "text" },
          password: { label: "password", type: "password" },
        },
        async authorize(credentials: any): Promise<any> {
          await dbConnect()
          try {
            // const user = await UserModel.findOne({
            //     $or: [
            //         {email: credentials.identifier},
            //         {username: credentials.identifier}

            //     ]
            // })
            const user = await UserModel.findOne({ email: credentials.email });
            if(!user){
                throw new Error('No user found with this email')
            }

            if(!user.isVerified) {
                throw new Error('Please verify your account before login')
            }
            const isPasswordCorrect = await bcrypt.compare(credentials.password, user.password)
            if(isPasswordCorrect){
                return user
            } else {
                throw new Error('Incorrect Password')
            }

          } catch (err: any) {
            throw new Error(err)
          }
        },
      }),
    ],
    callbacks :{
        async jwt({ token, user}) {
            if(user){
                token._id = user._id?.toString()
                token.isVerified = user.isVerified;
                token.isAcceptingMessages = user.isAcceptingMessages;
                token.username = user.username
            }

            return token
        },
        async session({ session, token}) {
        //     if(token) {
        //         session.user._id = token._id
        //         session.user.isVerified = token.isVerified
        //         session.user.isAcceptingMessages = token.isAcceptingMessages
        //         session.user.username = token.username
        //     }
                if (!session.user) {
                    session.user = {} as any; // Ensure session.user is defined
                }
            
                session.user._id = token._id;
                session.user.isVerified = token.isVerified;
                session.user.isAcceptingMessages = token.isAcceptingMessages;
                session.user.username = token.username;
            return session
        },
    },
    pages:{
        signIn: '/sign-in',
    },
    session:{
        strategy: "jwt"
    },
    secret: process.env.NEXTAUTH_SECRET,
  };
  