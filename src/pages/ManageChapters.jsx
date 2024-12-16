import React, { useState, useEffect } from 'react';
import API from '../api';

const ManageChapters = () => {
  const [programs, setPrograms] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: '',
    description: '',
    program_id: '',
    chapter_order: '',
  });
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch(`${API.baseUrl}/programs`);
        const data = await response.json();
        setPrograms(data);
      } catch (error) {
        console.error('Error fetching programs:', error);
      }
    };

    fetchPrograms();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleProgramChange = async (e) => {
    const program_id = e.target.value;
    setForm({ ...form, program_id });

    try {
      const response = await fetch(`${API.baseUrl}/programs/${program_id}/chapters`);
      const data = await response.json();
      setChapters(data);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (isEditing) {
        await fetch(`${API.baseUrl}/chapters/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      } else {
        await fetch(`${API.baseUrl}/chapters`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
      }

      setForm({ id: null, name: '', description: '', program_id: '', chapter_order: '' });
      setIsEditing(false);
      const response = await fetch(`${API.baseUrl}/programs/${form.program_id}/chapters`);
      const data = await response.json();
      setChapters(data);
    } catch (error) {
      console.error('Error submitting chapter:', error);
    }
  };

  const handleEdit = (chapter) => {
    setForm(chapter);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`${API.baseUrl}/chapters/${id}`, { method: 'DELETE' });
      setChapters(chapters.filter((chapter) => chapter.id !== id));
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Manage Chapters</h2>

      {/* Program and Chapter Form */}
      <form onSubmit={handleSubmit} className="mb-8 bg-white p-6 shadow-md rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <select
            name="program_id"
            value={form.program_id}
            onChange={handleProgramChange}
            className="p-2 border rounded"
            required
          >
            <option value="">Select Program</option>
            {programs.map((program) => (
              <option key={program.id} value={program.id}>
                {program.name}
              </option>
            ))}
          </select>

          <input
            type="text"
            name="name"
            placeholder="Chapter Name"
            value={form.name}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
          <textarea
            name="description"
            placeholder="Chapter Description"
            value={form.description}
            onChange={handleChange}
            className="p-2 border rounded"
            rows="4"
          />
          <input
            type="number"
            name="chapter_order"
            placeholder="Chapter Order"
            value={form.chapter_order}
            onChange={handleChange}
            className="p-2 border rounded"
            required
          />
        </div>
        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isEditing ? 'Update Chapter' : 'Create Chapter'}
        </button>
      </form>

      {/* Chapter List */}
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Description</th>
            <th className="border p-2">Order</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {chapters.map((chapter) => (
            <tr key={chapter.id}>
              <td className="border p-2">{chapter.name}</td>
              <td className="border p-2">{chapter.description}</td>
              <td className="border p-2">{chapter.chapter_order}</td>
              <td className="border p-2">
                <button
                  onClick={() => handleEdit(chapter)}
                  className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(chapter.id)}
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

export default ManageChapters;
