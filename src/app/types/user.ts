export enum UserRole {
    TEACHER = "teacher",
    ADMIN = "admin",
    PARENT = "parent",
    STUDENT = "student",
  }
  
  export interface User {
    username: string
    role: UserRole | null
  }
  
  