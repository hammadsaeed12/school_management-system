import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validate required fields
    const requiredFields = ["name", "capacity"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Create the class in the database
    const classItem = await prisma.class.create({
      data: {
        name: data.name,
        capacity: parseInt(data.capacity),
      },
    });

    return NextResponse.json({ success: true, id: classItem.id });
  } catch (err) {
    console.error("Error creating class:", err);
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

    // Validate required fields
    if (!data.id) {
      return NextResponse.json(
        { success: false, error: "Missing class ID" },
        { status: 400 }
      );
    }

    // Update the class in the database
    await prisma.class.update({
      where: {
        id: data.id,
      },
      data: {
        name: data.name,
        capacity: parseInt(data.capacity),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating class:", err);
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
        { success: false, error: "Missing class ID" },
        { status: 400 }
      );
    }

    // Check if there are students in this class
    const studentsCount = await prisma.student.count({
      where: { classId: id },
    });

    if (studentsCount > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete class with students" },
        { status: 400 }
      );
    }

    // Delete the class
    await prisma.class.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting class:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 