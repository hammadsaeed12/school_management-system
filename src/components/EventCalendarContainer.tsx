import React from "react";
import EventList from "./EventList";
import EventCalender from "./EventCalender";
import Image from "next/image";

type Props = {
  searchParams: Record<string, string | string[] | undefined>
}

const EventCalendarContainer = ({ searchParams }: Props) => {
  const date = searchParams.date as string | undefined;
  
  return (
    <div className="bg-white p-4 rounded-md ">
      <EventCalender />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold my-4">Events</h1>
        <Image src="/moreDark.png" alt="" width={20} height={20} />
      </div>
      <div className="flex flex-col gap-4">
        <EventList dateParam={date} />
      </div>
    </div>
  );
};

export default EventCalendarContainer;
