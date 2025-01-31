import React, { useEffect, useState, useRef } from 'react';
import API from '../api';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { 
  BookOpen, Download, FileText, Users, Award,
  CheckCircle, Clock, AlertCircle, Calendar,
  ChevronRight, Printer, Search
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
  const contentRef = useRef(null);

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || user.role !== 'professional') {
        setSnackbar({ open: true, message: 'Unauthorized access', severity: 'error' });
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
    item.participant_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.chapter_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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

        {/* Progress Section */}
        {selectedProgram && (
          <div ref={contentRef} className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Progress for {selectedProgram.name}
                </h3>
                <p className="text-sm text-gray-500">Detailed progress tracking</p>
              </div>
              <div className="flex items-center space-x-4">
                {/* Search Input */}
                <div className="relative">
                  <Search className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search participants or chapters..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 
                             focus:ring-blue-500 focus:border-blue-500 w-64"
                  />
                </div>
                {/* PDF Generation Button */}
                <button
                  onClick={handleGeneratePDF}
                  disabled={isGeneratingPDF}
                  className="inline-flex items-center px-4 py-2 border border-transparent 
                           rounded-lg shadow-sm text-sm font-medium text-white 
                           bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 
                           focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50
                           disabled:cursor-not-allowed space-x-2"
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
                                {item.participant_name.charAt(0)}
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
                              {new Date(item.updated_at).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })}
                            </span>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                        <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        No progress data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
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