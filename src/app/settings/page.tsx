import { auth } from "@/lib/auth";
import SettingsForm from "@/components/Forms/SettingsForm";
import Link from "next/link";

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
  },
};

const SettingsPage = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!userId) {
    return (
      <div className="p-4 flex justify-center items-center h-screen">
        <div className="bg-white p-8 rounded-md shadow-md">
          <h1 className="text-xl font-semibold mb-4">Authentication Required</h1>
          <p>Please sign in to access your settings.</p>
          <a href="/sign-in" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Use mock data instead of fetching from database
  const userData = mockUserData[role as keyof typeof mockUserData];

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
          href="/profile" 
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          View Profile
        </Link>
      </div>
      
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-6">Settings</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-gray-50 p-4 rounded-lg">
                <nav className="space-y-1">
                  <a href="#profile" className="block px-3 py-2 rounded-md bg-blue-50 text-blue-700 font-medium">
                    Profile Settings
                  </a>
                  <a href="#password" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                    Password
                  </a>
                  <a href="#notifications" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                    Notifications
                  </a>
                  <a href="#appearance" className="block px-3 py-2 rounded-md text-gray-700 hover:bg-gray-100">
                    Appearance
                  </a>
                </nav>
              </div>
            </div>
            
            {/* Main content */}
            <div className="md:col-span-3">
              {/* Profile Settings Section */}
              <section id="profile" className="mb-12">
                <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <SettingsForm userData={userData} role={role} />
                </div>
              </section>
              
              {/* Password Section */}
              <section id="password" className="mb-12">
                <h2 className="text-xl font-semibold mb-4">Password</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <form className="space-y-4">
                    <div>
                      <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        id="current-password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        id="new-password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        id="confirm-password"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <button
                        type="submit"
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                      >
                        Update Password
                      </button>
                    </div>
                  </form>
                </div>
              </section>
              
              {/* Notifications Section */}
              <section id="notifications" className="mb-12">
                <h2 className="text-xl font-semibold mb-4">Notification Preferences</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Email Notifications</h3>
                        <p className="text-sm text-gray-500">Receive email notifications for important updates</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Assignment Reminders</h3>
                        <p className="text-sm text-gray-500">Get notified about upcoming assignments</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Exam Notifications</h3>
                        <p className="text-sm text-gray-500">Get notified about upcoming exams</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-gray-700">Result Notifications</h3>
                        <p className="text-sm text-gray-500">Get notified when new results are published</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    
                    <div className="pt-4">
                      <button
                        type="button"
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                      >
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              </section>
              
              {/* Appearance Section */}
              <section id="appearance" className="mb-12">
                <h2 className="text-xl font-semibold mb-4">Appearance</h2>
                <div className="bg-gray-50 p-6 rounded-lg">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Theme</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="border-2 border-blue-500 p-2 rounded-md text-center cursor-pointer bg-white">
                          <div className="h-12 bg-white border border-gray-200 rounded mb-2"></div>
                          <span className="text-sm">Light</span>
                        </div>
                        <div className="border-2 border-gray-200 p-2 rounded-md text-center cursor-pointer">
                          <div className="h-12 bg-gray-800 rounded mb-2"></div>
                          <span className="text-sm">Dark</span>
                        </div>
                        <div className="border-2 border-gray-200 p-2 rounded-md text-center cursor-pointer">
                          <div className="h-12 bg-gradient-to-r from-white to-gray-800 rounded mb-2"></div>
                          <span className="text-sm">System</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Accent Color</h3>
                      <div className="grid grid-cols-6 gap-4">
                        <div className="h-8 w-8 rounded-full bg-blue-500 cursor-pointer ring-2 ring-offset-2 ring-blue-500"></div>
                        <div className="h-8 w-8 rounded-full bg-purple-500 cursor-pointer"></div>
                        <div className="h-8 w-8 rounded-full bg-green-500 cursor-pointer"></div>
                        <div className="h-8 w-8 rounded-full bg-red-500 cursor-pointer"></div>
                        <div className="h-8 w-8 rounded-full bg-yellow-500 cursor-pointer"></div>
                        <div className="h-8 w-8 rounded-full bg-pink-500 cursor-pointer"></div>
                      </div>
                    </div>
                    
                    <div className="pt-4">
                      <button
                        type="button"
                        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
                      >
                        Save Appearance
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage; 