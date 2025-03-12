import React, { useEffect, useState } from 'react';
import API from '../api';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { 
  BookOpen, CheckCircle, ArrowRight, ArrowLeft, 
  Award, Clock, AlertCircle, Edit3, User, Flag,
  ChevronRight, Bookmark, Book, BookMarked,
  CheckSquare, Save, Plus, MessageSquare, FileText
} from 'lucide-react';

const ParticipantPage = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [isLoading, setIsLoading] = useState(true);
  const [chapterProgress, setChapterProgress] = useState({});
  const [saveInProgress, setSaveInProgress] = useState(false);
  const [personalNotes, setPersonalNotes] = useState({});
  const [currentNote, setCurrentNote] = useState('');
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [noteSaveInProgress, setNoteSaveInProgress] = useState(false);

  useEffect(() => {
    const fetchPrograms = async () => {
      setIsLoading(true);
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || user.role !== 'participant') {
          setSnackbar({ open: true, message: 'Unauthorized access. Please log in as a participant.', severity: 'error' });
          setIsLoading(false);
          return;
        }

        try {
          const response = await fetch(`${API.baseUrl}/programs/role?role=participant&userId=${user.id}`);
          
          if (response.ok) {
            const data = await response.json();
            setPrograms(Array.isArray(data) ? data : []);
          } else {
            console.error('Error fetching programs:', response.status);
            setSnackbar({ open: true, message: 'Error loading your programs.', severity: 'error' });
            setPrograms([]);
          }
        } catch (error) {
          console.error('Error fetching participant programs:', error);
          setSnackbar({ open: true, message: 'Error connecting to server. Please try again later.', severity: 'error' });
          setPrograms([]);
        }
      } catch (error) {
        console.error('Error in user authentication:', error);
        setSnackbar({ open: true, message: 'Authentication error. Please log in again.', severity: 'error' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrograms();
  }, []);

  const handleSelectProgram = async (program) => {
    setSelectedProgram(program);
    setIsLoading(true);

    try {
      const user = JSON.parse(localStorage.getItem('user'));
      
      // Fetch all chapters for this program
      const chaptersResponse = await fetch(`${API.baseUrl}/chapters?programId=${program.id}`);
      if (!chaptersResponse.ok) {
        throw new Error(`Error fetching chapters: ${chaptersResponse.status}`);
      }
      
      const chaptersData = await chaptersResponse.json();
      setChapters(chaptersData);
      
      // Initialize progress tracking
      const progressMap = {};
      const notesMap = {};
      
      // Fetch the progress for all chapters
      try {
        const progressResponse = await fetch(
          `${API.baseUrl}/chapters/progress?program_id=${program.id}&user_id=${user.id}`
        );
        
        if (progressResponse.ok) {
          const progressData = await progressResponse.json();
          
          // Create a map of chapter ID to progress status
          progressData.forEach(progress => {
            progressMap[progress.chapter_id] = {
              status: progress.status || 'not_started',
              remarks: progress.remarks || ''
            };
            
            // Extract personal notes if stored in the API
            if (progress.personal_notes) {
              try {
                notesMap[progress.chapter_id] = progress.personal_notes;
              } catch (e) {
                notesMap[progress.chapter_id] = '';
              }
            }
          });
          
          setChapterProgress(progressMap);
          setPersonalNotes(notesMap);
          
          // Find the first incomplete chapter
          let startIndex = 0;
          for (let i = 0; i < chaptersData.length; i++) {
            const progress = progressMap[chaptersData[i].id];
            if (!progress || progress.status !== 'completed') {
              startIndex = i;
              break;
            }
            
            // If all chapters are completed, set to the last one
            if (i === chaptersData.length - 1) {
              startIndex = i;
            }
          }
          
          setCurrentChapterIndex(startIndex);
          
          // Set remarks for the current chapter
          const currentChapter = chaptersData[startIndex];
          if (currentChapter) {
            const currentProgress = progressMap[currentChapter.id];
            setRemarks(currentProgress ? currentProgress.remarks : '');
            setCurrentNote(notesMap[currentChapter.id] || '');
          }
        } else {
          // If no progress data, start from the first chapter
          setCurrentChapterIndex(0);
          setRemarks('');
          setCurrentNote('');
        }
      } catch (error) {
        console.error('Error fetching progress data:', error);
        // Default to first chapter if there's an error
        setCurrentChapterIndex(0);
        setRemarks('');
        setCurrentNote('');
      }
    } catch (error) {
      console.error('Error loading program details:', error);
      setSnackbar({ open: true, message: 'Error loading program details. Please try again.', severity: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateProgress = async (chapterId, status, remarks) => {
    setSaveInProgress(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!selectedProgram || !user) {
        setSnackbar({ open: true, message: 'Invalid operation. Please reload the page.', severity: 'error' });
        return;
      }

      // Check if previous chapters are completed
      if (status === 'completed') {
        const currentChapterIndex = chapters.findIndex(chapter => chapter.id === chapterId);
        
        // Check if any previous chapters are not completed
        for (let i = 0; i < currentChapterIndex; i++) {
          const prevChapterId = chapters[i].id;
          const prevProgress = chapterProgress[prevChapterId];
          
          if (!prevProgress || prevProgress.status !== 'completed') {
            setSnackbar({ 
              open: true, 
              message: 'Please complete previous chapters first.', 
              severity: 'warning' 
            });
            setSaveInProgress(false);
            return;
          }
        }
      }

      // Include personal notes in the API call
      const currentNoteContent = personalNotes[chapterId] || '';

      const response = await fetch(`${API.baseUrl}/chapters/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          program_id: selectedProgram.id,
          user_id: user.id,
          chapter_id: chapterId,
          status,
          remarks,
          personal_notes: currentNoteContent // Send personal notes to the API
        }),
      });

      if (response.ok) {
        // Update local progress state
        setChapterProgress(prev => ({
          ...prev,
          [chapterId]: { status, remarks }
        }));
        
        // Update chapter status message
        const statusMessages = {
          'completed': 'Chapter completed successfully!',
          'in_progress': 'Progress saved',
          'not_started': 'Chapter marked as not started'
        };
        
        setSnackbar({ 
          open: true, 
          message: statusMessages[status] || `Chapter marked as ${status}`, 
          severity: 'success' 
        });
      } else {
        const error = await response.json();
        setSnackbar({ open: true, message: error.error || 'Error updating progress', severity: 'error' });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      setSnackbar({ open: true, message: 'Error updating progress', severity: 'error' });
    } finally {
      setSaveInProgress(false);
    }
  };

  const handleSaveNote = async () => {
    if (!currentChapter) return;
    
    setNoteSaveInProgress(true);
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!selectedProgram || !user) {
        setSnackbar({ open: true, message: 'Invalid operation. Please reload the page.', severity: 'error' });
        return;
      }

      // Update local notes state
      const updatedNotes = {
        ...personalNotes,
        [currentChapter.id]: currentNote
      };
      setPersonalNotes(updatedNotes);
      
      // Get current status and remarks
      const currentStatus = chapterProgress[currentChapter.id]?.status || 'in_progress';
      const currentRemarks = chapterProgress[currentChapter.id]?.remarks || remarks;

      // Save to API
      const response = await fetch(`${API.baseUrl}/chapters/progress`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          program_id: selectedProgram.id,
          user_id: user.id,
          chapter_id: currentChapter.id,
          status: currentStatus,
          remarks: currentRemarks,
          personal_notes: currentNote
        }),
      });

      if (response.ok) {
        setSnackbar({ 
          open: true, 
          message: 'Your personal notes have been saved', 
          severity: 'success' 
        });
        setIsEditingNote(false);
      } else {
        const error = await response.json();
        setSnackbar({ open: true, message: error.error || 'Error saving notes', severity: 'error' });
      }
    } catch (error) {
      console.error('Error saving notes:', error);
      setSnackbar({ open: true, message: 'Error saving notes', severity: 'error' });
    } finally {
      setNoteSaveInProgress(false);
    }
  };

  const handleNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
      const currentChapter = chapters[currentChapterIndex];
      
      // Save current chapter progress before moving
      handleUpdateProgress(currentChapter.id, 'in_progress', remarks);
      
      // Move to next chapter
      const nextIndex = currentChapterIndex + 1;
      setCurrentChapterIndex(nextIndex);
      
      // Set remarks for the next chapter
      const nextChapter = chapters[nextIndex];
      const nextProgress = chapterProgress[nextChapter.id];
      setRemarks(nextProgress ? nextProgress.remarks : '');
      setCurrentNote(personalNotes[nextChapter.id] || '');
      setIsEditingNote(false);
    }
  };

  const handlePreviousChapter = () => {
    if (currentChapterIndex > 0) {
      const currentChapter = chapters[currentChapterIndex];
      
      // Save current chapter progress before moving
      handleUpdateProgress(currentChapter.id, 'in_progress', remarks);
      
      // Move to previous chapter
      const prevIndex = currentChapterIndex - 1;
      setCurrentChapterIndex(prevIndex);
      
      // Set remarks for the previous chapter
      const prevChapter = chapters[prevIndex];
      const prevProgress = chapterProgress[prevChapter.id];
      setRemarks(prevProgress ? prevProgress.remarks : '');
      setCurrentNote(personalNotes[prevChapter.id] || '');
      setIsEditingNote(false);
    }
  };

  const handleFinish = () => {
    const currentChapter = chapters[currentChapterIndex];
    handleUpdateProgress(currentChapter.id, 'completed', remarks);
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Completed
          </span>
        );
      case 'in_progress':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Clock className="h-3 w-3 mr-1" />
            In Progress
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Not Started
          </span>
        );
    }
  };

  const getChapterStatus = (chapterId) => {
    const progress = chapterProgress[chapterId];
    return progress ? progress.status : 'not_started';
  };

  const currentChapter = chapters[currentChapterIndex];

  if (isLoading && !selectedProgram) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex justify-center items-center">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-10">
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-8 md:px-10">
              <div className="flex items-center">
                <div className="p-3 bg-white bg-opacity-20 rounded-full mr-4">
                  <Book className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white">
                    My Learning Programs
                  </h2>
                  <p className="text-blue-100 mt-1">
                    Continue your journey through interactive chapters
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Programs Grid */}
        <div className="mb-12">
          <div className="flex items-center space-x-3 mb-6">
            <BookOpen className="h-6 w-6 text-blue-600" />
            <h3 className="text-xl font-semibold text-gray-800">
              Available Programs
            </h3>
          </div>

          {programs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="h-8 w-8 text-yellow-600" />
              </div>
              <h4 className="text-xl font-medium text-gray-900 mb-2">No Programs Available</h4>
              <p className="text-gray-600 max-w-md mx-auto">
                You are not currently enrolled in any programs. Please contact your administrator to get access.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <div
                  key={program.id}
                  onClick={() => handleSelectProgram(program)}
                  className={`relative overflow-hidden rounded-xl cursor-pointer
                    transition-all duration-300 ease-in-out
                    ${selectedProgram?.id === program.id
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-500 shadow-lg transform scale-102'
                      : 'bg-white border border-gray-200 hover:border-blue-300 hover:shadow-lg hover:-translate-y-1'
                    }
                  `}
                >
                  <div className="absolute top-0 right-0">
                    {program.status === 'active' ? (
                      <div className="m-3 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-md">
                        Active
                      </div>
                    ) : (
                      <div className="m-3 px-2 py-1 bg-gray-100 text-gray-800 text-xs font-semibold rounded-md">
                        {program.status}
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-start mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg mr-4">
                        <BookOpen className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="text-lg font-semibold text-gray-900">
                        {program.name}
                      </h4>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      {program.description}
                    </p>
                    
                    <div className="flex justify-between items-center mt-4">
                      <div className="flex items-center text-sm text-gray-500">
                        <User className="h-4 w-4 mr-2 text-gray-400" />
                        <span>{program.assigned_to_name || 'Unassigned'}</span>
                      </div>
                      
                      <div className="text-blue-600 flex items-center font-medium text-sm">
                        <span>View Program</span>
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected Program Content */}
        {selectedProgram && (
          <div className="space-y-8">
            {isLoading ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading program content...</p>
              </div>
            ) : (
              <>
                {/* Program Info */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <Award className="h-6 w-6 text-blue-600 mr-3" />
                      <h3 className="text-xl font-semibold text-gray-800">
                        {selectedProgram.name}
                      </h3>
                    </div>
                    <div className="text-sm text-gray-500">
                      {chapters.length} {chapters.length === 1 ? 'Chapter' : 'Chapters'}
                    </div>
                  </div>
                  
                  {/* Chapter Progress */}
                  <div className="mb-8">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-gray-700">Chapter Progress</h4>
                      <span className="text-sm text-gray-600">
                        {Object.values(chapterProgress).filter(p => p.status === 'completed').length} / {chapters.length} complete
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ 
                          width: `${Object.values(chapterProgress).filter(p => p.status === 'completed').length / chapters.length * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                  
                  {/* Chapter List */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Chapters</h4>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                      {chapters.map((chapter, index) => {
                        const status = getChapterStatus(chapter.id);
                        return (
                          <div
                            key={chapter.id}
                            onClick={() => setCurrentChapterIndex(index)}
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors
                              ${currentChapterIndex === index 
                                ? 'bg-blue-50 border border-blue-200' 
                                : 'hover:bg-gray-50 border border-transparent'
                              }
                            `}
                          >
                            <div className="flex-shrink-0 mr-3">
                              {status === 'completed' ? (
                                <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                  <CheckCircle className="h-4 w-4 text-green-600" />
                                </div>
                              ) : status === 'in_progress' ? (
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <Clock className="h-4 w-4 text-blue-600" />
                                </div>
                              ) : (
                                <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-gray-600">{index + 1}</span>
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {chapter.chapter_name}
                              </p>
                              <p className="text-xs text-gray-500 truncate">
                                {chapter.description?.substring(0, 60)}
                                {chapter.description?.length > 60 ? '...' : ''}
                              </p>
                            </div>
                            <div className="flex-shrink-0 ml-2">
                              {getStatusBadge(status)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Current Chapter Content */}
                {currentChapter && (
                  <div className="bg-white rounded-xl shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold text-white flex items-center">
                          <BookMarked className="h-5 w-5 mr-2" />
                          Chapter {currentChapterIndex + 1}: {currentChapter.chapter_name}
                        </h3>
                        {getStatusBadge(getChapterStatus(currentChapter.id))}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="prose max-w-none mb-6">
                        <p className="text-gray-700">{currentChapter.description}</p>
                      </div>
                      
                      {/* Remarks Section */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          <div className="flex items-center">
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Progress Remarks
                          </div>
                        </label>
                        <textarea
                          value={remarks}
                          onChange={(e) => setRemarks(e.target.value)}
                          placeholder="Add remarks for this question on this chapter..."
                          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          rows="3"
                        ></textarea>
                      </div>

                      {/* Personal Notes Section */}
                      <div className="mb-8 bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-3">
                          <label className="block text-sm font-medium text-gray-700">
                            <div className="flex items-center">
                              <FileText className="h-4 w-4 mr-2" />
                              My Personal Notes
                            </div>
                          </label>
                          {!isEditingNote ? (
                            <button
                              onClick={() => setIsEditingNote(true)}
                              className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                            >
                              <Edit3 className="h-3 w-3 mr-1" />
                              {personalNotes[currentChapter.id] ? 'Edit Notes' : 'Add Notes'}
                            </button>
                          ) : (
                            <button
                              onClick={handleSaveNote}
                              disabled={noteSaveInProgress}
                              className="text-sm text-green-600 hover:text-green-800 flex items-center"
                            >
                              {noteSaveInProgress ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-green-600 mr-1"></div>
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="h-3 w-3 mr-1" />
                                  Save Notes
                                </>
                              )}
                            </button>
                          )}
                        </div>
                        
                        {isEditingNote ? (
                          <textarea
                            value={currentNote}
                            onChange={(e) => setCurrentNote(e.target.value)}
                            placeholder="Add your personal notes, tips, or additional information here..."
                            className="w-full p-3 border border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white"
                            rows="5"
                          ></textarea>
                        ) : personalNotes[currentChapter.id] ? (
                          <div className="bg-white p-4 rounded-lg border border-gray-200 prose prose-sm max-w-none">
                            {personalNotes[currentChapter.id].split('\n').map((line, i) => (
                              <p key={i} className={i === 0 ? 'mt-0' : ''}>{line}</p>
                            ))}
                          </div>
                        ) : (
                          <div 
                            onClick={() => setIsEditingNote(true)}
                            className="bg-white p-4 rounded-lg border border-dashed border-gray-300 text-center cursor-pointer hover:border-blue-300 transition-colors"
                          >
                            <Plus className="h-5 w-5 mx-auto text-gray-400 mb-2" />
                            <p className="text-gray-500 text-sm">Click to add your personal notes for this chapter</p>
                          </div>
                        )}
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row sm:justify-between space-y-4 sm:space-y-0">
                        <div className="flex space-x-3">
                          {currentChapterIndex > 0 && (
                            <button
                              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                              onClick={handlePreviousChapter}
                              disabled={saveInProgress}
                            >
                              <ArrowLeft className="h-4 w-4 mr-2" />
                              Previous Chapter
                            </button>
                          )}
                          
                          {currentChapterIndex < chapters.length - 1 && (
                            <button
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                              onClick={handleNextChapter}
                              disabled={saveInProgress}
                            >
                              Next Chapter
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </button>
                          )}
                        </div>
                        
                        <button
                          className={`px-5 py-2 rounded-lg flex items-center justify-center transition-colors
                            ${getChapterStatus(currentChapter.id) === 'completed'
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-green-600 text-white hover:bg-green-700'
                            }
                          `}
                          onClick={handleFinish}
                          disabled={saveInProgress}
                        >
                          {saveInProgress ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                              Saving...
                            </>
                          ) : getChapterStatus(currentChapter.id) === 'completed' ? (
                            <>
                              <CheckSquare className="h-4 w-4 mr-2" />
                              Already Completed
                            </>
                          ) : (
                            <>
                              <Flag className="h-4 w-4 mr-2" />
                              Mark as Completed
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ParticipantPage;