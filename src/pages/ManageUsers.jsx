import React, { useEffect, useState } from 'react';
import API from '../api';
import { Snackbar } from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { 
  Plus, X, Edit2, Trash2, UserCheck, UserX, Eye,
  Mail, Phone, MapPin, Briefcase, IdCard, Calendar, User,
  Key
} from 'lucide-react';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({
    id: null,
    name: '',
    gender: '',
    profession: '',
    national_id: '',
    address: '',
    rehab_reason: '',
    email: '',
    username: '',
    role: 'participant',
    password: '',
    verified: false,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${API.baseUrl}/users`);
      if (!response.ok) throw new Error('Failed to fetch users');
      const data = await response.json();
      setUsers(data.users || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      showSnackbar('Error fetching users', 'error');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'national_id' && value.length > 16) return;
    setForm({ ...form, [name]: value });
  };

  const handleSubmit = async (e, updatedForm = form) => {
    e.preventDefault();
  
    try {
      const url = isEditing ? `${API.baseUrl}/users/${updatedForm.id}` : `${API.baseUrl}/users/register`;
      const method = isEditing ? 'PUT' : 'POST';
  
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedForm),
      });
  
      if (!response.ok) throw new Error('Error saving user');
  
      showSnackbar(isEditing ? 'User updated successfully' : 'User created successfully', 'success');
      resetForm();
      fetchUsers();
      setShowModal(false);
    } catch (error) {
      console.error('Error submitting user:', error);
      showSnackbar('Error submitting user', 'error');
    }
  };
  

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const response = await fetch(`${API.baseUrl}/users/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Error deleting user');

      setUsers(users.filter((user) => user.id !== id));
      showSnackbar('User deleted successfully', 'success');
    } catch (error) {
      console.error('Error deleting user:', error);
      showSnackbar('Error deleting user', 'error');
    }
  };

  const handleEdit = (user) => {
    setForm(user);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleVerify = async (id, status) => {
    try {
      const response = await fetch(`${API.baseUrl}/users/verify/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: status }),
      });

      if (!response.ok) throw new Error('Error verifying user');

      fetchUsers();
      showSnackbar(status ? 'User verified successfully' : 'User verification revoked', 'success');
    } catch (error) {
      console.error('Error verifying user:', error);
      showSnackbar('Error verifying user', 'error');
    }
  };

  const resetForm = () => {
    setForm({
      id: null,
      name: '',
      gender: '',
      profession: '',
      national_id: '',
      address: '',
      rehab_reason: '',
      email: '',
      username: '',
      role: 'participant',
      password: '',
      verified: false,
    });
    setIsEditing(false);
  };

  const showSnackbar = (message, severity) => {
    setSnackbar({ open: true, message, severity });
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  const inputClass = "w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500";
  const buttonClass = "inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500";

  // Form Modal Component
  const FormModal = () => {
    // Local state for form input
    const [localForm, setLocalForm] = useState({
      name: form.name || '',
      gender: form.gender || '',
      profession: form.profession || '',
      national_id: form.national_id || '',
      address: form.address || '',
      rehab_reason: form.rehab_reason || '',
      email: form.email || '',
      username: form.username || '',
      role: form.role || 'participant',
      password: form.password || '',
    });
  
    // State for validation errors
    const [errors, setErrors] = useState({});
  
    const validateField = (name, value) => {
      switch (name) {
        case 'name':
          if (!value) return 'Name is required';
          if (value.length < 3) return 'Name must be at least 3 characters';
          if (!/^[a-zA-Z\s]*$/.test(value)) return 'Name can only contain letters and spaces';
          return '';
  
        case 'national_id':
          if (value && value.length > 0) {
            if (value.length !== 16) return 'National ID must be exactly 16 characters';
            if (!/^\d+$/.test(value)) return 'National ID must contain only numbers';
          }
          return '';
  
        case 'email':
          if (!value) return 'Email is required';
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
          return '';
  
        case 'username':
          if (!value) return 'Username is required';
          if (value.length < 3) return 'Username must be at least 3 characters';
          if (!/^[a-zA-Z0-9_]*$/.test(value)) return 'Username can only contain letters, numbers, and underscores';
          return '';
  
        case 'password':
          if (!isEditing) {
            if (!value) return 'Password is required';
            if (value.length < 3) return 'Password must be at least 3 characters';
           
          }
          return '';
  
        default:
          return '';
      }
    };
  
    const handleLocalChange = (e) => {
      const { name, value } = e.target;
      
      // Update form
      setLocalForm(prev => ({
        ...prev,
        [name]: value
      }));
  
      // Validate field
      const error = validateField(name, value);
      setErrors(prev => ({
        ...prev,
        [name]: error
      }));
    };
  
    const handleLocalSubmit = (e) => {
      e.preventDefault();
  
      // Validate all fields
      const newErrors = {};
      Object.keys(localForm).forEach(key => {
        const error = validateField(key, localForm[key]);
        if (error) newErrors[key] = error;
      });
  
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
  
      setForm(prevForm => {
        const updatedForm = { ...prevForm, ...localForm };
        handleSubmit({ preventDefault: () => {} }, updatedForm);
        return updatedForm;
      });
      
    };
  
    const getInputClassName = (fieldName) => {
      return `${inputClass} ${errors[fieldName] ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}`;
    };
  
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center p-6 border-b">
            <h3 className="text-2xl font-semibold text-gray-900">
              {isEditing ? 'Edit User' : 'Add New User'}
            </h3>
            <button
              onClick={() => setShowModal(false)}
              className="text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
  
          <form onSubmit={handleLocalSubmit} className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input
                  type="text"
                  name="name"
                  value={localForm.name}
                  onChange={handleLocalChange}
                  className={getInputClassName('name')}
                  required
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">National ID</label>
                <input
                  type="text"
                  name="national_id"
                  value={localForm.national_id}
                  onChange={handleLocalChange}
                  maxLength={16}
                  className={getInputClassName('national_id')}
                />
                {errors.national_id ? (
                  <p className="mt-1 text-sm text-red-600">{errors.national_id}</p>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">{localForm.national_id.length}/16 characters</p>
                )}
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select 
                  name="gender"
                  value={localForm.gender}
                  onChange={handleLocalChange}
                  className={getInputClassName('gender')}
                >
                  <option value="">Select Gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profession</label>
                <input
                  type="text"
                  name="profession"
                  value={localForm.profession}
                  onChange={handleLocalChange}
                  className={getInputClassName('profession')}
                />
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  name="address"
                  value={localForm.address}
                  onChange={handleLocalChange}
                  className={getInputClassName('address')}
                />
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="email"
                  value={localForm.email}
                  onChange={handleLocalChange}
                  className={getInputClassName('email')}
                  required
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                <input
                  type="text"
                  name="username"
                  value={localForm.username}
                  onChange={handleLocalChange}
                  className={getInputClassName('username')}
                  required
                />
                {errors.username && <p className="mt-1 text-sm text-red-600">{errors.username}</p>}
              </div>
  
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select
                  name="role"
                  value={localForm.role}
                  onChange={handleLocalChange}
                  className={getInputClassName('role')}
                  required
                >
                  <option value="participant">Guardian</option>
                  <option value="professional">Professional</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
  
              {!isEditing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input
                    type="password"
                    name="password"
                    value={localForm.password}
                    onChange={handleLocalChange}
                    className={getInputClassName('password')}
                    required={!isEditing}
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>
              )}
  
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Rehab Reason</label>
                <textarea
                  name="rehab_reason"
                  value={localForm.rehab_reason}
                  onChange={handleLocalChange}
                  className={`${getInputClassName('rehab_reason')} h-24 resize-none`}
                />
              </div>
            </div>
  
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={buttonClass}
              >
                {isEditing ? 'Update User' : 'Add User'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  // Details Modal Component
  const UserDetailsModal = ({ user, onClose }) => {
    if (!user) return null;

    const DetailRow = ({ icon: Icon, label, value }) => (
      <div className="flex items-start space-x-3 p-4 hover:bg-gray-50 rounded-lg transition-colors">
        <div className="flex-shrink-0">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-500">{label}</p>
          <p className="mt-1 text-sm text-gray-900">{value || 'Not provided'}</p>
        </div>
      </div>
    );

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
          <div className="border-b border-gray-200">
            <div className="p-6 flex justify-between items-start">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">User Details</h3>
                <p className="mt-1 text-sm text-gray-500">Comprehensive information about the user</p>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="p-6">
            {/* Header Information */}
            <div className="flex items-center justify-between pb-6 border-b">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">
                    {user.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div>
                  <h4 className="text-xl font-semibold text-gray-900">{user.name}</h4>
                  <p className="text-sm text-gray-500">{user.role}</p>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium
                ${user.verified 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'}`}
              >
                {user.verified ? 'Verified' : 'Unverified'}
              </span>
            </div>

            {/* Details Grid */}
            <div className="mt-6 space-y-1">
              <DetailRow icon={User} label="Username" value={user.username} />
              <DetailRow icon={Mail} label="Email" value={user.email} />
              <DetailRow icon={IdCard} label="National ID" value={user.national_id} />
              <DetailRow icon={User} label="Gender" value={user.gender} />
              <DetailRow icon={Briefcase} label="Profession" value={user.profession} />
              <DetailRow icon={MapPin} label="Address" value={user.address} />
              
              {/* Rehab Reason Section */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium text-gray-900 mb-2">Rehabilitation Reason</h5>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">
                  {user.rehab_reason || 'No reason provided'}
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 
                         rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 
                         focus:ring-offset-2 focus:ring-blue-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Manage Users</h2>
            <p className="mt-1 text-sm text-gray-500">View and manage user accounts</p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg
                     text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                     shadow-sm transition-colors duration-200 gap-2"
          >
            <Plus className="h-5 w-5" />
            Add New User
          </button>
        </div>

        {/* User List */}
        <div className="bg-white shadow-lg rounded-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user.name?.charAt(0)?.toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.username}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{user.email}</div>
                      <div className="text-sm text-gray-500">{user.profession}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${user.verified 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'}`}
                      >
                        {user.verified ? 'Verified' : 'Unverified'}
                      </span>
                      <div className="text-sm text-gray-500 mt-1">{user.role}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleViewDetails(user)}
                          className="inline-flex items-center px-3 py-1 rounded-md text-sm
                                   text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          Details
                        </button>
                        <button
                          onClick={() => handleVerify(user.id, !user.verified)}
                          className="inline-flex items-center px-2 py-1 rounded-md text-sm
                                   text-green-600 hover:bg-green-50 transition-colors duration-200"
                        >
                          {user.verified ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                        </button>
                        <button
                          onClick={() => handleEdit(user)}
                          className="inline-flex items-center px-2 py-1 rounded-md text-sm
                                   text-amber-600 hover:bg-amber-50 transition-colors duration-200"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="inline-flex items-center px-2 py-1 rounded-md text-sm
                                   text-red-600 hover:bg-red-50 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add/Edit Modal */}
        {showModal && <FormModal />}

        {/* Details Modal */}
        {showDetailsModal && (
          <UserDetailsModal 
            user={selectedUser} 
            onClose={() => {
              setShowDetailsModal(false);
              setSelectedUser(null);
            }} 
          />
        )}

        {/* Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <MuiAlert
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            severity={snackbar.severity}
            elevation={6}
            variant="filled"
          >
            {snackbar.message}
          </MuiAlert>
        </Snackbar>
      </div>
    </div>
  );
};

export default ManageUsers;