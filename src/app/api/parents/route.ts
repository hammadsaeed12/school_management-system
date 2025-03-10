import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validate required fields
    const requiredFields = ["username", "name", "surname"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create the parent in the database
    const parent = await prisma.parent.create({
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
      },
    });

    // Hash the password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create a user in the User table
    await prisma.user.create({
      data: {
        username: data.username,
        password: hashedPassword,
        role: "parent",
        parentId: parent.id,
      },
    });

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

    // Update the parent in the database
    await prisma.parent.update({
      where: {
        id: data.id,
      },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || null,
      },
    });

    // Find the user associated with this parent
    const user = await prisma.user.findFirst({
      where: { parentId: data.id }
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
      console.error("No user found for parent ID:", data.id);
      // Optionally create a user if one doesn't exist
      if (data.password) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        await prisma.user.create({
          data: {
            username: data.username,
            password: hashedPassword,
            role: "parent",
            parentId: data.id,
          },
        });
      }
    }

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

    // Find the user associated with this parent
    const user = await prisma.user.findFirst({
      where: { parentId: id }
    });

    // Delete the user first (to maintain referential integrity)
    if (user) {
      await prisma.user.delete({
        where: { id: user.id }, // Use the user's ID for the delete
      });
    }

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