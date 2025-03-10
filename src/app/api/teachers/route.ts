import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Log the incoming payload
    console.log("API received payload:", JSON.stringify(data, null, 2));

    // Validate required fields
    const requiredFields = ["username", "name", "surname", "birthday", "password", "bloodType", "sex"];
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === "") {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}`,
          receivedData: Object.keys(data)
        },
        { status: 400 }
      );
    }

    // Validate the birthday field
    let birthday;
    try {
      birthday = new Date(data.birthday);
      if (isNaN(birthday.getTime())) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Invalid date format for birthday",
            receivedValue: data.birthday
          },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid date format for birthday", 
          details: error,
          receivedValue: data.birthday
        },
        { status: 400 }
      );
    }

    // Set default values for optional fields
    const address = data.address || "";
    const email = data.email || null;
    const phone = data.phone || null;
    const img = data.img || null;
    const bloodType = data.bloodType || "";
    const sex = data.sex || "MALE";

    // Create the teacher in the database
    const teacher = await prisma.teacher.create({
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: email,
        phone: phone,
        address: address,
        img: img,
        bloodType: bloodType,
        sex: sex,
        birthday: birthday,
        subjects: {
          connect: data.subjects?.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })) || [],
        },
      },
    });

    console.log("Teacher created:", teacher);

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create a user in the User table
    const user = await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        role: "teacher",
        teacherId: teacher.id,
      },
    });

    console.log("User created:", { id: user.id, username: user.username, role: user.role });

    return NextResponse.json({ success: true, id: teacher.id });
  } catch (err) {
    console.error("Error creating teacher:", err);
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
        { success: false, error: "Missing teacher ID" },
        { status: 400 }
      );
    }
    
    // Validate the birthday field
    let birthday;
    try {
      birthday = new Date(data.birthday);
      if (isNaN(birthday.getTime())) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Invalid date format for birthday",
            receivedValue: data.birthday
          },
          { status: 400 }
        );
      }
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid date format for birthday", 
          details: error,
          receivedValue: data.birthday
        },
        { status: 400 }
      );
    }
    
    // Set default values for optional fields
    const address = data.address || "";
    const email = data.email || null;
    const phone = data.phone || null;
    const img = data.img || null;
    const bloodType = data.bloodType || "";
    const sex = data.sex || "MALE";
    
    // Handle subjects array
    let subjectsData = {};
    if (data.subjects) {
      // Ensure subjects is an array
      const subjectsArray = Array.isArray(data.subjects) ? data.subjects : [];
      
      // Format subjects for Prisma
      if (subjectsArray.length > 0) {
        subjectsData = {
          set: subjectsArray.map((subjectId: string) => ({
            id: parseInt(subjectId),
          })),
        };
      } else {
        // If empty array, disconnect all subjects
        subjectsData = { set: [] };
      }
    } else {
      // If subjects is not provided, don't change the relationships
      subjectsData = {};
    }
    
    console.log("Subjects data:", subjectsData);

    // Update the teacher in the database
    const updatedTeacher = await prisma.teacher.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: email,
        phone: phone,
        address: address,
        img: img,
        bloodType: bloodType,
        sex: sex,
        birthday: birthday,
        subjects: subjectsData,
      },
      include: {
        subjects: true,
      }
    });
    
    console.log("Teacher updated:", {
      id: updatedTeacher.id,
      username: updatedTeacher.username,
      subjects: updatedTeacher.subjects.map(s => s.id)
    });

    // Find the user associated with this teacher
    const user = await prisma.user.findFirst({
      where: { teacherId: data.id }
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
      console.error("No user found for teacher ID:", data.id);
      // Optionally create a user if one doesn't exist
      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        await prisma.user.create({
          data: {
            username: data.username,
            password: hashedPassword,
            role: "teacher",
            teacherId: data.id,
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating teacher:", err);
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
        { success: false, error: "Missing teacher ID" },
        { status: 400 }
      );
    }

    // Find the user associated with this teacher
    const user = await prisma.user.findFirst({
      where: { teacherId: id }
    });

    // Delete the user first (to maintain referential integrity)
    if (user) {
      await prisma.user.delete({
        where: { id: user.id }, // Use the user's ID for the delete
      });
    }

    // Delete the teacher
    await prisma.teacher.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting teacher:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}