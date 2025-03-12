"use client";
import { auth } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";

// Define types for our mock data
type Student = {
  id: string;
  name: string;
  surname: string;
  class?: { name: string };
  grade?: { level: number };
};

// Mock user data to match the session users
const mockUserData = {
  admin: {
    id: "1",
    username: "admin",
    name: "Admin",
    surname: "User",
    email: "admin@example.com",
    phone: "+1234567890",
    address: "123 Admin Street, Admin City",
    img: null,
    createdAt: new Date(),
  },
  teacher: {
    id: "2",
    username: "teacher",
    name: "Teacher",
    surname: "User",
    email: "teacher@example.com",
    phone: "+1234567891",
    address: "456 Teacher Avenue, Teacher Town",
    img: null,
    bloodType: "O+",
    sex: "MALE",
    createdAt: new Date(),
    birthday: new Date("1985-05-15"),
    subjects: [],
    classes: [],
  },
  student: {
    id: "3",
    username: "student",
    name: "Student",
    surname: "User",
    email: "student@example.com",
    phone: "+1234567892",
    address: "789 Student Road, Student Village",
    img: null,
    bloodType: "A+",
    sex: "FEMALE",
    createdAt: new Date(),
    birthday: new Date("2005-10-20"),
    class: { name: "Class 10A" },
    grade: { level: 10 },
    parent: { name: "Parent", surname: "User" },
  },
  parent: {
    id: "4",
    username: "parent",
    name: "Parent",
    surname: "User",
    email: "parent@example.com",
    phone: "+1234567893",
    address: "101 Parent Boulevard, Parent City",
    img: null,
    createdAt: new Date(),
    students: [
      {
        id: "3",
        name: "Student",
        surname: "User",
        class: { name: "Class 10A" },
        grade: { level: 10 },
      },
    ] as Student[],
  },
};

// Mock messages data
const mockMessages = [
  {
    id: 1,
    conversationId: 1,
    content: "Hello, how are you?",
    senderId: "1",
    timestamp: new Date()
  },
  {
    id: 2,
    conversationId: 1,
    content: "I'm good, thanks for asking!",
    senderId: "2",
    timestamp: new Date()
  }
];

// Mock conversations data
const mockConversations = [
  {
    id: 1,
    participants: [
      { id: "1", name: "Admin", role: "admin" },
      { id: "2", name: "Teacher", role: "teacher" }
    ],
    lastMessage: {
      content: "Hello, how are you?",
      timestamp: new Date()
    }
  }
];

