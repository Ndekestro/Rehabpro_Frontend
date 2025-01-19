import React, { useEffect, useState } from 'react';
import API from '../api';

const ProfessionalPage = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [progress, setProgress] = useState({});
  const [remarks, setRemarks] = useState({});
  const [participants, setParticipants] = useState([]);
  const [availableParticipants, setAvailableParticipants] = useState([]);
  const [newParticipantId, setNewParticipantId] = useState('');
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleSelectProgram = async (program) => {
    setSelectedProgram(program);
    setProgress({});
    setRemarks({});
    setIsLoading(true);
    
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

      const participantsResponse = await fetch(`${API.baseUrl}/programs/participants`);
      const availableParticipantsData = await participantsResponse.json();
      const filteredParticipants = availableParticipantsData.filter(participant => 
        !program.participants?.split(',').includes(participant.id.toString())
      );
      setAvailableParticipants(filteredParticipants);
    } catch (error) {
      console.error('Error fetching chapters:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!newParticipantId) {
      alert('Please select a participant to add');
      return;
    }

    setIsSubmitting(true);
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
    } finally {
      setIsSubmitting(false);
    }
  };

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
        setParticipants(participants.filter((participant) => participant !== userId));
      } else {
        const data = await response.json();
        alert(data.error || 'Error removing participant');
      }
    } catch (error) {
      console.error('Error removing participant:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Programs Management
          </h2>

          {/* Programs Grid */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">
                Assigned Programs
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {programs.map((program) => (
                  <div
                    key={program.id}
                    onClick={() => handleSelectProgram(program)}
                    className={`
                      relative overflow-hidden rounded-lg p-6 cursor-pointer
                      transition-all duration-200 ease-in-out
                      ${
                        selectedProgram?.id === program.id
                          ? 'bg-blue-50 border-2 border-blue-500 shadow-md transform scale-102'
                          : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-md'
                      }
                    `}
                  >
                    <div className="flex flex-col h-full">
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">
                        {program.name}
                      </h4>
                      <p className="text-gray-600 mb-4 flex-grow">
                        {program.description}
                      </p>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">
                          Created by: <span className="font-medium">{program.created_by_name}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: <span className="font-medium">{program.status}</span>
                        </p>
                        <p className="text-sm text-gray-500">
                          Assigned to: <span className="font-medium">{program.assigned_to_name || 'Not Assigned'}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Selected Program Section */}
            {selectedProgram && (
              <div className="mt-12 space-y-8">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    Add Participant to {selectedProgram.name}
                  </h3>
                  <form onSubmit={handleAddParticipant} className="space-y-4">
                    <div>
                      <select
                        value={newParticipantId}
                        onChange={(e) => setNewParticipantId(e.target.value)}
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                        required
                      >
                        <option value="">Select Participant</option>
                        {availableParticipants.map((participant) => (
                          <option key={participant.id} value={participant.id}>
                            {participant.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`
                        w-full sm:w-auto px-6 py-3 rounded-lg text-white font-medium
                        transition-all duration-200 ease-in-out
                        ${
                          isSubmitting
                            ? 'bg-blue-400 cursor-not-allowed'
                            : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                        }
                      `}
                    >
                      {isSubmitting ? (
                        <span className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                          Adding...
                        </span>
                      ) : (
                        'Add Participant'
                      )}
                    </button>
                  </form>
                </div>

                {/* Participants List */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h3 className="text-xl font-semibold text-gray-800 mb-6">
                    Current Participants
                  </h3>
                  <div className="space-y-4">
                    {participants.length > 0 ? (
                      participants.map((participant) => (
                        <div
                          key={participant}
                          className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                        >
                          <span className="text-gray-700">{participant}</span>
                          <button
                            onClick={() => handleRemoveParticipant(participant)}
                            className="px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors duration-200"
                          >
                            Remove
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">
                        No participants added yet
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalPage;