import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, User, FileText, Shield } from "lucide-react";
import { usePatient, useUpdatePatient } from "../hooks/usePatients";
import { Button, Card, Input, Alert } from "../components/ui";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import { UpdatePatientRequest, UpdatePatientFormData } from "../types";
import toast from "react-hot-toast";

const EditPatient: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: patient, isLoading } = usePatient(id!);
  const updatePatientMutation = useUpdatePatient();

  const [formData, setFormData] = useState<UpdatePatientFormData>({
    personalInfo: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      phoneNumber: "",
      dateOfBirth: "",
      gender: undefined,
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
        postalCode: "",
        country: "US",
      },
    },
    medicalInfo: {
      bloodType: "",
      allergies: [],
      medications: [],
      medicalHistory: "",
      emergencyContact: {
        name: "",
        relationship: "",
        phone: "",
        phoneNumber: "",
      },
    },
    status: "ACTIVE",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Populate form when patient data loads
  useEffect(() => {
    if (patient) {
      setFormData({
        personalInfo: {
          firstName: patient.personalInfo?.firstName || "",
          lastName: patient.personalInfo?.lastName || "",
          email: patient.personalInfo?.email || "",
          phone: patient.personalInfo?.phone || "",
          phoneNumber:
            patient.personalInfo?.phoneNumber ||
            patient.personalInfo?.phone ||
            "",
          dateOfBirth: patient.personalInfo?.dateOfBirth || "",
          gender: patient.personalInfo?.gender || undefined,
          address: {
            street: patient.personalInfo?.address?.street || "",
            city: patient.personalInfo?.address?.city || "",
            state: patient.personalInfo?.address?.state || "",
            zipCode: patient.personalInfo?.address?.zipCode || "",
            postalCode:
              patient.personalInfo?.address?.postalCode ||
              patient.personalInfo?.address?.zipCode ||
              "",
            country: patient.personalInfo?.address?.country || "US",
          },
        },
        medicalInfo: {
          bloodType: patient.medicalInfo?.bloodType || "",
          allergies: patient.medicalInfo?.allergies || [],
          medications: patient.medicalInfo?.medications || [],
          medicalHistory: patient.medicalInfo?.medicalHistory || "",
          emergencyContact: {
            name: patient.medicalInfo?.emergencyContact?.name || "",
            relationship:
              patient.medicalInfo?.emergencyContact?.relationship || "",
            phone: patient.medicalInfo?.emergencyContact?.phone || "",
            phoneNumber:
              patient.medicalInfo?.emergencyContact?.phoneNumber ||
              patient.medicalInfo?.emergencyContact?.phone ||
              "",
          },
        },
        status: patient.status,
      });
    }
  }, [patient]);

  // Validation
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.personalInfo.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.personalInfo.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.personalInfo.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.personalInfo.email)) {
      newErrors.email = "Email is invalid";
    }
    if (!formData.personalInfo.phone?.trim()) {
      newErrors.phone = "Phone number is required";
    }
    if (!formData.personalInfo.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }
    if (!formData.personalInfo.gender) {
      newErrors.gender = "Gender is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form field changes
  const handlePersonalInfoChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        address: {
          ...prev.personalInfo.address,
          [field]: value,
        },
      },
    }));
  };

  const handleMedicalInfoChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        [field]: value,
      },
    }));
  };

  const handleEmergencyContactChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        emergencyContact: {
          ...prev.medicalInfo.emergencyContact,
          [field]: value,
        },
      },
    }));
  };

  const handleArrayFieldChange = (
    field: "allergies" | "medications",
    value: string
  ) => {
    const items = value
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);
    setFormData((prev) => ({
      ...prev,
      medicalInfo: {
        ...prev.medicalInfo,
        [field]: items,
      },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Convert form data to API request format
    const updateData: UpdatePatientRequest = {
      personalInfo: formData.personalInfo,
      medicalInfo: formData.medicalInfo,
      status: formData.status,
    };

    try {
      await updatePatientMutation.mutateAsync({ id: id!, data: updateData });
      toast.success("Patient updated successfully!");
      navigate(`/patients/${id}`);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" text="Loading patient data..." />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="space-y-6">
        <Alert variant="error">Patient not found.</Alert>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/patients/${id}`)}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Patient</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Patient</h1>
          <p className="text-gray-600 mt-2">
            Update patient information and medical records
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <User className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Personal Information
            </h2>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  First Name *
                </label>
                <Input
                  type="text"
                  value={formData.personalInfo.firstName}
                  onChange={(e) =>
                    handlePersonalInfoChange("firstName", e.target.value)
                  }
                  placeholder="Enter first name"
                  error={errors.firstName}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Last Name *
                </label>
                <Input
                  type="text"
                  value={formData.personalInfo.lastName}
                  onChange={(e) =>
                    handlePersonalInfoChange("lastName", e.target.value)
                  }
                  placeholder="Enter last name"
                  error={errors.lastName}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <Input
                  type="email"
                  value={formData.personalInfo.email}
                  onChange={(e) =>
                    handlePersonalInfoChange("email", e.target.value)
                  }
                  placeholder="Enter email address"
                  error={errors.email}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number *
                </label>
                <Input
                  type="tel"
                  value={formData.personalInfo.phone}
                  onChange={(e) =>
                    handlePersonalInfoChange("phone", e.target.value)
                  }
                  placeholder="Enter phone number"
                  error={errors.phone}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date of Birth *
                </label>
                <Input
                  type="date"
                  value={formData.personalInfo.dateOfBirth}
                  onChange={(e) =>
                    handlePersonalInfoChange("dateOfBirth", e.target.value)
                  }
                  error={errors.dateOfBirth}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gender *
                </label>
                <select
                  value={formData.personalInfo.gender || ""}
                  onChange={(e) =>
                    handlePersonalInfoChange("gender", e.target.value)
                  }
                  className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.gender ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Select gender</option>
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                  <option value="O">Other</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    status: e.target.value as "ACTIVE" | "INACTIVE" | "PENDING",
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="PENDING">Pending</option>
              </select>
            </div>

            {/* Address */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Address
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <Input
                    type="text"
                    value={formData.personalInfo.address.street}
                    onChange={(e) =>
                      handleAddressChange("street", e.target.value)
                    }
                    placeholder="Enter street address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <Input
                      type="text"
                      value={formData.personalInfo.address.city}
                      onChange={(e) =>
                        handleAddressChange("city", e.target.value)
                      }
                      placeholder="Enter city"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State
                    </label>
                    <Input
                      type="text"
                      value={formData.personalInfo.address.state}
                      onChange={(e) =>
                        handleAddressChange("state", e.target.value)
                      }
                      placeholder="Enter state"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZIP Code
                    </label>
                    <Input
                      type="text"
                      value={formData.personalInfo.address.zipCode}
                      onChange={(e) =>
                        handleAddressChange("zipCode", e.target.value)
                      }
                      placeholder="Enter ZIP code"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Medical Information */}
        <Card className="p-6">
          <div className="flex items-center space-x-2 mb-6">
            <FileText className="h-5 w-5 text-gray-600" />
            <h2 className="text-xl font-semibold text-gray-900">
              Medical Information
            </h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Blood Type
              </label>
              <select
                value={formData.medicalInfo.bloodType}
                onChange={(e) =>
                  handleMedicalInfoChange("bloodType", e.target.value)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select blood type</option>
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Allergies
              </label>
              <Input
                type="text"
                value={formData.medicalInfo.allergies.join(", ")}
                onChange={(e) =>
                  handleArrayFieldChange("allergies", e.target.value)
                }
                placeholder="Enter allergies separated by commas"
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate multiple allergies with commas (e.g., Penicillin,
                Shellfish, Nuts)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Medications
              </label>
              <Input
                type="text"
                value={formData.medicalInfo.medications.join(", ")}
                onChange={(e) =>
                  handleArrayFieldChange("medications", e.target.value)
                }
                placeholder="Enter current medications separated by commas"
              />
              <p className="mt-1 text-xs text-gray-500">
                Separate multiple medications with commas
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Medical History
              </label>
              <textarea
                value={formData.medicalInfo.medicalHistory}
                onChange={(e) =>
                  handleMedicalInfoChange("medicalHistory", e.target.value)
                }
                placeholder="Enter relevant medical history"
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Emergency Contact */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Emergency Contact
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Name
                  </label>
                  <Input
                    type="text"
                    value={formData.medicalInfo.emergencyContact.name}
                    onChange={(e) =>
                      handleEmergencyContactChange("name", e.target.value)
                    }
                    placeholder="Contact name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Relationship
                  </label>
                  <Input
                    type="text"
                    value={formData.medicalInfo.emergencyContact.relationship}
                    onChange={(e) =>
                      handleEmergencyContactChange(
                        "relationship",
                        e.target.value
                      )
                    }
                    placeholder="e.g., Spouse, Parent, Sibling"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    value={formData.medicalInfo.emergencyContact.phone}
                    onChange={(e) =>
                      handleEmergencyContactChange("phone", e.target.value)
                    }
                    placeholder="Contact phone"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-between">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/patients/${id}`)}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            disabled={updatePatientMutation.isPending}
            className="flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>
              {updatePatientMutation.isPending ? "Saving..." : "Save Changes"}
            </span>
          </Button>
        </div>
      </form>

      {/* HIPAA Notice */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">
              HIPAA Compliance Notice
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              All patient information updates are encrypted and logged for
              security purposes. Changes are tracked and monitored in compliance
              with HIPAA regulations.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EditPatient;
