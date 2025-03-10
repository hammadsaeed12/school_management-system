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

type CurrentState = { success: boolean; error: boolean };

export const createSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    const response = await fetch("http://localhost:3000/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("API Error:", errorResponse);
      throw new Error(errorResponse.error || "Failed to create subject");
    }

    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateSubject = async (
  currentState: CurrentState,
  data: SubjectSchema
) => {
  try {
    const response = await fetch("http://localhost:3000/api/subjects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("API Error:", errorResponse);
      throw new Error(errorResponse.error || "Failed to update subject");
    }

    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteSubject = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const response = await fetch(`http://localhost:3000/api/subjects?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("API Error:", errorResponse);
      throw new Error(errorResponse.error || "Failed to delete subject");
    }

    revalidatePath("/list/subjects");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    console.log("createClass received data:", JSON.stringify(data, null, 2));
    
    // Ensure gradeId is included and is a number
    if (!data.gradeId) {
      console.error("Missing required field: gradeId");
      return { 
        success: false, 
        error: true, 
        message: "Missing required field: gradeId" 
      };
    }
    
    // Create a copy of the data for formatting
    const formattedData = { 
      ...data,
      gradeId: Number(data.gradeId),
      capacity: Number(data.capacity),
    };
    
    console.log("Formatted data being sent to API:", JSON.stringify(formattedData, null, 2));
    
    const response = await fetch("http://localhost:3000/api/classes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formattedData),
    });

    const responseData = await response.json();
    console.log("API response:", responseData);
    
    if (!response.ok) {
      console.error("API Error:", responseData);
      return { 
        success: false, 
        error: true, 
        message: responseData.error || "Failed to create class" 
      };
    }

    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating class:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Unknown error" 
    };
  }
};

export const updateClass = async (
  currentState: CurrentState,
  data: ClassSchema
) => {
  try {
    const response = await fetch("http://localhost:3000/api/classes", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("API Error:", errorResponse);
      throw new Error(errorResponse.error || "Failed to update class");
    }

    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteClass = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const response = await fetch(`http://localhost:3000/api/classes?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("API Error:", errorResponse);
      throw new Error(errorResponse.error || "Failed to delete class");
    }

    revalidatePath("/list/classes");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createTeacher = async (data: any) => {
  try {
    // Log the data received by the server action
    console.log("createTeacher received data:", JSON.stringify(data, null, 2));
    
    // Ensure all required fields are present
    const requiredFields = ["username", "name", "surname", "birthday", "password", "bloodType", "sex"];
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null || data[field] === "") {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      console.error(`Missing required fields: ${missingFields.join(', ')}`);
      return { 
        success: false, 
        error: true, 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        receivedData: Object.keys(data)
      };
    }
    
    // Create a copy of the data for formatting
    const formattedData = { ...data };
    
    // Set default values for optional fields
    formattedData.address = formattedData.address || "";
    formattedData.bloodType = formattedData.bloodType || "";
    formattedData.sex = formattedData.sex || "MALE";
    
    // Convert email and phone to undefined if they're null
    // This avoids type errors with the API
    if (formattedData.email === null) formattedData.email = undefined;
    if (formattedData.phone === null) formattedData.phone = undefined;
    
    console.log("Formatted data being sent to API:", JSON.stringify(formattedData, null, 2));
    
    const response = await fetch("http://localhost:3000/api/teachers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formattedData),
    });

    const responseData = await response.json();
    console.log("API response:", responseData);
    
    if (!response.ok) {
      console.error("API Error:", responseData);
      return { 
        success: false, 
        error: true, 
        message: responseData.error || "Failed to create teacher",
        details: responseData
      };
    }

    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating teacher:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Unknown error" 
    };
  }
};

