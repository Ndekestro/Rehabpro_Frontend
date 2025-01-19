import React, { useEffect, useState } from 'react';
import API from '../api';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const ProfessionalProgress = () => {
  const [programs, setPrograms] = useState([]); // Programs managed by the professional
  const [selectedProgram, setSelectedProgram] = useState(null); // Selected program
  const [progressData, setProgressData] = useState([]); // Progress data for the selected program
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'professional') {
          alert('Unauthorized');
          return;
        }

        const response = await fetch(`${API.baseUrl}/programs/role?role=professional&userId=${user.id}`);
        const data = await response.json();
        setPrograms(data);
      } catch (error) {
        console.error('Error fetching programs:', error);
        setSnackbar({ open: true, message: 'Error fetching programs', severity: 'error' });
      }
    };

    fetchPrograms();
  }, []);

  const handleSelectProgram = async (program) => {
    setSelectedProgram(program);

    try {
      const response = await fetch(`${API.baseUrl}/progress?program_id=${program.id}`);
      const data = await response.json();
      setProgressData(data);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setSnackbar({ open: true, message: 'Error fetching progress data', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Program Progress</h2>

      {/* List of Programs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((program) => (
          <div
            key={program.id}
            className={`p-4 border rounded shadow-md ${selectedProgram?.id === program.id ? 'border-blue-500' : 'border-gray-300'}`}
            onClick={() => handleSelectProgram(program)}
          >
            <h3 className="text-lg font-bold">{program.name}</h3>
            <p className="text-gray-600">{program.description}</p>
          </div>
        ))}
      </div>

      {/* Progress Table */}
      {selectedProgram && (
        <div className="mt-8">
          <h3 className="text-xl font-bold mb-4">Progress for {selectedProgram.name}</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2">Participant</th>
                <th className="border border-gray-300 px-4 py-2">Chapter</th>
                <th className="border border-gray-300 px-4 py-2">Description</th>
                <th className="border border-gray-300 px-4 py-2">Status</th>
                <th className="border border-gray-300 px-4 py-2">Remarks</th>
                <th className="border border-gray-300 px-4 py-2">Updated At</th>
              </tr>
            </thead>
            <tbody>
              {progressData.length > 0 ? (
                progressData.map((item) => (
                  <tr key={item.progress_id}>
                    <td className="border border-gray-300 px-4 py-2">{item.participant_name}</td>
                    <td className="border border-gray-300 px-4 py-2">{item.chapter_name}</td>
                    <td className="border border-gray-300 px-4 py-2">{item.chapter_description}</td>
                    <td className="border border-gray-300 px-4 py-2">{item.status || 'not_started'}</td>
                    <td className="border border-gray-300 px-4 py-2">{item.remarks || 'N/A'}</td>
                    <td className="border border-gray-300 px-4 py-2">{item.updated_at}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="border border-gray-300 px-4 py-2 text-center" colSpan="6">
                    No progress data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ProfessionalProgress;
