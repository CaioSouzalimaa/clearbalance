import { NextResponse } from "next/server";

import { DuplicateEmailError, registerUser } from "@/src/services/auth/register";

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const result = await registerUser(body);
    if (!result.success) {
      return NextResponse.json(
        { message: "Invalid input", errors: result.error.flatten() },
        { status: 400 }
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      return NextResponse.json(
        { message: "Email already in use" },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { message: "Unable to register user" },
      { status: 500 }
    );
  }
}
