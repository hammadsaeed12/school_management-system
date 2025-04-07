"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./EventCalendar.css"; // We'll create this file next

type ValuePiece = Date | null;

type Value = ValuePiece | [ValuePiece, ValuePiece];

const EventCalendar = () => {
  const [value, onChange] = useState<Value>(new Date());

  const router = useRouter();

  useEffect(() => {
    if (value instanceof Date) {
      router.push(`?date=${value.toISOString().split('T')[0]}`);
    }
  }, [value, router]);

  return (
    <div className="event-calendar-container">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-lg font-semibold">Calendar</h2>
      </div>
      <div className="p-4">
        <Calendar 
          onChange={onChange} 
          value={value} 
          className="custom-calendar"
          nextLabel={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          }
          prevLabel={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          }
          navigationLabel={({ date }) => (
            <span className="font-medium">
              {date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          )}
          tileClassName={({ date, view }) => {
            // Add custom classes for today
            if (
              view === 'month' &&
              date.getDate() === new Date().getDate() &&
              date.getMonth() === new Date().getMonth() &&
              date.getFullYear() === new Date().getFullYear()
            ) {
              return 'today-tile';
            }
            return null;
          }}
        />
      </div>
    </div>
  );
};

export default EventCalendar;