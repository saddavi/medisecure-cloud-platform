import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Home, ArrowLeft, Search, Heart, Shield, FileX } from "lucide-react";
import { Button, Card } from "../components/ui";

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  const quickLinks = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: Home,
      description: "Return to main dashboard",
    },
    {
      name: "Patients",
      href: "/patients",
      icon: Search,
      description: "Browse patient records",
    },
    {
      name: "Provider Dashboard",
      href: "/provider-dashboard",
      icon: Shield,
      description: "Healthcare provider tools",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* MediSecure Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="h-16 w-16 bg-blue-600 rounded-xl flex items-center justify-center">
              <Heart className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">MediSecure</h1>
          <p className="text-gray-600">Healthcare Cloud Platform</p>
        </div>

        {/* 404 Content */}
        <Card className="p-8 text-center">
          <div className="mb-6">
            <FileX className="h-24 w-24 text-gray-400 mx-auto mb-4" />
            <h2 className="text-4xl font-bold text-gray-900 mb-2">404</h2>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              Page Not Found
            </h3>
            <p className="text-gray-600">
              The page you're looking for doesn't exist or has been moved. Let's
              get you back to where you need to be.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 mb-8">
            <Button
              variant="primary"
              onClick={() => navigate(-1)}
              className="flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Go Back</span>
            </Button>
            <Link to="/dashboard" className="flex-1">
              <Button
                variant="outline"
                className="w-full flex items-center justify-center space-x-2"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </Button>
            </Link>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-4">
              Quick Navigation
            </h4>
            <div className="space-y-2">
              {quickLinks.map((link) => (
                <Link key={link.href} to={link.href}>
                  <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-left">
                    <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <link.icon className="h-4 w-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{link.name}</p>
                      <p className="text-sm text-gray-500">
                        {link.description}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </Card>

        {/* HIPAA Notice */}
        <Card className="mt-6 p-4 bg-blue-50 border-blue-200">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="text-sm font-medium text-blue-900">
                Secure Healthcare Platform
              </h4>
              <p className="text-sm text-blue-700 mt-1">
                Your session remains secure and all patient data is protected by
                HIPAA-compliant encryption.
              </p>
            </div>
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>Need help? Contact your system administrator.</p>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
