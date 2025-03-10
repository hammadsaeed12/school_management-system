import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Log the incoming payload
    console.log("Received payload:", data);

    // Validate required fields
    const requiredFields = ["username", "name", "surname", "birthday", "classId"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate the birthday field
    const birthday = new Date(data.birthday);
    if (isNaN(birthday.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid date format for birthday" },
        { status: 400 }
      );
    }

    // Check class capacity
    const classItem = await prisma.class.findUnique({
      where: { id: data.classId },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity <= classItem._count.students) {
      return NextResponse.json(
        { success: false, error: "Class is full" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create the student in the database
    const student = await prisma.student.create({
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: birthday,
        classId: data.classId,
        parentId: data.parentId || null,
      },
    });

    // Create a user in the User table
    await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        role: "student",
        studentId: student.id,
      },
    });

    return NextResponse.json({ success: true, id: student.id });
  } catch (err) {
    console.error("Error creating student:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const data = await req.json();
    
    // Log the incoming payload
    console.log("API received PUT payload:", JSON.stringify(data, null, 2));

    // Validate required fields
    if (!data.id) {
      return NextResponse.json(
        { success: false, error: "Missing student ID" },
        { status: 400 }
      );
    }

    // Update the student in the database
    await prisma.student.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address,
        img: data.img || null,
        bloodType: data.bloodType,
        sex: data.sex,
        birthday: new Date(data.birthday),
        classId: data.classId,
        parentId: data.parentId || null,
      },
    });

    // Find the user associated with this student
    const user = await prisma.user.findFirst({
      where: { studentId: data.id }
    });

    if (user) {
      // If password is provided, update it in the User table
      if (data.password && data.password !== "") {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        await prisma.user.update({
          where: { id: user.id }, // Use the user's ID for the update
          data: { 
            username: data.username,
            password: hashedPassword 
          },
        });
      } else {
        // Just update the username if no password provided
        await prisma.user.update({
          where: { id: user.id }, // Use the user's ID for the update
          data: { username: data.username },
        });
      }
    } else {
      console.error("No user found for student ID:", data.id);
      // Optionally create a user if one doesn't exist
      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        await prisma.user.create({
          data: {
            username: data.username,
            password: hashedPassword,
            role: "student",
            studentId: data.id,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating student:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing student ID" },
        { status: 400 }
      );
    }

    // Find the user associated with this student
    const user = await prisma.user.findFirst({
      where: { studentId: id }
    });

    // Delete the user first (to maintain referential integrity)
    if (user) {
      await prisma.user.delete({
        where: { id: user.id }, // Use the user's ID for the delete
      });
    }

    // Delete the student
    await prisma.student.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting student:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 