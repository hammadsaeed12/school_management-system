"use client";
import { auth } from "@/lib/auth";
import Link from "next/link";
import Image from "next/image";
import { format } from "date-fns";

// Mock messages data
const mockConversations = [
  {
    id: 1,
    participants: [
      { id: "2", name: "Teacher", surname: "User", role: "teacher", img: null },
      { id: "3", name: "Student", surname: "User", role: "student", img: null }
    ],
    lastMessage: {
      id: 1,
      content: "Hello, I have a question about the homework assignment.",
      timestamp: new Date("2023-05-16T14:30:00"),
      senderId: "3"
    },
    unread: 2
  },
  {
    id: 2,
    participants: [
      { id: "2", name: "Teacher", surname: "User", role: "teacher", img: null },
      { id: "4", name: "Parent", surname: "User", role: "parent", img: null }
    ],
    lastMessage: {
      id: 2,
      content: "I'd like to discuss my child's progress in your class.",
      timestamp: new Date("2023-05-15T10:15:00"),
      senderId: "4"
    },
    unread: 0
  },
  {
    id: 3,
    participants: [
      { id: "1", name: "Admin", surname: "User", role: "admin", img: null },
      { id: "2", name: "Teacher", surname: "User", role: "teacher", img: null }
    ],
    lastMessage: {
      id: 3,
      content: "Please submit your lesson plans for next week by Friday.",
      timestamp: new Date("2023-05-14T09:00:00"),
      senderId: "1"
    },
    unread: 0
  },
  {
    id: 4,
    participants: [
      { id: "3", name: "Student", surname: "User", role: "student", img: null },
      { id: "4", name: "Parent", surname: "User", role: "parent", img: null }
    ],
    lastMessage: {
      id: 4,
      content: "Don't forget to bring your science project tomorrow.",
      timestamp: new Date("2023-05-13T20:45:00"),
      senderId: "4"
    },
    unread: 1
  },
  {
    id: 5,
    participants: [
      { id: "1", name: "Admin", surname: "User", role: "admin", img: null },
      { id: "4", name: "Parent", surname: "User", role: "parent", img: null }
    ],
    lastMessage: {
      id: 5,
      content: "The parent-teacher conference is scheduled for next Tuesday.",
      timestamp: new Date("2023-05-12T11:30:00"),
      senderId: "1"
    },
    unread: 0
  }
];

const mockMessages = [
  {
    id: 1,
    conversationId: 1,
    content: "Hello, I have a question about the homework assignment.",
    timestamp: new Date("2023-05-16T14:30:00"),
    senderId: "3"
  },
  {
    id: 2,
    conversationId: 1,
    content: "Sure, what's your question?",
    timestamp: new Date("2023-05-16T14:35:00"),
    senderId: "2"
  },
  {
    id: 3,
    conversationId: 1,
    content: "I'm not sure how to solve problem #5 on the math worksheet.",
    timestamp: new Date("2023-05-16T14:40:00"),
    senderId: "3"
  },
  {
    id: 4,
    conversationId: 1,
    content: "For problem #5, you need to use the quadratic formula. Remember that a quadratic equation ax² + bx + c = 0 can be solved using x = (-b ± √(b² - 4ac)) / 2a.",
    timestamp: new Date("2023-05-16T14:45:00"),
    senderId: "2"
  },
  {
    id: 5,
    conversationId: 1,
    content: "Oh, I see! Thank you for the explanation.",
    timestamp: new Date("2023-05-16T14:50:00"),
    senderId: "3"
  },
  {
    id: 6,
    conversationId: 1,
    content: "You're welcome! Let me know if you have any other questions.",
    timestamp: new Date("2023-05-16T14:55:00"),
    senderId: "2"
  },
  {
    id: 7,
    conversationId: 1,
    content: "Actually, I'm also having trouble with problem #8. Could you help me with that one too?",
    timestamp: new Date("2023-05-16T15:00:00"),
    senderId: "3"
  },
  {
    id: 8,
    conversationId: 1,
    content: "For problem #8, you need to use the chain rule for differentiation. Remember that if y = f(g(x)), then dy/dx = (df/dg) × (dg/dx).",
    timestamp: new Date("2023-05-16T15:05:00"),
    senderId: "2"
  }
];

