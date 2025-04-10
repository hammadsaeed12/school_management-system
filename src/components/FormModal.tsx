"use client";

import React, {
  Dispatch,
  JSX,
  SetStateAction,
  useActionState,
  useEffect,
  useState,
  useTransition,
} from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import {
  deleteClass,
  deleteExam,
  deleteStudent,
  deleteSubject,
  deleteTeacher,
  deleteParent,
} from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { FormContainerProps } from "./FormContainer";

const deleteActionMap = {
  subject: (state: any, formData: FormData) => {
    const id = formData.get("id") as string;
    return deleteSubject(parseInt(id));
  },
  class: deleteClass,
  teacher: deleteTeacher,
  student: deleteStudent,
  exam: deleteExam,
  parent: deleteParent,
  // For tables without specific delete functions, use a generic handler
  // parent: async (currentState: any, data: FormData) => {
  //   const id = data.get("id") as string;
  //   try {
  //     const response = await fetch(`http://localhost:3000/api/parents?id=${id}`, {
  //       method: "DELETE",
  //     });
  //     
  //     const responseData = await response.json();
  //     
  //     if (!response.ok) {
  //       return { 
  //         success: false, 
  //         error: true, 
  //         message: responseData.error || "Failed to delete parent" 
  //       };
  //     }
  //     
  //     return { 
  //       success: true, 
  //       error: false, 
  //       message: "Parent deleted successfully!" 
  //     };
  //   } catch (err) {
  //     return { 
  //       success: false, 
  //       error: true, 
  //       message: err instanceof Error ? err.message : "Unknown error" 
  //     };
  //   }
  // },
  // parent: deleteSubject,
  // lesson: deleteSubject,
  // assignment: deleteSubject,
  // result: deleteSubject,
  // attendance: deleteSubject,
  // event: deleteSubject,
  // announcement: deleteSubject,
};

const TeacherForm = dynamic(() => import("./Forms/TeacherForm"), {
  loading: () => <h1>Loading...</h1>,
});
const StudentForm = dynamic(() => import("./Forms/StudentForm"), {
  loading: () => <h1>Loading...</h1>,
});
const SubjectForm = dynamic(() => import("./Forms/SubjectForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ClassForm = dynamic(() => import("./Forms/ClassForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ExamForm = dynamic(() => import("./Forms/ExamForm"), {
  loading: () => <h1>Loading...</h1>,
});
const ParentForm = dynamic(() => import("./Forms/ParentForm"), {
  loading: () => <h1>Loading...</h1>,
});
// const LessonForm = dynamic(() => import("./Forms/LessonForm"));
// // const SubjectForm = dynamic(() => import("./Forms/SubjectForm"));
// const LessonForm = dynamic(() => import("./Forms/LessonForm"));
// // const ExamForm = dynamic(() => import("./Forms/ExamForm"));
// const AssignmentForm = dynamic(() => import("./Forms/Assignment"));
// const ResultForm = dynamic(() => import("./Forms/ResultForm"));
// const AttendanceForm = dynamic(() => import("./Forms/AttendanceForm"));
// const EventForm = dynamic(() => import("./Forms/EventForm"));
// const AnnouncementForm = dynamic(() => import("./Forms/AnnouncementForm"));

const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any,
    relatedData?: any
  ) => JSX.Element;
} = {
  student: (setOpen, type, data, relatedData) => (
    <StudentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  teacher: (setOpen, type, data, relatedData) => (
    <TeacherForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  subject: (setOpen, type, data, relatedData) => (
    <SubjectForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  class: (setOpen, type, data, relatedData) => (
    <ClassForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  exam: (setOpen, type, data, relatedData) => (
    <ExamForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
  parent: (setOpen, type, data, relatedData) => (
    <ParentForm
      type={type}
      data={data}
      setOpen={setOpen}
      relatedData={relatedData}
    />
  ),
};
const FormModal = ({
  table,
  type,
  data,
  id,
  relatedData,
}: FormContainerProps & { relatedData?: any }) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";
  const [open, setOpen] = useState(false);
  const Form = () => {
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();
    
    // Use useEffect for any client-side only initialization
    useEffect(() => {
      // This code only runs on the client, avoiding hydration mismatch
    }, []);

    const handleDelete = async (e: React.FormEvent) => {
      e.preventDefault();
      
      const formData = new FormData();
      formData.append("id", id as string);
      
      const deleteAction = deleteActionMap[table as keyof typeof deleteActionMap];
      
      startTransition(async () => {
        const result = await deleteAction({ success: false, error: false, message: "" }, formData);
        
        console.log("Delete action result:", result);
        
        if (result.success) {
          toast(`${table} has been deleted!`);
          setOpen(false);
          router.refresh();
        } else {
          toast.error(result.message || `Failed to delete ${table}`);
        }
      });
    };

    return type === "delete" && id ? (
      <form onSubmit={handleDelete} className="flex flex-col gap-4 p-4">
        <input type="hidden" name="id" value={id} />
        <span className="font-medium text-center">
          All data will be lost. Are you sure you want to delete this {table}?
        </span>
        {error && (
          <span className="text-red-500">{error}</span>
        )}
        <button 
          className="self-center px-4 py-2 text-white bg-red-700 border-none rounded-md w-max disabled:bg-red-300"
          disabled={isPending}
          type="submit"
        >
          {isPending ? "Deleting..." : "Delete"}
        </button>
      </form>
    ) : type === "create" || type === "update" ? (
      forms[table](setOpen, type, data, relatedData)
    ) : (
      "Form not found!"
    );
  };
  return (
    <>
      <button
        className={`${size} flex items-center justify-center rounded-full ${bgColor}`}
        onClick={() => setOpen(true)}
      >
        <Image src={`/${type}.png`} alt="" width={16} height={16} />
      </button>
      {open && (
        <div className="absolute top-0 left-0 z-50 flex items-center justify-center w-screen h-screen bg-black bg-opacity-60">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <Form />
            <div
              className="absolute cursor-pointer top-4 right-4"
              onClick={() => setOpen(false)}
            >
              <Image src="/close.png" alt="" width={14} height={14} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default FormModal;
