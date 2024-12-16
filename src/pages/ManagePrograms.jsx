import React, { useState, useEffect } from 'react';
import API from '../api'; // Assume API class has the base URL

const ManagePrograms = () => {
  const [programs, setPrograms] = useState([]);
  const [professionals, setProfessionals] = useState([]); // Store professionals for the dropdown
  const [form, setForm] = useState({
    id: null,
    name: '',
    description: '',
    assigned_to: '',
    created_by: '',
    progress: '',
    remarks: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  // Fetch programs and professionals from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [programResponse, professionalsResponse] = await Promise.all([
          fetch(`${API.baseUrl}/programs`),
          fetch(`${API.baseUrl}/programs/professionals`), // Fetch all professionals
        ]);

        const programsData = await programResponse.json();
        const professionalsData = await professionalsResponse.json();

        setPrograms(programsData);
        setProfessionals(professionalsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    // Set created_by from localStorage
    const userId = localStorage.getItem('userId');
    if (userId) {
      setForm((prevForm) => ({ ...prevForm, created_by: userId }));
    }
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
        // Update an existing program
        await fetch(`${API.baseUrl}/programs/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        // Create a new program
        await fetch(`${API.baseUrl}/programs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }

      // Reset the form and refresh the program list
      setForm({
        id: null,
        name: '',
        description: '',
        assigned_to: '',
        created_by: localStorage.getItem('userId'),
        progress: '',
        remarks: '',
      });
      setIsEditing(false);
      const response = await fetch(`${API.baseUrl}/programs`);
      const data = await response.json();
      setPrograms(data);
    } catch (error) {
      console.error('Error submitting program:', error);
    }
  };

  // Handle deleting a program
  const handleDelete = async (id) => {
    try {
      await fetch(`${API.baseUrl}/programs/${id}`, { method: 'DELETE' });
      setPrograms(programs.filter((program) => program.id !== id));
    } catch (error) {
      console.error('Error deleting program:', error);
    }
  };

  // Handle editing a program
  const handleEdit = (program) => {
    setForm(program);
    setIsEditing(true);
  };

  return (
    <div className="ml-64 p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Programs</h2>

      {/* Program Form */}
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 shadow-md rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="name"
            placeholder="Program Name"
            value={form.name}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
          />
          <input
            type="text"
            name="description"
            placeholder="Program Description"
            value={form.description}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
          />
          <select
            name="assigned_to"
            value={form.assigned_to}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            required
          >
            <option value="">Select Professional</option>
            {professionals.map((professional) => (
              <option key={professional.id} value={professional.id}>
                {professional.name}
              </option>
            ))}
          </select>
          <textarea
            name="progress"
            placeholder="Progress Details"
            value={form.progress}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            rows="3"
          />
          <textarea
            name="remarks"
            placeholder="Remarks"
            value={form.remarks}
            onChange={handleChange}
            className="p-2 border rounded w-full"
            rows="3"
          />
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isEditing ? 'Update Program' : 'Create Program'}
        </button>
      </form>

      {/* Program List */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Progress</th>
            <th className="border p-2">Remarks</th>
            <th className="border p-2">Assigned To</th>
            <th className="border p-2">Created By</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {programs.map((program) => (
            <tr key={program.id}>
              <td className="border border-gray-300 p-2">{program.name}</td>
              <td className="border border-gray-300 p-2">{program.description}</td>
              <td className="border border-gray-300 p-2">{program.progress || 'N/A'}</td>
              <td className="border border-gray-300 p-2">{program.remarks || 'N/A'}</td>
              <td className="border border-gray-300 p-2">{program.assigned_to_name || 'Not Assigned'}</td>
              <td className="border border-gray-300 p-2">{program.created_by_name}</td>
              <td className="border border-gray-300 p-2">{program.status}</td>
              <td className="border border-gray-300 p-2">
                <button
                  onClick={() => handleEdit(program)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(program.id)}
                  className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ManagePrograms;