const MessagesPage = async () => {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  if (!userId) {
    return (
      <div className="p-4 flex justify-center items-center h-screen">
        <div className="bg-white p-8 rounded-md shadow-md">
          <h1 className="text-xl font-semibold mb-4">Authentication Required</h1>
          <p>Please sign in to access your messages.</p>
          <a href="/sign-in" className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  // Filter conversations based on user role and ID
  const userConversations = mockConversations.filter(conversation => 
    conversation.participants.some(participant => participant.id === userId)
  );

  // Get the first conversation for the message thread
  const selectedConversation = userConversations.length > 0 ? userConversations[0] : null;
  const conversationMessages = selectedConversation 
    ? mockMessages.filter(message => message.conversationId === selectedConversation.id)
    : [];

  // Get the other participant in the selected conversation
  const otherParticipant = selectedConversation
    ? selectedConversation.participants.find(p => p.id !== userId)
    : null;

  return (
    <div className="p-4">
      {/* Back Button */}
      <div className="mb-4">
        <Link 
          href={`/${role}`} 
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Back to Dashboard
        </Link>
      </div>
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="flex h-[calc(100vh-150px)]">
          {/* Conversation List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold">Messages</h2>
              <div className="mt-2 relative">
                <input
                  type="text"
                  placeholder="Search messages..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 pl-10"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>
            
            <div>
              {userConversations.map((conversation) => {
                // Find the other participant in the conversation
                const otherParticipant = conversation.participants.find(p => p.id !== userId);
                
                return (
                  <div 
                    key={conversation.id} 
                    className={`p-4 border-b border-gray-200 hover:bg-gray-50 cursor-pointer ${
                      selectedConversation?.id === conversation.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="relative">
                        <Image 
                          src={otherParticipant?.img || "/default-avatar.png"} 
                          alt={`${otherParticipant?.name} ${otherParticipant?.surname}`}
                          width={48}
                          height={48}
                          className="rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/default-avatar.png";
                          }}
                        />
                        {conversation.unread > 0 && (
                          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                            {conversation.unread}
                          </span>
                        )}
                      </div>
                      <div className="ml-3 flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {otherParticipant?.name} {otherParticipant?.surname}
                          </p>
                          <p className="text-xs text-gray-500">
                            {format(conversation.lastMessage.timestamp, 'MMM d')}
                          </p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage.senderId === userId ? 'You: ' : ''}
                            {conversation.lastMessage.content}
                          </p>
                          {otherParticipant?.role && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-800 capitalize">
                              {otherParticipant.role}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Message Thread */}
          <div className="w-2/3 flex flex-col">
            {selectedConversation ? (
              <>
                {/* Conversation Header */}
                <div className="p-4 border-b border-gray-200 flex items-center">
                  <Image 
                    src={otherParticipant?.img || "/default-avatar.png"} 
                    alt={`${otherParticipant?.name} ${otherParticipant?.surname}`}
                    width={40}
                    height={40}
                    className="rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "/default-avatar.png";
                    }}
                  />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">
                      {otherParticipant?.name} {otherParticipant?.surname}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {otherParticipant?.role}
                    </p>
                  </div>
                </div>
                
                {/* Messages */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-4">
                    {conversationMessages.map((message) => {
                      const isCurrentUser = message.senderId === userId;
                      
                      return (
                        <div 
                          key={message.id} 
                          className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                          <div 
                            className={`max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl rounded-lg px-4 py-2 ${
                              isCurrentUser 
                                ? 'bg-blue-500 text-white' 
                                : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            <p className="text-sm">{message.content}</p>
                            <p className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'}`}>
                              {format(message.timestamp, 'h:mm a')}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Message Input */}
                <div className="p-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <button className="text-gray-500 hover:text-gray-700 mr-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                    </button>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button className="ml-2 bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <p className="mt-2 text-gray-500">Select a conversation to start messaging</p>
                  <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
                    Start New Conversation
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessagesPage; 