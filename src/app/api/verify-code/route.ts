import dbConnect from "@/app/lib/dbConnect";
import UserModel from "@/app/model/User";
import { NextResponse } from "next/server";
// import {z} from "zod";
// import {usernameValidation} from "@/app/schemas/signUpSchema"

// const UsernameQuerySchema = z.object({
//     username: usernameValidation
// })

export async function POST(request: Request){
    await dbConnect()

    try {
        const {username, code} = await request.json()

        const decodedUsername = decodeURIComponent(username)
        const user = await UserModel.findOne({username: decodedUsername})

        if(!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found"
                },
                {
                    status : 500
                }
            )
        }

        const isCodeValid = user.verifyCode === code
        const isCodeNotExpried = new Date(user.verifyCodeExpiry) > new Date()

        if(isCodeNotExpried && isCodeValid){
            user.isVerified = true
            await user.save()

            return NextResponse.json(
                {
                    success: true,
                    message: "Account verified successfully"
                },
                {
                    status : 200
                }
            )
        }

        else if(!isCodeNotExpried){
            return NextResponse.json(
                {
                    success: false,
                    message: "Verification code has expired, please signup to get a new code"
                },
                {
                    status : 400
                }
            )
        }

        else{
            return NextResponse.json(
                {
                    success: false,
                    message: "Incorrect Verification code"
                },
                {
                    status : 400
                }
            )
        }

    } catch (error) {
        console.error("Error verifing username", error)
        return NextResponse.json(
            {
                success: false,
                message: "Error verifing username"
            },
            {
                status : 500
            }
        )
    }
}