import Announcements from "@/components/Announcement";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalender";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";

const StudentPage = async () => {
  const { userId } = await auth();

  // Add a fallback for when userId is null
  if (!userId) {
    return (
      <div className="p-4 flex justify-center items-center h-screen">
        <div className="bg-white p-8 rounded-md shadow-md">
          <h1 className="text-xl font-semibold mb-4">Authentication Required</h1>
          <p>Please sign in to access your student dashboard.</p>
          <a href="/sign-in" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const classItem = await prisma.class.findMany({
    where: {
      students: { some: { id: userId } },
    },
  });

  console.log("Class items found:", classItem);

  return (
    <div className="p-4 flex gap-4 flex-col xl:flex-row">
      {/* LEFT */}
      <div className="w-full xl:w-2/3">
        <div className="h-full bg-white p-4 rounded-md">
          <h1 className="text-xl font-semibold">
            Schedule {classItem.length > 0 ? `(${classItem[0].name})` : "(No Class Assigned)"}
          </h1>
          {classItem.length > 0 ? (
            <BigCalendarContainer type="classId" id={classItem[0].id} />
          ) : (
            <div className="flex justify-center items-center h-64 bg-gray-100 rounded-md mt-4">
              <p className="text-gray-500">No class schedule available</p>
            </div>
          )}
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-full xl:w-1/3 flex flex-col gap-8">
        <EventCalendar />
        <Announcements />
      </div>
    </div>
  );
};

export default StudentPage;
