"use server";

import {
  ClassSchema,
  ExamSchema,
  StudentSchema,
  SubjectSchema,
  TeacherSchema,
} from "./formValidationSchema";
import prisma from "./prisma";
import { revalidatePath } from "next/cache";
import { apiRequest, safeParseJSON } from "./apiUtils";
import crypto from "crypto";

// Define the type for the state returned by server actions
type CurrentState = { 
  success: boolean; 
  error: boolean; 
  message?: string;
};

export const createSubject = async (prevState: any, formData: SubjectSchema) => {
  try {
    console.log("createSubject received data:", JSON.stringify(formData, null, 2));
    
    // Validate the data
    if (!formData.name) {
      return {
        success: false,
        error: true,
        message: "Subject name is required"
      };
    }

    // Ensure teachers array is properly formatted
    const teacherIds = Array.isArray(formData.teachers) 
      ? formData.teachers.map(id => id.toString())
      : [];

    // Create the subject with teacher connections
    const subject = await prisma.subject.create({
      data: {
        name: formData.name,
        teachers: {
          connect: teacherIds.map(id => ({ id }))
        }
      },
      include: {
        teachers: true
      }
    });
    
    console.log("Created subject:", subject);

    revalidatePath("/list/subjects");
    return { 
      success: true, 
      error: false,
      message: "Subject created successfully!" 
    };
  } catch (err) {
    console.error("Error creating subject:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Unknown error" 
    };
  }
};

export const updateSubject = async (prevState: any, formData: SubjectSchema) => {
  try {
    console.log("updateSubject received data:", JSON.stringify(formData, null, 2));

    if (!formData.id) {
      return {
        success: false,
        error: true,
        message: "Subject ID is required for update"
      };
    }

    // Ensure teachers array is properly formatted
    const teacherIds = Array.isArray(formData.teachers) 
      ? formData.teachers.map(id => id.toString())
      : [];

    // Update the subject with teacher connections
    const subject = await prisma.subject.update({
      where: {
        id: parseInt(formData.id.toString())
      },
      data: {
        name: formData.name,
        teachers: {
          set: teacherIds.map(id => ({ id }))
        }
      },
      include: {
        teachers: true
      }
    });

    console.log("Updated subject:", subject);

    revalidatePath("/list/subjects");
    return {
      success: true,
      error: false,
      message: "Subject updated successfully!"
    };
  } catch (err) {
    console.error("Error updating subject:", err);
    return {
      success: false,
      error: true,
      message: err instanceof Error ? err.message : "Unknown error"
    };
  }
};

export const deleteSubject = async (id: number) => {
  try {
    console.log("deleteSubject received id:", id);

    // Check if subject has any associated lessons
    const existingLessons = await prisma.lesson.findMany({
      where: {
        subjectId: id
      }
    });

    if (existingLessons.length > 0) {
      return {
        success: false,
        error: true,
        message: "Cannot delete subject with existing lessons"
      };
    }

    // Delete the subject
    await prisma.subject.delete({
      where: {
        id: id
      }
    });

    revalidatePath("/list/subjects");
    return {
      success: true,
      error: false,
      message: "Subject deleted successfully!"
    };
  } catch (err) {
    console.error("Error deleting subject:", err);
    return {
      success: false,
      error: true,
      message: err instanceof Error ? err.message : "Unknown error"
    };
  }
};

export const createClass = async (currentState: CurrentState, data: ClassSchema) => {
  try {
    console.log("createClass received data:", JSON.stringify(data, null, 2));
    
    // Ensure required fields are present
    if (!data.gradeId || !data.name || !data.capacity) {
      return { 
        success: false, 
        error: true, 
        message: "Missing required fields: name, gradeId, and capacity are required" 
      };
    }

    // Create the class using Prisma
    const newClass = await prisma.class.create({
      data: {
        name: data.name,
        gradeId: Number(data.gradeId),
        capacity: Number(data.capacity),
        supervisorId: data.supervisorId || null
      },
      include: {
        grade: true,
        supervisor: true
      }
    });

    console.log("Created class:", newClass);
    revalidatePath("/list/classes");
    return { 
      success: true, 
      error: false,
      message: "Class created successfully!" 
    };
  } catch (err) {
    console.error("Error creating class:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Unknown error" 
    };
  }
};

