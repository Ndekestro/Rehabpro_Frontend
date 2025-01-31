import React, { useEffect, useState } from "react";
import API from "../api";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, BarChart, Bar, Legend, AreaChart, 
  Area, PieChart, Pie, Cell, RadarChart, Radar, 
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, RadialBarChart, 
  RadialBar
} from "recharts";
import {
  Users, UserCheck, AlertCircle, CheckCircle, Clock,
  Activity, TrendingUp, Award, Layout, Shield, Brain,
  ArrowUp, ArrowDown, Sparkles, Target, Zap, Heart,
  ChevronUp, ChevronRight, ChevronDown  // Added ChevronDown here
} from "lucide-react";

const AdminDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [recentRequests, setRecentRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API.baseUrl}/dashboard/summary`);
      const data = await response.json();
      
      // Process dates and add dummy hourly data for demonstration
      const processedRequests = data.recent_requests.map(req => {
        const date = new Date(req.request_date);
        return {
          ...req,
          request_date: date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
          }),
          morning: Math.floor(Math.random() * 50),
          afternoon: Math.floor(Math.random() * 50),
          evening: Math.floor(Math.random() * 50)
        };
      });
      
      setSummary(data.summary);
      setRecentRequests(processedRequests);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const COLORS = {
    primary: ['#3B82F6', '#2563EB', '#1D4ED8'],
    success: ['#10B981', '#059669', '#047857'],
    warning: ['#F59E0B', '#D97706', '#B45309'],
    info: ['#6366F1', '#4F46E5', '#4338CA'],
    secondary: ['#EC4899', '#DB2777', '#BE185D']
  };

  const gradientOffset = () => {
    const dataMax = Math.max(...recentRequests.map(item => item.total_requests));
    const dataMin = Math.min(...recentRequests.map(item => item.total_requests));
    
    if (dataMax <= 0) return 0;
    if (dataMin >= 0) return 1;
    
    return dataMax / (dataMax - dataMin);
  };

  const off = gradientOffset();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg">
                <Layout className="h-8 w-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold bg-clip-text text-transparent 
                             bg-gradient-to-r from-blue-600 to-indigo-600">
                  Dashboard
                </h2>
                <p className="mt-1 text-gray-500 flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                  Real-time platform analytics and insights
                </p>
              </div>
            </div>
            <div className="flex items-center text-sm text-gray-500">
              Last updated: {new Date().toLocaleString()}
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        {summary && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatsCard
              title="Total Requests"
              value={summary.total_requests}
              change="+12%"
              trend="up"
              icon={Activity}
              color="blue"
              sparklineData={[30, 45, 25, 60, 40, 80, 50]}
            />
            <StatsCard
              title="Pending"
              value={summary.pending_requests}
              change="-5%"
              trend="down"
              icon={Clock}
              color="yellow"
              sparklineData={[40, 35, 45, 30, 25, 35, 40]}
            />
            <StatsCard
              title="In Progress"
              value={summary.in_progress_requests}
              change="+8%"
              trend="up"
              icon={TrendingUp}
              color="purple"
              sparklineData={[20, 30, 40, 50, 40, 60, 70]}
            />
            <StatsCard
              title="Resolved"
              value={summary.resolved_requests}
              change="+15%"
              trend="up"
              icon={CheckCircle}
              color="green"
              sparklineData={[40, 50, 60, 70, 75, 80, 85]}
            />
          </div>
        )}

        {/* Advanced Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Enhanced Area Chart */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Request Distribution</h3>
                <p className="text-sm text-gray-500">Hourly breakdown of requests</p>
              </div>
              <div className="flex items-center space-x-2">
                {['Morning', 'Afternoon', 'Evening'].map((time) => (
                  <span key={time} className="px-3 py-1 text-xs font-medium rounded-full
                                            bg-blue-50 text-blue-600">
                    {time}
                  </span>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={recentRequests}>
                <defs>
                  <linearGradient id="colorMorning" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.primary[0]} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.primary[0]} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorAfternoon" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.success[0]} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.success[0]} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorEvening" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.info[0]} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={COLORS.info[0]} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="request_date" 
                  tick={{ fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  tick={{ fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="morning" 
                  stroke={COLORS.primary[0]} 
                  fill="url(#colorMorning)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="afternoon" 
                  stroke={COLORS.success[0]} 
                  fill="url(#colorAfternoon)"
                  strokeWidth={2}
                />
                <Area 
                  type="monotone" 
                  dataKey="evening" 
                  stroke={COLORS.info[0]} 
                  fill="url(#colorEvening)"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                <p className="text-sm text-gray-500">Multi-dimensional analysis</p>
              </div>
              <Target className="h-5 w-5 text-indigo-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart 
                outerRadius={100} 
                data={[
                  {
                    subject: 'Response Time',
                    A: 120,
                    B: 110,
                    fullMark: 150,
                  },
                  {
                    subject: 'Resolution Rate',
                    A: 98,
                    B: 130,
                    fullMark: 150,
                  },
                  {
                    subject: 'User Satisfaction',
                    A: 86,
                    B: 130,
                    fullMark: 150,
                  },
                  {
                    subject: 'Engagement',
                    A: 99,
                    B: 100,
                    fullMark: 150,
                  },
                  {
                    subject: 'Efficiency',
                    A: 85,
                    B: 90,
                    fullMark: 150,
                  },
                ]}
              >
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#6B7280' }} />
                <PolarRadiusAxis angle={30} domain={[0, 150]} />
                <Radar
                  name="Current"
                  dataKey="A"
                  stroke={COLORS.primary[0]}
                  fill={COLORS.primary[0]}
                  fillOpacity={0.3}
                />
                <Radar
                  name="Target"
                  dataKey="B"
                  stroke={COLORS.success[0]}
                  fill={COLORS.success[0]}
                  fillOpacity={0.3}
                />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Section with RadialBar and Advanced Bar Chart */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* RadialBar Chart */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Completion Rates</h3>
                <p className="text-sm text-gray-500">Request resolution status</p>
              </div>
              <Zap className="h-5 w-5 text-yellow-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <RadialBarChart
                innerRadius="10%"
                outerRadius="80%"
                data={[
                  {
                    name: 'Resolved',
                    value: 85,
                    fill: COLORS.success[0]
                  },
                  {
                    name: 'In Progress',
                    value: 65,
                    fill: COLORS.warning[0]
                  },
                  {
                    name: 'Pending',
                    value: 45,
                    fill: COLORS.primary[0]
                  }
                ]}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  minAngle={15}
                  label={{ fill: '#6B7280', position: 'insideStart' }}
                  background={{ fill: '#f3f4f6' }}
                  clockWise={true}
                  dataKey="value"
                />
                <Legend iconSize={10} />
                <Tooltip />
              </RadialBarChart>
            </ResponsiveContainer>
          </div>

          {/* Advanced Bar Chart */}
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">User Distribution</h3>
                <p className="text-sm text-gray-500">Platform demographics</p>
              </div>
              <Users className="h-5 w-5 text-purple-500" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={[
                  {
                    name: "Participants",
                    value: summary?.total_participants,
                    color: COLORS.primary[0]
                  },
                  {
                    name: "Guardians",
                    value: summary?.total_guardians,
                    color: COLORS.success[0]
                  },
                  {
                    name: "Professionals",
                    value: summary?.total_professionals,
                    color: COLORS.warning[0]
                  },
                  {name: "Active Programs",
                    value: summary?.active_programs,
                    color: COLORS.info[0]
                  }
                ]}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <YAxis 
                  tick={{ fill: '#6B7280' }}
                  axisLine={{ stroke: '#E5E7EB' }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFF',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)'
                  }}
                />
                <Bar 
  dataKey="value" 
  radius={[8, 8, 0, 0]}
  barSize={40}
>
  {Object.values(COLORS.primary).map((color, index) => (
    <Cell key={`cell-${index}`} fill={color} />
  ))}
</Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced Stats Card Component with Sparkline
const StatsCard = ({ title, value, change, trend, icon: Icon, color, sparklineData }) => {
  const colors = {
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      border: 'border-blue-200',
      hover: 'hover:bg-blue-100',
      icon: 'bg-blue-500',
      sparkline: '#3B82F6'
    },
    yellow: {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      border: 'border-yellow-200',
      hover: 'hover:bg-yellow-100',
      icon: 'bg-yellow-500',
      sparkline: '#F59E0B'
    },
    purple: {
      bg: 'bg-purple-50',
      text: 'text-purple-600',
      border: 'border-purple-200',
      hover: 'hover:bg-purple-100',
      icon: 'bg-purple-500',
      sparkline: '#8B5CF6'
    },
    green: {
      bg: 'bg-green-50',
      text: 'text-green-600',
      border: 'border-green-200',
      hover: 'hover:bg-green-100',
      icon: 'bg-green-500',
      sparkline: '#10B981'
    }
  };

  const colorSet = colors[color];

  // Calculate sparkline points
  const max = Math.max(...sparklineData);
  const min = Math.min(...sparklineData);
  const range = max - min;
  const points = sparklineData.map((value, i) => ({
    x: (i / (sparklineData.length - 1)) * 100,
    y: 100 - ((value - min) / range) * 100
  })).map(point => `${point.x},${point.y}`).join(' ');

  return (
    <div className={`bg-white rounded-2xl shadow-lg border p-6
                    transition-all duration-300 transform hover:-translate-y-1
                    hover:shadow-xl ${colorSet.border}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorSet.icon}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div className={`flex items-center space-x-1 ${
          trend === 'up' ? 'text-green-600' : 'text-red-600'
        }`}>
          {trend === 'up' ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
          <span className="text-sm font-medium">{change}</span>
        </div>
      </div>

      <h4 className="text-sm font-medium text-gray-500 mb-2">{title}</h4>
      <p className="text-2xl font-bold text-gray-900 mb-4">{value}</p>

      {/* Sparkline */}
      <div className="h-8 w-full">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          <path
            d={`M 0,${100 - ((sparklineData[0] - min) / range) * 100} ${points}`}
            fill="none"
            stroke={colorSet.sparkline}
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

export default AdminDashboard;