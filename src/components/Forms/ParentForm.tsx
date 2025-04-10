"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import React, { Dispatch, SetStateAction, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const schema = z.object({
  username: z
    .string()
    .min(3, { message: "Username must be at least 3 characters long!" })
    .max(20, { message: "Username must be at most 20 characters long!" }),
  email: z.string().email({ message: "Invalid email address!" }).optional().nullable(),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters long!" }),
  name: z.string().min(1, { message: "First name is required!" }),
  surname: z.string().min(1, { message: "Last name is required!" }),
  phone: z.string().min(1, { message: "Phone number required!" }),
  address: z.string().min(1, { message: "Address is required!" }),
  studentIds: z.array(z.string()).optional(),
});

type ParentSchema = z.infer<typeof schema>;

// Define the expected return type from the server actions
interface ActionResult {
  success: boolean;
  error: boolean;
  message?: string;
}

interface Student {
  id: string;
  name: string;
  surname: string;
  class?: {
    name: string;
  };
}

const ParentForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: {
    students?: Student[];
    currentParentStudents?: string[];
  };
}) => {
  // Debug log to see what data is being received
  console.log("ParentForm received relatedData:", relatedData);
  console.log("Students available:", relatedData?.students?.length || 0);
  
  // Format data for the form
  const formattedData = data ? {
    ...data,
    // Add any data formatting here if needed
  } : {};
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<ParentSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...formattedData,
      studentIds: relatedData?.currentParentStudents || [],
    }
  });

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [selectedStudents, setSelectedStudents] = useState<string[]>(
    relatedData?.currentParentStudents || []
  );
  
  const router = useRouter();

  // Handle student selection change
  const handleStudentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedStudents(selectedOptions);
    setValue('studentIds', selectedOptions);
  };

  const onSubmit = handleSubmit(async (formData) => {
    setErrorMessage(null);
    
    // Log the form data for debugging
    console.log("Form data being submitted:", formData);
    
    // Create a copy of the data for formatting
    const formattedData = { ...formData };
    
    // Make sure studentIds is included
    formattedData.studentIds = selectedStudents;
    
    // For update, make sure we have the ID
    if (type === "update" && data?.id) {
      (formattedData as any).id = data.id;
    }
    
    console.log("Submitting parent data:", formattedData);
    
    startTransition(async () => {
      try {
        // Send the data to the API directly
        const response = await fetch(`http://localhost:3000/api/parents`, {
          method: type === "create" ? "POST" : "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formattedData),
        });
        
        const result = await response.json();
        console.log("API response:", result);
        
        if (result.success) {
          toast(`Parent has been ${type === "create" ? "created" : "updated"}!`);
          setOpen(false);
          router.refresh();
        } else {
          setErrorMessage(result.error || "Something went wrong!");
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        setErrorMessage("An unexpected error occurred");
      }
    });
  });

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">{type==="create" ? "Create a new parent":"Update the parent"}</h1>
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
          required
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
          register={register}
          name="name"
          error={errors.name}
          defaultValue={data?.name}
          required
        />
        <InputField
          label="Lastname"
          register={register}
          name="surname"
          error={errors.surname}
          defaultValue={data?.surname}
          required
        />
        <InputField
          label="Phone"
          register={register}
          name="phone"
          error={errors.phone}
          defaultValue={data?.phone}
          required
        />
        <InputField
          label="Address"
          register={register}
          name="address"
          error={errors.address}
          defaultValue={data?.address}
          required
        />
      </div>

      <span className="text-xs text-gray-400 font-medium">
        Associated Students
      </span>
      <div className="w-full">
        <div className="flex flex-col gap-2">
          <label className="text-xs text-gray-500">Select Students <span className="text-xs text-gray-400">(Hold Ctrl/Cmd to select multiple)</span></label>
          {relatedData?.students && relatedData.students.length > 0 ? (
            <select
              multiple
              className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full border bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              onChange={handleStudentChange}
              value={selectedStudents}
              style={{ height: '100px' }}
            >
              {relatedData.students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.name} {student.surname} {student.class ? `(${student.class.name})` : ''}
                </option>
              ))}
            </select>
          ) : (
            <div className="p-4 text-sm text-red-500 border border-red-300 rounded-md bg-red-50">
              <p className="font-medium">No students available</p>
              <p className="text-xs mt-1">Please create students first before assigning them to a parent.</p>
              <a 
                href="/list/students" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-xs text-blue-500 underline mt-2 inline-block"
              >
                Go to Students List
              </a>
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Total students available: {relatedData?.students?.length || 0}
          </p>
        </div>
      </div>
      
      {errorMessage && (
        <span className="text-red-500">{errorMessage}</span>
      )}
      <button 
        className="bg-blue-400 text-white p-2 rounded-md disabled:bg-gray-300"
        disabled={isPending}
      >
        {isPending ? "Processing..." : (type === "create" ? "Create" : "Update")}
      </button>
    </form>
  );
};

export default ParentForm;
