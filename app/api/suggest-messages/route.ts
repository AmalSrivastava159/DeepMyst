import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Set up Gemini API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: What's a hobby you've recently started? ||If you could have dinner with any historical figure, who would it be?|| What's a simple thing that makes you happy? Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    // Create model instance
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Get response from Gemini
    const result = await model.generateContent(prompt);
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        { name: error.name, message: error.message },
        { status: 500 }
      );
    } else {
      console.error("An unexpected error occurred", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
  }
}