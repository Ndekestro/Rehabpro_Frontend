import React, { useEffect, useState } from 'react';
import API from '../api'; // Import API utility

const ManageUsers = () => {
  const [users, setUsers] = useState([]); // Ensure it's initialized as an array
  const [form, setForm] = useState({ id: null, name: '', email: '', username: '', role: 'participant', password: '' });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch users from the backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${API.baseUrl}/users`);
        const data = await response.json();

        // Update the users state with the correct array
        setUsers(data.users || []); // Ensure data.users exists, otherwise fallback to an empty array
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Handle form submission (Create or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        // Update user
        await fetch(`${API.baseUrl}/users/${form.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        });
      } else {
        // Create user
        await fetch(`${API.baseUrl}/users/register`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(form),
        });
      }
      setForm({ id: null, name: '', email: '', username: '', role: 'participant', password: '' });
      setIsEditing(false);
      const response = await fetch(`${API.baseUrl}/users`);
      const data = await response.json();
      setUsers(data.users || []); // Refresh user list
    } catch (error) {
      console.error('Error submitting user:', error);
    }
  };

  // Handle deleting a user
  const handleDelete = async (id) => {
    try {
      await fetch(`${API.baseUrl}/users/${id}`, { method: 'DELETE' });
      setUsers(users.filter((user) => user.id !== id));
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Handle editing a user
  const handleEdit = (user) => {
    setForm(user);
    setIsEditing(true);
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Users</h2>

      {/* User Form */}
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 shadow-md rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={form.name}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          >
            <option value="participant">Participant</option>
            <option value="professional">Professional</option>
            <option value="admin">Admin</option>
          </select>
          {!isEditing && (
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="p-2 border rounded"
              required
            />
          )}
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isEditing ? 'Update User' : 'Add User'}
        </button>
      </form>

      {/* User List */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th classnmame="border-bottom-white p-2">ID</th>
            <th className="border border-gray-300 p-2">Name</th>
            <th className="border border-gray-300 p-2">Email</th>
            <th className="border border-gray-300 p-2">Username</th>
            <th className="border border-gray-300 p-2">Role</th>
            <th className="border border-gray-300 p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.length > 0 ? (
            users.map((user) => (
              <tr key={user.id} className="text-center">
                <td className="border border-gray-300 p-2">{user.id}</td>
                <td className="border border-gray-300 p-2">{user.name}</td>
                <td className="border border-gray-300 p-2">{user.email}</td>
                <td className="border border-gray-300 p-2">{user.username}</td>
                <td className="border border-gray-300 p-2">{user.role}</td>
                <td className="border border-gray-300 p-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 mr-2"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(user.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="text-center p-4">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ManageUsers;