export const updateClass = async (currentState: CurrentState, data: ClassSchema) => {
  try {
    console.log("updateClass received data:", JSON.stringify(data, null, 2));
    
    if (!data.id) {
      return { 
        success: false, 
        error: true, 
        message: "Missing class ID" 
      };
    }

    // Update the class using Prisma
    const updatedClass = await prisma.class.update({
      where: { id: Number(data.id) },
      data: {
        name: data.name,
        gradeId: Number(data.gradeId),
        capacity: Number(data.capacity),
        supervisorId: data.supervisorId || null
      },
      include: {
        grade: true,
        supervisor: true
      }
    });

    console.log("Updated class:", updatedClass);
    revalidatePath("/list/classes");
    return { 
      success: true, 
      error: false,
      message: "Class updated successfully!" 
    };
  } catch (err) {
    console.error("Error updating class:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Unknown error" 
    };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    console.log("deleteClass called with ID:", id);
    
    if (!id) {
      console.error("Missing class ID");
      return { 
        success: false, 
        error: true, 
        message: "Missing class ID" 
      };
    }
    
    // Check if class has any associated records
    const existingLessons = await prisma.lesson.findMany({
      where: { classId: parseInt(id) }
    });

    const existingStudents = await prisma.student.findMany({
      where: { classId: parseInt(id) }
    });

    if (existingLessons.length > 0) {
      return {
        success: false,
        error: true,
        message: "Cannot delete class with existing lessons"
      };
    }

    if (existingStudents.length > 0) {
      return {
        success: false,
        error: true,
        message: "Cannot delete class with enrolled students"
      };
    }

    // Delete the class
    await prisma.class.delete({
      where: { id: parseInt(id) }
    });

    revalidatePath("/list/classes");
    return { 
      success: true, 
      error: false,
      message: "Class deleted successfully!" 
    };
  } catch (err) {
    console.error("Error deleting class:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Unknown error" 
    };
  }
};

export const createTeacher = async (data: TeacherSchema) => {
  try {
    console.log("createTeacher received data:", JSON.stringify(data, null, 2));
    
    // Validate required fields
    const requiredFields = ["username", "name", "surname", "birthday", "password", "bloodType", "sex"] as const;
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return { 
        success: false, 
        error: true, 
        message: `Missing required fields: ${missingFields.join(', ')}`
      };
    }

    // Create teacher and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the teacher
      const teacher = await tx.teacher.create({
        data: {
          id: crypto.randomUUID(),
          username: data.username,
          name: data.name,
          surname: data.surname,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || "",
          img: data.img || null,
          bloodType: data.bloodType,
          birthday: new Date(data.birthday),
          sex: data.sex
        }
      });

      // Create the user account if password is provided
      if (data.password) {
        await tx.user.create({
          data: {
            username: data.username,
            password: data.password,
            role: "TEACHER",
            teacherId: teacher.id
          }
        });
      }

      return teacher;
    });

    console.log("Created teacher:", result);
    revalidatePath("/list/teachers");
    return { 
      success: true, 
      error: false,
      message: "Teacher created successfully!" 
    };
  } catch (err) {
    console.error("Error creating teacher:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Unknown error" 
    };
  }
};

export const updateTeacher = async (currentState: CurrentState, data: TeacherSchema) => {
  try {
    console.log("updateTeacher received data:", JSON.stringify(data, null, 2));
    
    if (!data.id) {
      return { 
        success: false, 
        error: true, 
        message: "Missing teacher ID" 
      };
    }

    // Update teacher using Prisma
    const updatedTeacher = await prisma.teacher.update({
      where: { id: data.id },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || "",
        img: data.img || null,
        bloodType: data.bloodType,
        birthday: new Date(data.birthday),
        sex: data.sex
      }
    });

    console.log("Updated teacher:", updatedTeacher);
    revalidatePath("/list/teachers");
    return { 
      success: true, 
      error: false,
      message: "Teacher updated successfully!" 
    };
  } catch (err) {
    console.error("Error updating teacher:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Unknown error" 
    };
  }
};

