"use client";

import React, { Dispatch, JSX, SetStateAction, useActionState, useEffect, useState } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useFormState } from "react-dom";
import { deleteSubject} from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const deleteActionMap = {
  subject: deleteSubject,
  // class: deleteClass,
  // teacher: deleteTeacher,
  // student: deleteStudent,
  // exam: deleteExam,
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
// const ParentForm = dynamic(() => import("./Forms/ParentForm"));
// const ClassForm = dynamic(() => import("./Forms/ClassForm"));
// // const SubjectForm = dynamic(() => import("./Forms/SubjectForm"));
// const LessonForm = dynamic(() => import("./Forms/LessonForm"));
// const ExamForm = dynamic(() => import("./Forms/ExamForm"));
// // const AssignmentForm = dynamic(() => import("./Forms/AssignmentForm"));
// const ResultForm = dynamic(() => import("./Forms/ResultForm"));
// const AttendanceForm = dynamic(() => import("./Forms/AttendanceForm"));
// const EventForm = dynamic(() => import("./Forms/EventForm"));
// const AnnouncementForm = dynamic(() => import("./Forms/AnnouncementForm"));

const forms: {
  [key: string]: (
    setOpen: Dispatch<SetStateAction<boolean>>,
    type: "create" | "update",
    data?: any
  ) => JSX.Element;
} = {
  teacher: (setOpen, type, data) => (
    <TeacherForm type={type} data={data} setOpen={setOpen} />
  ),
  student: (setOpen, type, data) => (
    <StudentForm type={type} data={data} setOpen={setOpen} />
  ),
  subject: (setOpen, type, data) => (
    <SubjectForm type={type} data={data} setOpen={setOpen} />
  ),
  parent: (setOpen, type, data) => (
    <ParentForm type={type} data={data} setOpen={setOpen} />
  ),
};
const FormModal = ({
  table,
  type,
  data,
  id,
}: {
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
}) => {
  const size = type === "create" ? "w-8 h-8" : "w-7 h-7";
  const bgColor =
    type === "create"
      ? "bg-lamaYellow"
      : type === "update"
      ? "bg-lamaSky"
      : "bg-lamaPurple";
  const [open, setOpen] = useState(false);
  const Form = () => {
    const [state, formAction] = useActionState(deleteActionMap[table as keyof typeof deleteActionMap], {
      success: false,
      error: false,
    });

    const router = useRouter();
    
      useEffect(() => {
        if (state.success) {
          toast(`Subject has been deleted!`);
          setOpen(false);
          router.refresh();
        }
      }, [state]);

    return type === "delete" && id ? (
      <form action={formAction} className="p-4 flex flex-col gap-4">
        <input type="text | number" name="id" value={id} hidden />
        <span className="text-center font-medium">
          All data will be lost. Are you sure you want to delte this {table}?
        </span>
        <button className="bg-red-700 text-white py-2 px-4 rounded-md border-none w-max self-center">
          Delete
        </button>
      </form>
    ) : type === "create" || type === "update" ? (
      forms[table](setOpen, type, data)
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
        <div className="w-screen h-screen absolute left-0 top-0 bg-black bg-opacity-60 z-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-md relative w-[90%] md:w-[70%] lg:w-[60%] xl:w-[50%] 2xl:w-[40%]">
            <Form />
            <div
              className="absolute top-4 right-4 cursor-pointer"
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
