import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validate required fields
    const requiredFields = ["title", "startTime", "endTime", "lessonId"];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Validate the time fields
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid date format for startTime or endTime" },
        { status: 400 }
      );
    }

    // Create the exam in the database
    const exam = await prisma.exam.create({
      data: {
        title: data.title,
        startTime: startTime,
        endTime: endTime,
        lessonId: parseInt(data.lessonId),
      },
    });

    return NextResponse.json({ success: true, id: exam.id });
  } catch (err) {
    console.error("Error creating exam:", err);
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
        { success: false, error: "Missing exam ID" },
        { status: 400 }
      );
    }

    // Validate the time fields
    const startTime = new Date(data.startTime);
    const endTime = new Date(data.endTime);
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid date format for startTime or endTime" },
        { status: 400 }
      );
    }

    // Update the exam in the database
    await prisma.exam.update({
      where: {
        id: parseInt(data.id),
      },
      data: {
        title: data.title,
        startTime: startTime,
        endTime: endTime,
        lessonId: parseInt(data.lessonId),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating exam:", err);
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
        { success: false, error: "Missing exam ID" },
        { status: 400 }
      );
    }

    // Delete the exam
    await prisma.exam.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting exam:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 