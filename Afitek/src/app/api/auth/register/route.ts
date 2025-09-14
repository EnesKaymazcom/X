import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  try {
    const { companyName, name, email, password } = await request.json()

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Bu email zaten kayıtlı" },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create tenant and user
    const tenant = await prisma.tenant.create({
      data: {
        name: companyName,
        users: {
          create: {
            email,
            password: hashedPassword,
            name,
            role: "admin",
          },
        },
      },
      include: {
        users: true,
      },
    })

    return NextResponse.json({
      message: "Kayıt başarılı",
      tenantId: tenant.id,
      userId: tenant.users[0].id,
    })
  } catch (error) {
    console.error("Register error:", error)
    return NextResponse.json(
      { error: "Kayıt sırasında hata oluştu" },
      { status: 500 }
    )
  }
}