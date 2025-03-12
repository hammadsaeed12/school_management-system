"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { Dispatch, SetStateAction, useTransition } from "react";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { createSubject, updateSubject } from "@/lib/actions";
import { subjectSchema, SubjectSchema } from "@/lib/formValidationSchema";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const SubjectForm = ({
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
    setError,
  } = useForm<SubjectSchema>({
    resolver: zodResolver(subjectSchema),
    defaultValues: {
      id: data?.id || undefined,
      name: data?.name || "",
      teachers: data?.teachers?.map((t: any) => t.id) || [],
    },
  });

  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const onSubmit = handleSubmit(async (formData) => {
    try {
      startTransition(async () => {
        const result = type === "create" 
          ? await createSubject({ success: false, error: false }, formData)
          : await updateSubject({ success: false, error: false }, formData);

        if (result?.success) {
          toast.success(`Subject ${type === "create" ? "created" : "updated"} successfully!`);
          setOpen(false);
          router.refresh();
        } else {
          toast.error(result?.message || "Operation failed");
          if (result?.message) {
            setError("root", { message: result.message });
          }
        }
      });
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("An unexpected error occurred");
    }
  });

  const { teachers = [] } = relatedData || {};

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new subject" : "Update the subject"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Subject name"
          register={register}
          name="name"
          error={errors.name}
          defaultValue={data?.name}
        />
        
        {data?.id && (
          <input
            type="hidden"
            {...register("id")}
            defaultValue={data.id}
          />
        )}

        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Teachers</label>
          <select
            multiple
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full border bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            {...register("teachers")}
          >
            {teachers.map((teacher: { id: string; name: string; surname: string }) => (
              <option key={teacher.id} value={teacher.id}>
                {`${teacher.name} ${teacher.surname}`}
              </option>
            ))}
          </select>
          {errors.teachers && (
            <p className="text-xs text-red-400">
              {errors.teachers.message}
            </p>
          )}
        </div>
      </div>

      {errors.root && (
        <p className="text-sm text-red-500">{errors.root.message}</p>
      )}

      <button
        type="submit"
        className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors disabled:bg-blue-300"
        disabled={isPending}
      >
        {isPending
          ? "Processing..."
          : type === "create"
          ? "Create Subject"
          : "Update Subject"}
      </button>
    </form>
  );
};

export default SubjectForm;
