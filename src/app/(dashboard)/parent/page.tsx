import Announcements from "@/components/Announcement";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";

const ParentPage = async () => {
  const { userId } = await auth();
  
  // Add a fallback for when userId is null
  if (!userId) {
    return (
      <div className="p-4 flex justify-center items-center h-screen">
        <div className="bg-white p-8 rounded-md shadow-md">
          <h1 className="text-xl font-semibold mb-4">Authentication Required</h1>
          <p>Please sign in to access your parent dashboard.</p>
          <a href="/sign-in" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Fetch parent data
  const parent = await prisma.parent.findUnique({
    where: { id: userId },
  });
  
  // Fetch children (students) data with their classes
  const students = await prisma.student.findMany({
    where: {
      parentId: userId,
    },
    include: {
      class: true,
    },
  });

  // For each student, fetch additional data
  const studentsWithData = await Promise.all(
    students.map(async (student) => {
      // Fetch attendance data
      const attendanceStats = await prisma.attendance.findMany({
        where: {
          studentId: student.id,
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

      // Fetch upcoming exams
      const upcomingExams = await prisma.exam.findMany({
        where: {
          lesson: {
            classId: student.classId,
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

      // Fetch recent results
      const recentResults = await prisma.result.findMany({
        where: {
          studentId: student.id,
        },
        orderBy: {
          id: 'desc',
        },
        take: 5,
        include: {
          exam: {
            include: {
              lesson: {
                include: {
                  subject: true
                }
              }
            },
          },
        },
      });

      // Calculate average grade
      const averageGrade = recentResults.length > 0
        ? recentResults.reduce((acc, result) => acc + result.grade, 0) / recentResults.length
        : 0;

      return {
        ...student,
        attendanceStats: {
          presentCount,
          absentCount,
          lateCount,
          attendanceRate,
        },
        upcomingExams,
        recentResults,
        averageGrade,
      };
    })
  );

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {parent?.name || 'Parent'}</h1>
            <p className="mt-1 text-green-100">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="text-sm">Children</div>
              <div className="text-2xl font-bold">{students.length}</div>
            </div>
          </div>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h2 className="text-xl font-semibold mt-4">No Children Found</h2>
          <p className="text-gray-500 mt-2">You don't have any children registered in the system yet.</p>
          <p className="text-gray-500 mt-1">Please contact the school administration for assistance.</p>
        </div>
      ) : (
        // For each student, show their dashboard section
        studentsWithData.map((student) => (
          <div key={student.id} className="space-y-6">
            {/* Student Header */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center">
                <div className="bg-green-100 p-3 rounded-full mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">{student.name} {student.surname}</h2>
                  <p className="text-gray-500">
                    Class: {student.class?.name || 'Not Assigned'} • 
                    ID: {student.id.substring(0, 8)}
                  </p>
                </div>
                <div className="ml-auto">
                  <Link 
                    href={`/list/students/${student.id}`} 
                    className="px-4 py-2 bg-green-100 text-green-700 rounded-md text-sm font-medium hover:bg-green-200 transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Attendance Rate</p>
                    <p className="text-2xl font-bold">{student.attendanceStats.attendanceRate}%</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-4 flex space-x-2">
                  <div className="bg-green-100 px-2 py-1 rounded text-xs text-green-800">Present: {student.attendanceStats.presentCount}</div>
                  <div className="bg-red-100 px-2 py-1 rounded text-xs text-red-800">Absent: {student.attendanceStats.absentCount}</div>
                  <div className="bg-yellow-100 px-2 py-1 rounded text-xs text-yellow-800">Late: {student.attendanceStats.lateCount}</div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Average Grade</p>
                    <p className="text-2xl font-bold">{student.averageGrade.toFixed(1)}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2">
                  <Link href={`/list/results?studentId=${student.id}`} className="text-xs text-blue-600 hover:underline">
                    View all results
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Upcoming Exams</p>
                    <p className="text-2xl font-bold">{student.upcomingExams.length}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2">
                  <Link href="/list/exams" className="text-xs text-blue-600 hover:underline">
                    View all exams
                  </Link>
                </div>
              </div>

              <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Class</p>
                    <p className="text-2xl font-bold">{student.class?.name || 'N/A'}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                </div>
                <div className="mt-2">
                  {student.class ? (
                    <p className="text-xs text-gray-500">Room: {student.class.room || 'Not assigned'}</p>
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
                      Class Schedule {student.class ? `(${student.class.name})` : "(No Class Assigned)"}
                    </h2>
                  </div>
                  <div className="p-4">
                    {student.class ? (
                      <div className="h-[400px]">
                        <BigCalendarContainer type="classId" id={student.classId} />
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
                {/* Upcoming Exams */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold">Upcoming Exams</h2>
                  </div>
                  <div className="p-4">
                    {student.upcomingExams.length > 0 ? (
                      <div className="space-y-3">
                        {student.upcomingExams.map((exam) => (
                          <div key={exam.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="bg-purple-100 p-2 rounded-lg mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{exam.title}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(exam.startTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • 
                                {exam.lesson?.subject?.name || 'No subject'}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div className="pt-2 text-center">
                          <Link href="/list/exams" className="text-sm text-blue-600 hover:underline">
                            View all exams
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="mt-2 text-gray-500 text-sm">No upcoming exams</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recent Results */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="p-4 border-b border-gray-100">
                    <h2 className="text-lg font-semibold">Recent Results</h2>
                  </div>
                  <div className="p-4">
                    {student.recentResults.length > 0 ? (
                      <div className="space-y-3">
                        {student.recentResults.map((result) => (
                          <div key={result.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                            <div className="bg-blue-100 p-2 rounded-lg mr-3">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                              </svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {result.exam?.title || 'Exam'} - {result.exam?.lesson?.subject?.name || 'Subject'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Grade: {result.grade} • {new Date(result.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                          </div>
                        ))}
                        <div className="pt-2 text-center">
                          <Link href={`/list/results?studentId=${student.id}`} className="text-sm text-blue-600 hover:underline">
                            View all results
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-6">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <p className="mt-2 text-gray-500 text-sm">No results available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))
      )}

      {/* Announcements */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold">School Announcements</h2>
        </div>
        <div>
          <Announcements />
        </div>
      </div>
    </div>
  );
};

export default ParentPage;
