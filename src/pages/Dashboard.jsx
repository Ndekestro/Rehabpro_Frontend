// src/components/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import API from '../api'; // Import API class

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await API.getDashboardData();
        setDashboardData(data);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="dashboard">
      <h2>Dashboard</h2>
      <div>
        {dashboardData ? (
          <pre>{JSON.stringify(dashboardData, null, 2)}</pre>
        ) : (
          <p>Loading...</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
