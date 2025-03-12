import { auth } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";

const ParentPage = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!userId || role !== 'parent') {
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

  // Mock data for demonstration
  const childrenCount = 2;
  const upcomingEventsCount = 3;
  const unreadMessagesCount = 5;

  return (
    <div className="p-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Parent Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">My Children</h3>
            <p className="text-2xl font-bold text-blue-600">{childrenCount}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800">Upcoming Events</h3>
            <p className="text-2xl font-bold text-green-600">{upcomingEventsCount}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800">Unread Messages</h3>
            <p className="text-2xl font-bold text-purple-600">{unreadMessagesCount}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/list/attendance" className="block p-2 bg-white rounded border border-gray-200 hover:bg-gray-50">
                View Attendance
              </Link>
              <Link href="/list/assignments" className="block p-2 bg-white rounded border border-gray-200 hover:bg-gray-50">
                Check Assignments
              </Link>
              <Link href="/list/exams" className="block p-2 bg-white rounded border border-gray-200 hover:bg-gray-50">
                Upcoming Exams
              </Link>
              <Link href="/list/results" className="block p-2 bg-white rounded border border-gray-200 hover:bg-gray-50">
                View Results
              </Link>
              <Link href="/list/messages" className="block p-2 bg-white rounded border border-gray-200 hover:bg-gray-50">
                Messages
              </Link>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Children's Performance</h3>
            <div className="space-y-3">
              <div className="p-3 bg-white rounded border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium">Sarah Johnson</p>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Class 10A</span>
                </div>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="ml-2 text-xs font-medium text-gray-700">85%</span>
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>Last Exam: A</span>
                  <span>Attendance: 92%</span>
                </div>
              </div>
              
              <div className="p-3 bg-white rounded border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium">Michael Johnson</p>
                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Class 7B</span>
                </div>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <span className="ml-2 text-xs font-medium text-gray-700">78%</span>
                </div>
                <div className="mt-2 flex justify-between text-xs text-gray-500">
                  <span>Last Exam: B+</span>
                  <span>Attendance: 88%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Upcoming Events</h3>
          <div className="space-y-3">
            <div className="p-3 bg-white rounded border border-gray-200">
              <p className="text-sm font-medium">Parent-Teacher Meeting</p>
              <p className="text-xs text-gray-500">May 15, 2023 - 4:00 PM</p>
            </div>
            <div className="p-3 bg-white rounded border border-gray-200">
              <p className="text-sm font-medium">Annual Sports Day</p>
              <p className="text-xs text-gray-500">May 20, 2023 - 9:00 AM</p>
            </div>
            <div className="p-3 bg-white rounded border border-gray-200">
              <p className="text-sm font-medium">Science Exhibition</p>
              <p className="text-xs text-gray-500">May 25, 2023 - 10:00 AM</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParentPage;
