import { auth } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";

const TeacherPage = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!userId || role !== 'teacher') {
    return (
      <div className="p-4 flex justify-center items-center h-screen">
        <div className="bg-white p-8 rounded-md shadow-md">
          <h1 className="text-xl font-semibold mb-4">Access Denied</h1>
          <p>You don't have permission to access this page.</p>
          <a href="/sign-in" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Fetch teacher data (in a real app)
  // const teacher = await prisma.teacher.findUnique({
  //   where: { id: userId },
  //   include: {
  //     classes: true,
  //   }
  // });

  // Mock data for demonstration
  const classCount = 4;
  const studentCount = 85;
  const upcomingExamCount = 2;

  return (
    <div className="p-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Teacher Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">My Classes</h3>
            <p className="text-2xl font-bold text-blue-600">{classCount}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800">My Students</h3>
            <p className="text-2xl font-bold text-green-600">{studentCount}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800">Upcoming Exams</h3>
            <p className="text-2xl font-bold text-purple-600">{upcomingExamCount}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/list/attendance" className="block p-2 bg-white rounded border border-gray-200 hover:bg-gray-50">
                Take Attendance
              </Link>
              <Link href="/list/assignments" className="block p-2 bg-white rounded border border-gray-200 hover:bg-gray-50">
                Manage Assignments
              </Link>
              <Link href="/list/exams" className="block p-2 bg-white rounded border border-gray-200 hover:bg-gray-50">
                Manage Exams
              </Link>
              <Link href="/list/results" className="block p-2 bg-white rounded border border-gray-200 hover:bg-gray-50">
                Enter Results
              </Link>
              <Link href="/list/messages" className="block p-2 bg-white rounded border border-gray-200 hover:bg-gray-50">
                Messages
              </Link>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Today's Schedule</h3>
            <div className="space-y-3">
              <div className="p-2 bg-white rounded border border-gray-200">
                <p className="text-sm font-medium">Mathematics - Class 10A</p>
                <p className="text-xs text-gray-500">9:00 AM - 10:00 AM</p>
              </div>
              <div className="p-2 bg-white rounded border border-gray-200">
                <p className="text-sm font-medium">Physics - Class 11B</p>
                <p className="text-xs text-gray-500">10:15 AM - 11:15 AM</p>
              </div>
              <div className="p-2 bg-white rounded border border-gray-200">
                <p className="text-sm font-medium">Mathematics - Class 9C</p>
                <p className="text-xs text-gray-500">11:30 AM - 12:30 PM</p>
              </div>
              <div className="p-2 bg-white rounded border border-gray-200">
                <p className="text-sm font-medium">Physics Lab - Class 11B</p>
                <p className="text-xs text-gray-500">1:30 PM - 3:00 PM</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeacherPage;
