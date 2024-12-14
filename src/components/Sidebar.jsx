// src/components/Sidebar.jsx

import React, { useEffect, useState } from 'react';
import API from '../api'; // Import API class

const Sidebar = () => {
  const [role, setRole] = useState('');

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const data = await API.getUserRole();
        setRole(data.role); // Assuming response contains { role: 'admin' }
      } catch (error) {
        console.error('Error fetching role', error);
      }
    };

    fetchRole();
  }, []);

  return (
    <div className="sidebar">
      <h3>Sidebar</h3>
      <ul>
        {role === 'admin' && (
          <>
            <li>Dashboard</li>
            <li>Manage Users</li>
          </>
        )}
        {role === 'professional' && (
          <>
            <li>Dashboard</li>
            <li>Manage Tasks</li>
          </>
        )}
        {role === 'participant' && (
          <>
            <li>My Dashboard</li>
            <li>Progress</li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Sidebar;
