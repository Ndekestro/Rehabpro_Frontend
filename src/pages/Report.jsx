import React, { useState, useEffect, useRef } from "react";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center h-64">
    <div className="relative w-16 h-16">
      <div className="absolute top-0 left-0 right-0 bottom-0 border-4 border-blue-200 rounded-full"></div>
      <div className="absolute top-0 left-0 right-0 bottom-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
    </div>
  </div>
);

// Enhanced Card Components
const Card = ({ children, className = "" }) => (
  <div 
    className={`
      rounded-2xl border border-gray-100 bg-white p-6 
      shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] 
      hover:shadow-[0_8px_30px_rgba(6,81,237,0.12)] 
      transition-all duration-300 ease-in-out 
      ${className}
    `}
  >
    {children}
  </div>
);

// Stats Card Component
const StatsCard = ({ title, value, change, icon }) => (
  <Card className="relative overflow-hidden">
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <span className={`text-xs font-bold px-2.5 py-1 rounded ${
          change >= 0 
            ? 'text-green-800 bg-green-100' 
            : 'text-red-800 bg-red-100'
        }`}>
          {change >= 0 ? '+' : ''}{change}%
        </span>
      </div>
      <div className="flex items-baseline mb-1">
        <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
      </div>
      {icon && (
        <div className="absolute bottom-2 right-2 text-4xl opacity-20">
          {icon}
        </div>
      )}
    </div>
    <div className="absolute inset-0 bg-gradient-to-r from-white via-white to-transparent"></div>
  </Card>
);

// Table Card Component with gradient header
const TableCard = ({ title, subtitle, children }) => (
  <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
    </div>
    {children}
  </div>
);

// Badge Component with enhanced styling
const Badge = ({ status }) => {
  const styles = {
    Active: 'bg-green-100 text-green-800 border-green-200',
    Discharged: 'bg-red-100 text-red-800 border-red-200',
    Pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
    Resolved: 'bg-purple-100 text-purple-800 border-purple-200',
    default: 'bg-gray-100 text-gray-800 border-gray-200'
  };

  return (
    <span className={`
      px-3 py-1 rounded-full text-xs font-semibold 
      border shadow-sm inline-flex items-center gap-1 
      ${styles[status] || styles.default}
    `}>
      <span className={`
        w-1.5 h-1.5 rounded-full ${
          status === 'Active' ? 'bg-green-600' :
          status === 'Pending' ? 'bg-yellow-600' :
          status === 'In Progress' ? 'bg-blue-600' :
          status === 'Resolved' ? 'bg-purple-600' :
          'bg-gray-600'
        }
      `}></span>
      {status}
    </span>
  );
};

