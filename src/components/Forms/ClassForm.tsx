"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  classSchema,
  ClassSchema,
} from "@/lib/formValidationSchema";
import {
  createClass,
  updateClass,
} from "@/lib/actions";
import { useEffect, SetStateAction, Dispatch, useState } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const ClassForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ClassSchema>({
    resolver: zodResolver(classSchema),
    defaultValues: data ? {
      ...data,
      id: data.id,
      name: data.name,
      capacity: data.capacity,
      gradeId: data.gradeId,
      supervisorId: data.supervisorId || "",
    } : {
      supervisorId: "",
      gradeId: "",
    }
  });

  // Initialize state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  // Use useEffect for any client-side only initialization
  useEffect(() => {
    // This code only runs on the client, avoiding hydration mismatch
  }, []);

  const onSubmit = handleSubmit(async (formData) => {
    setIsSubmitting(true);
    setError(null);
    console.log("Form data being submitted:", formData);
    
    try {
      const result = type === "create" 
        ? await createClass({ success: false, error: false }, formData)
        : await updateClass({ success: false, error: false }, formData);
      
      console.log("Action result:", result);
      
      if (result.success) {
        toast(`Class has been ${type === "create" ? "created" : "updated"}!`);
        setOpen(false);
        router.refresh();
      } else if (result.error) {
        setError(result.message || "Something went wrong!");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  });

  const { teachers, grades } = relatedData || { teachers: [], grades: [] };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new class" : "Update the class"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Class name"
          name="name"
          defaultValue={data?.name}
          register={register}
          error={errors?.name}
          required
        />
        <InputField
          label="Capacity"
          name="capacity"
          defaultValue={data?.capacity}
          register={register}
          error={errors?.capacity}
          required
          type="number"
        />
        {data && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data?.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Supervisor</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("supervisorId")}
            defaultValue={data?.supervisorId || ""}
          >
            <option value="">No supervisor</option>
            {teachers && teachers.map((teacher: { id: string; name: string; surname: string }) => (
              <option value={teacher.id} key={teacher.id}>
                {teacher.name + " " + teacher.surname}
              </option>
            ))}
          </select>
          {errors.supervisorId?.message && (
            <p className="text-xs text-red-400">
              {errors.supervisorId.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Grade <span className="text-red-500">*</span></label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("gradeId")}
            defaultValue={data?.gradeId || ""}
            required
          >
            <option value="">Select a grade</option>
            {grades && grades.map((grade: { id: number; level: number }) => (
              <option value={grade.id} key={grade.id}>
                {grade.level}
              </option>
            ))}
          </select>
          {errors.gradeId?.message && (
            <p className="text-xs text-red-400">
              {errors.gradeId.message.toString()}
            </p>
          )}
        </div>
      </div>
      {error && (
        <span className="text-red-500">{error}</span>
      )}
      <button 
        className="bg-blue-400 text-white p-2 rounded-md disabled:bg-gray-300"
        disabled={isSubmitting}
        type="submit"
      >
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default ClassForm;
