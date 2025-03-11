import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import React from "react";
import Link from "next/link";

const Announcement = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const roleConditions = {
    teacher: { lessons: { some: { teacherId: userId! } } },
    student: { students: { some: { id: userId! } } },
    parent: { students: { some: { parentId: userId! } } },
  };

  const data = await prisma.announcement.findMany({
    take: 3,
    orderBy: { date: "desc" },
    where: {
      ...(role !== "admin" && {
        OR: [
          { classId: null },
          { class: roleConditions[role as keyof typeof roleConditions] || {} },
        ],
      }),
    },
  });

  // Define announcement card colors
  const cardColors = [
    { bg: "bg-blue-50", icon: "text-blue-500", border: "border-blue-100" },
    { bg: "bg-purple-50", icon: "text-purple-500", border: "border-purple-100" },
    { bg: "bg-amber-50", icon: "text-amber-500", border: "border-amber-100" },
  ];

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Announcements</h2>
        <Link href="/list/announcements" className="text-sm text-blue-600 hover:underline">
          View All
        </Link>
      </div>
      
      {data.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-gray-100 p-3 rounded-full inline-flex mx-auto mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
            </svg>
          </div>
          <p className="text-gray-500">No announcements available</p>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((announcement, index) => (
            <div 
              key={announcement.id} 
              className={`${cardColors[index % 3].bg} ${cardColors[index % 3].border} border rounded-xl p-4 transition-all hover:shadow-md`}
            >
              <div className="flex items-start">
                <div className={`${cardColors[index % 3].bg} p-2 rounded-full mr-3 mt-1`}>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${cardColors[index % 3].icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-medium text-gray-900">{announcement.title}</h3>
                    <span className="text-xs bg-white rounded-md px-2 py-1 text-gray-500 ml-2">
                      {new Date(announcement.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1 line-clamp-3">
                    {announcement.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Announcement;

