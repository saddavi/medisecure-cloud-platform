import React from "react";
import { Link } from "react-router-dom";
import {
  Stethoscope,
  Users,
  Calendar,
  FileText,
  Activity,
  Clock,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Bell,
  Heart,
  Shield,
  Plus,
  Eye,
  ArrowRight,
} from "lucide-react";
import { usePatientStats, useRecentPatients } from "../hooks/usePatients";
import { Button, Card } from "../components/ui";
import LoadingSpinner from "../components/ui/LoadingSpinner";

const ProviderDashboard: React.FC = () => {
  const { data: stats, isLoading: statsLoading } = usePatientStats();
  const { data: recentPatients, isLoading: recentLoading } =
    useRecentPatients(5);

  // Mock data for provider-specific metrics
  const todayAppointments = [
    {
      id: 1,
      patient: "Sarah Johnson",
      time: "09:00 AM",
      type: "Consultation",
      status: "upcoming",
    },
    {
      id: 2,
      patient: "Ahmed Al-Rashid",
      time: "10:30 AM",
      type: "Follow-up",
      status: "in-progress",
    },
    {
      id: 3,
      patient: "Maria Garcia",
      time: "02:00 PM",
      type: "Check-up",
      status: "upcoming",
    },
    {
      id: 4,
      patient: "John Smith",
      time: "03:30 PM",
      type: "Consultation",
      status: "upcoming",
    },
  ];

  const criticalAlerts = [
    {
      id: 1,
      patient: "Ahmed Al-Rashid",
      alert: "High Blood Pressure",
      severity: "high",
      time: "10 min ago",
    },
    {
      id: 2,
      patient: "Linda Davis",
      alert: "Missed Medication",
      severity: "medium",
      time: "1 hour ago",
    },
    {
      id: 3,
      patient: "Carlos Rodriguez",
      alert: "Lab Results Ready",
      severity: "low",
      time: "2 hours ago",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Provider Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Healthcare provider interface for patient care management
          </p>
        </div>
        <div className="flex space-x-3">
          <Link to="/appointments/new">
            <Button variant="outline" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Schedule Appointment</span>
            </Button>
          </Link>
          <Link to="/patients/new">
            <Button variant="primary" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Patient</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Provider Stats Cards */}
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
                    Today's Appointments
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {todayAppointments.length}
                  </p>
                  <p className="text-sm text-blue-600 flex items-center mt-1">
                    <Clock className="h-4 w-4 mr-1" />
                    Next in 15 mins
                  </p>
                </div>
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Active Patients
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats?.totalPatients || 0}
                  </p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <TrendingUp className="h-4 w-4 mr-1" />+
                    {stats?.newPatientsThisMonth || 0} this month
                  </p>
                </div>
                <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Critical Alerts
                  </p>
                  <p className="text-3xl font-bold text-gray-900">
                    {criticalAlerts.length}
                  </p>
                  <p className="text-sm text-red-600 flex items-center mt-1">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Requires attention
                  </p>
                </div>
                <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <Bell className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    Consultations
                  </p>
                  <p className="text-3xl font-bold text-gray-900">12</p>
                  <p className="text-sm text-purple-600 flex items-center mt-1">
                    <Activity className="h-4 w-4 mr-1" />
                    Today's completed
                  </p>
                </div>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Stethoscope className="h-6 w-6 text-purple-600" />
                </div>
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">
                Today's Schedule
              </h2>
              <Link to="/appointments">
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

            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center">
                      <span className="text-sm font-medium text-gray-900">
                        {appointment.time.split(" ")[0]}
                      </span>
                      <span className="text-xs text-gray-500">
                        {appointment.time.split(" ")[1]}
                      </span>
                    </div>
                    <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {appointment.patient
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {appointment.patient}
                      </p>
                      <p className="text-sm text-gray-500">
                        {appointment.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        appointment.status === "in-progress"
                          ? "bg-green-100 text-green-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {appointment.status === "in-progress"
                        ? "In Progress"
                        : "Upcoming"}
                    </span>
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar - Critical Alerts & Quick Actions */}
        <div className="space-y-6">
          {/* Critical Alerts */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Critical Alerts
            </h2>
            <div className="space-y-4">
              {criticalAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg"
                >
                  <div
                    className={`h-3 w-3 rounded-full mt-2 ${
                      alert.severity === "high"
                        ? "bg-red-500"
                        : alert.severity === "medium"
                        ? "bg-yellow-500"
                        : "bg-blue-500"
                    }`}
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{alert.patient}</p>
                    <p className="text-sm text-gray-600">{alert.alert}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">
              Quick Actions
            </h2>
            <div className="space-y-3">
              <Link to="/patients/new" className="block">
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
                  <div className="h-8 w-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Plus className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Add New Patient</p>
                    <p className="text-sm text-gray-500">
                      Register new patient
                    </p>
                  </div>
                </div>
              </Link>

              <Link to="/records/new" className="block">
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors">
                  <div className="h-8 w-8 bg-green-100 rounded-lg flex items-center justify-center">
                    <FileText className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Create Medical Note
                    </p>
                    <p className="text-sm text-gray-500">
                      Document consultation
                    </p>
                  </div>
                </div>
              </Link>

              <Link to="/prescriptions/new" className="block">
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors">
                  <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Heart className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Prescribe Medication
                    </p>
                    <p className="text-sm text-gray-500">
                      Digital prescription
                    </p>
                  </div>
                </div>
              </Link>

              <Link to="/labs/order" className="block">
                <div className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg hover:bg-orange-50 hover:border-orange-300 transition-colors">
                  <div className="h-8 w-8 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Activity className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Order Lab Tests</p>
                    <p className="text-sm text-gray-500">Diagnostic testing</p>
                  </div>
                </div>
              </Link>
            </div>
          </Card>

          {/* HIPAA Compliance Status */}
          <Card className="p-6 bg-green-50 border-green-200">
            <div className="flex items-start space-x-3">
              <Shield className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-green-900">
                  HIPAA Compliant
                </h4>
                <p className="text-sm text-green-700 mt-1">
                  All patient data is encrypted and access is logged. Provider
                  actions are monitored for compliance.
                </p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600">
                      Data Encryption
                    </span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600">
                      Access Logging
                    </span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-green-600">Audit Trail</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Recent Patients */}
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
              <span>View All Patients</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {recentLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : recentPatients?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentPatients.map((patient: any) => (
              <Link key={patient.id} to={`/patients/${patient.id}`}>
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-blue-600">
                        {patient.personalInfo?.firstName?.[0]}
                        {patient.personalInfo?.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {patient.personalInfo?.firstName}{" "}
                        {patient.personalInfo?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Last visit:{" "}
                        {new Date(patient.updatedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs font-medium rounded-full ${
                        patient.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {patient.status}
                    </span>
                  </div>
                </div>
              </Link>
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
  );
};

export default ProviderDashboard;
