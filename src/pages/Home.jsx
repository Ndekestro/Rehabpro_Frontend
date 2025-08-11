import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Activity, 
  FileText, 
  MessageSquare, 
  Bell, 
  Clock,
  Phone
} from 'lucide-react';

const GuardianHome = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Welcome Banner */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Welcome to Rehab</h1>
          <p className="mt-1 text-sm text-gray-500">Monitor and support your loved one's rehabilitation journey</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {/* Progress Monitoring */}
          <Link to="/programs" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Programss</h2>
                <p className="mt-1 text-sm text-gray-500">View rehabilitation programs</p>
              </div>
            </div>
          </Link>

          {/* Schedule/Calendar */}
          <Link to="/help" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">help</h2>
                <p className="mt-1 text-sm text-gray-500">request help</p>
              </div>
            </div>
          </Link>

          {/* Reports */}
          <Link to="/#" className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-lg font-medium text-gray-900">Support</h2>
                <p className="mt-1 text-sm text-gray-500">We are here for you</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Important Information Section */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Important Information</h3>
          </div>
          <div className="px-6 py-5">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Bell className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Chapters</h4>
                  <p className="mt-1 text-sm text-gray-500">Answer in the system </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Center Hours</h4>
                  <p className="mt-1 text-sm text-gray-500">Monday - Friday: 8:00 AM - 6:00 PM</p>
                  <p className="text-sm text-gray-500">Saturday: 9:00 AM - 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm font-medium text-gray-900">Emergency Contact</h4>
                  <p className="mt-1 text-sm text-gray-500">24/7 Emergency Line: (123) 456-7890</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-100">
            <h3 className="text-lg font-medium text-blue-900">Need Help?</h3>
            <p className="mt-2 text-sm text-blue-700">Contact our support team for assistance with the portal</p>
            <Link 
              to="/support" 
              className="mt-4 inline-flex items-center text-sm text-blue-600 hover:text-blue-500"
            >
              Get Support
              <MessageSquare className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="bg-green-50 p-6 rounded-lg border border-green-100">
            <h3 className="text-lg font-medium text-green-900">Resources</h3>
            <p className="mt-2 text-sm text-green-700">Access helpful resources and guidelines</p>
            <Link 
              to="/resources" 
              className="mt-4 inline-flex items-center text-sm text-green-600 hover:text-green-500"
            >
              View Resources
              <FileText className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GuardianHome;