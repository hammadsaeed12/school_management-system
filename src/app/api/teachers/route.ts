import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Function to generate a simple unique ID
function generateUniqueId() {
  return 'teacher_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      // Fetch a specific teacher by ID
      const teacher = await prisma.teacher.findUnique({
        where: { id },
        include: {
          subjects: true,
          classes: true,
          lessons: true,
        },
      });

      if (!teacher) {
        return NextResponse.json(
          { success: false, error: "Teacher not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: teacher });
    } else {
      // Fetch all teachers
      const teachers = await prisma.teacher.findMany({
        include: {
          subjects: true,
          classes: true,
          lessons: true,
        },
      });

      return NextResponse.json({ success: true, data: teachers });
    }
  } catch (err) {
    console.error("Error fetching teachers:", err);
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
    const requiredFields = ["username", "name", "surname", "birthday", "password", "bloodType", "sex"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check if a teacher with the same username already exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { username: data.username }
    });

    if (existingTeacher) {
      return NextResponse.json(
        { success: false, error: `A teacher with username '${data.username}' already exists` },
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

    // Generate a unique ID for the teacher
    const teacherId = generateUniqueId();
    console.log("Generated teacher ID:", teacherId);

    // Create the teacher data object with required fields
    const teacherData = {
      id: teacherId,
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
    };

    // Add subjects if provided
    if (data.subjects && Array.isArray(data.subjects) && data.subjects.length > 0) {
      teacherData.subjects = {
        connect: data.subjects.map((subjectId: string) => ({
          id: parseInt(subjectId),
        })),
      };
    }

    // Create the teacher in the database
    const teacher = await prisma.teacher.create({
      data: teacherData,
      include: {
        subjects: true,
      },
    });

    console.log("Teacher created:", teacher);

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create a user in the User table
    try {
      const user = await prisma.user.create({
        data: {
          username: data.username,
          password: hashedPassword,
          role: "teacher",
          teacherId: teacher.id,
        },
      });
      console.log("User created for teacher:", { username: user.username, role: user.role });
    } catch (userError) {
      console.error("Error creating user for teacher:", userError);
      // If user creation fails, we should still return success for the teacher creation
      // but log the error for debugging
    }

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

    // Check if the teacher exists
    const existingTeacher = await prisma.teacher.findUnique({
      where: { id: data.id }
    });

    if (!existingTeacher) {
      return NextResponse.json(
        { success: false, error: "Teacher not found" },
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

    // Create the teacher data object with required fields
    const teacherData = {
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
    };

    // Handle subjects update if provided
    if (data.subjects) {
      teacherData.subjects = {
        set: Array.isArray(data.subjects) ? data.subjects.map((subjectId: string) => ({
          id: parseInt(subjectId),
        })) : [],
      };
    }

    // Update the teacher in the database
    const updatedTeacher = await prisma.teacher.update({
      where: { id: data.id },
      data: teacherData,
      include: {
        subjects: true,
      },
    });

    console.log("Teacher updated:", updatedTeacher);

    // Find the user associated with this teacher
    const user = await prisma.user.findFirst({
      where: { teacherId: data.id }
    });

    // Update user information if needed
    if (user) {
      const userUpdateData = {
        username: data.username,
      };

      // Only update password if a new one is provided
      if (data.password && data.password.trim() !== "") {
        userUpdateData.password = await bcrypt.hash(data.password, 10);
      }

      await prisma.user.update({
        where: { id: user.id },
        data: userUpdateData,
      });
      console.log("User updated for teacher");
    } else {
      console.error("No user found for teacher ID:", data.id);
      // Create a user if one doesn't exist and password is provided
      if (data.password && data.password.trim() !== "") {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        await prisma.user.create({
          data: {
            username: data.username,
            password: hashedPassword,
            role: "teacher",
            teacherId: data.id,
          },
        });
        console.log("Created new user for existing teacher");
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

    // Check if the teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id },
      include: {
        lessons: true,
        classes: {
          where: {
            supervisorId: id,
          },
        },
      },
    });

    if (!teacher) {
      return NextResponse.json(
        { success: false, error: "Teacher not found" },
        { status: 404 }
      );
    }

    // Check if teacher has any active lessons or supervised classes
    if (teacher.lessons.length > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete teacher with active lessons" },
        { status: 400 }
      );
    }

    if (teacher.classes.length > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete teacher who is supervising classes" },
        { status: 400 }
      );
    }

    // Delete associated user first
    try {
      await prisma.user.delete({
        where: { teacherId: id },
      });
      console.log("User deleted for teacher");
    } catch (userError) {
      console.error("Error deleting user for teacher:", userError);
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