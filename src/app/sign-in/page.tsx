"use client";

import { signIn } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

const SignInPage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      console.log("Signing in with:", { email, password });

      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      console.log("Sign in result:", result);

      if (result?.error) {
        setError(`Authentication error: ${result.error}`);
        setIsLoading(false);
        return;
      }

      try {
        // Redirect based on user role
        const response = await fetch("/api/auth/me");
        const data = await response.json();
        
        console.log("User data:", data);
        
        if (data.role) {
          router.push(`/${data.role}`);
        } else {
          router.push("/");
        }
      } catch (fetchError) {
        console.error("Error fetching user data:", fetchError);
        setError("Error fetching user data after sign in");
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Sign in error:", error);
      setError("An error occurred during sign in");
      setIsLoading(false);
    }
  };

  // For testing purposes, let's add a direct login function
  const handleDirectLogin = (role: string) => {
    setEmail(`${role}@example.com`);
    setPassword(`${role}123`);
    // We'll submit the form after setting the values
    setTimeout(() => {
      document.getElementById("loginForm")?.dispatchEvent(
        new Event("submit", { cancelable: true, bubbles: true })
      );
    }, 100);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-lamaSkyLight to-blue-100">
      <div className="w-full max-w-md">
        <div className="bg-white p-8 rounded-xl shadow-2xl transform transition-all">
          <div className="flex flex-col items-center mb-8">
            <div className="bg-blue-50 p-3 rounded-full mb-4">
              <Image src="/logo.png" alt="SchooLama Logo" width={40} height={40} className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome to SchooLama</h1>
            <p className="text-gray-500 mt-2 text-center">Sign in to access your school dashboard</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded">
              <p className="font-medium">Error</p>
              <p>{error}</p>
            </div>
          )}
          
          <form id="loginForm" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="you@example.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="pl-10 w-full py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="••••••••"
                />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : "Sign In"}
            </button>
          </form>

          {/* Quick login buttons for testing */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <p className="text-sm text-gray-600 mb-3">Quick login for testing:</p>
            <div className="grid grid-cols-2 gap-2">
              <button 
                onClick={() => handleDirectLogin("admin")}
                className="flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="mr-2 w-4 h-4 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-[10px] font-bold">A</span>
                Admin
              </button>
              <button 
                onClick={() => handleDirectLogin("teacher")}
                className="flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="mr-2 w-4 h-4 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-[10px] font-bold">T</span>
                Teacher
              </button>
              <button 
                onClick={() => handleDirectLogin("student")}
                className="flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="mr-2 w-4 h-4 bg-green-100 text-green-800 rounded-full flex items-center justify-center text-[10px] font-bold">S</span>
                Student
              </button>
              <button 
                onClick={() => handleDirectLogin("parent")}
                className="flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <span className="mr-2 w-4 h-4 bg-yellow-100 text-yellow-800 rounded-full flex items-center justify-center text-[10px] font-bold">P</span>
                Parent
              </button>
            </div>
          </div>
          
          {/* Debug information - hidden in production */}
          {debugInfo && process.env.NODE_ENV === "development" && (
            <div className="mt-4 p-2 bg-gray-100 rounded text-xs font-mono whitespace-pre-wrap">
              <p className="font-bold">Debug Info:</p>
              {debugInfo}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SignInPage; 