// Progress Bar Component
const ProgressBar = ({ value, total, color = "blue" }) => {
  const percentage = (value / total) * 100;
  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div
        className={`bg-${color}-600 h-2 rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};

// PDF Generation with enhanced styling
const generatePDF = async (element, title) => {
  const scale = 2;
  const canvas = await html2canvas(element, {
    scale: scale,
    logging: false,
    useCORS: true,
    backgroundColor: '#ffffff'
  });

  const imgWidth = 297;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const pdf = new jsPDF('l', 'mm', 'a4');

  // Add header design
  pdf.setFillColor(249, 250, 251);
  pdf.rect(0, 0, pdf.internal.pageSize.width, 30, 'F');
  pdf.setTextColor(17, 24, 39);
  pdf.setFontSize(20);
  pdf.text(title, 20, 20);

  // Add timestamp and border
  pdf.setFontSize(10);
  pdf.setTextColor(107, 114, 128);
  pdf.text(`Generated on ${new Date().toLocaleString()}`, 20, 27);

  // Add main content
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 35, imgWidth, imgHeight);
  
  pdf.save(`${title.toLowerCase().replace(/\s+/g, '-')}-${new Date().toLocaleDateString()}.pdf`);
};
const GuardianRow = ({ guardian }) => {
    const [isExpanded, setIsExpanded] = useState(false);
  
    return (
      <>
        <tr className="hover:bg-gray-50">
          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {guardian.name}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {guardian.email}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
            {guardian.total_help_requests}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
            {guardian.participants?.length || 0}
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-center">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className={`px-3 py-1 rounded-full text-sm transition-colors ${
                isExpanded ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
              }`}
            >
              {isExpanded ? 'Hide Participants' : 'Show Participants'}
            </button>
          </td>
        </tr>
        {isExpanded && guardian.participants && (
          <tr>
            <td colSpan="5" className="px-6 py-4 bg-gray-50">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Age</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Condition</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {guardian.participants.map((participant) => (
                    <tr key={participant.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {participant.first_name} {participant.last_name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {participant.age}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {participant.gender}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {participant.condition}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge status={participant.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </td>
          </tr>
        )}
      </>
    );
  };

const ReportsPage = () => {
  const reportRef = useRef();
  const baseUrl = "http://localhost:5000/api/reports";
  const [selectedCategory, setSelectedCategory] = useState("systemSummary");
  const [data, setData] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const downloadPDF = async () => {
    try {
      setPdfLoading(true);
      
      // Initialize PDF in landscape for better table display
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });
  
      // Get page dimensions
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
  
      // Style configurations
      const styles = {
        header: { fillColor: [235, 241, 255], textColor: [30, 64, 175], fontSize: 12 },
        subheader: { fillColor: [243, 244, 246], textColor: [55, 65, 81], fontSize: 10 },
        cell: { textColor: [55, 65, 81], fontSize: 9 },
        accent: { fillColor: [249, 250, 251] }
      };
  
      // Helper function for multiline cell text
      const splitTextToSize = (text, maxWidth) => {
        return pdf.splitTextToSize(String(text), maxWidth);
      };
  
      // Helper function to add header to each page
      const addPageHeader = (pageTitle) => {
        // Header background
        pdf.setFillColor(...styles.header.fillColor);
        pdf.rect(0, 0, pageWidth, 20, 'F');
  
        // Title
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...styles.header.textColor);
        pdf.setFontSize(14);
        const title = pageTitle || `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Report`;
        pdf.text(title, 10, 13);
  
        // Timestamp
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 10, 13, { align: 'right' });
      };
  
      // Helper function to create table
      const createTable = (headers, data, startY, options = {}) => {
        const margin = 10;
        const availableWidth = pageWidth - (2 * margin);
        const columnWidths = options.columnWidths || headers.map(() => availableWidth / headers.length);
        const rowHeight = options.rowHeight || 10;
        let currentY = startY;
  
        // Table header
        pdf.setFillColor(...styles.header.fillColor);
        pdf.rect(margin, currentY, availableWidth, rowHeight, 'F');
        pdf.setFont("helvetica", "bold");
        pdf.setTextColor(...styles.header.textColor);
        pdf.setFontSize(styles.header.fontSize);
  
        let xOffset = margin;
        headers.forEach((header, index) => {
          pdf.text(header, xOffset + 2, currentY + 7);
          xOffset += columnWidths[index];
        });
        currentY += rowHeight;
  
        // Table data
        pdf.setFont("helvetica", "normal");
        pdf.setTextColor(...styles.cell.textColor);
        pdf.setFontSize(styles.cell.fontSize);
  
        data.forEach((row, rowIndex) => {
          const rowContent = row.map((cell, cellIndex) => ({
            text: String(cell),
            lines: splitTextToSize(cell, columnWidths[cellIndex] - 4)
          }));
  
          // Calculate row height based on maximum number of lines
          const maxLines = Math.max(...rowContent.map(cell => cell.lines.length));
          const calculatedRowHeight = Math.max(rowHeight, maxLines * 5);
  
          // Check if we need a new page
          if (currentY + calculatedRowHeight > pageHeight - 20) {
            pdf.addPage();
            addPageHeader();
            currentY = 30;
          }
  
          // Row background for alternate rows
          if (rowIndex % 2 === 0) {
            pdf.setFillColor(...styles.accent.fillColor);
            pdf.rect(margin, currentY, availableWidth, calculatedRowHeight, 'F');
          }
  
          // Add cell content
          xOffset = margin;
          rowContent.forEach((cell, cellIndex) => {
            cell.lines.forEach((line, lineIndex) => {
              pdf.text(line, xOffset + 2, currentY + 5 + (lineIndex * 5));
            });
            xOffset += columnWidths[cellIndex];
          });
  
          currentY += calculatedRowHeight;
        });
  
        return currentY;
      };
  
      // Function to handle system summary
      const addSystemSummary = () => {
        const summary = data[0];
        const sections = [
          {
            title: "Users Overview",
            data: [
              ["Total Guardians", summary.total_guardians],
              ["Total Professionals", summary.total_professionals],
              ["Total Participants", summary.total_participants]
            ]
          },
          {
            title: "Programs & Chapters",
            data: [
              ["Active Programs", summary.active_programs],
              ["Total Chapters", summary.total_chapters]
            ]
          },
          {
            title: "Help Requests",
            data: [
              ["Total Requests", summary.total_requests],
              ["Pending", summary.pending_requests],
              ["In Progress", summary.in_progress_requests],
              ["Resolved", summary.resolved_requests]
            ]
          }
        ];
  
        let startY = 30;
        sections.forEach(section => {
          pdf.setFontSize(12);
          pdf.setFont("helvetica", "bold");
          pdf.text(section.title, 10, startY);
          startY = createTable(
            ["Metric", "Value"],
            section.data,
            startY + 5,
            { columnWidths: [150, 100] }
          ) + 10;
        });
      };
  
      // Function to handle professionals data
      const addProfessionalsData = () => {
        const professionals = data[0].professionals;
        const headers = ["Name", "Email", "Profession", "Total Part.", "Active", "Programs", "Chapters"];
        const profData = professionals.map(prof => [
          prof.first_name,
          prof.email,
          prof.profession,
          prof.total_participants,
          prof.active_participants,
          prof.total_programs,
          prof.total_chapters_supervised
        ]);
        
        createTable(headers, profData, 30, {
          columnWidths: [40, 60, 40, 30, 30, 30, 30]
        });
      };
  
      // Function to handle guardians data
      const addGuardiansData = () => {
        const guardians = data[0].guardians;
        let startY = 30;
  
        guardians.forEach((guardian, index) => {
          // Guardian header
          if (startY > pageHeight - 40) {
            pdf.addPage();
            addPageHeader();
            startY = 30;
          }
  
          // Guardian main info
          createTable(
            ["Name", "Email", "Help Requests", "Total Participants"],
            [[guardian.first_name, guardian.email, guardian.total_help_requests, guardian.total_guardian_participants]],
            startY,
            { columnWidths: [70, 100, 40, 50] }
          );
  
          startY += 20;
  
          // Participants table if any
          if (guardian.participants && guardian.participants.length > 0) {
            const partHeaders = ["Name", "Age", "Gender", "Condition", "Status"];
            const partData = guardian.participants.map(p => [
              p.first_name,
              p.age,
              p.gender,
              p.condition,
              p.status
            ]);
  
            startY = createTable(
              partHeaders,
              partData,
              startY,
              { columnWidths: [50, 30, 40, 70, 40] }
            ) + 20;
          }
        });
      };
  
      // Function to handle help requests data
      const addHelpRequestsData = () => {
        const requests = data[0].help_requests;
        const headers = ["Date", "Total Requests"];
        const requestData = requests.map(req => [
          new Date(req.request_date).toLocaleDateString(),
          req.total_requests
        ]);
        
        createTable(headers, requestData, 30, {
          columnWidths: [100, 160]
        });
      };
  
      // Function to handle admissions data
      const addAdmissionsData = () => {
        const admissions = data[0].admissions;
        const headers = ["Date", "Total Participants"];
        const admissionData = admissions.map(adm => [
          new Date(adm.admission_date).toLocaleDateString(),
          adm.total_participants
        ]);
        
        createTable(headers, admissionData, 30, {
          columnWidths: [100, 160]
        });
      };
  
      // Function to handle chapter progress data
      const addChapterProgressData = () => {
        const progress = data[0].chapter_progress;
        const headers = ["Chapter", "Participant", "Status", "Last Updated", "Remarks"];
        const progressData = progress.map(item => [
          item.chapter_name,
          item.participant_name,
          item.status,
          new Date(item.updated_at).toLocaleDateString(),
          item.remarks || '-'
        ]);
        
        createTable(headers, progressData, 30, {
          columnWidths: [60, 50, 40, 40, 70]
        });
      };
  
      // Add first page header
      addPageHeader();
  
      // Generate content based on category
      switch (selectedCategory) {
        case "systemSummary":
          addSystemSummary();
          break;
        case "professionals":
          addProfessionalsData();
          break;
        case "guardians":
          addGuardiansData();
          break;
        case "helpRequests":
          addHelpRequestsData();
          break;
        case "admissions":
          addAdmissionsData();
          break;
        case "chapterProgress":
          addChapterProgressData();
          break;
      }
  
      // Add page numbers
      const pageCount = pdf.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        pdf.setPage(i);
        pdf.setFont("helvetica", "normal");
        pdf.setFontSize(8);
        pdf.text(`Page ${i} of ${pageCount}`, pageWidth / 2, pageHeight - 10, { align: 'center' });
      }
  
      // Save PDF
      const formattedDate = new Date().toISOString().split('T')[0];
      const filename = `${selectedCategory}-report-${formattedDate}.pdf`;
      pdf.save(filename);
  
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setPdfLoading(false);
    }
  };
  
  // Add a complementary loading state handler
  const [pdfLoading, setPdfLoading] = useState(false);
  

  const fetchData = async () => {
    setLoading(true);
    setError("");
    try {
      let url = `${baseUrl}`;

      if (selectedCategory === "systemSummary") {
        url += "/system-summary";
      } else if (selectedCategory === "professionals") {
        url += "/professional";
      } else if (selectedCategory === "guardians") {
        url += "/guardian";
      } else if (selectedCategory === "helpRequests") {
        url += `/date/help-requests?startDate=${startDate}&endDate=${endDate}`;
      } else if (selectedCategory === "admissions") {
        url += `/date/admissions?startDate=${startDate}&endDate=${endDate}`;
      } else if (selectedCategory === "chapterProgress") {
        url += `/date/chapter-progress?startDate=${startDate}&endDate=${endDate}`;
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const result = await response.json();
      setData(Array.isArray(result) ? result : [result]);
    } catch (error) {
      setError("Failed to fetch data");
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const renderSystemSummaryTable = (data) => {
    if (!data[0]) return null;
    const summary = data[0];

    const sections = [
      {
        title: "Users Overview",
        data: [
          { label: "Total Guardians", value: summary.total_guardians },
          { label: "Total Professionals", value: summary.total_professionals },
          { label: "Total Participants", value: summary.total_participants }
        ]
      },
      {
        title: "Programs Overview",
        data: [
          { label: "Active Programs", value: summary.active_programs },
          { label: "Total Chapters", value: summary.total_chapters }
        ]
      },
      {
        title: "Help Requests Overview",
        data: [
          { label: "Total Requests", value: summary.total_requests },
          { label: "Pending Requests", value: summary.pending_requests },
          { label: "In Progress", value: summary.in_progress_requests },
          { label: "Resolved", value: summary.resolved_requests }
        ]
      }
    ];

    return (
      <div className="space-y-6">
        {sections.map((section, idx) => (
          <TableCard key={idx} title={section.title}>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Metric
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Value
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {section.data.map((item, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {item.label}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {item.value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TableCard>
        ))}
      </div>
    );
  };

  const renderProfessionalsTable = (data) => {
    const professionals = data[0]?.professionals || [];

    return (
      <TableCard 
        title="Professionals Overview" 
        subtitle={`Total: ${professionals.length} professionals`}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profession</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Total Participants</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Active</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Programs</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Chapters</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {professionals.map((prof, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {prof.first_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prof.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge status={prof.profession} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                    {prof.total_participants}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                    {prof.active_participants}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                    {prof.total_programs}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                    {prof.total_chapters_supervised}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableCard>
    );
  };

 

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center text-red-500 my-8 p-4 bg-red-50 rounded-lg">
          {error}
        </div>
      );
    }

    return (
      <div ref={reportRef}>
        {selectedCategory === "systemSummary" && renderSystemSummaryTable(data)}
        {selectedCategory === "professionals" && renderProfessionalsTable(data)}
        {selectedCategory === "guardians" && renderGuardians(data)}
        {selectedCategory === "helpRequests" && renderHelpRequests(data)}
        {selectedCategory === "admissions" && renderAdmissions(data)}
        {selectedCategory === "chapterProgress" && renderChapterProgress(data)}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Reports Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                View and analyze system data
              </p>
            </div>
            <div className="flex space-x-4">
              <select
                className="p-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="systemSummary">System Summary</option>
                <option value="professionals">All Professionals</option>
                <option value="guardians">All Guardians</option>
                <option value="helpRequests">Help Requests</option>
                <option value="admissions">Admissions</option>
                <option value="chapterProgress">Chapter Progress</option>
              </select>
              <button
  onClick={downloadPDF}
  disabled={pdfLoading}
  className={`inline-flex items-center px-4 py-2 rounded-lg transition-colors duration-200 
    ${pdfLoading 
      ? 'bg-gray-400 cursor-not-allowed' 
      : 'bg-blue-600 hover:bg-blue-700'} 
    text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
>
  {pdfLoading ? (
    <>
      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Generating PDF...
    </>
  ) : (
    <>
      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
      </svg>
      Download Report
    </>
  )}
</button>
            </div>
          </div>

          {(selectedCategory === "helpRequests" ||
            selectedCategory === "admissions" ||
            selectedCategory === "chapterProgress") && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex space-x-4">
                <input
                  type="date"
                  className="border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  />
                  <input
                    type="date"
                    className="border p-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                  />
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                    onClick={fetchData}
                  >
                    Filter
                  </button>
                </div>
              </div>
            )}
  
            <div className="space-y-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  const renderGuardians = (data) => {
    const guardians = data[0]?.guardians || [];
  
    return (
      <TableCard 
        title="Guardians Overview" 
        subtitle={`Total: ${guardians.length} guardians`}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Help Requests</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Participants</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {guardians.map((guardian) => (
                <GuardianRow key={guardian.id} guardian={guardian} />
              ))}
            </tbody>
          </table>
        </div>
      </TableCard>
    );
  };
  
  const renderHelpRequests = (data) => {
    const requests = data[0]?.help_requests || [];
  
    return (
      <TableCard 
        title="Help Requests Overview" 
        subtitle={`Showing requests by date`}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Requests</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {requests.map((request, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(request.request_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                    {request.total_requests}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-6 py-3 text-sm font-medium text-gray-900">Total</td>
                <td className="px-6 py-3 text-sm font-medium text-center text-gray-900">
                  {requests.reduce((sum, req) => sum + req.total_requests, 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </TableCard>
    );
  };
  
  const renderAdmissions = (data) => {
    const admissions = data[0]?.admissions || [];
  
    return (
      <TableCard 
        title="Admissions Overview" 
        subtitle={`Showing admissions by date`}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Participants</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admissions.map((admission, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(admission.admission_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-900">
                    {admission.total_participants}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td className="px-6 py-3 text-sm font-medium text-gray-900">Total</td>
                <td className="px-6 py-3 text-sm font-medium text-center text-gray-900">
                  {admissions.reduce((sum, adm) => sum + adm.total_participants, 0)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </TableCard>
    );
  };
  
  const renderChapterProgress = (data) => {
    const progress = data[0]?.chapter_progress || [];
  
    return (
      <TableCard 
        title="Chapter Progress Overview" 
        subtitle={`Showing progress details`}
      >
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chapter</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remarks</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {progress.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.chapter_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {item.participant_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge status={item.status} />
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {new Date(item.updated_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {item.remarks || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </TableCard>
    );
  };
  
  export default ReportsPage;