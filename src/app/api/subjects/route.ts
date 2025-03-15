import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      // Fetch a specific subject by ID
      const subject = await prisma.subject.findUnique({
        where: { id: parseInt(id) },
        include: {
          teachers: true,
          lessons: true,
        },
      });

      if (!subject) {
        return NextResponse.json(
          { success: false, error: "Subject not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({ success: true, data: subject });
    } else {
      // Fetch all subjects
      const subjects = await prisma.subject.findMany({
        include: {
          teachers: true,
          lessons: true,
        },
      });

      return NextResponse.json({ success: true, data: subjects });
    }
  } catch (err) {
    console.error("Error fetching subjects:", err);
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
    if (!data.name) {
      return NextResponse.json(
        { success: false, error: "Missing required field: name" },
        { status: 400 }
      );
    }

    // Check if a subject with the same name already exists
    const existingSubject = await prisma.subject.findUnique({
      where: { name: data.name }
    });

    if (existingSubject) {
      return NextResponse.json(
        { success: false, error: `A subject with name '${data.name}' already exists` },
        { status: 400 }
      );
    }

    // Create the subject in the database
    let subject;
    
    if (data.teachers && Array.isArray(data.teachers) && data.teachers.length > 0) {
      // Create with teachers
      subject = await prisma.subject.create({
        data: {
          name: data.name,
          teachers: {
            connect: data.teachers.map((teacherId: string) => ({ id: teacherId })),
          }
        },
        include: {
          teachers: true,
        },
      });
    } else {
      // Create without teachers
      subject = await prisma.subject.create({
        data: {
          name: data.name,
        },
        include: {
          teachers: true,
        },
      });
    }

    console.log("Subject created:", subject);

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
    
    console.log("API received PUT payload:", JSON.stringify(data, null, 2));

    // Validate required fields
    if (!data.id) {
      return NextResponse.json(
        { success: false, error: "Missing subject ID" },
        { status: 400 }
      );
    }

    if (!data.name) {
      return NextResponse.json(
        { success: false, error: "Missing required field: name" },
        { status: 400 }
      );
    }

    // Check if the subject exists
    const existingSubject = await prisma.subject.findUnique({
      where: { id: parseInt(data.id) }
    });

    if (!existingSubject) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      );
    }

    // Check if another subject with the same name exists
    if (data.name !== existingSubject.name) {
      const nameExists = await prisma.subject.findUnique({
        where: { name: data.name }
      });

      if (nameExists) {
        return NextResponse.json(
          { success: false, error: `A subject with name '${data.name}' already exists` },
          { status: 400 }
        );
      }
    }

    // Update the subject in the database
    let updatedSubject;
    
    if (data.teachers !== undefined) {
      // Update with teachers
      updatedSubject = await prisma.subject.update({
        where: { id: parseInt(data.id) },
        data: {
          name: data.name,
          teachers: {
            set: Array.isArray(data.teachers) ? data.teachers.map((teacherId: string) => ({
              id: teacherId,
            })) : [],
          }
        },
        include: {
          teachers: true,
        },
      });
    } else {
      // Update without changing teachers
      updatedSubject = await prisma.subject.update({
        where: { id: parseInt(data.id) },
        data: {
          name: data.name,
        },
        include: {
          teachers: true,
        },
      });
    }

    console.log("Subject updated:", updatedSubject);

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

    // Check if the subject exists
    const subject = await prisma.subject.findUnique({
      where: { id: parseInt(id) },
      include: {
        lessons: true,
      },
    });

    if (!subject) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      );
    }

    // Check if subject has any active lessons
    if (subject.lessons.length > 0) {
      return NextResponse.json(
        { success: false, error: "Cannot delete subject with active lessons" },
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