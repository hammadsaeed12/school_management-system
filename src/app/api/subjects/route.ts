import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Validate required fields
    if (!data.name) {
      return NextResponse.json(
        { success: false, error: "Missing required field: name" },
        { status: 400 }
      );
    }

    // Create the subject in the database
    const subject = await prisma.subject.create({
      data: {
        name: data.name,
        teachers: {
          connect: data.teachers?.map((teacherId: string) => ({ id: teacherId })) || [],
        },
      },
    });

    return NextResponse.json({ success: true, id: subject.id });
  } catch (err) {
    console.error("Error creating subject:", err);
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
        { success: false, error: "Missing subject ID" },
        { status: 400 }
      );
    }

    // Update the subject in the database
    await prisma.subject.update({
      where: {
        id: parseInt(data.id),
      },
      data: {
        name: data.name,
        teachers: {
          set: data.teachers?.map((teacherId: string) => ({ id: teacherId })) || [],
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error updating subject:", err);
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
        { success: false, error: "Missing subject ID" },
        { status: 400 }
      );
    }

    // Delete the subject
    await prisma.subject.delete({
      where: { id: parseInt(id) },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error deleting subject:", err);
    const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
} 