import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      // Fetch a specific class by ID
      const classItem = await prisma.class.findUnique({
        where: { id: parseInt(id) },
        include: {
          grade: true,
          students: true,
          teachers: true,
        },
      });

      if (!classItem) {
        return NextResponse.json(
          { success: false, error: "Class not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: classItem });
    } else {
      // Fetch all classes
      const classes = await prisma.class.findMany({
        include: {
          grade: true,
          students: true,
          teachers: true,
          _count: {
            select: {
              students: true,
            },
          },
        },
      });

      return NextResponse.json({ success: true, data: classes });
    }
  } catch (err) {
    console.error("Error fetching classes:", err);
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
    const requiredFields = ["name", "capacity", "gradeId"];
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
        gradeId: parseInt(data.gradeId),
        supervisorId: data.supervisorId || null,
      },
    });

    console.log("Class created:", classItem);

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
    
    console.log("API received PUT payload:", JSON.stringify(data, null, 2));

    // Validate required fields
    if (!data.id) {
      return NextResponse.json(
        { success: false, error: "Missing class ID" },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ["name", "capacity", "gradeId"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Convert ID to number
    const classId = typeof data.id === 'string' ? parseInt(data.id) : data.id;
    
    // Check if the class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: classId }
    });
    
    if (!existingClass) {
      return NextResponse.json(
        { success: false, error: `Class with ID ${classId} not found` },
        { status: 404 }
      );
    }

    // Update the class in the database
    const updatedClass = await prisma.class.update({
      where: {
        id: classId,
      },
      data: {
        name: data.name,
        capacity: parseInt(data.capacity),
        gradeId: parseInt(data.gradeId),
        supervisorId: data.supervisorId || null,
      },
    });

    console.log("Class updated:", updatedClass);

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

    console.log("API received DELETE request for class ID:", id);

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Missing class ID" },
        { status: 400 }
      );
    }

    // Convert ID to number
    const classId = parseInt(id);
    
    // Check if the class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: classId }
    });
    
    if (!existingClass) {
      return NextResponse.json(
        { success: false, error: `Class with ID ${classId} not found` },
        { status: 404 }
      );
    }

    // Check if there are students in this class
    const studentsCount = await prisma.student.count({
      where: { classId: classId },
    });

    if (studentsCount > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete class with students" },
        { status: 400 }
      );
    }

    // Delete the class
    const deletedClass = await prisma.class.delete({
      where: { id: classId },
    });

    console.log("Class deleted:", deletedClass);

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