export const updateTeacher = async (
  currentState: CurrentState,
  data: TeacherSchema
) => {
  try {
    // Log the data received by the server action
    console.log("updateTeacher received data:", JSON.stringify(data, null, 2));
    
    if (!data.id) {
      console.error("Missing teacher ID");
      return { 
        success: false, 
        error: true, 
        message: "Missing teacher ID" 
      };
    }
    
    // Ensure all required fields are present
    const requiredFields = ["username", "name", "surname", "birthday", "bloodType", "sex"];
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (data[field as keyof TeacherSchema] === undefined || 
          data[field as keyof TeacherSchema] === null || 
          data[field as keyof TeacherSchema] === "") {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      console.error(`Missing required fields: ${missingFields.join(', ')}`);
      return { 
        success: false, 
        error: true, 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        receivedData: Object.keys(data)
      };
    }
    
    // Create a copy of the data for formatting
    const formattedData = { ...data };
    
    // Set default values for optional fields
    formattedData.address = formattedData.address || "";
    formattedData.bloodType = formattedData.bloodType || "";
    formattedData.sex = formattedData.sex || "MALE";
    
    // Convert email and phone to undefined if they're null
    // This avoids type errors with the API
    if (formattedData.email === null) formattedData.email = undefined;
    if (formattedData.phone === null) formattedData.phone = undefined;
    
    // Handle subjects array
    if (formattedData.subjects && !Array.isArray(formattedData.subjects)) {
      formattedData.subjects = [];
    }
    
    console.log("Formatted data being sent to API:", JSON.stringify(formattedData, null, 2));
    
    const response = await fetch("http://localhost:3000/api/teachers", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formattedData),
    });

    const responseData = await response.json();
    console.log("API response:", responseData);
    
    if (!response.ok) {
      console.error("API Error:", responseData);
      return { 
        success: false, 
        error: true, 
        message: responseData.error || "Failed to update teacher",
        details: responseData
      };
    }

    revalidatePath("/list/teachers");
    return { success: true, error: false };
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
    const response = await fetch(`http://localhost:3000/api/teachers?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("API Error:", errorResponse);
      throw new Error(errorResponse.error || "Failed to delete teacher");
    }

    revalidatePath("/list/teachers");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  try {
    // Log the data received by the server action
    console.log("createStudent received data:", JSON.stringify(data, null, 2));
    
    // Ensure all required fields are present
    const requiredFields = ["username", "name", "surname", "birthday", "password", "bloodType", "sex", "classId", "parentId"];
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (data[field as keyof StudentSchema] === undefined || 
          data[field as keyof StudentSchema] === null || 
          data[field as keyof StudentSchema] === "") {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      console.error(`Missing required fields: ${missingFields.join(', ')}`);
      return { 
        success: false, 
        error: true, 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        receivedData: Object.keys(data)
      };
    }
    
    // Create a copy of the data for formatting
    const formattedData = { ...data };
    
    // Remove the id field if it exists, as it should be generated by the database
    if ('id' in formattedData) {
      console.log("Removing id field from student data as it should be auto-generated");
      delete formattedData.id;
    }
    
    // Set default values for optional fields
    formattedData.address = formattedData.address || "";
    formattedData.bloodType = formattedData.bloodType || "";
    formattedData.sex = formattedData.sex || "MALE";
    
    // Ensure numeric fields are numbers
    if (formattedData.gradeId) {
      formattedData.gradeId = Number(formattedData.gradeId);
    }
    
    if (formattedData.classId) {
      formattedData.classId = Number(formattedData.classId);
    }
    
    // Convert email and phone to undefined if they're null
    // This avoids type errors with the API
    if (formattedData.email === null) formattedData.email = undefined;
    if (formattedData.phone === null) formattedData.phone = undefined;
    
    console.log("Formatted data being sent to API:", JSON.stringify(formattedData, null, 2));
    
    const response = await fetch("http://localhost:3000/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formattedData),
    });

    const responseData = await response.json();
    console.log("API response:", responseData);
    
    if (!response.ok) {
      console.error("API Error:", responseData);
      return { 
        success: false, 
        error: true, 
        message: responseData.error || "Failed to create student",
        details: responseData
      };
    }

    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.error("Error creating student:", err);
    return { 
      success: false, 
      error: true, 
      message: err instanceof Error ? err.message : "Unknown error" 
    };
  }
};

export const updateStudent = async (
  currentState: CurrentState,
  data: StudentSchema
) => {
  try {
    // Log the data received by the server action
    console.log("updateStudent received data:", JSON.stringify(data, null, 2));
    
    if (!data.id) {
      console.error("Missing student ID");
      return { 
        success: false, 
        error: true, 
        message: "Missing student ID" 
      };
    }
    
    // Ensure all required fields are present
    const requiredFields = ["username", "name", "surname", "birthday", "bloodType", "sex", "classId", "parentId"];
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (data[field as keyof StudentSchema] === undefined || 
          data[field as keyof StudentSchema] === null || 
          data[field as keyof StudentSchema] === "") {
        missingFields.push(field);
      }
    }
    
    if (missingFields.length > 0) {
      console.error(`Missing required fields: ${missingFields.join(', ')}`);
      return { 
        success: false, 
        error: true, 
        message: `Missing required fields: ${missingFields.join(', ')}`,
        receivedData: Object.keys(data)
      };
    }
    
    // Create a copy of the data for formatting
    const formattedData = { ...data };
    
    // Set default values for optional fields
    formattedData.address = formattedData.address || "";
    formattedData.bloodType = formattedData.bloodType || "";
    formattedData.sex = formattedData.sex || "MALE";
    
    // Ensure numeric fields are numbers
    if (formattedData.gradeId) {
      formattedData.gradeId = Number(formattedData.gradeId);
    }
    
    if (formattedData.classId) {
      formattedData.classId = Number(formattedData.classId);
    }
    
    // Convert email and phone to undefined if they're null
    // This avoids type errors with the API
    if (formattedData.email === null) formattedData.email = undefined;
    if (formattedData.phone === null) formattedData.phone = undefined;
    
    console.log("Formatted data being sent to API:", JSON.stringify(formattedData, null, 2));
    
    const response = await fetch("http://localhost:3000/api/students", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formattedData),
    });

    const responseData = await response.json();
    console.log("API response:", responseData);
    
    if (!response.ok) {
      console.error("API Error:", responseData);
      return { 
        success: false, 
        error: true, 
        message: responseData.error || "Failed to update student",
        details: responseData
      };
    }

    revalidatePath("/list/students");
    return { success: true, error: false };
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
    const response = await fetch(`http://localhost:3000/api/students?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("API Error:", errorResponse);
      throw new Error(errorResponse.error || "Failed to delete student");
    }

    revalidatePath("/list/students");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const createExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    const response = await fetch("http://localhost:3000/api/exams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("API Error:", errorResponse);
      throw new Error(errorResponse.error || "Failed to create exam");
    }

    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const updateExam = async (
  currentState: CurrentState,
  data: ExamSchema
) => {
  try {
    const response = await fetch("http://localhost:3000/api/exams", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("API Error:", errorResponse);
      throw new Error(errorResponse.error || "Failed to update exam");
    }

    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};

export const deleteExam = async (
  currentState: CurrentState,
  data: FormData
) => {
  const id = data.get("id") as string;
  try {
    const response = await fetch(`http://localhost:3000/api/exams?id=${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("API Error:", errorResponse);
      throw new Error(errorResponse.error || "Failed to delete exam");
    }

    revalidatePath("/list/exams");
    return { success: true, error: false };
  } catch (err) {
    console.log(err);
    return { success: false, error: true };
  }
};
