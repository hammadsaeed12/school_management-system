import { auth } from "@/lib/auth";
import Link from "next/link";
import { headers } from "next/headers";
const StudentPage = async () => {
  const { userId, sessionClaims } = await auth(headers());
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!userId || role !== 'student') {
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
      <div className="p-6 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold">Student Dashboard</h1>
        
        <div className="grid grid-cols-1 gap-6 mb-6 md:grid-cols-3">
          <div className="p-4 rounded-lg bg-blue-50">
            <h3 className="text-sm font-medium text-blue-800">My Class</h3>
            <p className="text-2xl font-bold text-blue-600">{classItem.name}</p>
            <p className="mt-1 text-xs text-blue-600">Teacher: {classItem.teacher}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-green-50">
            <h3 className="text-sm font-medium text-green-800">Assignments Due</h3>
            <p className="text-2xl font-bold text-green-600">{upcomingAssignments.length}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-purple-50">
            <h3 className="text-sm font-medium text-purple-800">Upcoming Exams</h3>
            <p className="text-2xl font-bold text-purple-600">{upcomingExams.length}</p>
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
                View Assignments
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
            <h3 className="mb-4 text-lg font-medium">Today's Schedule</h3>
            <div className="space-y-3">
              <div className="p-2 bg-white border border-gray-200 rounded">
                <p className="text-sm font-medium">Mathematics</p>
                <p className="text-xs text-gray-500">9:00 AM - 10:00 AM</p>
              </div>
              <div className="p-2 bg-white border border-gray-200 rounded">
                <p className="text-sm font-medium">Physics</p>
                <p className="text-xs text-gray-500">10:15 AM - 11:15 AM</p>
              </div>
              <div className="p-2 bg-white border border-gray-200 rounded">
                <p className="text-sm font-medium">Chemistry</p>
                <p className="text-xs text-gray-500">11:30 AM - 12:30 PM</p>
              </div>
              <div className="p-2 bg-white border border-gray-200 rounded">
                <p className="text-sm font-medium">Lunch Break</p>
                <p className="text-xs text-gray-500">12:30 PM - 1:30 PM</p>
              </div>
              <div className="p-2 bg-white border border-gray-200 rounded">
                <p className="text-sm font-medium">English</p>
                <p className="text-xs text-gray-500">1:30 PM - 2:30 PM</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 gap-6 mt-6 md:grid-cols-2">
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="mb-4 text-lg font-medium">Upcoming Assignments</h3>
            <div className="space-y-3">
              {upcomingAssignments.map(assignment => (
                <div key={assignment.id} className="p-3 bg-white border border-gray-200 rounded">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{assignment.title}</p>
                      <p className="text-xs text-gray-500">{assignment.subject}</p>
                    </div>
                    <span className="px-2 py-1 text-xs text-yellow-800 bg-yellow-100 rounded">Due: {assignment.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="p-4 rounded-lg bg-gray-50">
            <h3 className="mb-4 text-lg font-medium">Announcements</h3>
            <div className="space-y-3">
              {announcements.map(announcement => (
                <div key={announcement.id} className="p-3 bg-white border border-gray-200 rounded">
                  <p className="text-sm font-medium">{announcement.title}</p>
                  <p className="mb-2 text-xs text-gray-500">{announcement.date}</p>
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
