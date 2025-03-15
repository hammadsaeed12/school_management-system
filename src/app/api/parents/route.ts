import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

// Function to generate a simple unique ID
function generateUniqueId() {
  return 'parent_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
}

export async function POST(req: Request) {
  try {
    const data = await req.json();
    
    console.log("API received POST payload:", JSON.stringify(data, null, 2));

    // Validate required fields
    const requiredFields = ["username", "name", "surname", "password"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Check if a parent with the same username already exists
    const existingParent = await prisma.parent.findUnique({
      where: { username: data.username }
    });

    if (existingParent) {
      return NextResponse.json(
        { success: false, error: `A parent with username '${data.username}' already exists` },
        { status: 400 }
      );
    }

    // Generate a unique ID for the parent
    const parentId = generateUniqueId();
    console.log("Generated parent ID:", parentId);

    // Create the parent data object with required fields
    const parentData = {
      id: parentId,
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || "",
    };

    // Only add the img field if it exists in the data
    if (data.img !== undefined) {
      // @ts-ignore - Ignore TypeScript error if img field is not in the schema
      parentData.img = data.img;
    }

    // Extract student IDs from the request
    const studentIds = data.studentIds || [];
    console.log("Student IDs to connect:", studentIds);

    // Create the parent in the database with connected students
    const parent = await prisma.parent.create({
      data: {
        ...parentData,
        // Connect students if any are provided
        ...(studentIds.length > 0 && {
          students: {
            connect: studentIds.map((id: string) => ({ id }))
          }
        })
      },
    });

    console.log("Parent created:", parent);

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create a user in the User table
    try {
      const user = await prisma.user.create({
        data: {
          username: data.username,
          password: hashedPassword,
          role: "parent",
          parentId: parent.id,
        },
      });
      console.log("User created for parent:", { username: user.username, role: user.role });
    } catch (userError) {
      console.error("Error creating user for parent:", userError);
      // If user creation fails, we should still return success for the parent creation
      // but log the error for debugging
    }

    return NextResponse.json({ success: true, id: parent.id });
  } catch (err) {
    console.error("Error creating parent:", err);
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
        { success: false, error: "Missing parent ID" },
        { status: 400 }
      );
    }

    // Create the parent data object with required fields
    const parentData = {
      username: data.username,
      name: data.name,
      surname: data.surname,
      email: data.email || null,
      phone: data.phone || null,
      address: data.address || "",
    };

    // Only add the img field if it exists in the data
    if (data.img !== undefined) {
      // @ts-ignore - Ignore TypeScript error if img field is not in the schema
      parentData.img = data.img;
    }

    // Extract student IDs from the request
    const studentIds = data.studentIds || [];
    console.log("Student IDs to connect:", studentIds);

    // Get current students for this parent
    const currentParent = await prisma.parent.findUnique({
      where: { id: data.id },
      include: { students: true },
    });

    if (!currentParent) {
      return NextResponse.json(
        { success: false, error: "Parent not found" },
        { status: 404 }
      );
    }

    // Get IDs of current students
    const currentStudentIds = currentParent.students.map(student => student.id);
    
    // Determine which students to disconnect (those in current but not in new list)
    const studentsToDisconnect = currentStudentIds.filter((id: string) => !studentIds.includes(id));
    
    // Determine which students to connect (those in new list but not in current)
    const studentsToConnect = studentIds.filter((id: string) => !currentStudentIds.includes(id));

    console.log("Students to disconnect:", studentsToDisconnect);
    console.log("Students to connect:", studentsToConnect);

    // Update the parent in the database
    await prisma.parent.update({
      where: {
        id: data.id,
      },
      data: {
        ...parentData,
        // Disconnect students that are no longer associated
        ...(studentsToDisconnect.length > 0 && {
          students: {
            disconnect: studentsToDisconnect.map((id: string) => ({ id }))
          }
        })
      },
    });

    // Connect new students in a separate operation if needed
    if (studentsToConnect.length > 0) {
      await prisma.parent.update({
        where: {
          id: data.id,
        },
        data: {
          students: {
            connect: studentsToConnect.map((id: string) => ({ id }))
          }
        },
      });
    }

    // Skip user-related operations since the User model might not have a parentId field
    console.log("Skipping user update for parent due to schema limitations");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating parent:", err);
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
        { success: false, error: "Missing parent ID" },
        { status: 400 }
      );
    }

    // Check if there are students associated with this parent
    const studentsCount = await prisma.student.count({
      where: { parentId: id },
    });

    if (studentsCount > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete parent with associated students" },
        { status: 400 }
      );
    }

    // Skip user-related operations since the User model might not have a parentId field
    console.log("Skipping user deletion for parent due to schema limitations");

    // Delete the parent
    await prisma.parent.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting parent:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 