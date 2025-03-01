import prisma from "@/lib/prisma";
import React from "react";

const StudentAttendanceCard = async ({id}:{id:string}) => {
  const attendace = await prisma.attendance.findMany({
    where: {
      studentId: id,
      date: {
        gte: new Date(new Date().getFullYear(),0,1),
    },
  },
  });
  return (
    <div className=" ">
      <h1 className="text-xl font-semibold">90%</h1>
      <span className="text-sm text-gray-400">Attendance</span>
    </div>
  );
};

export default StudentAttendanceCard;
