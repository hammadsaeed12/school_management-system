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
    
    console.log("API received POST payload:", JSON.stringify(data, null, 2));

    // Validate required fields
    const requiredFields = ["username", "name", "surname", "birthday", "password"];
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

    // Create the teacher in the database
    let teacher;
    
    if (data.subjects && Array.isArray(data.subjects) && data.subjects.length > 0) {
      // Create with subjects
      teacher = await prisma.teacher.create({
        data: {
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
          subjects: {
            connect: data.subjects.map((subjectId: string) => ({
              id: parseInt(subjectId),
            })),
          }
        },
        include: {
          subjects: true,
          classes: true,
        },
      });
    } else {
      // Create without subjects
      teacher = await prisma.teacher.create({
        data: {
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
        },
        include: {
          subjects: true,
          classes: true,
        },
      });
    }

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

    // Update the teacher in the database
    let updatedTeacher;
    
    if (data.subjects !== undefined) {
      // Update with subjects
      updatedTeacher = await prisma.teacher.update({
        where: { id: data.id },
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
          ...(birthday && { birthday }),
          subjects: {
            set: Array.isArray(data.subjects) ? data.subjects.map((subjectId: string) => ({
              id: parseInt(subjectId),
            })) : [],
          }
        },
        include: {
          subjects: true,
          classes: true,
        },
      });
    } else {
      // Update without changing subjects
      updatedTeacher = await prisma.teacher.update({
        where: { id: data.id },
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
          ...(birthday && { birthday }),
        },
        include: {
          subjects: true,
          classes: true,
        },
      });
    }

    console.log("Teacher updated:", updatedTeacher);

    // Update the user if username is changed
    if (data.username !== existingTeacher.username) {
      try {
        // Find the user first
        const user = await prisma.user.findFirst({
          where: { teacherId: data.id }
        });
        
        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: { username: data.username },
          });
          console.log("User updated for teacher");
        } else {
          console.log("No user found for teacher ID:", data.id);
        }
      } catch (userError) {
        console.error("Error updating user for teacher:", userError);
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
      // Find the user first
      const user = await prisma.user.findFirst({
        where: { teacherId: id }
      });
      
      if (user) {
        await prisma.user.delete({
          where: { id: user.id },
        });
        console.log("User deleted for teacher");
      } else {
        console.log("No user found for teacher ID:", id);
      }
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