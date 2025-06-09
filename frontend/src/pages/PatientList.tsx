import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Download,
  Plus,
  Edit,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Users,
  SlidersHorizontal,
} from "lucide-react";
import {
  usePatients,
  useDeletePatient,
  useExportPatients,
} from "../hooks/usePatients";
import { Button, Card, Input, Modal, Alert } from "../components/ui";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { Patient } from "../types";

const PatientList: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const pageSize = 10;

  // Queries
  const {
    data: patientsData,
    isLoading,
    error,
  } = usePatients({
    page: currentPage,
    limit: pageSize,
    search,
    status: statusFilter,
    sortBy,
    sortOrder,
  });

  const deletePatientMutation = useDeletePatient();
  const exportPatientsMutation = useExportPatients();

  const patients = patientsData?.patients || [];
  const totalPages = Math.ceil((patientsData?.total || 0) / pageSize);

  // Handlers
  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1); // Reset to first page on search
  };

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const handleSelectPatient = (patientId: string) => {
    setSelectedPatients((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleSelectAll = () => {
    if (selectedPatients.length === patients.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(patients.map((patient: Patient) => patient.id));
    }
  };

  const handleDeletePatient = (patient: Patient) => {
    setPatientToDelete(patient);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (patientToDelete) {
      try {
        await deletePatientMutation.mutateAsync(patientToDelete.id);
        setShowDeleteModal(false);
        setPatientToDelete(null);
      } catch (error) {
        // Error is handled by the mutation
      }
    }
  };

  const handleExport = (format: "csv" | "xlsx" | "pdf") => {
    exportPatientsMutation.mutate(format);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      active: "bg-green-100 text-green-800",
      inactive: "bg-gray-100 text-gray-800",
      pending: "bg-yellow-100 text-yellow-800",
      suspended: "bg-red-100 text-red-800",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${
          styles[status as keyof typeof styles] || styles.inactive
        }`}
      >
        {status}
      </span>
    );
  };

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="error">
          Failed to load patients. Please try again later.
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Patients</h1>
          <p className="text-gray-600 mt-2">
            Manage patient records and information
          </p>
        </div>
        <div className="flex space-x-3">
          <div className="relative">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export</span>
            </Button>
            {showFilters && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-10">
                <button
                  onClick={() => handleExport("csv")}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  disabled={exportPatientsMutation.isPending}
                >
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport("xlsx")}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  disabled={exportPatientsMutation.isPending}
                >
                  Export as Excel
                </button>
                <button
                  onClick={() => handleExport("pdf")}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  disabled={exportPatientsMutation.isPending}
                >
                  Export as PDF
                </button>
              </div>
            )}
          </div>
          <Link to="/patients/new">
            <Button variant="primary" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Add Patient</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search patients by name, email, or ID..."
                value={search}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <select
              value={statusFilter}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>

            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filters</span>
            </Button>
          </div>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sort By
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="createdAt">Date Created</option>
                  <option value="personalInfo.firstName">First Name</option>
                  <option value="personalInfo.lastName">Last Name</option>
                  <option value="personalInfo.email">Email</option>
                  <option value="status">Status</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) =>
                    setSortOrder(e.target.value as "asc" | "desc")
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>

              <div className="flex items-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setStatusFilter("");
                    setSortBy("createdAt");
                    setSortOrder("desc");
                    setCurrentPage(1);
                  }}
                  className="w-full"
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Results Info */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <div>
          {selectedPatients.length > 0 && (
            <span className="mr-4">
              {selectedPatients.length} patient(s) selected
            </span>
          )}
          Showing {patients.length} of {patientsData?.total || 0} patients
        </div>
        {patientsData?.total && (
          <div>
            Page {currentPage} of {totalPages}
          </div>
        )}
      </div>

      {/* Patient List */}
      <Card>
        {isLoading ? (
          <div className="p-8 text-center">
            <LoadingSpinner size="large" text="Loading patients..." />
          </div>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No patients found
            </h3>
            <p className="text-gray-500 mb-4">
              {search || statusFilter
                ? "Try adjusting your search criteria or filters"
                : "Get started by adding your first patient"}
            </p>
            {!search && !statusFilter && (
              <Link to="/patients/new">
                <Button variant="primary">Add First Patient</Button>
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedPatients.length === patients.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <div className="ml-6 grid grid-cols-12 gap-4 w-full">
                  <div className="col-span-3">
                    <button
                      onClick={() => handleSort("personalInfo.firstName")}
                      className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Patient
                    </button>
                  </div>
                  <div className="col-span-2">
                    <button
                      onClick={() => handleSort("personalInfo.email")}
                      className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Contact
                    </button>
                  </div>
                  <div className="col-span-2">
                    <button
                      onClick={() => handleSort("personalInfo.dateOfBirth")}
                      className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Age
                    </button>
                  </div>
                  <div className="col-span-2">
                    <button
                      onClick={() => handleSort("status")}
                      className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Status
                    </button>
                  </div>
                  <div className="col-span-2">
                    <button
                      onClick={() => handleSort("createdAt")}
                      className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider hover:text-gray-700"
                    >
                      Created
                    </button>
                  </div>
                  <div className="col-span-1">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-gray-200">
              {patients.map((patient: Patient) => (
                <div key={patient.id} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedPatients.includes(patient.id)}
                      onChange={() => handleSelectPatient(patient.id)}
                      className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    <div className="ml-6 grid grid-cols-12 gap-4 w-full">
                      {/* Patient Info */}
                      <div className="col-span-3">
                        <div className="flex items-center">
                          <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-blue-600">
                              {patient.personalInfo?.firstName?.[0]}
                              {patient.personalInfo?.lastName?.[0]}
                            </span>
                          </div>
                          <div className="ml-3">
                            <Link
                              to={`/patients/${patient.id}`}
                              className="text-sm font-medium text-gray-900 hover:text-blue-600"
                            >
                              {patient.personalInfo?.firstName}{" "}
                              {patient.personalInfo?.lastName}
                            </Link>
                            <p className="text-sm text-gray-500">
                              ID: {patient.id}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Contact */}
                      <div className="col-span-2">
                        <p className="text-sm text-gray-900">
                          {patient.personalInfo?.email}
                        </p>
                        <p className="text-sm text-gray-500">
                          {patient.personalInfo?.phone}
                        </p>
                      </div>

                      {/* Age */}
                      <div className="col-span-2">
                        <p className="text-sm text-gray-900">
                          {patient.personalInfo?.dateOfBirth
                            ? new Date().getFullYear() -
                              new Date(
                                patient.personalInfo.dateOfBirth
                              ).getFullYear()
                            : "N/A"}{" "}
                          years
                        </p>
                        <p className="text-sm text-gray-500">
                          {patient.personalInfo?.gender || "Not specified"}
                        </p>
                      </div>

                      {/* Status */}
                      <div className="col-span-2">
                        {getStatusBadge(patient.status)}
                      </div>

                      {/* Created Date */}
                      <div className="col-span-2">
                        <p className="text-sm text-gray-900">
                          {new Date(patient.createdAt).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-500">
                          {new Date(patient.createdAt).toLocaleTimeString()}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="col-span-1">
                        <div className="flex items-center space-x-2">
                          <Link to={`/patients/${patient.id}`}>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link to={`/patients/${patient.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePatient(patient)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Showing {(currentPage - 1) * pageSize + 1} to{" "}
            {Math.min(currentPage * pageSize, patientsData?.total || 0)} of{" "}
            {patientsData?.total || 0} results
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center space-x-1"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            <div className="flex items-center space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "primary" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10 h-10 p-0"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className="flex items-center space-x-1"
            >
              <span>Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <div className="p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Delete Patient
          </h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete the patient record for{" "}
            <strong>
              {patientToDelete?.personalInfo?.firstName}{" "}
              {patientToDelete?.personalInfo?.lastName}
            </strong>
            ? This action cannot be undone.
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
              onClick={confirmDelete}
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

export default PatientList;
