"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, {
  Dispatch,
  SetStateAction,
  startTransition,
  useActionState,
  useEffect,
  useState,
} from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import { studentSchema, StudentSchema } from "@/lib/formValidationSchema";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { createStudent, updateStudent } from "@/lib/actions";

const StudentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
  });

  const [img, setImg] = useState<any>(null);

  const [state, formAction] = useActionState(
    type === "create" ? createStudent : updateStudent,
    {
      success: false,
      error: false,
    }
  );
  const onSubmit = handleSubmit((data) => {
    console.log(data);
    startTransition(() => {
      formAction({ ...data, img: img?.secure_url });
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Student has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state]);

  const { grades, classes } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new student" : "Update the student"}
      </h1>
      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Username"
          register={register}
          name="username"
          error={errors.username}
          defaultValue={data?.username}
        />
        <InputField
          label="Email"
          register={register}
          name="email"
          type="email"
          error={errors.email}
          defaultValue={data?.email}
        />
        
        <InputField
          label="Password"
          register={register}
          name="password"
          type="password"
          error={errors.password}
          defaultValue={data?.password}
        />
      </div>

      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>
      <CldUploadWidget
        uploadPreset="school"
        onSuccess={(result, { widget }) => {
          setImg(result.info);
          widget.close();
        }}
      >
        {({ open }) => {
          return (
            <div
              className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"
              onClick={() => open()}
            >
              <Image src="/upload.png" alt="" width={28} height={28} />
              <span>Upload a photo</span>
            </div>
          );
        }}
      </CldUploadWidget>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Firstname"
          register={register}
          name="name"
          error={errors.name}
          defaultValue={data?.name}
        />
        <InputField
          label="Lastname"
          register={register}
          name="surname"
          type="surname"
          error={errors.surname}
          defaultValue={data?.surname}
        />
        <InputField
          label="Parent Id"
          register={register}
          name="parentId"
          error={errors.parentId}
          defaultValue={data?.parentId}
        />
        <InputField
          label="Phone"
          register={register}
          name="phone"
          type="phone"
          error={errors.phone}
          defaultValue={data?.phone}
        />
        <InputField
          label="Address"
          register={register}
          name="address"
          type="address"
          error={errors.address}
          defaultValue={data?.address}
        />
        <InputField
          label="BloodType"
          register={register}
          name="bloodType"
          type="bloodType"
          error={errors.bloodType}
          defaultValue={data?.bloodType}
        />
        <InputField
          label="Birthday"
          register={register}
          name="birthday"
          type="date"
          error={errors.birthday}
          defaultValue={data?.birthday.toISOString().split("T")[0]}
        />
        {data && (
          <InputField
            label="Id"
            register={register}
            name="id"
            error={errors.id}
            defaultValue={data?.id}
            hidden
          />
        )}
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">sex</label>
          <select
            className="ring-[1.5px] ring-gray-300  p-2 rounded-md text-sm w-full  border  bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            {...register("sex")}
            defaultValue={data?.sex}
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
          </select>
          {errors.sex?.message && (
            <p className="text-xs text-red-400">
              {errors.sex.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Grade</label>
          <select
            className="ring-[1.5px] ring-gray-300  p-2 rounded-md text-sm w-full  border  bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            {...register("gradeId")}
            defaultValue={data?.gradeId}
          >
            {grades.map((grade: { id: string; level: number }) => (
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
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Class</label>
          <select
            className="ring-[1.5px] ring-gray-300  p-2 rounded-md text-sm w-full  border  bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            {...register("classId")}
            defaultValue={data?.classId}
          >
            {classes.map(
              (classItem: {
                id: string;
                name: string;
                capacity: number;
                _count: { students: number };
              }) => (
                <option value={classItem.id} key={classItem.id}>
                  ({classItem.name} -{" "}
                  {classItem._count.students + "/" + classItem.capacity}{" "}
                  Capacity)
                </option>
              )
            )}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">
              {errors.classId.message.toString()}
            </p>
          )}
        </div>
      </div>
      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default StudentForm;

