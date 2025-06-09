import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Download,
  User,
  FileText,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  Shield,
  AlertTriangle,
  Activity,
  Clock,
  Plus,
} from "lucide-react";
import { usePatient, useDeletePatient } from "../hooks/usePatients";
import { Button, Card, Modal, Alert } from "../components/ui";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import toast from "react-hot-toast";

const PatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { data: patient, isLoading, error } = usePatient(id!);
  const deletePatientMutation = useDeletePatient();

  const handleDelete = async () => {
    if (patient) {
      try {
        await deletePatientMutation.mutateAsync(patient.id);
        toast.success("Patient deleted successfully");
        navigate("/patients");
      } catch (error) {
        // Error is handled by the mutation
      }
    }
    setShowDeleteModal(false);
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }

    return age;
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800 border-green-200",
      inactive: "bg-gray-100 text-gray-800 border-gray-200",
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      suspended: "bg-red-100 text-red-800 border-red-200",
    };

    return (
      <span
        className={`px-3 py-1 text-sm font-medium rounded-full border ${
          styles[status as keyof typeof styles] || styles.inactive
        }`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading patient details..." />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/patients")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Patients</span>
          </Button>
        </div>
        <Alert variant="error">
          Patient not found or failed to load patient details.
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate("/patients")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Patients</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {patient.personalInfo?.firstName} {patient.personalInfo?.lastName}
            </h1>
            <p className="text-gray-600 mt-1">
              Patient ID: {patient.id} • {getStatusBadge(patient.status)}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <Button variant="outline" className="flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </Button>
          <Link to={`/patients/${patient.id}/edit`}>
            <Button variant="outline" className="flex items-center space-x-2">
              <Edit className="h-4 w-4" />
              <span>Edit</span>
            </Button>
          </Link>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center space-x-2"
          >
            <Trash2 className="h-4 w-4" />
            <span>Delete</span>
          </Button>
        </div>
      </div>

      {/* Patient Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Age</p>
              <p className="text-2xl font-bold text-gray-900">
                {patient.personalInfo?.dateOfBirth
                  ? calculateAge(patient.personalInfo.dateOfBirth)
                  : "N/A"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Blood Type</p>
              <p className="text-2xl font-bold text-gray-900">
                {patient.medicalInfo?.bloodType || "Unknown"}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Allergies</p>
              <p className="text-2xl font-bold text-gray-900">
                {patient.medicalInfo?.allergies?.length || 0}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-3">
            <div className="h-12 w-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Last Visit</p>
              <p className="text-sm font-medium text-gray-900">
                {patient.updatedAt
                  ? new Date(patient.updatedAt).toLocaleDateString()
                  : "No visits"}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Personal Information */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Personal Information</span>
              </h2>
              <Link to={`/patients/${patient.id}/edit`}>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Full Name</p>
                    <p className="font-medium text-gray-900">
                      {patient.personalInfo?.firstName}{" "}
                      {patient.personalInfo?.lastName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Date of Birth</p>
                    <p className="font-medium text-gray-900">
                      {patient.personalInfo?.dateOfBirth
                        ? new Date(
                            patient.personalInfo.dateOfBirth
                          ).toLocaleDateString()
                        : "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Gender</p>
                    <p className="font-medium text-gray-900 capitalize">
                      {patient.personalInfo?.gender || "Not specified"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-medium text-gray-900">
                      {patient.personalInfo?.email || "Not provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-medium text-gray-900">
                      {patient.personalInfo?.phone || "Not provided"}
                    </p>
                  </div>
                </div>

                {patient.personalInfo?.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-600">Address</p>
                      <p className="font-medium text-gray-900">
                        {patient.personalInfo.address.street && (
                          <>
                            {patient.personalInfo.address.street}
                            <br />
                          </>
                        )}
                        {patient.personalInfo.address.city &&
                          patient.personalInfo.address.state && (
                            <>
                              {patient.personalInfo.address.city},{" "}
                              {patient.personalInfo.address.state}
                              {patient.personalInfo.address.zipCode &&
                                ` ${patient.personalInfo.address.zipCode}`}
                            </>
                          )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Medical Information */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
                <FileText className="h-5 w-5" />
                <span>Medical Information</span>
              </h2>
              <Link to={`/patients/${patient.id}/edit`}>
                <Button variant="ghost" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            </div>

            <div className="space-y-6">
              {/* Blood Type and Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Basic Medical Info
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Blood Type</p>
                      <p className="font-medium text-gray-900">
                        {patient.medicalInfo?.bloodType || "Not specified"}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Emergency Contact
                  </h3>
                  {patient.medicalInfo?.emergencyContact ? (
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900">
                        {patient.medicalInfo.emergencyContact.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {patient.medicalInfo.emergencyContact.relationship}
                      </p>
                      <p className="text-sm text-gray-900">
                        {patient.medicalInfo.emergencyContact.phone}
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Not provided</p>
                  )}
                </div>
              </div>

              {/* Allergies */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Allergies
                </h3>
                {patient.medicalInfo?.allergies &&
                patient.medicalInfo.allergies.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.medicalInfo.allergies.map((allergy, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full"
                      >
                        {allergy}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">No known allergies</p>
                )}
              </div>

              {/* Current Medications */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Current Medications
                </h3>
                {patient.medicalInfo?.medications &&
                patient.medicalInfo.medications.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {patient.medicalInfo.medications.map(
                      (medication, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {medication}
                        </span>
                      )
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    No current medications
                  </p>
                )}
              </div>

              {/* Medical History */}
              {patient.medicalInfo?.medicalHistory && (
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">
                    Medical History
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {patient.medicalInfo.medicalHistory}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors">
                <Calendar className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    Schedule Appointment
                  </p>
                  <p className="text-sm text-gray-500">
                    Book a new appointment
                  </p>
                </div>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors">
                <Plus className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium text-gray-900">Add Medical Note</p>
                  <p className="text-sm text-gray-500">Record visit notes</p>
                </div>
              </button>

              <button className="w-full flex items-center space-x-3 p-3 text-left border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors">
                <FileText className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium text-gray-900">
                    View Medical Records
                  </p>
                  <p className="text-sm text-gray-500">Access full history</p>
                </div>
              </button>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="h-2 w-2 bg-blue-600 rounded-full mt-2"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Patient record created
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(patient.createdAt).toLocaleDateString()} at{" "}
                    {new Date(patient.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
              {patient.updatedAt && patient.updatedAt !== patient.createdAt && (
                <div className="flex items-start space-x-3">
                  <div className="h-2 w-2 bg-green-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Record updated
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(patient.updatedAt).toLocaleDateString()} at{" "}
                      {new Date(patient.updatedAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Compliance Status */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Compliance Status
            </h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">HIPAA Compliant</span>
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    Active
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Encrypted</span>
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    Yes
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Access Logged</span>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-600">
                    Monitored
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Delete Patient
          </h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete the patient record for{" "}
            <strong>
              {patient.personalInfo?.firstName} {patient.personalInfo?.lastName}
            </strong>
            ? This action cannot be undone and will permanently remove all
            associated medical records.
          </p>
          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              disabled={deletePatientMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={deletePatientMutation.isPending}
            >
              {deletePatientMutation.isPending
                ? "Deleting..."
                : "Delete Patient"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PatientDetail;
