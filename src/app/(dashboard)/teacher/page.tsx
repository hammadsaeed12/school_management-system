import Announcements from "@/components/Announcement";
import BigCalendarContainer from "@/components/BigCalendarContainer";
import prisma from "@/lib/prisma";
import { auth } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";

const TeacherPage = async () => {
  const { userId } = await auth();

  // Add a fallback for when userId is null
  if (!userId) {
    return (
      <div className="p-4 flex justify-center items-center h-screen">
        <div className="bg-white p-8 rounded-md shadow-md">
          <h1 className="text-xl font-semibold mb-4">Authentication Required</h1>
          <p>Please sign in to access your teacher dashboard.</p>
          <a href="/sign-in" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Fetch teacher data
  const teacher = await prisma.teacher.findUnique({
    where: { id: userId },
  });

  // Fetch classes taught by this teacher
  const classes = await prisma.class.findMany({
    where: {
      lessons: {
        some: {
          teacherId: userId,
        },
      },
    },
    include: {
      _count: {
        select: {
          students: true,
        },
      },
    },
  });

  // Fetch upcoming lessons
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingLessons = await prisma.lesson.findMany({
    where: {
      teacherId: userId,
      startTime: {
        gte: today,
      },
    },
    orderBy: {
      startTime: 'asc',
    },
    take: 5,
    include: {
      class: true,
      subject: true,
    },
  });

  // Fetch assignments that need grading
  const pendingAssignments = await prisma.assignment.findMany({
    where: {
      lesson: {
        teacherId: userId,
      },
      dueDate: {
        gte: today,
      },
    },
    orderBy: {
      dueDate: 'asc',
    },
    take: 5,
    include: {
      lesson: {
        include: {
          class: true,
        },
      },
    },
  });

  // Fetch upcoming exams with details
  const upcomingExamsWithDetails = await prisma.exam.findMany({
    where: {
      lesson: {
        teacherId: userId,
      },
      startTime: {
        gte: today,
      },
    },
    orderBy: {
      startTime: 'asc',
    },
    take: 5,
    include: {
      lesson: {
        include: {
          class: true,
          subject: true,
        },
      },
    },
  });

  // Calculate some stats
  const totalStudents = classes.reduce((acc, cls) => acc + cls._count.students, 0);
  const totalClasses = classes.length;
  const upcomingExams = await prisma.exam.count({
    where: {
      lesson: {
        teacherId: userId,
      },
      startTime: {
        gte: today,
      },
    },
  });

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {teacher?.name || 'Teacher'}</h1>
            <p className="mt-1 text-blue-100">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3">
              <div className="text-sm">Today's Classes</div>
              <div className="text-2xl font-bold">
                {upcomingLessons.filter(lesson => {
                  const lessonDate = new Date(lesson.startTime);
                  return lessonDate.getDate() === today.getDate() &&
                         lessonDate.getMonth() === today.getMonth() &&
                         lessonDate.getFullYear() === today.getFullYear();
                }).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Classes</p>
              <p className="text-2xl font-bold">{totalClasses}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <Link href="/list/classes" className="text-xs text-blue-600 hover:underline">
              View all classes
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-2xl font-bold">{totalStudents}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <Link href="/list/students" className="text-xs text-blue-600 hover:underline">
              View all students
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Pending Assignments</p>
              <p className="text-2xl font-bold">{pendingAssignments.length}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
          <div className="mt-2">
            <Link href="/list/assignments" className="text-xs text-blue-600 hover:underline">
              View all assignments
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Upcoming Exams</p>
              <p className="text-2xl font-bold">{upcomingExams}</p>
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
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Schedule */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Your Teaching Schedule</h2>
            </div>
            <div className="p-4">
              <div className="h-[500px]">
                <BigCalendarContainer type="teacherId" id={userId} />
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Classes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Upcoming Classes</h2>
            </div>
            <div className="p-4">
              {upcomingLessons.length > 0 ? (
                <div className="space-y-3">
                  {upcomingLessons.map((lesson) => {
                    const startTime = new Date(lesson.startTime);
                    const endTime = new Date(lesson.endTime);
                    return (
                      <div key={lesson.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{lesson.name}</p>
                          <p className="text-xs text-gray-500">
                            {startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • 
                            {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - 
                            {endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-xs text-gray-500">
                            {lesson.class?.name} • {lesson.subject?.name}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-gray-500 text-sm">No upcoming classes</p>
                </div>
              )}
            </div>
          </div>

          {/* Classes */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Your Classes</h2>
            </div>
            <div className="p-4">
              {classes.length > 0 ? (
                <div className="space-y-3">
                  {classes.map((cls) => (
                    <div key={cls.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <div className="bg-indigo-100 p-2 rounded-lg mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{cls.name}</p>
                        <p className="text-xs text-gray-500">
                          {cls._count.students} students • Room: {cls.room || 'Not assigned'}
                        </p>
                      </div>
                      <Link href={`/list/classes/${cls.id}`} className="text-xs text-blue-600 hover:underline">
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-300 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <p className="mt-2 text-gray-500 text-sm">No classes assigned</p>
                </div>
              )}
            </div>
          </div>

          {/* Pending Assignments */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Pending Assignments</h2>
            </div>
            <div className="p-4">
              {pendingAssignments.length > 0 ? (
                <div className="space-y-3">
                  {pendingAssignments.map((assignment) => {
                    const dueDate = new Date(assignment.dueDate);
                    return (
                      <div key={assignment.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="bg-yellow-100 p-2 rounded-lg mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{assignment.title}</p>
                          <p className="text-xs text-gray-500">
                            Due: {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • 
                            Class: {assignment.lesson?.class?.name || 'Unknown'}
                          </p>
                        </div>
                        <Link href={`/list/assignments/${assignment.id}`} className="text-xs text-blue-600 hover:underline">
                          View
                        </Link>
                      </div>
                    );
                  })}
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
                  <p className="mt-2 text-gray-500 text-sm">No pending assignments</p>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Exams */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Upcoming Exams</h2>
            </div>
            <div className="p-4">
              {upcomingExamsWithDetails.length > 0 ? (
                <div className="space-y-3">
                  {upcomingExamsWithDetails.map((exam) => {
                    const startTime = new Date(exam.startTime);
                    const endTime = new Date(exam.endTime);
                    return (
                      <div key={exam.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="bg-purple-100 p-2 rounded-lg mr-3">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{exam.title}</p>
                          <p className="text-xs text-gray-500">
                            Date: {startTime.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} • 
                            {startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} - 
                            {endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                          <p className="text-xs text-gray-500">
                            Class: {exam.lesson?.class?.name || 'Unknown'} • 
                            Subject: {exam.lesson?.subject?.name || 'Unknown'}
                          </p>
                        </div>
                        <Link href={`/list/exams/${exam.id}`} className="text-xs text-blue-600 hover:underline">
                          View
                        </Link>
                      </div>
                    );
                  })}
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

          {/* Announcements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Announcements</h2>
            </div>
            <div>
              <Announcements />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherPage;
