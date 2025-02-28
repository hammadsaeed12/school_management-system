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
import { teacherSchema, TeacherSchema } from "@/lib/formValidationSchema";

import { toast } from "react-toastify";
import { createTeacher, updateTeacher } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { set } from "zod";

const TeacherForm = ({
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
  } = useForm<TeacherSchema>({
    resolver: zodResolver(teacherSchema),
  });

  const [img, setImg] = useState<any>(null);

  const [state, formAction] = useActionState(
    type === "create" ? createTeacher : updateTeacher,
    {
      success: false,
      error: false,
    }
  );
  const onSubmit = handleSubmit((data) => {
    console.log(data);
    startTransition(() => {
      formAction({...data,img:img?.secure_url});
    });
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Teacher has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state]);

  const { subjects } = relatedData;

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new teacher" : "Update the teacher"}
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
          defaultValue={data?.birthday}
        />
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
          <label className="text-xs text-gray-500">Subjects</label>
          <select
            multiple
            className="ring-[1.5px] ring-gray-300  p-2 rounded-md text-sm w-full  border  bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            {...register("subjects")}
            defaultValue={data?.subjects}
          >
            {subjects.map((subject: { id: string; name: string }) => (
              <option value={subject.id} key={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          {errors.subjects?.message && (
            <p className="text-xs text-red-400">
              {errors.subjects.message.toString()}
            </p>
          )}
        </div>

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

export default TeacherForm;
