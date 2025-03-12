import React, { useEffect, useState } from 'react';
import API from '../api';
import { 
  BookOpen, Users, Award, User, Check, X, ArrowRight, 
  AlertTriangle, ChevronRight, UserPlus, UserMinus, Briefcase,
  CheckCircle
} from 'lucide-react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const ProfessionalPage = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [progress, setProgress] = useState({});
  const [remarks, setRemarks] = useState({});
  const [participants, setParticipants] = useState([]);
  const [participantDetails, setParticipantDetails] = useState({});
  const [availableParticipants, setAvailableParticipants] = useState([]);
  const [newParticipantId, setNewParticipantId] = useState('');
  const [chapters, setChapters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'professional') {
          setError('Unauthorized access. Please log in as a professional.');
          setSnackbar({
            open: true,
            message: 'Unauthorized access. Please log in as a professional.',
            severity: 'error'
          });
          setIsLoading(false);
          return;
        }

        try {
          const response = await fetch(`${API.baseUrl}/programs/role?role=professional&userId=${user.id}`);
          
          if (!response.ok) {
            if (response.status === 500) {
              console.log('No programs found or server error.');
              setPrograms([]);
              setSnackbar({
                open: true,
                message: 'You are not currently assigned to any programs.',
                severity: 'info'
              });
            } else {
              throw new Error(`Error ${response.status}: ${response.statusText}`);
            }
          } else {
            const data = await response.json();
            setPrograms(Array.isArray(data) ? data : []);
          }
        } catch (error) {
          console.error('Error fetching assigned programs:', error);
          setError('Unable to fetch programs. You may not have any programs assigned yet.');
          setSnackbar({
            open: true,
            message: 'Error fetching programs. You may not have any programs assigned yet.',
            severity: 'warning'
          });
          setPrograms([]);
        }
      } catch (error) {
        console.error('Error in user authentication:', error);
        setError('Authentication error. Please log in again.');
        setSnackbar({
          open: true,
          message: 'Authentication error. Please log in again.',
          severity: 'error'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleSelectProgram = async (program) => {
    try {
      setSelectedProgram(program);
      setProgress({});
      setRemarks({});
      setIsLoading(true);
      setError(null);
      
      // Get participant IDs from the program
      const participantIds = program.participants ? 
        (typeof program.participants === 'string' ? program.participants.split(',') : program.participants) 
        : [];
      
      setParticipants(participantIds);

      try {
        // Fetch chapters for the program
        const chaptersResponse = await fetch(`${API.baseUrl}/chapters?programId=${program.id}`);
        
        if (!chaptersResponse.ok) {
          console.log('No chapters found or error fetching chapters.');
          setChapters([]);
        } else {
          const chaptersData = await chaptersResponse.json();
          setChapters(Array.isArray(chaptersData) ? chaptersData : []);

          const initialProgress = {};
          const initialRemarks = {};
          chaptersData.forEach((chapter) => {
            initialProgress[chapter.id] = chapter.progress || '';
            initialRemarks[chapter.id] = chapter.remarks || '';
          });
          setProgress(initialProgress);
          setRemarks(initialRemarks);
        }

        // Fetch all available participants
        const participantsResponse = await fetch(`${API.baseUrl}/programs/participants`);
        
        if (!participantsResponse.ok) {
          console.log('Error fetching available participants.');
          setAvailableParticipants([]);
          setSnackbar({
            open: true,
            message: 'Could not load available guardians.',
            severity: 'warning'
          });
        } else {
          const availableParticipantsData = await participantsResponse.json();
          
          // Create a map of participant details for easy lookup
          const detailsMap = {};
          availableParticipantsData.forEach(participant => {
            detailsMap[participant.id] = participant;
          });
          setParticipantDetails(detailsMap);
          
          // Filter out already assigned participants
          const currentParticipantIds = participantIds.map(id => id.toString());
          const filteredParticipants = availableParticipantsData.filter(participant => 
            !currentParticipantIds.includes(participant.id.toString())
          );
          
          setAvailableParticipants(filteredParticipants);
        }
      } catch (error) {
        console.error('Error fetching program details:', error);
        setError('Unable to load program details. Please try again later.');
        setSnackbar({
          open: true,
          message: 'Unable to load program details. Please try again later.',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Error in program selection:', error);
      setError('An unexpected error occurred. Please try again.');
      setSnackbar({
        open: true,
        message: 'An unexpected error occurred. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddParticipant = async (e) => {
    e.preventDefault();
    if (!newParticipantId) {
      setSnackbar({
        open: true,
        message: 'Please select a guardian to add',
        severity: 'warning'
      });
      return;
    }

    setIsSubmitting(true);
    setError(null);
    
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
        // Find the guardian details to display in the success message
        const addedGuardian = availableParticipants.find(p => p.id.toString() === newParticipantId);
        const guardianName = addedGuardian ? 
          `${addedGuardian.first_name || ''} ${addedGuardian.last_name || ''}`.trim() : 
          'Guardian';

        setSnackbar({
          open: true,
          message: `${guardianName} successfully added to the program`,
          severity: 'success'
        });

        try {
          const updatedProgram = await fetch(`${API.baseUrl}/programs/${selectedProgram.id}`);
          
          if (updatedProgram.ok) {
            const updatedData = await updatedProgram.json();
            const updatedParticipantIds = updatedData.participants ? 
              (typeof updatedData.participants === 'string' ? updatedData.participants.split(',') : updatedData.participants) 
              : [];
            
            setParticipants(updatedParticipantIds);
            
            // Remove the added participant from available participants
            setAvailableParticipants(prev => 
              prev.filter(p => p.id.toString() !== newParticipantId)
            );
            
            setNewParticipantId('');
          } else {
            console.error('Error fetching updated program data');
            setSnackbar({
              open: true,
              message: 'Guardian was added but unable to refresh the list. Please reload the page.',
              severity: 'warning'
            });
          }
        } catch (error) {
          console.error('Error refreshing program data:', error);
          setSnackbar({
            open: true,
            message: 'Guardian was added but unable to refresh the list. Please reload the page.',
            severity: 'warning'
          });
        }
      } else {
        try {
          const errorData = await response.json();
          setSnackbar({
            open: true,
            message: errorData.error || 'Error adding guardian. Please try again.',
            severity: 'error'
          });
        } catch (error) {
          setSnackbar({
            open: true,
            message: 'Error adding guardian. Please try again.',
            severity: 'error'
          });
        }
      }
    } catch (error) {
      console.error('Error adding guardian:', error);
      setSnackbar({
        open: true,
        message: 'Network error when adding guardian. Please check your connection and try again.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveParticipant = async (userId) => {
    setIsSubmitting(true);
    setError(null);
    
    // Get the guardian name before removing
    const guardianDetails = participantDetails[userId];
    const guardianName = guardianDetails ? 
      `${guardianDetails.first_name || ''} ${guardianDetails.last_name || ''}`.trim() : 
      'Guardian';
    
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
        // Remove the participant locally
        setParticipants(prev => prev.filter(participantId => participantId !== userId));
        
        // Add the removed participant back to available participants
        try {
          if (participantDetails[userId]) {
            setAvailableParticipants(prev => [...prev, participantDetails[userId]]);
          } else {
            const participantsResponse = await fetch(`${API.baseUrl}/programs/participants`);
            if (participantsResponse.ok) {
              const allParticipants = await participantsResponse.json();
              const removedParticipant = allParticipants.find(p => p.id.toString() === userId.toString());
              
              if (removedParticipant) {
                setAvailableParticipants(prev => [...prev, removedParticipant]);
              }
            }
          }
          
          setSnackbar({
            open: true,
            message: `${guardianName} successfully removed from the program`,
            severity: 'success'
          });
        } catch (error) {
          console.error('Error refreshing available participants:', error);
          setSnackbar({
            open: true,
            message: `${guardianName} was removed but the list may not be up to date. Please reload the page.`,
            severity: 'warning'
          });
        }
      } else {
        try {
          const errorData = await response.json();
          setSnackbar({
            open: true,
            message: errorData.error || 'Error removing guardian. Please try again.',
            severity: 'error'
          });
        } catch (error) {
          setSnackbar({
            open: true,
            message: 'Error removing guardian. Please try again.',
            severity: 'error'
          });
        }
      }
    } catch (error) {
      console.error('Error removing participant:', error);
      setSnackbar({
        open: true,
        message: 'Network error when removing guardian. Please check your connection and try again.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFullName = (participantId) => {
    const details = participantDetails[participantId];
    if (!details) return `Guardian ${participantId}`;
    
    return `${details.first_name || ''} ${details.last_name || ''}`.trim() || `Guardian ${participantId}`;
  };

  if (isLoading && !selectedProgram) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading your programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white pt-8 px-4 sm:px-6 lg:px-8 pb-16">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 md:px-10">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 md:mb-0">
                <div className="p-3 bg-white bg-opacity-20 rounded-full">
                  <Briefcase className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    Programs Survey Management
                  </h2>
                  <p className="text-blue-100 mt-1">
                    Manage programs and guardians
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="px-6 py-4 bg-red-50 border-l-4 border-red-500 flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0 mt-0.5" />
              <p className="text-red-700">{error}</p>
            </div>
          )}
        </div>

        {/* Programs Grid */}
        <div className="mb-10">
          <div className="flex items-center space-x-3 mb-6">
            <Award className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-800">
              Your Assigned Programs
            </h3>
          </div>
          
          {programs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-yellow-600" />
              </div>
              <h4 className="text-xl font-medium text-gray-900 mb-2">No Programs Assigned</h4>
              <p className="text-gray-600 max-w-md mx-auto">
                You currently don't have any programs assigned to you. 
                Please contact an administrator if you believe this is an error.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <div
                  key={program.id}
                  onClick={() => handleSelectProgram(program)}
                  className={`
                    relative overflow-hidden rounded-xl p-6 cursor-pointer
                    transition-all duration-300 ease-in-out
                    ${
                      selectedProgram?.id === program.id
                        ? 'bg-blue-50 border-2 border-blue-500 shadow-lg transform scale-102'
                        : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1'
                    }
                  `}
                >
                  <div className="flex flex-col h-full">
                    <div className="flex items-start mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg mr-4">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {program.name}
                      </h4>
                    </div>
                    
                    <p className="text-gray-600 mb-4 flex-grow">
                      {program.description}
                    </p>
                    
                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span>Created by: </span>
                        <span className="ml-1 font-medium text-gray-700">{program.created_by_name}</span>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-500">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mr-2
                          ${program.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}
                        `}>
                          <CheckCircle className="h-3 w-3 mr-1" />
                          {program.status}
                        </span>
                        <ChevronRight className="h-4 w-4 ml-auto text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Program Section */}
        {selectedProgram && (
          <div className="space-y-8">
            {isLoading ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading program details...</p>
              </div>
            ) : (
              <>
                {/* Add Guardian Section */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <UserPlus className="h-5 w-5 mr-2" />
                      Add Guardian to {selectedProgram.name}
                    </h3>
                  </div>
                  
                  <div className="p-6">
                    {availableParticipants.length === 0 ? (
                      <div className="bg-gray-50 rounded-lg p-4 text-center">
                        <p className="text-gray-600">No available guardians to add</p>
                      </div>
                    ) : (
                      <form onSubmit={handleAddParticipant} className="space-y-4">
                        <div>
                          <label htmlFor="guardian-select" className="block text-sm font-medium text-gray-700 mb-1">
                            Select Guardian
                          </label>
                          <div className="relative">
                            <select
                              id="guardian-select"
                              value={newParticipantId}
                              onChange={(e) => setNewParticipantId(e.target.value)}
                              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-lg"
                              required
                            >
                              <option value="">Select a guardian to add</option>
                              {availableParticipants.map((participant) => (
                                <option key={participant.id} value={participant.id}>
                                  {`${participant.first_name || ''} ${participant.last_name || ''}`.trim() || `Guardian ${participant.id}`}
                                </option>
                              ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className={`
                              px-6 py-2 rounded-lg text-white font-medium
                              transition-all duration-200 ease-in-out flex items-center
                              ${
                                isSubmitting
                                  ? 'bg-gray-400 cursor-not-allowed'
                                  : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-md'
                              }
                            `}
                          >
                            {isSubmitting ? (
                              <>
                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                                <span>Adding...</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-5 w-5 mr-2" />
                                <span>Add Guardian</span>
                              </>
                            )}
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>

                {/* Current Guardians List */}
                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-6 py-4">
                    <h3 className="text-lg font-semibold text-white flex items-center">
                      <Users className="h-5 w-5 mr-2" />
                      Current Guardians for {selectedProgram.name}
                    </h3>
                  </div>
                  
                  <div className="p-6">
                    {participants.length > 0 ? (
                      <div className="space-y-3">
                        {participants.map((participantId) => (
                          <div
                            key={participantId}
                            className="flex items-center justify-between p-4 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                          >
                            <div className="flex items-center">
                              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                                <User className="h-5 w-5 text-blue-600" />
                              </div>
                              <span className="font-medium text-gray-800">
                                {getFullName(participantId)}
                              </span>
                            </div>
                            <button
                              onClick={() => handleRemoveParticipant(participantId)}
                              disabled={isSubmitting}
                              className={`
                                px-4 py-2 rounded-lg text-red-600 hover:bg-red-50 border border-red-200
                                transition-colors duration-200 flex items-center
                                ${isSubmitting ? 'opacity-50 cursor-not-allowed' : 'hover:text-red-700'}
                              `}
                            >
                              <UserMinus className="h-4 w-4 mr-1" />
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-8 text-center">
                        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                          <Users className="h-8 w-8 text-blue-500" />
                        </div>
                        <h4 className="text-lg font-medium text-gray-800 mb-2">No Guardians Added</h4>
                        <p className="text-gray-600 max-w-md mx-auto">
                          There are currently no guardians added to this program.
                          Use the form above to add guardians.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        >
          <Alert
            onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            severity={snackbar.severity}
            sx={{ width: '100%' }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
};

export default ProfessionalPage;