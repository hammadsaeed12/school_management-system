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

export async function POST(req: Request) {
  try {
    const rawData = await req.json();
    
    // Log the incoming payload
    console.log("API received POST payload:", JSON.stringify(rawData, null, 2));

    // Validate required fields
    const requiredFields = ["username", "name", "surname", "birthday", "classId", "parentId"];
    for (const field of requiredFields) {
      if (!rawData[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check if a student with the same username already exists
    const existingStudent = await prisma.student.findUnique({
      where: { username: rawData.username }
    });

    if (existingStudent) {
      return NextResponse.json(
        { success: false, error: `A student with username '${rawData.username}' already exists` },
        { status: 400 }
      );
    }

    // Validate the birthday field
    const birthday = new Date(rawData.birthday);
    if (isNaN(birthday.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid date format for birthday" },
        { status: 400 }
      );
    }

    // Check class capacity
    const classItem = await prisma.class.findUnique({
      where: { id: Number(rawData.classId) },
      include: { _count: { select: { students: true } } },
    });

    if (classItem && classItem.capacity <= classItem._count.students) {
      return NextResponse.json(
        { success: false, error: "Class is full" },
        { status: 400 }
      );
    }

    // Get the grade ID from the class
    const classDetails = await prisma.class.findUnique({
      where: { id: Number(rawData.classId) },
      select: { gradeId: true }
    });

    if (!classDetails) {
      return NextResponse.json(
        { success: false, error: "Class not found" },
        { status: 400 }
      );
    }

    // Generate a unique ID for the student
    const studentId = generateUniqueId();
    console.log("Generated student ID:", studentId);

    // Prepare data for insertion
    const username = rawData.username;
    const name = rawData.name;
    const surname = rawData.surname;
    const email = rawData.email || null;
    const phone = rawData.phone || null;
    const address = rawData.address || "";
    const img = rawData.img || null;
    const bloodType = rawData.bloodType || "";
    const sex = rawData.sex || "MALE";
    const classId = Number(rawData.classId);
    const parentId = rawData.parentId;
    const gradeId = classDetails.gradeId;

    console.log("Creating student with these fields:", {
      id: studentId,
      username, 
      name, 
      surname, 
      email, 
      phone, 
      address, 
      img, 
      bloodType, 
      sex, 
      birthday, 
      classId, 
      parentId,
      gradeId
    });

    // Use a direct approach with explicit field selection
    const student = await prisma.student.create({
      data: {
        id: studentId,
        username,
        name,
        surname,
        email,
        phone,
        address,
        img,
        bloodType,
        sex,
        birthday,
        classId,
        parentId,
        gradeId
      },
      select: {
        id: true,
        username: true,
        name: true
      }
    });

    console.log("Student created:", student);

    // Skip creating a user for now since the User model doesn't have a studentId field
    console.log("Skipping user creation for student due to schema limitations");

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

    // Validate the birthday field
    const birthday = new Date(data.birthday);
    if (isNaN(birthday.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid date format for birthday" },
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
        address: data.address || "",
        img: data.img || null,
        bloodType: data.bloodType || "",
        sex: data.sex || "MALE",
        birthday: birthday,
        classId: Number(data.classId),
        parentId: data.parentId,
      },
    });

    // Skip user-related operations since the User model doesn't have a studentId field
    console.log("Skipping user update for student due to schema limitations");

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

    // Skip user-related operations since the User model doesn't have a studentId field
    console.log("Skipping user deletion for student due to schema limitations");

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