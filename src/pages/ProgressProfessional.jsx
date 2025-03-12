import React, { useEffect, useState, useRef } from 'react';
import API from '../api';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { 
  BookOpen, Download, FileText, Users, Award,
  CheckCircle, Clock, AlertCircle, Calendar,
  ChevronRight, Printer, Search, Info
} from 'lucide-react';
import { jsPDF } from "jspdf";
import html2canvas from 'html2canvas';

const ProfessionalProgress = () => {
  const [programs, setPrograms] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [progressData, setProgressData] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [searchTerm, setSearchTerm] = useState('');
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || user.role !== 'professional') {
        setSnackbar({ open: true, message: 'Unauthorized access', severity: 'error' });
        setError('Unauthorized access. Please log in as a professional.');
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`${API.baseUrl}/programs/role?role=professional&userId=${user.id}`);
        
        if (!response.ok) {
          if (response.status === 500) {
            // Handle the 500 error gracefully
            console.log('No programs found or server error.');
            setPrograms([]);
          } else {
            throw new Error(`Server responded with status: ${response.status}`);
          }
        } else {
          const data = await response.json();
          setPrograms(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching programs:', error);
        setError('Unable to fetch programs. You may not have any programs assigned yet.');
        setPrograms([]);
      }
    } catch (error) {
      console.error('Error in user authentication:', error);
      setError('Authentication error. Please log in again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectProgram = async (program) => {
    setSelectedProgram(program);
    setIsLoading(true);
    
    try {
      const response = await fetch(`${API.baseUrl}/progress?program_id=${program.id}`);
      
      if (!response.ok) {
        if (response.status === 500) {
          console.log('No progress data found or server error.');
          setProgressData([]);
        } else {
          throw new Error(`Server responded with status: ${response.status}`);
        }
      } else {
        const data = await response.json();
        setProgressData(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setSnackbar({ open: true, message: 'Error fetching progress data', severity: 'error' });
      setProgressData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'not_started':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
        return <Clock className="h-4 w-4" />;
      case 'not_started':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const handleGeneratePDF = async () => {
    if (!contentRef.current) return;
    
    setIsGeneratingPDF(true);
    try {
      const content = contentRef.current;
      const canvas = await html2canvas(content, {
        scale: 2,
        logging: false,
        useCORS: true
      });
      
      const imgWidth = 190;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      // Add header
      pdf.setFontSize(20);
      pdf.setTextColor(44, 62, 80);
      pdf.text('Program Progress Report', 105, 15, { align: 'center' });
      
      // Add program info
      pdf.setFontSize(12);
      pdf.text(`Program: ${selectedProgram?.name}`, 15, 25);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 15, 32);
      
      // Add the content
      pdf.addImage(canvas.toDataURL('image/jpeg', 1.0), 'JPEG', 10, 40, imgWidth, imgHeight);
      
      // Save the PDF
      pdf.save(`${selectedProgram?.name}_progress_report.pdf`);
      setSnackbar({ open: true, message: 'PDF generated successfully', severity: 'success' });
    } catch (error) {
      console.error('Error generating PDF:', error);
      setSnackbar({ open: true, message: 'Error generating PDF', severity: 'error' });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const filteredProgressData = progressData.filter(item =>
    item.participant_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.chapter_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading && !selectedProgram) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your programs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                <Award className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent 
                             bg-gradient-to-r from-blue-600 to-indigo-600">
                  Program Progress
                </h2>
                <p className="mt-1 text-gray-500 flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Track and monitor participant progress
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Info className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-medium text-yellow-800">Attention needed</h3>
                <div className="mt-2 text-yellow-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Programs Grid */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Programs</h3>
          {programs.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
              <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <Info className="h-8 w-8 text-yellow-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No Programs Assigned</h3>
              <p className="text-gray-600 max-w-md mx-auto">
                You currently don't have any programs assigned to you. Please contact an administrator to get access to programs.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <div
                  key={program.id}
                  onClick={() => handleSelectProgram(program)}
                  className={`bg-white rounded-xl p-6 border transition-all duration-200 cursor-pointer
                           hover:shadow-lg transform hover:-translate-y-1
                           ${selectedProgram?.id === program.id 
                             ? 'border-blue-500 shadow-lg' 
                             : 'border-gray-200 shadow-sm'}`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BookOpen className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{program.name}</h3>
                      <p className="text-sm text-gray-500">{program.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Progress Section */}
        {selectedProgram && (
          <>
            {isLoading ? (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading progress data...</p>
              </div>
            ) : (
              <div ref={contentRef} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">
                      Progress for {selectedProgram.name}
                    </h3>
                    <p className="text-sm text-gray-500">Detailed progress tracking</p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-auto">
                      <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Search participants or chapters..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                                focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64"
                      />
                    </div>
                    {/* PDF Generation Button */}
                    <button
                      onClick={handleGeneratePDF}
                      disabled={isGeneratingPDF || progressData.length === 0}
                      className="inline-flex items-center px-4 py-2 border border-transparent 
                              rounded-lg shadow-sm text-sm font-medium text-white 
                              bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
                              focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50
                              disabled:cursor-not-allowed space-x-2 w-full sm:w-auto justify-center"
                    >
                      {isGeneratingPDF ? (
                        <>
                          <Printer className="animate-spin h-5 w-5" />
                          <span>Generating...</span>
                        </>
                      ) : (
                        <>
                          <Download className="h-5 w-5" />
                          <span>Export PDF</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Participant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Chapter
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remarks
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Updated
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProgressData.length > 0 ? (
                        filteredProgressData.map((item) => (
                          <tr key={item.progress_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4">
                              <div className="flex items-center space-x-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                                  <span className="text-sm font-medium text-blue-600">
                                    {item.participant_name?.charAt(0) || '?'}
                                  </span>
                                </div>
                                <div className="text-sm font-medium text-gray-900">
                                  {item.participant_name}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-900">
                              {item.chapter_name}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {item.chapter_description}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full 
                                          text-xs font-medium space-x-1 ${getStatusColor(item.status)}`}>
                                {getStatusIcon(item.status)}
                                <span>{item.status || 'Not Started'}</span>
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              {item.remarks || 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                <span>
                                  {item.updated_at ? new Date(item.updated_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                  }) : 'N/A'}
                                </span>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                            <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                              <FileText className="h-8 w-8 text-gray-400" />
                            </div>
                            <p className="text-gray-700 font-medium mb-1">No progress data available</p>
                            <p className="text-gray-500 text-sm max-w-md mx-auto">
                              There is no progress data available for this program yet. Progress will appear here once participants start working on chapters.
                            </p>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}

        <Snackbar 
          open={snackbar.open} 
          autoHideDuration={4000} 
          onClose={() => setSnackbar({ ...snackbar, open: false })}
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
    </div>
  );
};

export default ProfessionalProgress;