const ProfilePage = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role || "student";

  if (!userId) {
    return (
      <div className="p-4 flex justify-center items-center h-screen">
        <div className="bg-white p-8 rounded-md shadow-md">
          <h1 className="text-xl font-semibold mb-4">Authentication Required</h1>
          <p>Please sign in to access your profile.</p>
          <a href="/sign-in" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Use mock data instead of fetching from database
  const userData = mockUserData[role as keyof typeof mockUserData];
  let additionalData: Record<string, any> = {};

  // Add role-specific additional data
  if (role === 'teacher') {
    additionalData = {
      studentCount: 45,
      subjectCount: 3,
      classCount: 2,
    };
  } else if (role === 'student') {
    additionalData = {
      attendanceRate: 95,
    };
  } else if (role === 'parent') {
    additionalData = {
      childrenCount: (userData as typeof mockUserData.parent).students?.length || 0,
    };
  }

  if (!userData) {
    return (
      <div className="p-4">
        <div className="bg-white p-8 rounded-md shadow-md">
          <h1 className="text-xl font-semibold mb-4">Profile Not Found</h1>
          <p>We couldn't find your profile information.</p>
        </div>
      </div>
    );
  }

  // Get the first conversation for the message thread
  const userConversations = mockConversations.filter(
    conversation => conversation.participants.some(p => p.id === userId)
  );
  const selectedConversation = userConversations.length > 0 ? userConversations[0] : null;
  const conversationMessages = selectedConversation 
    ? mockMessages.filter(message => message.conversationId === selectedConversation.id)
    : [];

  // Get the other participant in the selected conversation
  const otherParticipant = selectedConversation
    ? selectedConversation.participants.find(p => p.id !== userId)
    : null;

  // Type guards for different user types
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';
  const isParent = role === 'parent';
  const isAdmin = role === 'admin';

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Back Button */}
      <div className="mb-4 flex justify-between items-center">
        <Link 
          href={`/${role}`} 
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </Link>
        
        <Link 
          href="/settings" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
          View Settings
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Header with background */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-40 relative">
          <div className="absolute -bottom-16 left-8">
            <div className="bg-white p-2 rounded-full border-4 border-white shadow-md">
              <Image 
                src={userData.img || "/default-avatar.png"} 
                alt="Profile" 
                width={100} 
                height={100} 
                className="rounded-full w-24 h-24 object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = "/default-avatar.png";
                }}
              />
            </div>
          </div>
        </div>
        
        {/* Profile info */}
        <div className="pt-20 px-8 pb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold">
                {userData.name} {userData.surname || ""}
              </h1>
              <p className="text-gray-500 capitalize">{role}</p>
              <p className="text-gray-500 mt-1">{userData.email || "No email provided"}</p>
            </div>
            <Link 
              href="/settings" 
              className="inline-flex items-center bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
              </svg>
              Edit Profile
            </Link>
          </div>
          
          {/* Role-specific information */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Username</span>
                  <span>{userData.username}</span>
                </div>
                {userData.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Phone</span>
                    <span>{userData.phone}</span>
                  </div>
                )}
                {userData.address && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Address</span>
                    <span>{userData.address}</span>
                  </div>
                )}
                {isTeacher && 'birthday' in userData && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Birthday</span>
                    <span>{new Date(userData.birthday).toLocaleDateString()}</span>
                  </div>
                )}
                {isStudent && 'birthday' in userData && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Birthday</span>
                    <span>{new Date(userData.birthday).toLocaleDateString()}</span>
                  </div>
                )}
                {isTeacher && 'bloodType' in userData && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Blood Type</span>
                    <span>{userData.bloodType}</span>
                  </div>
                )}
                {isStudent && 'bloodType' in userData && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Blood Type</span>
                    <span>{userData.bloodType}</span>
                  </div>
                )}
                {isTeacher && 'sex' in userData && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gender</span>
                    <span>{userData.sex === 'MALE' ? 'Male' : 'Female'}</span>
                  </div>
                )}
                {isStudent && 'sex' in userData && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Gender</span>
                    <span>{userData.sex === 'MALE' ? 'Male' : 'Female'}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Role-specific details */}
            <div className="bg-gray-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">
                {isTeacher ? 'Teaching Information' : 
                 isStudent ? 'Academic Information' : 
                 isParent ? 'Children Information' : 
                 'Admin Information'}
              </h2>
              
              {isTeacher && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Subjects</span>
                    <span>{additionalData.subjectCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Classes</span>
                    <span>{additionalData.classCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Students</span>
                    <span>{additionalData.studentCount}</span>
                  </div>
                </div>
              )}
              
              {isStudent && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Class</span>
                    <span>{(userData as typeof mockUserData.student).class?.name || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Grade</span>
                    <span>{(userData as typeof mockUserData.student).grade?.level || 'Not assigned'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Parent</span>
                    <span>
                      {(userData as typeof mockUserData.student).parent?.name} {(userData as typeof mockUserData.student).parent?.surname}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Attendance Rate</span>
                    <span className="font-semibold text-green-600">{additionalData.attendanceRate}%</span>
                  </div>
                </div>
              )}
              
              {isParent && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Children</span>
                    <span>{additionalData.childrenCount}</span>
                  </div>
                  {(userData as typeof mockUserData.parent).students && (userData as typeof mockUserData.parent).students.map((student) => (
                    <div key={student.id} className="border-t pt-2">
                      <p className="font-medium">{student.name} {student.surname}</p>
                      <p className="text-sm text-gray-500">Class: {student.class?.name || 'Not assigned'}</p>
                      <p className="text-sm text-gray-500">Grade: {student.grade?.level || 'Not assigned'}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {isAdmin && (
                <div className="text-center py-4">
                  <p className="text-gray-500">You have administrator privileges</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 