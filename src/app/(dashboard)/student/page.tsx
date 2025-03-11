import Announcements from "@/components/Announcement";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import EventCalendar from "@/components/EventCalender";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";

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

  // Fetch student data
  const student = await prisma.student.findUnique({
    where: { id: userId },
    include: {
      class: true,
    }
  });

  // Fetch class data
  const classItem = await prisma.class.findMany({
    where: {
      students: { some: { id: userId } },
    },
  });
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Fetch upcoming assignments
  const upcomingAssignments = await prisma.assignment.findMany({
    where: {
      classId: classItem.length > 0 ? classItem[0].id : undefined,
      dueDate: {
        gte: today,
      },
    },
    orderBy: {
      dueDate: 'asc',
    },
    take: 5,
  });

  // Fetch upcoming exams
  const upcomingExams = await prisma.exam.findMany({
    where: {
      lesson: {
        classId: classItem.length > 0 ? classItem[0].id : undefined,
      },
      startTime: {
        gte: new Date(),
      },
    },
    orderBy: {
      startTime: 'asc',
    },
    take: 3,
    include: {
      lesson: {
        include: {
          subject: true
        }
      }
    }
  });

  // Fetch attendance stats
  const attendanceStats = await prisma.attendance.findMany({
    where: {
      studentId: userId,
    },
    orderBy: {
      date: 'desc',
    },
    take: 30, // Last 30 days
  });

  const presentCount = attendanceStats.filter(a => a.status === 'PRESENT').length;
  const absentCount = attendanceStats.filter(a => a.status === 'ABSENT').length;
  const lateCount = attendanceStats.filter(a => a.status === 'LATE').length;
  const attendanceRate = attendanceStats.length > 0 
    ? Math.round((presentCount / attendanceStats.length) * 100) 
    : 100;

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {student?.name || 'Student'}</h1>
            <p className="mt-1 text-blue-100">
              {classItem.length > 0 
                ? `${classItem[0].name} - ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
                : 'No class assigned yet'}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="text-sm">Today's Classes</div>
              <div className="text-2xl font-bold">{new Date().getDay() === 0 || new Date().getDay() === 6 ? '0' : '5'}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Attendance Rate</p>
              <p className="text-2xl font-bold">{attendanceRate}%</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex space-x-2">
            <div className="bg-green-100 px-2 py-1 rounded text-xs text-green-800">Present: {presentCount}</div>
            <div className="bg-red-100 px-2 py-1 rounded text-xs text-red-800">Absent: {absentCount}</div>
            <div className="bg-yellow-100 px-2 py-1 rounded text-xs text-yellow-800">Late: {lateCount}</div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Upcoming Assignments</p>
              <p className="text-2xl font-bold">{upcomingAssignments.length}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            {upcomingAssignments.length > 0 ? (
              <Link href="/list/assignments" className="text-xs text-blue-600 hover:underline">
                View all assignments
              </Link>
            ) : (
              <p className="text-xs text-gray-500">No upcoming assignments</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Upcoming Exams</p>
              <p className="text-2xl font-bold">{upcomingExams.length}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            {upcomingExams.length > 0 ? (
              <Link href="/list/exams" className="text-xs text-blue-600 hover:underline">
                View all exams
              </Link>
            ) : (
              <p className="text-xs text-gray-500">No upcoming exams</p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Class</p>
              <p className="text-2xl font-bold">{classItem.length > 0 ? classItem[0].name : 'N/A'}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            {classItem.length > 0 ? (
              <p className="text-xs text-gray-500">Room: {classItem[0].room || 'Not assigned'}</p>
            ) : (
              <p className="text-xs text-gray-500">No class assigned</p>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">
                Class Schedule {classItem.length > 0 ? `(${classItem[0].name})` : "(No Class Assigned)"}
              </h2>
            </div>
            <div className="p-4">
              {classItem.length > 0 ? (
                <div className="h-[500px]">
                  <BigCalendarContainer type="classId" id={classItem[0].id} />
                </div>
              ) : (
                <div className="flex justify-center items-center h-64 bg-gray-50 rounded-md">
                  <div className="text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="mt-2 text-gray-500">No class schedule available</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Assignments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Upcoming Assignments</h2>
            </div>
            <div className="p-4">
              {upcomingAssignments.length > 0 ? (
                <div className="space-y-3">
                  {upcomingAssignments.map((assignment) => (
                    <div key={assignment.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{assignment.title}</p>
                        <p className="text-xs text-gray-500">
                          Due: {new Date(assignment.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 text-center">
                    <Link href="/list/assignments" className="text-sm text-blue-600 hover:underline">
                      View all assignments
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="mt-2 text-gray-500 text-sm">No upcoming assignments</p>
                </div>
              )}
            </div>
          </div>

          {/* Announcements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Announcements</h2>
            </div>
            <div>
              <Announcements />
            </div>
          </div>

          {/* Calendar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <EventCalendar />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPage;
