"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
const schema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be atleast 3 character long!" })
    .max(20, { message: "Username must be most 20 character long!" }),
  email: z.string().email({ message: "Invalid email address!" }),
  password: z
    .string()
    .min(8, { message: "Password must be atleast 8 characters long!" }),
  firstName: z.string().min(1, { message: "First name is required!" }),
  LastName: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().min(1, { message: "Phone number required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
  bloodType: z.string().min(1, { message: "bloodtype is required!" }),
  birthday: z.date({ message: "Birthday date is required!" }),
  gender: z.enum(["male", "female"], { message: "Gender is required!" }),
  img: z.instanceof(File, { message: "Image is required!" }),
});
type Inputs = z.infer<typeof schema>;
const AnnouncementForm = ({
  type,
  data,
}: {
  type: "create" | "update";
  data: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
  });

  const onSubmit = handleSubmit((data) => {
    console.log(data);
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">Create a new Announcement</h1>
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
          name="firstName"
          error={errors.firstName}
          defaultValue={data?.firstName}
        />
        <InputField
          label="Lastname"
          register={register}
          name="LastName"
          type="LastName"
          error={errors.LastName}
          defaultValue={data?.LastName}
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
        <label className="text-xs text-gray-500">Gender</label>
        <select
          className="ring-[1.5px] ring-gray-300  p-2 rounded-md text-sm w-full  border  bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          {...register("gender")}
          defaultValue={data?.gender}
        >
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
        {errors.gender?.message && (
          <p className="text-xs text-red-400">
            {errors.gender.message.toString()}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 w-full md:w-1/4 justify-center">
        <label className="text-xs text-gray-500 flex items-center gap-2 cursor-pointer"htmlFor="img">
          <Image src="/upload.png" alt="" width={28} height={28}/>
          <span>Upload a photo</span>
        </label>
        <input type="file" id="img" {...register("img")} className="hidden"/>
        
        {errors.img?.message && (
          <p className="text-xs text-red-400">
            {errors.img.message.toString()}
          </p>
        )}
      </div>
      </div>
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AnnouncementForm;
