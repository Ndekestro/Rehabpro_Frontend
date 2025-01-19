import React, { useEffect, useState } from 'react';
import API from '../api'; // Assuming API setup already exists

const ChatPage = () => {
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    setUser(currentUser);

    if (currentUser) {
      fetchUsers(currentUser.id);
      fetchConversations(currentUser.id);
    }
  }, []);

  const fetchUsers = async (userId) => {
    try {
      const response = await fetch(`${API.baseUrl}/chat/users?userId=${userId}`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchConversations = async (userId) => {
    try {
      const response = await fetch(`${API.baseUrl}/chat/conversations/${userId}`);
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await fetch(`${API.baseUrl}/chat/messages/${conversationId}`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSelectConversation = (conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.conversation_id);
  };

  const handleStartConversation = async (participantId) => {
    try {
      const response = await fetch(`${API.baseUrl}/chat/conversation`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user1_id: user.id,
          user2_id: participantId,
        }),
      });
  
      const newConversation = await response.json();
  
      if (!newConversation || !newConversation.conversationId) {
        console.error('Failed to create conversation:', newConversation);
        return;
      }
  
      setConversations((prev) => [newConversation, ...prev]);
      handleSelectConversation(newConversation);
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };
  
  const db = require('../db');

  // Create a conversation
  exports.createConversation = (req, res) => {
      const { participant1_id, participant2_id } = req.body;
  
      const query = `
          INSERT IGNORE INTO conversations (participant1_id, participant2_id)
          VALUES (LEAST(?, ?), GREATEST(?, ?))
      `;
      db.query(query, [participant1_id, participant2_id, participant1_id, participant2_id], (err, results) => {
          if (err) {
              console.error('Error creating conversation:', err);
              return res.status(500).json({ error: 'Error creating conversation' });
          }
  
          res.status(201).json({ message: 'Conversation created successfully', conversationId: results.insertId });
      });
  };
  
  // Send a message
  exports.sendMessage = (req, res) => {
      const { conversation_id, sender_id, message } = req.body;
  
      const query = `
          INSERT INTO messages (conversation_id, sender_id, message)
          VALUES (?, ?, ?)
      `;
      db.query(query, [conversation_id, sender_id, message], (err) => {
          if (err) {
              console.error('Error sending message:', err);
              return res.status(500).json({ error: 'Error sending message' });
          }
  
          res.status(201).json({ message: 'Message sent successfully' });
      });
  };
  
  // Fetch messages for a conversation
  exports.getMessages = (req, res) => {
      const { conversation_id } = req.params;
  
      const query = `
          SELECT m.id, m.sender_id, m.message, m.created_at, u.name AS sender_name
          FROM messages m
          JOIN users u ON m.sender_id = u.id
          WHERE m.conversation_id = ?
          ORDER BY m.created_at ASC
      `;
      db.query(query, [conversation_id], (err, results) => {
          if (err) {
              console.error('Error fetching messages:', err);
              return res.status(500).json({ error: 'Error fetching messages' });
          }
  
          res.status(200).json(results);
      });
  };
  
  // Fetch all conversations for a user
  exports.getConversations = (req, res) => {
      const { user_id } = req.params;
  
      const query = `
          SELECT c.id AS conversation_id, 
                 c.participant1_id, 
                 c.participant2_id,
                 u1.name AS participant1_name,
                 u2.name AS participant2_name,
                 (SELECT message FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message,
                 (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS last_message_time
          FROM conversations c
          JOIN users u1 ON c.participant1_id = u1.id
          JOIN users u2 ON c.participant2_id = u2.id
          WHERE c.participant1_id = ? OR c.participant2_id = ?
          ORDER BY last_message_time DESC
      `;
      db.query(query, [user_id, user_id], (err, results) => {
          if (err) {
              console.error('Error fetching conversations:', err);
              return res.status(500).json({ error: 'Error fetching conversations' });
          }
  
          res.status(200).json(results);
      });
  };
  exports.getAllUsers = (req, res) => {
      const { userId } = req.query;
    
      const query = `
        SELECT id, name, role FROM users
        WHERE id != ?
        ORDER BY name;
      `;
    
      db.query(query, [userId], (err, results) => {
        if (err) {
          console.error('Error fetching users:', err);
          return res.status(500).json({ error: 'Error fetching users' });
        }
        res.status(200).json(results);
      });
    };

  return (
    <div className="flex h-screen">
      <div className="w-1/4 h-full border-r bg-gray-100 p-4">
        <h2 className="text-xl font-bold mb-4">Users</h2>
        <ul className="space-y-2">
          {users.map((user) => (
            <li
              key={user.id}
              onClick={() => handleStartConversation(user.id)}
              className="p-2 rounded-lg cursor-pointer bg-white hover:bg-gray-200"
            >
              {user.name} ({user.role})
            </li>
          ))}
        </ul>

        <h2 className="text-xl font-bold mt-6 mb-4">Conversations</h2>
        <ul className="space-y-2">
          {conversations.map((conversation) => (
            <li
              key={conversation.conversation_id}
              onClick={() => handleSelectConversation(conversation)}
              className={`p-2 rounded-lg cursor-pointer ${
                selectedConversation?.conversation_id === conversation.conversation_id
                  ? 'bg-blue-500 text-white'
                  : 'bg-white hover:bg-gray-200'
              }`}
            >
              {conversation.name}
            </li>
          ))}
        </ul>
      </div>

      <div className="w-3/4 h-full flex flex-col bg-white">
        {selectedConversation && (
          <>
            <header className="p-4 border-b bg-gray-100">
              <h2 className="text-lg font-bold">{selectedConversation.name}</h2>
            </header>

            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id || message.created_at}
                  className={`flex ${message.sender_id === user.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs p-4 rounded-lg ${
                      message.sender_id === user.id ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
                    }`}
                  >
                    <p className="text-sm font-semibold">{message.sender_name}</p>
                    <p>{message.message}</p>
                    <p className="text-xs text-gray-400">
                      {new Date(message.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t bg-gray-100 flex items-center space-x-4">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message"
                className="flex-1 p-2 border rounded-lg"
              />
              <button onClick={handleSendMessage} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
