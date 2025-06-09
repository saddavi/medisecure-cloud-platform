import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserPlus,
  Calendar,
  FileText,
  TrendingUp,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  ArrowRight,
} from "lucide-react";
import { usePatientStats, useRecentPatients } from "../hooks/usePatients";
import { Button, Card } from "../components/ui";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const PatientDashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = usePatientStats();
  const { data: recentPatients, isLoading: recentLoading } =
    useRecentPatients(5);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Patient Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Manage patient records and monitor healthcare metrics
          </p>
        </div>
        <div className="flex space-x-3">
          <Link to="/patients">
            <Button variant="outline" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>View All Patients</span>
            </Button>
          </Link>
          <Link to="/patients/new">
            <Button variant="primary" className="flex items-center space-x-2">
              <UserPlus className="h-4 w-4" />
              <span>Add New Patient</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsLoading ? (
          <>
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="p-6">
                <LoadingSpinner size="small" />
              </Card>
            ))}
          </>
        ) : (
          <>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Total Patients
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.totalPatients || 0}
                  </p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 mr-1" />+
                    {stats?.newPatientsThisMonth || 0} this month
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Cases
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.activeCases || 0}
                  </p>
                  <p className="text-sm text-blue-600 flex items-center mt-1">
                    <Activity className="h-4 w-4 mr-1" />
                    {stats?.criticalCases || 0} critical
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Appointments Today
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.appointmentsToday || 0}
                  </p>
                  <p className="text-sm text-orange-600 flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    {stats?.upcomingAppointments || 0} upcoming
                  </p>
                </div>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Pending Reviews
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.pendingReviews || 0}
                  </p>
                  <p className="text-sm text-red-600 flex items-center mt-1">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Requires attention
                  </p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Recent Activity and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Patients */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Recent Patients
              </h2>
              <Link to="/patients">
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center space-x-1"
                >
                  <span>View All</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            {recentLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg animate-pulse"
                  >
                    <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : recentPatients?.length > 0 ? (
              <div className="space-y-3">
                {recentPatients.map((patient: any) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {patient.personalInfo?.firstName?.[0]}
                          {patient.personalInfo?.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {patient.personalInfo?.firstName}{" "}
                          {patient.personalInfo?.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          ID: {patient.id} • {patient.personalInfo?.email}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          patient.status === "active"
                            ? "bg-green-100 text-green-800"
                            : patient.status === "inactive"
                            ? "bg-gray-100 text-gray-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {patient.status}
                      </span>
                      <Link to={`/patients/${patient.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No recent patients</p>
                <Link to="/patients/new">
                  <Button variant="primary" className="mt-3">
                    Add First Patient
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link to="/patients/new" className="block">
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UserPlus className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Add New Patient</p>
                    <p className="text-sm text-gray-500">
                      Register a new patient
                    </p>
                  </div>
                </div>
              </Link>

              <Link to="/appointments" className="block">
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors">
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Schedule Appointment
                    </p>
                    <p className="text-sm text-gray-500">
                      Book a new appointment
                    </p>
                  </div>
                </div>
              </Link>

              <Link to="/records" className="block">
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors">
                  <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Medical Records</p>
                    <p className="text-sm text-gray-500">
                      Access patient records
                    </p>
                  </div>
                </div>
              </Link>

              <Link to="/analytics" className="block">
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors">
                  <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">View Analytics</p>
                    <p className="text-sm text-gray-500">Healthcare insights</p>
                  </div>
                </div>
              </Link>
            </div>
          </Card>

          {/* HIPAA Compliance Status */}
          <Card className="p-6 mt-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Compliance Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">HIPAA Compliance</span>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    Active
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Encryption</span>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    Enabled
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Access Logs</span>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    Monitored
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