export const deleteTeacher = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    console.log("deleteTeacher called with ID:", id);
    
    if (!id) {
      return { 
        success: false, 
        error: true, 
        message: "Missing teacher ID" 
      };
    }

    // Check if teacher has any associated lessons or classes
    const existingLessons = await prisma.lesson.findMany({
      where: { teacherId: id }
    });

    const existingClasses = await prisma.class.findMany({
      where: { supervisorId: id }
    });

    if (existingLessons.length > 0) {
      return {
        success: false,
        error: true,
        message: "Cannot delete teacher with existing lessons"
      };
    }

    if (existingClasses.length > 0) {
      return {
        success: false,
        error: true,
        message: "Cannot delete teacher who is supervising classes"
      };
    }

    // Delete the teacher
    await prisma.teacher.delete({
      where: { id: id }
    });

    revalidatePath("/list/teachers");
    return { 
      success: true, 
      error: false,
      message: "Teacher deleted successfully!" 
    };
  } catch (err) {
    console.error("Error deleting teacher:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Unknown error" 
    };
  }
};

export const createStudent = async (currentState: CurrentState, data: StudentSchema) => {
  try {
    console.log("createStudent received data:", JSON.stringify(data, null, 2));
    
    // Validate required fields
    const requiredFields = ["username", "name", "surname", "birthday", "password", "bloodType", "sex", "classId", "parentId"] as const;
    const missingFields = requiredFields.filter(field => !data[field]);
    
    if (missingFields.length > 0) {
      return { 
        success: false, 
        error: true, 
        message: `Missing required fields: ${missingFields.join(', ')}`
      };
    }

    // Get grade ID from class
    const classData = await prisma.class.findUnique({
      where: { id: Number(data.classId) },
      select: { gradeId: true }
    });

    if (!classData) {
      return {
        success: false,
        error: true,
        message: "Invalid class ID"
      };
    }

    // Create student and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the student
      const student = await tx.student.create({
        data: {
          id: crypto.randomUUID(),
          username: data.username,
          name: data.name,
          surname: data.surname,
          email: data.email || null,
          phone: data.phone || null,
          address: data.address || "",
          img: data.img || null,
          bloodType: data.bloodType,
          birthday: new Date(data.birthday),
          sex: data.sex,
          classId: Number(data.classId),
          gradeId: classData.gradeId,
          parentId: data.parentId
        }
      });

      // Create the user account if password is provided
      if (data.password) {
        await tx.user.create({
          data: {
            username: data.username,
            password: data.password,
            role: "STUDENT",
            studentId: student.id
          }
        });
      }

      return student;
    });

    console.log("Created student:", result);
    revalidatePath("/list/students");
    return { 
      success: true, 
      error: false,
      message: "Student created successfully!" 
    };
  } catch (err) {
    console.error("Error creating student:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Unknown error" 
    };
  }
};

export const updateStudent = async (currentState: CurrentState, data: StudentSchema) => {
  try {
    console.log("updateStudent received data:", JSON.stringify(data, null, 2));
    
    if (!data.id) {
      return { 
        success: false, 
        error: true, 
        message: "Missing student ID" 
      };
    }

    // Get grade ID from class
    const classData = await prisma.class.findUnique({
      where: { id: Number(data.classId) },
      select: { gradeId: true }
    });

    if (!classData) {
      return {
        success: false,
        error: true,
        message: "Invalid class ID"
      };
    }

    // Update student using Prisma
    const updatedStudent = await prisma.student.update({
      where: { id: data.id },
      data: {
        username: data.username,
        name: data.name,
        surname: data.surname,
        email: data.email || null,
        phone: data.phone || null,
        address: data.address || "",
        img: data.img || null,
        bloodType: data.bloodType,
        birthday: new Date(data.birthday),
        sex: data.sex,
        classId: Number(data.classId),
        gradeId: classData.gradeId,
        parentId: data.parentId
      }
    });

    console.log("Updated student:", updatedStudent);
    revalidatePath("/list/students");
    return { 
      success: true, 
      error: false,
      message: "Student updated successfully!" 
    };
  } catch (err) {
    console.error("Error updating student:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Unknown error" 
    };
  }
};

export const deleteStudent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    console.log("deleteStudent called with ID:", id);
    
    if (!id) {
      return { 
        success: false, 
        error: true, 
        message: "Missing student ID" 
      };
    }

    // Check if student has any associated records
    const existingAttendances = await prisma.attendance.findMany({
      where: { studentId: id }
    });

    const existingResults = await prisma.result.findMany({
      where: { studentId: id }
    });

    if (existingAttendances.length > 0 || existingResults.length > 0) {
      return {
        success: false,
        error: true,
        message: "Cannot delete student with existing attendance or exam records"
      };
    }

    // Delete the student
    await prisma.student.delete({
      where: { id: id }
    });

    revalidatePath("/list/students");
    return { 
      success: true, 
      error: false,
      message: "Student deleted successfully!" 
    };
  } catch (err) {
    console.error("Error deleting student:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Unknown error" 
    };
  }
};

