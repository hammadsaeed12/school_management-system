import { Class } from "@prisma/client";
import { z } from "zod";

export const subjectSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  teachers: z.array(z.string()), //teacher ids
});
export type SubjectSchema = z.infer<typeof subjectSchema>;

export const classSchema = z.object({
  id: z.coerce.number().optional(),
  name: z.string().min(1, { message: "Subject name is required!" }),
  capacity: z.coerce.number().min(1, { message: "Capacity name is required!" }),
  gradeId: z.coerce.number().min(1, { message: "Grade name is required!" }),
  supervisorId: z.coerce.string().optional(),
});
export type ClassSchema = z.infer<typeof classSchema>;

export const teacherSchema = z.object({
  id: z.string().optional(),
  username: z
    .string()
    .min(3, { message: "Username must be atleast 3 character long!" })
    .max(20, { message: "Username must be most 20 character long!" }),
  password: z
    .string()
    .min(8, { message: "Password must be atleast 8 characters long!" })
    .optional()
    .or(z.literal("")),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  email: z
    .string()
    .email({ message: "Invalid email address!" })
    .optional()
    .or(z.literal("")),
  phone: z.string().optional(),
  address: z.string(),
  bloodType: z.string().min(1, { message: "bloodtype is required!" }),
  birthday: z.coerce.date({ message: "Birthday date is required!" }),
  sex: z.enum(["MALE", "FEMALE"], { message: "Gender is required!" }),
  img: z.string().optional(),
  subjects: z.array(z.string()).optional(),
});
export type TeacherSchema = z.infer<typeof teacherSchema>;
