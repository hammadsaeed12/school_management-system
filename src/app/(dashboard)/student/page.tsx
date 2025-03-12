import { auth } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";

const StudentPage = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!userId || role !== 'student') {
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

  // Fetch student data (in a real app)
  // const student = await prisma.student.findUnique({
  //   where: { id: userId },
  //   include: {
  //     class: true,
  //   }
  // });

  // Mock data for demonstration
  const classItem = {
    name: "Class 10A",
    teacher: "Mr. Johnson",
    subjects: ["Mathematics", "Physics", "Chemistry", "English", "History"]
  };

  const upcomingAssignments = [
    { id: 1, subject: "Mathematics", title: "Quadratic Equations", dueDate: "May 15, 2023" },
    { id: 2, subject: "Physics", title: "Newton's Laws of Motion", dueDate: "May 18, 2023" },
    { id: 3, subject: "Chemistry", title: "Periodic Table", dueDate: "May 20, 2023" }
  ];

  const upcomingExams = [
    { id: 1, subject: "Mathematics", title: "Mid-Term Exam", startTime: "May 25, 2023 - 9:00 AM" },
    { id: 2, subject: "Physics", title: "Unit Test", startTime: "May 28, 2023 - 10:00 AM" }
  ];

  const announcements = [
    { id: 1, title: "School Closed for Holiday", date: "May 12, 2023", content: "School will remain closed on May 12 for Buddha Purnima." },
    { id: 2, title: "Science Exhibition", date: "May 25, 2023", content: "Annual Science Exhibition will be held on May 25. All students are encouraged to participate." }
  ];

  return (
    <div className="p-4">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-6">Student Dashboard</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-blue-800">My Class</h3>
            <p className="text-2xl font-bold text-blue-600">{classItem.name}</p>
            <p className="text-xs text-blue-600 mt-1">Teacher: {classItem.teacher}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-green-800">Assignments Due</h3>
            <p className="text-2xl font-bold text-green-600">{upcomingAssignments.length}</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="text-sm font-medium text-purple-800">Upcoming Exams</h3>
            <p className="text-2xl font-bold text-purple-600">{upcomingExams.length}</p>
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
                View Assignments
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
            <h3 className="text-lg font-medium mb-4">Today's Schedule</h3>
            <div className="space-y-3">
              <div className="p-2 bg-white rounded border border-gray-200">
                <p className="text-sm font-medium">Mathematics</p>
                <p className="text-xs text-gray-500">9:00 AM - 10:00 AM</p>
              </div>
              <div className="p-2 bg-white rounded border border-gray-200">
                <p className="text-sm font-medium">Physics</p>
                <p className="text-xs text-gray-500">10:15 AM - 11:15 AM</p>
              </div>
              <div className="p-2 bg-white rounded border border-gray-200">
                <p className="text-sm font-medium">Chemistry</p>
                <p className="text-xs text-gray-500">11:30 AM - 12:30 PM</p>
              </div>
              <div className="p-2 bg-white rounded border border-gray-200">
                <p className="text-sm font-medium">Lunch Break</p>
                <p className="text-xs text-gray-500">12:30 PM - 1:30 PM</p>
              </div>
              <div className="p-2 bg-white rounded border border-gray-200">
                <p className="text-sm font-medium">English</p>
                <p className="text-xs text-gray-500">1:30 PM - 2:30 PM</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Upcoming Assignments</h3>
            <div className="space-y-3">
              {upcomingAssignments.map(assignment => (
                <div key={assignment.id} className="p-3 bg-white rounded border border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium">{assignment.title}</p>
                      <p className="text-xs text-gray-500">{assignment.subject}</p>
                    </div>
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Due: {assignment.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-medium mb-4">Announcements</h3>
            <div className="space-y-3">
              {announcements.map(announcement => (
                <div key={announcement.id} className="p-3 bg-white rounded border border-gray-200">
                  <p className="text-sm font-medium">{announcement.title}</p>
                  <p className="text-xs text-gray-500 mb-2">{announcement.date}</p>
                  <p className="text-xs text-gray-700">{announcement.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPage;