export const createExam = async (currentState: CurrentState, data: ExamSchema) => {
  try {
    console.log("createExam received data:", JSON.stringify(data, null, 2));
    
    // Validate required fields
    if (!data.title || !data.startTime || !data.endTime || !data.lessonId) {
      return { 
        success: false, 
        error: true, 
        message: "Missing required fields: title, startTime, endTime, and lessonId are required" 
      };
    }

    // Create exam using Prisma
    const newExam = await prisma.exam.create({
      data: {
        title: data.title,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        lessonId: Number(data.lessonId)
      },
      include: {
        lesson: true
      }
    });

    console.log("Created exam:", newExam);
    revalidatePath("/list/exams");
    return { 
      success: true, 
      error: false,
      message: "Exam created successfully!" 
    };
  } catch (err) {
    console.error("Error creating exam:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Unknown error" 
    };
  }
};

export const updateExam = async (currentState: CurrentState, data: ExamSchema) => {
  try {
    console.log("updateExam received data:", JSON.stringify(data, null, 2));
    
    if (!data.id) {
      return { 
        success: false, 
        error: true, 
        message: "Missing exam ID" 
      };
    }

    // Update exam using Prisma
    const updatedExam = await prisma.exam.update({
      where: { id: Number(data.id) },
      data: {
        title: data.title,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
        lessonId: Number(data.lessonId)
      },
      include: {
        lesson: true
      }
    });

    console.log("Updated exam:", updatedExam);
    revalidatePath("/list/exams");
    return { 
      success: true, 
      error: false,
      message: "Exam updated successfully!" 
    };
  } catch (err) {
    console.error("Error updating exam:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Unknown error" 
    };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    console.log("deleteExam called with ID:", id);
    
    if (!id) {
      return { 
        success: false, 
        error: true, 
        message: "Missing exam ID" 
      };
    }

    // Check if exam has any results
    const existingResults = await prisma.result.findMany({
      where: { examId: parseInt(id) }
    });

    if (existingResults.length > 0) {
      return {
        success: false,
        error: true,
        message: "Cannot delete exam with existing results"
      };
    }

    // Delete the exam
    await prisma.exam.delete({
      where: { id: parseInt(id) }
    });

    revalidatePath("/list/exams");
    return { 
      success: true, 
      error: false,
      message: "Exam deleted successfully!" 
    };
  } catch (err) {
    console.error("Error deleting exam:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Unknown error" 
    };
  }
};

export const deleteParent = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    console.log("deleteParent called with ID:", id);
    
    if (!id) {
      console.error("Missing parent ID");
      return { 
        success: false, 
        error: true, 
        message: "Missing parent ID" 
      };
    }
    
    const result = await apiRequest(`http://localhost:3000/api/parents?id=${id}`, {
      method: "DELETE",
    });
    
    if (!result.success) {
      return { 
        success: false, 
        error: true, 
        message: result.error || "Failed to delete parent" 
      };
    }

    revalidatePath("/list/parents");
    return { 
      success: true, 
      error: false,
      message: "Parent deleted successfully!" 
    };
  } catch (err) {
    console.error("Error deleting parent:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Unknown error" 
    };
  }
};

export const getSubject = async (id: string) => {
  try {
    if (!id) {
      console.error("Missing subject ID");
      return null;
    }
    
    const result = await apiRequest(`http://localhost:3000/api/subjects/${id}`, {
      method: "GET",
    });
    
    if (!result.success) {
      console.error("Error fetching subject:", result.error);
      return null;
    }
    
    return result.data || null;
  } catch (err) {
    console.error("Error fetching subject:", err);
    return null;
  }
};

export const getSubjects = async () => {
  try {
    const result = await apiRequest("http://localhost:3000/api/subjects", {
      method: "GET",
    });
    
    if (!result.success) {
      console.error("Error fetching subjects:", result.error);
      return [];
    }
    
    return result.data || [];
  } catch (err) {
    console.error("Error fetching subjects:", err);
    return [];
  }
};
