import React from "react";
import FormModal from "./FormModal";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

export type FormContainerProps = {
  table:
    | "teacher"
    | "student"
    | "parent"
    | "subject"
    | "class"
    | "lesson"
    | "exam"
    | "assignment"
    | "result"
    | "attendance"
    | "event"
    | "announcement";
  type: "create" | "update" | "delete";
  data?: any;
  id?: number | string;
};
const FormContainer = async ({ table, type, data, id }: FormContainerProps) => {
  let relatedData = {};
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;
  const currentUserId = userId;

  if (type !== "delete") {
    switch (table) {
      case "subject":
        const subjectTeachers = await prisma.teacher.findMany({
          select: {
            id: true,
            name: true,
            surname: true,
          },
        });
        relatedData = { teachers: subjectTeachers };

        break;
      case "class":
        const classGrades = await prisma.grade.findMany({
          select: {
            id: true,
            level: true,
          },
        });
        const classTeachers = await prisma.teacher.findMany({
          select: {
            id: true,
            name: true,
            surname: true,
          },
        });
        relatedData = { teachers: classTeachers, grades: classGrades };

        break;
      case "teacher":
        const teacherSubjects = await prisma.subject.findMany({
          select: { id: true, name: true },
        });
        relatedData = { subjects: teacherSubjects };
        break;

      case "student":
        const studentGrades = await prisma.grade.findMany({
          select: { id: true, level: true },
        });
        const studentClasses = await prisma.class.findMany({
          include: { _count: { select: { students: true } } },
        });
        relatedData = { classes: studentClasses, grades: studentGrades };
        break;
      case "parent":
        // Fetch all students for parent form
        const parentStudents = await prisma.student.findMany({
          select: {
            id: true,
            name: true,
            surname: true,
            class: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        });
        
        console.log("Fetched students for parent form:", parentStudents.length);
        
        // If updating, fetch the current parent's students
        let currentParentStudents: string[] = [];
        if (type === "update" && data?.id) {
          const parentWithStudents = await prisma.parent.findUnique({
            where: { id: data.id },
            include: {
              students: {
                select: {
                  id: true,
                },
              },
            },
          });
          
          if (parentWithStudents) {
            currentParentStudents = parentWithStudents.students.map(s => s.id);
          }
        }
        
        relatedData = { 
          students: parentStudents,
          currentParentStudents,
        };
        
        console.log("Related data for parent form:", {
          studentsCount: parentStudents.length,
          currentParentStudentsCount: currentParentStudents.length
        });
        break;
      case "exam":
        const examLessons = await prisma.lesson.findMany({
          where: {
            ...(role === "teacher" ? { teacherId: currentUserId! } : {}),
          },
          select: { id: true, name: true },
        });
        relatedData = { lessons: examLessons };
        break;

      default:
        break;
    }
  }
  return (
    <div>
      <FormModal
        table={table}
        type={type}
        data={data}
        id={id}
        relatedData={relatedData}
      />
    </div>
  );
};

export default FormContainer;
