import { auth } from "@/lib/auth";
import Link from "next/link";
import { headers } from "next/headers";

const ParentPage = async () => {
  const { userId, sessionClaims } = await auth(headers());
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!userId || role !== 'parent') {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <div className="p-8 bg-white rounded-md shadow-md">
          <h1 className="mb-4 text-xl font-semibold">Access Denied</h1>
          <p>You don't have permission to access this page.</p>
          <a href="/sign-in" className="inline-block px-4 py-2 mt-4 text-white bg-blue-500 rounded">
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
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold">Parent Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-blue-50">
            <h3 className="text-sm font-medium text-blue-800">My Children</h3>
            <p className="text-2xl font-bold text-blue-600">{childrenCount}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-green-50">
            <h3 className="text-sm font-medium text-green-800">Upcoming Events</h3>
            <p className="text-2xl font-bold text-green-600">{upcomingEventsCount}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-purple-50">
            <h3 className="text-sm font-medium text-purple-800">Unread Messages</h3>
            <p className="text-2xl font-bold text-purple-600">{unreadMessagesCount}</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="mb-4 text-lg font-medium">Quick Actions</h3>
            <div className="space-y-2">
              <Link href="/list/attendance" className="block p-2 bg-white border border-gray-200 rounded hover:bg-gray-50">
                View Attendance
              </Link>
              <Link href="/list/assignments" className="block p-2 bg-white border border-gray-200 rounded hover:bg-gray-50">
                Check Assignments
              </Link>
              <Link href="/list/exams" className="block p-2 bg-white border border-gray-200 rounded hover:bg-gray-50">
                Upcoming Exams
              </Link>
              <Link href="/list/results" className="block p-2 bg-white border border-gray-200 rounded hover:bg-gray-50">
                View Results
              </Link>
              <Link href="/list/messages" className="block p-2 bg-white border border-gray-200 rounded hover:bg-gray-50">
                Messages
              </Link>
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="mb-4 text-lg font-medium">Children's Performance</h3>
            <div className="space-y-3">
              <div className="p-3 bg-white border border-gray-200 rounded">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Sarah Johnson</p>
                  <span className="px-2 py-1 text-xs text-blue-800 bg-blue-100 rounded">Class 10A</span>
                </div>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                  <span className="ml-2 text-xs font-medium text-gray-700">85%</span>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Last Exam: A</span>
                  <span>Attendance: 92%</span>
                </div>
              </div>
              
              <div className="p-3 bg-white border border-gray-200 rounded">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">Michael Johnson</p>
                  <span className="px-2 py-1 text-xs text-green-800 bg-green-100 rounded">Class 7B</span>
                </div>
                <div className="flex items-center">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div className="bg-green-600 h-2.5 rounded-full" style={{ width: '78%' }}></div>
                  </div>
                  <span className="ml-2 text-xs font-medium text-gray-700">78%</span>
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Last Exam: B+</span>
                  <span>Attendance: 88%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="p-4 mt-6 rounded-lg bg-gray-50">
          <h3 className="mb-4 text-lg font-medium">Upcoming Events</h3>
          <div className="space-y-3">
            <div className="p-3 bg-white border border-gray-200 rounded">
              <p className="text-sm font-medium">Parent-Teacher Meeting</p>
              <p className="text-xs text-gray-500">May 15, 2023 - 4:00 PM</p>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded">
              <p className="text-sm font-medium">Annual Sports Day</p>
              <p className="text-xs text-gray-500">May 20, 2023 - 9:00 AM</p>
            </div>
            <div className="p-3 bg-white border border-gray-200 rounded">
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
