import { auth } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";
import { headers } from "next/headers";

// Mock attendance data
const mockAttendanceData = [
  {
    id: 1,
    date: new Date("2023-05-10"),
    present: true,
    studentId: "3",
    student: {
      name: "Student",
      surname: "User",
      class: { name: "Class 10A" }
    },
    lesson: {
      name: "Mathematics",
      teacher: { name: "Teacher", surname: "User" }
    }
  },
  {
    id: 2,
    date: new Date("2023-05-11"),
    present: false,
    studentId: "3",
    student: {
      name: "Student",
      surname: "User",
      class: { name: "Class 10A" }
    },
    lesson: {
      name: "Physics",
      teacher: { name: "Teacher", surname: "User" }
    }
  },
  {
    id: 3,
    date: new Date("2023-05-12"),
    present: true,
    studentId: "3",
    student: {
      name: "Student",
      surname: "User",
      class: { name: "Class 10A" }
    },
    lesson: {
      name: "Chemistry",
      teacher: { name: "Teacher", surname: "User" }
    }
  },
  {
    id: 4,
    date: new Date("2023-05-15"),
    present: true,
    studentId: "3",
    student: {
      name: "Student",
      surname: "User",
      class: { name: "Class 10A" }
    },
    lesson: {
      name: "Biology",
      teacher: { name: "Teacher", surname: "User" }
    }
  },
  {
    id: 5,
    date: new Date("2023-05-16"),
    present: true,
    studentId: "3",
    student: {
      name: "Student",
      surname: "User",
      class: { name: "Class 10A" }
    },
    lesson: {
      name: "Mathematics",
      teacher: { name: "Teacher", surname: "User" }
    }
  },
];

const AttendancePage = async () => {
  const headersList = headers();
  const { userId, sessionClaims } = await auth(headersList);
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen p-4">
        <div className="p-8 bg-white rounded-md shadow-md">
          <h1 className="mb-4 text-xl font-semibold">Authentication Required</h1>
          <p>Please sign in to access attendance records.</p>
          <a href="/sign-in" className="inline-block px-4 py-2 mt-4 text-white bg-blue-500 rounded">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Filter attendance data based on user role
  let attendanceData = [...mockAttendanceData];
  
  if (role === 'student') {
    attendanceData = attendanceData.filter(record => record.studentId === userId);
  } else if (role === 'parent') {
    // In a real app, we would filter by the parent's children
    attendanceData = attendanceData.filter(record => record.studentId === "3");
  }

  // Calculate attendance statistics
  const totalRecords = attendanceData.length;
  const presentCount = attendanceData.filter(record => record.present).length;
  const absentCount = totalRecords - presentCount;
  const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

  return (
    <div className="p-4">
      {/* Back Button */}
      <div className="mb-4">
        <Link 
          href={`/${role}`} 
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
      
      <div className="p-6 bg-white rounded-lg shadow-md">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Attendance Records</h1>
          
          {(role === 'admin' || role === 'teacher') && (
            <button className="inline-flex items-center px-4 py-2 text-white transition bg-blue-500 rounded-md hover:bg-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Take Attendance
            </button>
          )}
        </div>
        
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-4">
          <div className="p-4 rounded-lg bg-blue-50">
            <h3 className="text-sm font-medium text-blue-800">Total Records</h3>
            <p className="text-2xl font-bold text-blue-600">{totalRecords}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-green-50">
            <h3 className="text-sm font-medium text-green-800">Present</h3>
            <p className="text-2xl font-bold text-green-600">{presentCount}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-red-50">
            <h3 className="text-sm font-medium text-red-800">Absent</h3>
            <p className="text-2xl font-bold text-red-600">{absentCount}</p>
          </div>
          
          <div className="p-4 rounded-lg bg-purple-50">
            <h3 className="text-sm font-medium text-purple-800">Attendance Rate</h3>
            <p className="text-2xl font-bold text-purple-600">{attendanceRate}%</p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="grid grid-cols-1 gap-4 mb-6 md:grid-cols-3">
          <div>
            <label htmlFor="date-filter" className="block mb-1 text-sm font-medium text-gray-700">
              Date Range
            </label>
            <select
              id="date-filter"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Time</option>
              <option value="this-week">This Week</option>
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {(role === 'admin' || role === 'teacher') && (
            <div>
              <label htmlFor="class-filter" className="block mb-1 text-sm font-medium text-gray-700">
                Class
              </label>
              <select
                id="class-filter"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Classes</option>
                <option value="10A">Class 10A</option>
                <option value="10B">Class 10B</option>
                <option value="11A">Class 11A</option>
                <option value="11B">Class 11B</option>
              </select>
            </div>
          )}
          
          {(role === 'admin' || role === 'teacher') && (
            <div>
              <label htmlFor="student-filter" className="block mb-1 text-sm font-medium text-gray-700">
                Student
              </label>
              <select
                id="student-filter"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Students</option>
                <option value="student1">Student User</option>
                <option value="student2">John Doe</option>
                <option value="student3">Jane Smith</option>
              </select>
            </div>
          )}
        </div>
        
        {/* Attendance Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Date
                </th>
                {(role === 'admin' || role === 'teacher' || role === 'parent') && (
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Student
                  </th>
                )}
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Class
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Subject
                </th>
                <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                  Status
                </th>
                {(role === 'admin' || role === 'teacher') && (
                  <th scope="col" className="px-6 py-3 text-xs font-medium tracking-wider text-left text-gray-500 uppercase">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {attendanceData.map((record) => (
                <tr key={record.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {format(record.date, 'MMM dd, yyyy')}
                  </td>
                  {(role === 'admin' || role === 'teacher' || role === 'parent') && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.student.name} {record.student.surname}
                      </div>
                    </td>
                  )}
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {record.student.class.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                    {record.lesson.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      record.present 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {record.present ? 'Present' : 'Absent'}
                    </span>
                  </td>
                  {(role === 'admin' || role === 'teacher') && (
                    <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                      <button className="mr-3 text-blue-600 hover:text-blue-900">
                        Edit
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">1</span> to <span className="font-medium">{attendanceData.length}</span> of <span className="font-medium">{attendanceData.length}</span> results
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>
              Previous
            </button>
            <button className="px-3 py-1 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50" disabled>
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;