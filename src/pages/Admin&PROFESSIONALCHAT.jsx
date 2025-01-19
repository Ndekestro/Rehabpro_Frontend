import React, { useState, useEffect } from 'react';
import API from '../api';

const AdminProfessionalChatPage = () => {
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Fetch user details from localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || (user.role !== 'admin' && user.role !== 'professional')) {
    return <div className="text-center text-red-500 mt-10">Access denied. Only admins and professionals can access this page.</div>;
  }

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API.baseUrl}/users`);
      const data = await response.json();

      if (Array.isArray(data.users)) {
        setUsers(data.users.filter((u) => u.id !== user.id)); // Exclude the current user
      } else {
        console.error('Invalid API response format:', data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  // Fetch all chats for the logged-in user
  const fetchChats = async () => {
    try {
      const response = await fetch(`${API.baseUrl}/chats/${user.id}`);
      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  };

  // Create or fetch a chat with a selected user
  const startChat = async (otherUserId) => {
    try {
      const response = await fetch(`${API.baseUrl}/chats/getOrCreate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          professional_id: user.role === 'professional' ? user.id : otherUserId,
          participant_id: user.role === 'participant' ? otherUserId : user.id,
        }),
      });
      const data = await response.json();
      setSelectedChat(data.chatId);
      setSelectedUser(users.find((u) => u.id === otherUserId));
      fetchChatHistory(data.chatId);
    } catch (error) {
      console.error('Error starting chat:', error);
    }
  };

  // Fetch chat history for a specific chat
  const fetchChatHistory = async (chatId) => {
    try {
      const response = await fetch(`${API.baseUrl}/messages/${chatId}/history`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  // Send a new message via Socket.IO
  const sendMessage = () => {
    if (!newMessage.trim()) return;

    API.sendMessage({
      chat_id: selectedChat,
      sender_id: user.id,
      message: newMessage,
    });

    // Optimistically update the UI
    setMessages((prev) => [
      ...prev,
      { chat_id: selectedChat, sender_id: user.id, message: newMessage, created_at: new Date() },
    ]);
    setNewMessage('');
  };

  // Listen for real-time messages
  useEffect(() => {
    const handleMessageReceived = (message) => {
      if (message.chat_id === selectedChat) {
        setMessages((prev) => [...prev, message]);
      }
    };

    API.onMessageReceived(handleMessageReceived);

    return () => {
      API.disconnect();
    };
  }, [selectedChat]);

  // Load users and chats when the component mounts
  useEffect(() => {
    fetchUsers();
    fetchChats();
    API.joinRoom(user.id); // Join the WebSocket room
  }, []);

  return (
    <div className="flex h-screen">
      {/* User List */}
      <div className="w-1/3 border-r border-gray-300 p-4 overflow-y-auto bg-gray-100">
        <h3 className="text-xl font-bold mb-4">All Users</h3>
        {users.map((u) => (
          <div
            key={u.id}
            className={`p-3 mb-2 cursor-pointer rounded-lg ${
              selectedUser?.id === u.id ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300'
            }`}
            onClick={() => startChat(u.id)}
          >
            <p className="font-semibold">{u.name}</p>
            <p className="text-sm text-gray-600">{u.role}</p>
          </div>
        ))}
      </div>

      {/* Chat Window */}
      <div className="flex flex-col flex-grow p-4">
        {selectedChat ? (
          <>
            <div className="text-lg font-semibold mb-2">Chat with {selectedUser?.name}</div>
            {/* Messages */}
            <div className="flex-grow overflow-y-auto bg-gray-100 p-4 rounded-lg border border-gray-300">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex mb-2 ${
                    message.sender_id === user.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-xs ${
                      message.sender_id === user.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    {message.message}
                  </div>
                </div>
              ))}
            </div>

            {/* Input for New Message */}
            <div className="flex mt-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={sendMessage}
                className="bg-blue-500 text-white px-6 py-3 rounded-r-lg hover:bg-blue-600"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <p className="text-center text-gray-500 mt-10">Select a user to start chatting</p>
        )}
      </div>
    </div>
  );
};

export default AdminProfessionalChatPage;
