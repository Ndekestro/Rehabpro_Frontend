import React, { useEffect, useState } from 'react';
import API from '../api'; // Your API utility

const ProfessionalPage = () => {
  const [programs, setPrograms] = useState([]); // Assigned programs
  const [selectedProgram, setSelectedProgram] = useState(null); // Program selected for updates
  const [progress, setProgress] = useState({}); // Progress update per chapter
  const [remarks, setRemarks] = useState({}); // Remarks update per chapter
  const [participants, setParticipants] = useState([]); // Participants for selected program
  const [availableParticipants, setAvailableParticipants] = useState([]); // All users with 'participant' role
  const [newParticipantId, setNewParticipantId] = useState(''); // New participant to add
  const [chapters, setChapters] = useState([]); // Chapters for selected program

  // Fetch programs assigned to the professional on component mount
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
        console.error('Error fetching assigned programs:', error);
      }
    };

    fetchPrograms();
  }, []);

  // Handle selecting a program
  const handleSelectProgram = async (program) => {
    setSelectedProgram(program);
    setProgress({});
    setRemarks({});
    
    // Convert the participants CSV string into an array
    setParticipants(program.participants ? program.participants.split(',') : []);

    try {
      const chaptersResponse = await fetch(`${API.baseUrl}/chapters?programId=${program.id}`);
      const chaptersData = await chaptersResponse.json();
      setChapters(chaptersData);

      const initialProgress = {};
      const initialRemarks = {};
      chaptersData.forEach((chapter) => {
        initialProgress[chapter.id] = chapter.progress || '';
        initialRemarks[chapter.id] = chapter.remarks || '';
      });
      setProgress(initialProgress);
      setRemarks(initialRemarks);

      // Fetch available participants (users with role 'participant')
      const participantsResponse = await fetch(`${API.baseUrl}/programs/participants`);
      const availableParticipantsData = await participantsResponse.json();
      // Filter out users already in the program
      const filteredParticipants = availableParticipantsData.filter(participant => 
        !program.participants?.split(',').includes(participant.id.toString())
      );
      setAvailableParticipants(filteredParticipants);

    } catch (error) {
      console.error('Error fetching chapters:', error);
    }
  };

  // Handle adding a participant to the selected program
  const handleAddParticipant = async (e) => {
    e.preventDefault();

    if (!newParticipantId) {
      alert('Please select a participant to add');
      return;
    }

    try {
      const response = await fetch(`${API.baseUrl}/programs/addparticipant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programId: selectedProgram.id,
          userId: newParticipantId,
        }),
      });

      if (response.ok) {
        alert('Participant added successfully');
        const updatedProgram = await fetch(`${API.baseUrl}/programs/${selectedProgram.id}`);
        const updatedData = await updatedProgram.json();
        setParticipants(updatedData.participants ? updatedData.participants.split(',') : []);
        setNewParticipantId('');
      } else {
        const data = await response.json();
        alert(data.error || 'Error adding participant');
      }
    } catch (error) {
      console.error('Error adding participant:', error);
    }
  };

  // Handle removing a participant from the selected program
  const handleRemoveParticipant = async (userId) => {
    try {
      const response = await fetch(`${API.baseUrl}/programs/removeparticipant`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          programId: selectedProgram.id,
          userId,
        }),
      });

      if (response.ok) {
        alert('Participant removed successfully');
        setParticipants(participants.filter((participant) => participant !== userId));
      } else {
        const data = await response.json();
        alert(data.error || 'Error removing participant');
      }
    } catch (error) {
      console.error('Error removing participant:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Assigned Programs</h2>
      {/* List of Assigned Programs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {programs.map((program) => (
          <div
            key={program.id}
            className={`p-4 border rounded shadow-md ${selectedProgram?.id === program.id ? 'border-blue-500' : 'border-gray-300'}`}
            onClick={() => handleSelectProgram(program)}
          >
            <h3 className="text-lg font-bold">{program.name}</h3>
            <p className="text-gray-600">{program.description}</p>
            <p className="text-sm text-gray-500">
              Created By: {program.created_by_name} | Status: {program.status}
            </p>
            <p className="text-sm text-gray-500">Assigned To: {program.assigned_to_name || 'Not Assigned'}</p>
          </div>
        ))}
      </div>

      {/* Add Participant Form */}
      {selectedProgram && (
        <div className="mt-8">
          <h3 className="text-xl font-bold">Add Participant to Program: {selectedProgram.name}</h3>
          <form onSubmit={handleAddParticipant} className="mt-4 space-y-4">
            <select
              value={newParticipantId}
              onChange={(e) => setNewParticipantId(e.target.value)}
              className="w-full p-2 border rounded"
              required
            >
              <option value="">Select Participant</option>
              {/* Render all participants, excluding those already added */}
              {availableParticipants.map((participant) => (
                <option key={participant.id} value={participant.id}>
                  {participant.name}
                </option>
              ))}
            </select>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Add Participant
            </button>
          </form>
        </div>
      )}

      {/* Participants List */}
      {selectedProgram && (
        <div className="mt-8">
          <h3 className="text-xl font-bold">Participants in Program</h3>
          <ul className="space-y-2">
            {participants.length > 0 ? (
              participants.map((participant) => (
                <li key={participant} className="text-sm text-gray-600">
                  {participant}
                  <button
                    onClick={() => handleRemoveParticipant(participant)}
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))
            ) : (
              <li>No participants yet</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default ProfessionalPage;
