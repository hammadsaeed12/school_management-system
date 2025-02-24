import prisma from "@/lib/prisma";
import React from "react";
import BigCalendar from "./BigCalendar";
import { start } from "repl";

const BigCalendarContainer = async ({
  type,
  id,
}: {
  type: "teacherId" | "classId";
  id: string | number;
}) => {
  const dataRes = await prisma.lesson.findMany({
    where: {
      ...(type === "teacherId"
        ? { teacherId: id as string }
        : { classId: id as number }),
    },
  });

  const data = dataRes.map(lesson => ({
    title: lesson.name,
    start: lesson.startTime,
    end: lesson.endTime,
  }));
  return <div><BigCalendar data={data}/></div>;
};

export default BigCalendarContainer;
