import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { message: "Email dan password diperlukan (minimal 6 karakter)." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email sudah terdaftar." },
        { status: 409 }
      );
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
      },
    });

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({ user: userWithoutPassword }, { status: 201 });
  } catch (error) {
    console.error("REGISTRATION_ERROR", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal." },
      { status: 500 }
    );
  }
}