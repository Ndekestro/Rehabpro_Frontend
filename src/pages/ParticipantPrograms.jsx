import React, { useEffect, useState } from 'react';
import API from '../api';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const ParticipantPage = () => {
  const [programs, setPrograms] = useState([]); // Programs the participant is part of
  const [selectedProgram, setSelectedProgram] = useState(null); // Selected program
  const [chapters, setChapters] = useState([]); // Chapters with progress
  const [currentChapterIndex, setCurrentChapterIndex] = useState(0); // Index of the current chapter
  const [remarks, setRemarks] = useState(''); // Remarks for the current chapter
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    const fetchPrograms = async () => {
        try {
            const user = JSON.parse(localStorage.getItem('user'));
            if (!user || user.role !== 'participant') {
                alert('Unauthorized');
                return;
            }
    
            const response = await fetch(`${API.baseUrl}/programs/role?role=participant&userId=${user.id}`);
            const data = await response.json();
            setPrograms(data);
        } catch (error) {
            console.error('Error fetching participant programs:', error);
        }
    };
    

    fetchPrograms();
  }, []);

  const handleSelectProgram = async (program) => {
    setSelectedProgram(program);

    try {
        const user = JSON.parse(localStorage.getItem('user'));
        
        // Fetch the last progress for this program
        const lastProgressResponse = await fetch(
          `${API.baseUrl}/chapters/last-progress?program_id=${program.id}&user_id=${user.id}`
        );
        const lastProgress = await lastProgressResponse.json();

        // Fetch all chapters for this program
        const chaptersResponse = await fetch(`${API.baseUrl}/chapters?programId=${program.id}`);
        const data = await chaptersResponse.json();
        setChapters(data);

        if (lastProgress) {
            // Start from the chapter where the user left off
            const lastIndex = data.findIndex((chapter) => chapter.id === lastProgress.chapter_id);
            setCurrentChapterIndex(lastIndex >= 0 ? lastIndex : 0);
            setRemarks(lastProgress.remarks || '');
        } else {
            // Default to the first chapter
            setCurrentChapterIndex(0);
            setRemarks(data[0]?.remarks || '');
        }
    } catch (error) {
        console.error('Error fetching chapters with progress:', error);
    }
};

const handleUpdateProgress = async (chapterId, status, remarks) => {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!selectedProgram || !user) {
            setSnackbar({ open: true, message: 'Invalid operation. Please reload the page.', severity: 'error' });
            return;
        }

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
            }),
        });

        if (response.ok) {
            const updatedChapters = chapters.map((chapter) =>
                chapter.id === chapterId ? { ...chapter, status, remarks } : chapter
            );
            setChapters(updatedChapters);
            setSnackbar({ open: true, message: `Chapter marked as ${status}`, severity: 'success' });
        } else {
            const error = await response.json();
            setSnackbar({ open: true, message: error.error || 'Error updating progress', severity: 'error' });
        }
    } catch (error) {
        console.error('Error updating progress:', error);
        setSnackbar({ open: true, message: 'Error updating progress', severity: 'error' });
    }
};

const handleNextChapter = () => {
    if (currentChapterIndex < chapters.length - 1) {
        const currentChapter = chapters[currentChapterIndex];
        handleUpdateProgress(currentChapter.id, 'in_progress', remarks);
        const nextIndex = currentChapterIndex + 1;
        setCurrentChapterIndex(nextIndex);
        setRemarks(chapters[nextIndex].remarks || '');
    }
};

const handlePreviousChapter = () => {
    if (currentChapterIndex > 0) {
        const currentChapter = chapters[currentChapterIndex];
        handleUpdateProgress(currentChapter.id, 'in_progress', remarks);
        const prevIndex = currentChapterIndex - 1;
        setCurrentChapterIndex(prevIndex);
        setRemarks(chapters[prevIndex].remarks || '');
    }
};

const handleFinish = () => {
    const currentChapter = chapters[currentChapterIndex];
    handleUpdateProgress(currentChapter.id, 'completed', remarks);
    setSnackbar({ open: true, message: 'You have completed all chapters in this program.', severity: 'success' });
};

  const handleCloseSnackbar = () => {
    setSnackbar({ open: false, message: '', severity: 'success' });
  };

  const currentChapter = chapters[currentChapterIndex];

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">My Programs</h2>

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
            <p className="text-sm text-gray-500">Status: {program.status}</p>
          </div>
        ))}
      </div>

      {/* Chapters in Selected Program */}
      {selectedProgram && currentChapter && (
        <div className="mt-8">
          <h3 className="text-xl font-bold">Chapter {currentChapterIndex + 1} of {chapters.length}</h3>
          <div className="p-4 border rounded shadow-md">
            <h4 className="text-lg font-bold">{currentChapter.chapter_name}</h4>
            <p className="text-gray-600 mb-4">{currentChapter.description}</p>
            <p className="text-sm text-gray-500 mb-2">Status: {currentChapter.status || 'not_started'}</p>

            {/* Remarks */}
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add remarks for this chapter"
              className="w-full p-2 border rounded mb-4"
              rows="3"
            ></textarea>

            {/* Navigation Buttons */}
            <div className="mt-4 flex justify-between">
              {currentChapterIndex > 0 && (
                <button
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  onClick={handlePreviousChapter}
                >
                  Previous Chapter
                </button>
              )}
              {currentChapterIndex < chapters.length - 1 ? (
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  onClick={handleNextChapter}
                >
                  Next Chapter
                </button>
              ) : (
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  onClick={handleFinish}
                >
                  Finish Program
                </button>
              )}
            </div>
          </div>
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

export default ParticipantPage;
