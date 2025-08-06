import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { Users, UserCheck, UserX, Clock, Calendar, FileText, Filter, Download, FileDown } from 'lucide-react';
import API from '../api';

const ReportsDashboard = () => {
  const [stats, setStats] = useState({});
  const [statusData, setStatusData] = useState([]);
  const [conditionData, setConditionData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    condition: '',
    dateFrom: '',
    dateTo: '',
    admissionDateFrom: '',
    admissionDateTo: ''
  });
  const [dateRangeStats, setDateRangeStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      const [statsRes, statusRes, conditionRes, monthlyRes, participantsRes] = await Promise.all([
        fetch(`${API.baseUrl}/participant-report/dashboard/stats`),
        fetch(`${API.baseUrl}/participant-report/distribution/status`),
        fetch(`${API.baseUrl}/participant-report/analysis/condition`),
        fetch(`${API.baseUrl}/participant-report/trends/monthly-admissions`),
        fetch(`${API.baseUrl}/participant-report/detailed/participants?limit=10`)
      ]);

      const [statsData, statusResult, conditionResult, monthlyResult, participantsResult] = await Promise.all([
        statsRes.json(),
        statusRes.json(),
        conditionRes.json(),
        monthlyRes.json(),
        participantsRes.json()
      ]);

      setStats(statsData.data?.overview || {});
      setStatusData(statusResult.data?.statusDistribution || []);
      setConditionData(conditionResult.data?.conditionAnalysis || []);
      setMonthlyData(monthlyResult.data?.monthlyTrend || []);
      setParticipants(participantsResult.data?.participants || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredData = async () => {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      const response = await fetch(`${API.baseUrl}/participant-report/detailed/participants?${params}`);
      const result = await response.json();
      setParticipants(result.data?.participants || []);

      // Fetch date range stats if date filters are applied
      if (filters.admissionDateFrom && filters.admissionDateTo) {
        const statsResponse = await fetch(
          `${API.baseUrl}/participant-report/stats/date-range?startDate=${filters.admissionDateFrom}&endDate=${filters.admissionDateTo}`
        );
        const statsResult = await statsResponse.json();
        setDateRangeStats(statsResult.data);
      }
    } catch (error) {
      console.error('Error fetching filtered data:', error);
    }
  };

  const generatePDF = () => {
    // Create CSV content for download instead of PDF
    const csvContent = generateCSVContent();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'rehabilitation-report.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const generateCSVContent = () => {
    let csv = 'Rehabilitation Program Report\n';
    csv += `Generated on: ${new Date().toLocaleDateString()}\n\n`;
    
    // Overview Statistics
    csv += 'Overview Statistics\n';
    csv += 'Metric,Value\n';
    csv += `Total Participants,${stats.totalParticipants || 0}\n`;
    csv += `Active Participants,${stats.activeParticipants || 0}\n`;
    csv += `Completed Participants,${stats.completedParticipants || 0}\n`;
    csv += `On Hold Participants,${stats.onHoldParticipants || 0}\n`;
    csv += `Total Professionals,${stats.totalProfessionals || 0}\n`;
    csv += `Average Age,${stats.averageAge || 0}\n\n`;

    // Date Range Statistics
    if (dateRangeStats) {
      csv += `Date Range Analysis (${filters.admissionDateFrom} to ${filters.admissionDateTo})\n`;
      csv += 'Metric,Value\n';
      csv += `Total Admissions in Period,${dateRangeStats.totalAdmissions}\n`;
      csv += `Min Age,${dateRangeStats.ageStatistics?.min_age || 0}\n`;
      csv += `Max Age,${dateRangeStats.ageStatistics?.max_age || 0}\n`;
      csv += `Average Age,${dateRangeStats.ageStatistics?.avg_age || 0}\n\n`;
    }

    // Participants Details
    if (participants.length > 0) {
      csv += 'Participants Details\n';
      csv += 'Name,Age,Gender,Condition,Status,Admission Date\n';
      participants.forEach(p => {
        csv += `"${p.first_name} ${p.last_name}",${p.age},${p.gender},"${p.condition}",${p.status},${new Date(p.admission_date).toLocaleDateString()}\n`;
      });
      csv += '\n';
    }

    // Status Distribution
    if (statusData.length > 0) {
      csv += 'Status Distribution\n';
      csv += 'Status,Count,Percentage\n';
      statusData.forEach(item => {
        csv += `${item.status},${item.count},${item.percentage}%\n`;
      });
    }

    return csv;
  };

  const generateSimplePDF = () => {
    const printWindow = window.open('', '_blank');
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Rehabilitation Program Report</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              line-height: 1.6; 
              color: #2c3e50;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
            }
            
            .container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 40px;
              background: white;
              min-height: 100vh;
              box-shadow: 0 0 50px rgba(0,0,0,0.1);
            }
            
            .header {
              text-align: center;
              margin-bottom: 50px;
              position: relative;
              padding: 40px 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              border-radius: 20px;
              margin: -20px -20px 50px -20px;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="75" cy="75" r="1" fill="rgba(255,255,255,0.1)"/><circle cx="50" cy="10" r="1" fill="rgba(255,255,255,0.1)"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
              border-radius: 20px;
            }
            
            .header-content {
              position: relative;
              z-index: 2;
            }
            
            .main-title {
              font-size: 42px;
              font-weight: 800;
              margin-bottom: 10px;
              text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
              letter-spacing: -1px;
            }
            
            .subtitle {
              font-size: 18px;
              opacity: 0.9;
              font-weight: 300;
              margin-bottom: 20px;
            }
            
            .date-badge {
              display: inline-block;
              background: rgba(255,255,255,0.2);
              padding: 8px 20px;
              border-radius: 25px;
              font-size: 14px;
              font-weight: 500;
              backdrop-filter: blur(10px);
            }

            .section {
              margin-bottom: 40px;
              background: #f8f9fa;
              border-radius: 15px;
              padding: 30px;
              box-shadow: 0 5px 15px rgba(0,0,0,0.08);
              position: relative;
              overflow: hidden;
            }

            .section::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              width: 5px;
              height: 100%;
              background: linear-gradient(to bottom, #667eea, #764ba2);
            }

            .section-title {
              font-size: 24px;
              font-weight: 700;
              margin-bottom: 20px;
              color: #2c3e50;
              display: flex;
              align-items: center;
              gap: 10px;
            }

            .section-title::before {
              content: '📊';
              font-size: 20px;
            }

            .stats-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 20px;
              margin-bottom: 30px;
            }

            .stat-card {
              background: white;
              border-radius: 12px;
              padding: 25px;
              text-align: center;
              box-shadow: 0 3px 10px rgba(0,0,0,0.1);
              border: 2px solid transparent;
              background-clip: padding-box;
              position: relative;
              overflow: hidden;
              transition: transform 0.3s ease;
            }

            .stat-card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #667eea, #764ba2);
            }

            .stat-number {
              font-size: 36px;
              font-weight: 800;
              color: #667eea;
              margin-bottom: 5px;
              display: block;
            }

            .stat-label {
              font-size: 14px;
              color: #7f8c8d;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .table-container {
              overflow-x: auto;
              border-radius: 15px;
              box-shadow: 0 5px 15px rgba(0,0,0,0.1);
              margin-top: 20px;
            }

            table {
              width: 100%;
              border-collapse: collapse;
              background: white;
              border-radius: 15px;
              overflow: hidden;
            }

            th {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 18px 15px;
              text-align: left;
              font-weight: 600;
              font-size: 14px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            td {
              padding: 15px;
              border-bottom: 1px solid #ecf0f1;
              font-size: 14px;
            }

            tr:hover {
              background-color: #f8f9fa;
            }

            tr:last-child td {
              border-bottom: none;
            }

            .status-badge {
              padding: 6px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: 600;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }

            .status-active { background: #d4edda; color: #155724; }
            .status-discharged { background: #cce5ff; color: #0056b3; }
            .status-transferred { background: #fff3cd; color: #856404; }

            .chart-placeholder {
              height: 200px;
              background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
              border-radius: 12px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #6c757d;
              font-style: italic;
              margin: 20px 0;
            }

            .highlight-box {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 25px;
              border-radius: 15px;
              margin: 20px 0;
              text-align: center;
            }

            .highlight-title {
              font-size: 20px;
              font-weight: 700;
              margin-bottom: 10px;
            }

            .footer {
              margin-top: 50px;
              text-align: center;
              color: #7f8c8d;
              font-size: 12px;
              padding: 20px;
              border-top: 2px solid #ecf0f1;
            }

            @media print {
              body { background: white !important; }
              .container { box-shadow: none !important; }
              .section { break-inside: avoid; }
              .stats-grid { break-inside: avoid; }
              table { break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="header-content">
                <div class="main-title">🏥 Rehabilitation Program</div>
                <div class="subtitle">Comprehensive Analytics Report</div>
                <div class="date-badge">📅 Generated: ${new Date().toLocaleDateString('en-US', { 
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}</div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">Executive Summary</div>
              <div class="stats-grid">
                <div class="stat-card">
                  <span class="stat-number">${stats.totalParticipants || 0}</span>
                  <div class="stat-label">Total Participants</div>
                </div>
                <div class="stat-card">
                  <span class="stat-number">${stats.activeParticipants || 0}</span>
                  <div class="stat-label">Active Cases</div>
                </div>
                <div class="stat-card">
                  <span class="stat-number">${stats.dischargedParticipants || 0}</span>
                  <div class="stat-label">Successfully Discharged</div>
                </div>
                <div class="stat-card">
                  <span class="stat-number">${stats.transferredParticipants || 0}</span>
                  <div class="stat-label">Transferred</div>
                </div>
                <div class="stat-card">
                  <span class="stat-number">${stats.totalProfessionals || 0}</span>
                  <div class="stat-label">Healthcare Professionals</div>
                </div>
                <div class="stat-card">
                  <span class="stat-number">${stats.averageAge || 0}</span>
                  <div class="stat-label">Average Age</div>
                </div>
              </div>
            </div>

            ${dateRangeStats ? `
              <div class="highlight-box">
                <div class="highlight-title">📊 Date Range Analysis</div>
                <div style="font-size: 16px; margin-bottom: 15px;">
                  ${filters.admissionDateFrom} → ${filters.admissionDateTo}
                </div>
                <div class="stats-grid" style="grid-template-columns: repeat(4, 1fr); gap: 15px;">
                  <div>
                    <div style="font-size: 28px; font-weight: bold;">${dateRangeStats.totalAdmissions}</div>
                    <div style="font-size: 12px; opacity: 0.9;">New Admissions</div>
                  </div>
                  <div>
                    <div style="font-size: 28px; font-weight: bold;">${dateRangeStats.ageStatistics?.avg_age || 0}</div>
                    <div style="font-size: 12px; opacity: 0.9;">Average Age</div>
                  </div>
                  <div>
                    <div style="font-size: 28px; font-weight: bold;">${dateRangeStats.ageStatistics?.min_age || 0}</div>
                    <div style="font-size: 12px; opacity: 0.9;">Youngest</div>
                  </div>
                  <div>
                    <div style="font-size: 28px; font-weight: bold;">${dateRangeStats.ageStatistics?.max_age || 0}</div>
                    <div style="font-size: 12px; opacity: 0.9;">Oldest</div>
                  </div>
                </div>
              </div>
            ` : ''}

            ${participants.length > 0 ? `
              <div class="section">
                <div class="section-title">👥 Participant Details</div>
                <div class="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>👤 Name</th>
                        <th>🎂 Age</th>
                        <th>⚧ Gender</th>
                        <th>🏥 Condition</th>
                        <th>📊 Status</th>
                        <th>📅 Admission Date</th>
                        <th>⏱️ Days in Program</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${participants.map(p => `
                        <tr>
                          <td style="font-weight: 600; color: #2c3e50;">${p.first_name} ${p.last_name}</td>
                          <td>${p.age}</td>
                          <td>${p.gender}</td>
                          <td style="color: #7f8c8d;">${p.condition}</td>
                          <td>
                            <span class="status-badge status-${p.status.toLowerCase()}">
                              ${p.status}
                            </span>
                          </td>
                          <td>${new Date(p.admission_date).toLocaleDateString()}</td>
                          <td style="font-weight: 600; color: #667eea;">
                            ${Math.floor((new Date() - new Date(p.admission_date)) / (1000 * 60 * 60 * 24))} days
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : ''}

            ${statusData.length > 0 ? `
              <div class="section">
                <div class="section-title">📈 Status Distribution Analysis</div>
                <div class="table-container">
                  <table>
                    <thead>
                      <tr>
                        <th>📊 Status Category</th>
                        <th>👥 Count</th>
                        <th>📊 Percentage</th>
                        <th>📈 Visual Representation</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${statusData.map(item => `
                        <tr>
                          <td>
                            <span class="status-badge status-${item.status.toLowerCase()}">
                              ${item.status}
                            </span>
                          </td>
                          <td style="font-weight: 700; font-size: 16px; color: #667eea;">${item.count}</td>
                          <td style="font-weight: 600;">${item.percentage}%</td>
                          <td>
                            <div style="background: #ecf0f1; height: 20px; border-radius: 10px; overflow: hidden;">
                              <div style="background: linear-gradient(90deg, #667eea, #764ba2); height: 100%; width: ${item.percentage}%; border-radius: 10px;"></div>
                            </div>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            ` : ''}

            <div class="footer">
              <div style="margin-bottom: 10px;">
                <strong>🏥 Rehabilitation Management System</strong>
              </div>
              <div>This report contains confidential patient information. Handle with care and maintain privacy standards.</div>
              <div style="margin-top: 10px; font-size: 10px;">
                Report ID: RPT-${new Date().getTime()} | Generated at ${new Date().toLocaleTimeString()}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
    
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.print();
  };

  const StatCard = ({ icon: Icon, title, value, color }) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border-l-4" style={{borderLeftColor: color}}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <Icon className="w-8 h-8" style={{color}} />
      </div>
    </div>
  );

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rehabilitation Reports</h1>
          <p className="text-gray-600">Comprehensive analytics and insights</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Users} title="Total Participants" value={stats.totalParticipants || 0} color="#3B82F6" />
          <StatCard icon={UserCheck} title="Active" value={stats.activeParticipants || 0} color="#10B981" />
          <StatCard icon={UserX} title="Discharged" value={stats.dischargedParticipants || 0} color="#F59E0B" />
          <StatCard icon={Clock} title="Transferred" value={stats.transferredParticipants || 0} color="#EF4444" />
        </div>

        {/* Date Range Statistics */}
        {dateRangeStats && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg shadow-sm mb-6 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Date Range Analysis ({filters.admissionDateFrom} to {filters.admissionDateTo})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">Total Admissions</p>
                <p className="text-2xl font-bold text-blue-600">{dateRangeStats.totalAdmissions}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">Average Age</p>
                <p className="text-2xl font-bold text-green-600">{dateRangeStats.ageStatistics?.avg_age || 0}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">Age Range</p>
                <p className="text-2xl font-bold text-purple-600">
                  {dateRangeStats.ageStatistics?.min_age || 0} - {dateRangeStats.ageStatistics?.max_age || 0}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <p className="text-sm text-gray-600">Conditions</p>
                <p className="text-2xl font-bold text-orange-600">{dateRangeStats.conditionBreakdown?.length || 0}</p>
              </div>
            </div>
          </div>
        )}
       {/* Charts Section */}
<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
  {/* Status Distribution */}
  <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
            <UserCheck className="w-5 h-5 text-white" />
          </div>
          Status Distribution
        </h3>
        <p className="text-gray-500 text-sm mt-1">Current participant status breakdown</p>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-blue-700">
          {statusData.reduce((sum, item) => sum + item.count, 0)}
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wide">Total</div>
      </div>
    </div>
    
    <div className="relative">
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <defs>
            <linearGradient id="blueGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" />
              <stop offset="100%" stopColor="#1E40AF" />
            </linearGradient>
            <linearGradient id="greenGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="orangeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#D97706" />
            </linearGradient>
            <linearGradient id="redGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
          </defs>
          <Pie
            data={statusData}
            cx="50%" 
            cy="50%" 
            outerRadius={100}
            innerRadius={40}
            dataKey="count" 
            nameKey="status"
            strokeWidth={3}
            stroke="#ffffff"
          >
            {statusData.map((entry, index) => {
              const gradients = ['url(#blueGradient)', 'url(#greenGradient)', 'url(#orangeGradient)', 'url(#redGradient)'];
              return (
                <Cell 
                  key={`cell-${index}`} 
                  fill={gradients[index % gradients.length]}
                />
              );
            })}
          </Pie>
          <Tooltip 
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
              padding: '12px'
            }}
            formatter={(value, name) => [
              <span className="font-semibold text-blue-700">{value} participants</span>, 
              <span className="font-medium">{name}</span>
            ]}
          />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Center Text */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-700">
            {statusData.reduce((sum, item) => sum + item.count, 0)}
          </div>
          <div className="text-xs text-gray-500 uppercase tracking-wide">Participants</div>
        </div>
      </div>
    </div>
    
    {/* Legend */}
    <div className="mt-6 grid grid-cols-2 gap-3">
      {statusData.map((item, index) => {
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-orange-500', 'bg-red-500'];
        return (
          <div key={item.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
              <span className="text-sm font-medium text-gray-700">{item.status}</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold text-gray-900">{item.count}</div>
              <div className="text-xs text-gray-500">{item.percentage}%</div>
            </div>
          </div>
        );
      })}
    </div>
  </div>

  {/* Monthly Admissions */}
  <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
    <div className="flex items-center justify-between mb-6">
      <div>
        <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          Monthly Admissions
        </h3>
        <p className="text-gray-500 text-sm mt-1">Admission trends over time</p>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-blue-700">
          {monthlyData.reduce((sum, item) => sum + (item.admissions_count || 0), 0)}
        </div>
        <div className="text-xs text-gray-500 uppercase tracking-wide">Total</div>
      </div>
    </div>
    
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={monthlyData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <defs>
          <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
          </linearGradient>
          <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#3B82F6" floodOpacity="0.3"/>
          </filter>
        </defs>
        <CartesianGrid 
          strokeDasharray="3 3" 
          stroke="#E5E7EB" 
          strokeOpacity={0.6}
        />
        <XAxis 
          dataKey="month_name" 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6B7280' }}
          tickMargin={10}
        />
        <YAxis 
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 12, fill: '#6B7280' }}
          tickMargin={10}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: 'none',
            borderRadius: '12px',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
            padding: '16px'
          }}
          labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '8px' }}
          formatter={(value, name) => [
            <span className="font-semibold text-blue-700">{value} admissions</span>, 
            <span className="font-medium">Monthly Total</span>
          ]}
        />
        
        {/* Area fill */}
        <Line
          type="monotone"
          dataKey="admissions_count"
          stroke="url(#areaGradient)"
          strokeWidth={0}
          fill="url(#areaGradient)"
          dot={false}
          activeDot={false}
        />
        
        {/* Main line */}
        <Line 
          type="monotone" 
          dataKey="admissions_count" 
          stroke="#1E40AF"
          strokeWidth={4}
          filter="url(#shadow)"
          dot={{ 
            fill: '#1E40AF', 
            strokeWidth: 3, 
            stroke: '#ffffff',
            r: 6,
            filter: 'url(#shadow)'
          }}
          activeDot={{ 
            r: 8, 
            fill: '#1E40AF',
            stroke: '#ffffff',
            strokeWidth: 3,
            filter: 'url(#shadow)'
          }}
        />
      </LineChart>
    </ResponsiveContainer>
    
    {/* Stats Summary */}
    <div className="mt-6 grid grid-cols-3 gap-4">
      <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-100">
        <div className="text-lg font-bold text-blue-700">
          {monthlyData.length > 0 ? Math.max(...monthlyData.map(item => item.admissions_count || 0)) : 0}
        </div>
        <div className="text-xs text-blue-600 uppercase tracking-wide">Peak Month</div>
      </div>
      <div className="text-center p-3 bg-green-50 rounded-lg border border-green-100">
        <div className="text-lg font-bold text-green-700">
          {monthlyData.length > 0 ? Math.round(monthlyData.reduce((sum, item) => sum + (item.admissions_count || 0), 0) / monthlyData.length) : 0}
        </div>
        <div className="text-xs text-green-600 uppercase tracking-wide">Average</div>
      </div>
      <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-100">
        <div className="text-lg font-bold text-orange-700">{monthlyData.length}</div>
        <div className="text-xs text-orange-600 uppercase tracking-wide">Months</div>
      </div>
    </div>
  </div>
</div>
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Filter className="w-5 h-5" />
              Filters & Date Range Analysis
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Discharged">Discharged</option>
              <option value="Transferred">Transferred</option>
            </select>
            <input
              type="text"
              placeholder="Condition"
              value={filters.condition}
              onChange={(e) => setFilters({...filters, condition: e.target.value})}
              className="border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="relative">
              <input
                type="date"
                value={filters.admissionDateFrom}
                onChange={(e) => setFilters({...filters, admissionDateFrom: e.target.value})}
                className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                title="Admission Date From"
              />
              <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">From Date</label>
            </div>
            <div className="relative">
              <input
                type="date"
                value={filters.admissionDateTo}
                onChange={(e) => setFilters({...filters, admissionDateTo: e.target.value})}
                className="border rounded-lg px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                title="Admission Date To"
              />
              <label className="absolute -top-2 left-2 bg-white px-1 text-xs text-gray-500">To Date</label>
            </div>
            <button
              onClick={fetchFilteredData}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              Apply
            </button>
            <button
              onClick={() => {
                setFilters({
                  status: '',
                  condition: '',
                  dateFrom: '',
                  dateTo: '',
                  admissionDateFrom: '',
                  admissionDateTo: ''
                });
                setDateRangeStats(null);
                fetchReportsData();
              }}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Participants Table */}
       {/* Participants Table */}
<div className="bg-white rounded-lg shadow-sm">
  <div className="p-6 border-b">
    <div className="flex items-center justify-between">
      <h3 className="text-lg font-semibold">Recent Participants</h3>
      <div className="flex gap-2">
        <button 
          onClick={generateSimplePDF}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          <FileDown className="w-4 h-4" />
          PDF
        </button>
        <button 
          onClick={generatePDF}
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors"
        >
          <Download className="w-4 h-4" />
          CSV
        </button>
      </div>
    </div>
  </div>
  
  {participants.length === 0 ? (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Users className="w-12 h-12 text-gray-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">No Participants Found</h3>
      <p className="text-gray-500 text-center mb-6 max-w-md">
        {Object.values(filters).some(filter => filter !== '') 
          ? "No participants match your current filter criteria. Try adjusting your filters or clearing them to see all participants."
          : "There are currently no participants in the system. Participants will appear here once they are added to the program."
        }
      </p>
      {Object.values(filters).some(filter => filter !== '') && (
        <button
          onClick={() => {
            setFilters({
              status: '',
              condition: '',
              dateFrom: '',
              dateTo: '',
              admissionDateFrom: '',
              admissionDateTo: ''
            });
            setDateRangeStats(null);
            fetchReportsData();
          }}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <Filter className="w-4 h-4" />
          Clear All Filters
        </button>
      )}
    </div>
  ) : (
    <div className="overflow-x-auto">
      <div className="inline-block min-w-full align-middle">
        <div className="overflow-hidden shadow-sm ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-700 to-blue-800">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Participant
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Age
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4" />
                    Condition
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4" />
                    Status
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Admission Date
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Days in Program
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {participants.map((participant, index) => {
                const daysInProgram = Math.floor((new Date() - new Date(participant.admission_date)) / (1000 * 60 * 60 * 24));
                const isEvenRow = index % 2 === 0;
                
                return (
                  <tr 
                    key={participant.id} 
                    className={`${isEvenRow ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-all duration-200 hover:shadow-md transform hover:-translate-y-0.5`}
                  >
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-12 w-12">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                            {participant.first_name?.[0]}{participant.last_name?.[0]}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-bold text-gray-900">
                            {participant.first_name} {participant.last_name}
                          </div>
                          <div className="text-sm text-gray-500 capitalize">
                            {participant.gender || 'Not specified'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-semibold text-gray-900 bg-gray-100 px-3 py-1 rounded-full">
                          {participant.age} years
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium bg-blue-50 px-3 py-2 rounded-lg border-l-4 border-blue-600">
                        {participant.condition}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm ${
                        participant.status === 'Active' 
                          ? 'bg-green-100 text-green-800 ring-2 ring-green-200' :
                        participant.status === 'Discharged' 
                          ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-200' :
                        participant.status === 'Transferred' 
                          ? 'bg-yellow-100 text-yellow-800 ring-2 ring-yellow-200' :
                        'bg-gray-100 text-gray-800 ring-2 ring-gray-200'
                      }`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${
                          participant.status === 'Active' ? 'bg-green-400' :
                          participant.status === 'Discharged' ? 'bg-blue-400' :
                          participant.status === 'Transferred' ? 'bg-yellow-400' :
                          'bg-gray-400'
                        }`}></div>
                        {participant.status}
                      </span>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-medium">
                        {new Date(participant.admission_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(participant.admission_date).toLocaleDateString('en-US', { weekday: 'long' })}
                      </div>
                    </td>
                    <td className="px-6 py-5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                          {daysInProgram} {daysInProgram === 1 ? 'day' : 'days'}
                        </div>
                        {daysInProgram > 30 && (
                          <div className="ml-2 text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded-full font-medium">
                            Long-term
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Table Summary Footer */}
      <div className="mt-4 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 rounded-lg border">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span className="text-gray-600">
                Active: <span className="font-semibold text-green-700">
                  {participants.filter(p => p.status === 'Active').length}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span className="text-gray-600">
                Discharged: <span className="font-semibold text-blue-700">
                  {participants.filter(p => p.status === 'Discharged').length}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-gray-600">
                Transferred: <span className="font-semibold text-yellow-700">
                  {participants.filter(p => p.status === 'Transferred').length}
                </span>
              </span>
            </div>
          </div>
          <div className="text-gray-600">
            <span className="font-semibold text-gray-900">{participants.length}</span> total participants
          </div>
        </div>
      </div>
    </div>
  )}
</div>
      </div>
    </div>
  );
};

export default ReportsDashboard;