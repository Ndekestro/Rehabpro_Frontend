import React, { useState, useEffect } from 'react';

const SendEmail = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [guardians, setGuardians] = useState([]);
  const [selectedGuardian, setSelectedGuardian] = useState('');
  const [professional, setProfessional] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get the professional's info from local storage
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser && storedUser.role === 'professional') {
      setProfessional(storedUser);
    }

    // Fetch all guardians
    fetchGuardians();
  }, []);

  // Fetch all guardians from the backend
  const fetchGuardians = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rehab/guardians');
      const data = await response.json();
      if (response.ok) {
        setGuardians(data.guardians);
      } else {
        console.error('❌ Error fetching guardians:', data.error);
      }
    } catch (error) {
      console.error('❌ Error fetching guardians:', error);
    }
  };

  // Send email function
  const handleSendEmail = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!subject || !message || !selectedGuardian) {
      alert("Please fill in all fields.");
      setIsLoading(false);
      return;
    }

    if (!professional) {
      alert("No professional details found. Please log in.");
      setIsLoading(false);
      return;
    }

    const emailData = {
      professionalId: professional.id,
      professionalEmail: professional.email,
      guardianId: selectedGuardian,
      subject,
      message,
    };

    try {
      const response = await fetch('http://localhost:5000/api/email/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData),
      });

      const data = await response.json();

      if (response.ok) {
        alert('✅ Email sent successfully!');
        // Reset form
        setSubject('');
        setMessage('');
        setSelectedGuardian('');
      } else {
        alert(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('❌ Error sending email:', error);
      alert('❌ Failed to send email.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white shadow-2xl rounded-2xl overflow-hidden">
          {/* Elegant Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6">
            <h2 className="text-3xl font-extrabold text-white text-center tracking-tight">
              Send Confidential Communication
            </h2>
          </div>

          {/* Form Container */}
          <form onSubmit={handleSendEmail} className="p-8 space-y-6">
            {/* Guardian Dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Guardian
              </label>
              <div className="relative">
                <select 
                  value={selectedGuardian} 
                  onChange={(e) => setSelectedGuardian(e.target.value)} 
                  className="w-full px-4 py-3 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block appearance-none pr-8 shadow-sm"
                  required
                >
                  <option value="">-- Select Guardian --</option>
                  {guardians.map((guardian) => (
                    <option key={guardian.id} value={guardian.id}>
                      {guardian.name} ({guardian.email})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Subject Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input 
                type="text" 
                value={subject} 
                onChange={(e) => setSubject(e.target.value)} 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                placeholder="Enter email subject"
                required
              />
            </div>

            {/* Message Textarea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 focus:ring-blue-500 focus:border-blue-500 h-36 resize-none shadow-sm"
                placeholder="Write your message here..."
                required
              />
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold rounded-lg 
                         hover:from-blue-700 hover:to-blue-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         transition-all duration-300 ease-in-out transform hover:scale-[1.02] 
                         disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                'Send Email'
              )}
            </button>
          </form>
        </div>

        {/* Subtle Footer */}
        <div className="text-center text-gray-500 mt-4 text-sm">
          Confidential Communication · Secure Transmission
        </div>
      </div>
    </div>
  );
};

export default SendEmail;