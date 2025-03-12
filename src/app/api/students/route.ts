import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Function to generate a simple unique ID
function generateUniqueId() {
  return 'student_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
}

// Define the exact shape of data we want to send to Prisma
interface StudentCreateData {
  id: string;
  username: string;
  name: string;
  surname: string;
  email: string | null;
  phone: string | null;
  address: string;
  img: string | null;
  bloodType: string;
  sex: "MALE" | "FEMALE";
  birthday: Date;
  classId: number;
  parentId: string;
  gradeId: number;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      // Fetch a specific student by ID
      const student = await prisma.student.findUnique({
        where: { id },
        include: {
          class: true,
          parent: true,
          grade: true,
        },
      });

      if (!student) {
        return NextResponse.json(
          { success: false, error: "Student not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: student });
    } else {
      // Fetch all students
      const students = await prisma.student.findMany({
        include: {
          class: true,
          parent: true,
          grade: true,
        },
      });

      return NextResponse.json({ success: true, data: students });
    }
  } catch (err) {
    console.error("Error fetching students:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    // Log the incoming payload
    console.log("API received POST payload:", JSON.stringify(data, null, 2));

    // Validate required fields
    const requiredFields = ["username", "name", "surname", "birthday", "classId", "parentId", "password"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check if a student with the same username already exists
    const existingStudent = await prisma.student.findUnique({
      where: { username: data.username }
    });

    if (existingStudent) {
      return NextResponse.json(
        { success: false, error: `A student with username '${data.username}' already exists` },
        { status: 400 }
      );
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
      where: { id: Number(data.classId) },
      include: { _count: { select: { students: true } } },
    });

    if (!classItem) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 400 }
      );
    }

    if (classItem.capacity <= classItem._count.students) {
      return NextResponse.json(
        { success: false, error: "Class is full" },
        { status: 400 }
      );
    }

    // Generate a unique ID for the student
    const studentId = generateUniqueId();
    console.log("Generated student ID:", studentId);

    // Create the student data object with required fields
    const studentData = {
      id: studentId,
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || "",
      img: data.img || null,
      bloodType: data.bloodType || "",
      sex: data.sex || "MALE",
      birthday: birthday,
      classId: Number(data.classId),
      parentId: data.parentId,
      gradeId: classItem.gradeId, // Get gradeId from the class
    };

    // Create the student in the database
    const student = await prisma.student.create({
      data: studentData,
    });

    console.log("Student created:", student);

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create a user in the User table
    try {
      const user = await prisma.user.create({
        data: {
          username: data.username,
          password: hashedPassword,
          role: "student",
          studentId: student.id,
        },
      });
      console.log("User created for student:", { username: user.username, role: user.role });
    } catch (userError) {
      console.error("Error creating user for student:", userError);
      // If user creation fails, we should still return success for the student creation
      // but log the error for debugging
    }

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

    // Check if the student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: data.id }
    });

    if (!existingStudent) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }

    // Validate the birthday field if provided
    let birthday;
    if (data.birthday) {
      birthday = new Date(data.birthday);
      if (isNaN(birthday.getTime())) {
        return NextResponse.json(
          { success: false, error: "Invalid date format for birthday" },
          { status: 400 }
        );
      }
    }

    // If changing class, check capacity
    if (data.classId && data.classId !== existingStudent.classId) {
      const newClass = await prisma.class.findUnique({
        where: { id: Number(data.classId) },
        include: { _count: { select: { students: true } } },
      });

      if (!newClass) {
        return NextResponse.json(
          { success: false, error: "New class not found" },
          { status: 400 }
        );
      }

      if (newClass.capacity <= newClass._count.students) {
        return NextResponse.json(
          { success: false, error: "New class is full" },
          { status: 400 }
        );
      }
    }

    // Create the student data object with required fields
    const studentData = {
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || "",
      img: data.img || null,
      bloodType: data.bloodType || "",
      sex: data.sex || "MALE",
      ...(birthday && { birthday }),
      ...(data.classId && { classId: Number(data.classId) }),
      ...(data.parentId && { parentId: data.parentId }),
    };

    // Update the student in the database
    const updatedStudent = await prisma.student.update({
      where: { id: data.id },
      data: studentData,
    });

    console.log("Student updated:", updatedStudent);

    // Update the user if username is changed
    if (data.username !== existingStudent.username) {
      try {
        await prisma.user.update({
          where: { studentId: data.id },
          data: { username: data.username },
        });
        console.log("User updated for student");
      } catch (userError) {
        console.error("Error updating user for student:", userError);
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

    // Check if the student exists
    const student = await prisma.student.findUnique({
      where: { id }
    });

    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found" },
        { status: 404 }
      );
    }

    // Delete associated user first
    try {
      await prisma.user.delete({
        where: { studentId: id },
      });
      console.log("User deleted for student");
    } catch (userError) {
      console.error("Error deleting user for student:", userError);
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