"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState, startTransition } from "react";
import {
  studentSchema,
  StudentSchema,
} from "@/lib/formValidationSchema";
import {
  createStudent,
  updateStudent,
} from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { CldUploadWidget } from "next-cloudinary";

// Define the expected return type from the server actions
interface ActionResult {
  success: boolean;
  error: boolean;
  message?: string;
}

const StudentForm = ({
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
  // Extract classes and parents from relatedData early to use in defaultValues
  const { grades, classes, parents } = relatedData || {};
  
  // Format data for the form
  const formattedData = data ? {
    ...data,
    birthday: data.birthday ? new Date(data.birthday) : undefined,
    sex: data.sex || "MALE",
    bloodType: data.bloodType || "",
    address: data.address || "",
  } : {
    sex: "MALE",
    bloodType: "",
    address: "",
  };
  
  console.log("Initial form data:", formattedData);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<StudentSchema>({
    resolver: zodResolver(studentSchema),
    defaultValues: formattedData
  });

  const [img, setImg] = useState<any>(data?.img ? { secure_url: data.img } : null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);
  
  const router = useRouter();

  const onSubmit = handleSubmit(async (formData) => {
    setErrorMessage(null);
    setIsSubmitting(true);
    
    // Log the form data for debugging
    console.log("Form data being submitted:", formData);
    
    // Ensure all required fields are present
    const requiredFields = ["username", "name", "surname", "birthday", "bloodType", "sex", "classId", "parentId"];
    const missingFields = [];
    
    for (const field of requiredFields) {
      if (!formData[field as keyof StudentSchema]) {
        missingFields.push(field);
      }
    }
    
    // Add password validation for create
    if (type === "create" && (!formData.password || formData.password === "")) {
      missingFields.push("password");
    }
    
    if (missingFields.length > 0) {
      setErrorMessage(`Missing required fields: ${missingFields.join(', ')}`);
      setIsSubmitting(false);
      return;
    }
    
    // Create a copy of the data for formatting
    const formattedData = { ...formData };
    
    // Add the image if available
    if (img?.secure_url) {
      formattedData.img = img.secure_url;
    }
    
    // Set default values for optional fields
    formattedData.address = formattedData.address || "";
    formattedData.bloodType = formattedData.bloodType || "";
    formattedData.sex = formattedData.sex || "MALE";
    
    // For update, make sure we have the ID
    if (type === "update" && !formattedData.id && data?.id) {
      formattedData.id = data.id;
    }
    
    console.log("Formatted data being sent to server:", formattedData);
    
    try {
      let result: ActionResult;
      if (type === "create") {
        result = await createStudent({ success: false, error: false }, formattedData);
      } else {
        result = await updateStudent({ success: false, error: false }, formattedData);
      }
      
      console.log("Action result:", result);
      
      if (result.success) {
        toast(`Student has been ${type === "create" ? "created" : "updated"}!`);
        setFormSuccess(true);
        setOpen(false);
        router.refresh();
      } else {
        setErrorMessage(result.message || "Something went wrong!");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setErrorMessage("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  });

  // For debugging - watch all form values
  const allValues = watch();
  console.log("Current form values:", allValues);

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new student" : "Update the student"}
      </h1>
      
      {/* Hidden ID field for updates */}
      {type === "update" && data?.id && (
        <input type="hidden" {...register("id")} defaultValue={data.id} />
      )}
      
      <span className="text-xs text-gray-400 font-medium">
        Authentication Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Username"
          name="username"
          register={register}
          error={errors.username}
          defaultValue={data?.username}
          required
        />
        <InputField
          label="Email"
          name="email"
          register={register}
          type="email"
          error={errors.email}
          defaultValue={data?.email}
        />
        <InputField
          label="Password"
          name="password"
          register={register}
          type="password"
          error={errors.password}
          defaultValue=""
          required={type === "create"}
        />
      </div>

      <span className="text-xs text-gray-400 font-medium">
        Personal Information
      </span>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Firstname"
          name="name"
          register={register}
          error={errors.name}
          defaultValue={data?.name}
          required
        />
        <InputField
          label="Lastname"
          name="surname"
          register={register}
          error={errors.surname}
          defaultValue={data?.surname}
          required
        />
        <InputField
          label="Phone"
          name="phone"
          register={register}
          error={errors.phone}
          defaultValue={data?.phone}
        />
        <InputField
          label="Address"
          name="address"
          register={register}
          error={errors.address}
          defaultValue={data?.address}
          required
        />
        <InputField
          label="BloodType"
          name="bloodType"
          register={register}
          error={errors.bloodType}
          defaultValue={data?.bloodType}
          required
        />
        <InputField
          label="Birthday"
          name="birthday"
          register={register}
          type="date"
          error={errors.birthday}
          defaultValue={data?.birthday ? new Date(data.birthday).toISOString().split("T")[0] : undefined}
          required
        />
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Sex <span className="text-red-500">*</span></label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full border bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            {...register("sex")}
            defaultValue={data?.sex || "MALE"}
            required
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
          <label className="text-xs text-gray-500">Grade <span className="text-red-500">*</span></label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full border bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            {...register("gradeId")}
            defaultValue={data?.gradeId}
            required
          >
            {grades?.map((grade: any) => (
              <option value={grade.id} key={grade.id}>
                {grade.name}
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
          <label className="text-xs text-gray-500">Class <span className="text-red-500">*</span></label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full border bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            {...register("classId")}
            defaultValue={data?.classId}
            required
          >
            {classes?.map((classItem: any) => (
              <option value={classItem.id} key={classItem.id}>
                {classItem.name}
              </option>
            ))}
          </select>
          {errors.classId?.message && (
            <p className="text-xs text-red-400">
              {errors.classId.message.toString()}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2 w-full md:w-1/4">
          <label className="text-xs text-gray-500">Parent <span className="text-red-500">*</span></label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full border bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            {...register("parentId")}
            defaultValue={data?.parentId}
            required
          >
            {parents?.map((parent: any) => (
              <option value={parent.id} key={parent.id}>
                {parent.name} {parent.surname}
              </option>
            ))}
          </select>
          {errors.parentId?.message && (
            <p className="text-xs text-red-400">
              {errors.parentId.message.toString()}
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
      {errorMessage && (
        <span className="text-red-500">{errorMessage}</span>
      )}
      <button 
        className="bg-blue-400 text-white p-2 rounded-md disabled:bg-gray-300"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Processing..." : (type === "create" ? "Create" : "Update")}
      </button>
    </form>
  );
};

export default StudentForm;
