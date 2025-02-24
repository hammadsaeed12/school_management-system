import React from "react";
import AttenndanceChart from "./AttenndanceChart";
import Image from "next/image";
import prisma from "@/lib/prisma";

const AttendanceChartContainer = async () => {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const data = await prisma.attendance.findMany({});
  return (
    <div className="bg-white rounded-lg p-4 h-full">
      <div className="flex justify-between items-center">
        <h1 className="text-lg font-semibold">Attendance</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <AttenndanceChart />
    </div>
  );
};

export default AttendanceChartContainer;
