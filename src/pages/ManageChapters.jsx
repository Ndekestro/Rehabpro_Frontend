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
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState(null);

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await fetch(`${API.baseUrl}/programs`);
        const data = await response.json();
        setPrograms(data);
      } catch (error) {
        console.error('Error fetching programs:', error);
      } finally {
        setIsLoading(false);
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
    setIsLoading(true);
    setSelectedProgram(programs.find(p => p.id === parseInt(program_id)));

    try {
      const response = await fetch(`${API.baseUrl}/programs/${program_id}/chapters`);
      const data = await response.json();
      setChapters(data);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

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

      const response = await fetch(`${API.baseUrl}/programs/${form.program_id}/chapters`);
      const data = await response.json();
      setChapters(data);
      setForm({ id: null, name: '', description: '', program_id: form.program_id, chapter_order: '' });
      setIsEditing(false);
    } catch (error) {
      console.error('Error submitting chapter:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (chapter) => {
    setForm(chapter);
    setIsEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this chapter?')) return;
    
    try {
      await fetch(`${API.baseUrl}/chapters/${id}`, { method: 'DELETE' });
      setChapters(chapters.filter((chapter) => chapter.id !== id));
    } catch (error) {
      console.error('Error deleting chapter:', error);
    }
  };

  if (isLoading && !chapters.length) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Manage Chapters</h2>

          {/* Program and Chapter Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Program
                </label>
                <select
                  name="program_id"
                  value={form.program_id}
                  onChange={handleProgramChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  required
                >
                  <option value="">Select Program</option>
                  {programs.map((program) => (
                    <option key={program.id} value={program.id}>
                      {program.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Chapter Name
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter chapter name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  required
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  name="description"
                  placeholder="Enter chapter description"
                  value={form.description}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  rows="4"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Chapter Order
                </label>
                <input
                  type="number"
                  name="chapter_order"
                  placeholder="Enter chapter order"
                  value={form.chapter_order}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`
                  px-6 py-3 rounded-lg text-white font-medium
                  transition-all duration-200 ease-in-out
                  ${isSubmitting
                    ? 'bg-blue-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                  }
                `}
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                    {isEditing ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  <span>{isEditing ? 'Update Chapter' : 'Create Chapter'}</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Chapters List */}
        {selectedProgram && (
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-800">
                Chapters for {selectedProgram.name}
              </h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {chapters.map((chapter) => (
                    <tr 
                      key={chapter.id}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">{chapter.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-gray-500 line-clamp-2">{chapter.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-500">{chapter.chapter_order}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="space-x-3">
                          <button
                            onClick={() => handleEdit(chapter)}
                            className="px-4 py-2 rounded-lg text-yellow-600 hover:bg-yellow-50 transition-colors duration-200"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(chapter.id)}
                            className="px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {chapters.length === 0 && (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500">
                        No chapters found for this program
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageChapters;