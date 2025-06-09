import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  User,
  FileText,
  Shield,
  Phone,
  Mail,
  Calendar,
} from "lucide-react";
import { useCreatePatient } from "../hooks/usePatients";
import { Button, Card, Input, Alert } from "../components/ui";
import { CreatePatientRequest } from "../types";
import toast from "react-hot-toast";

const CreatePatient: React.FC = () => {
  const navigate = useNavigate();
  const createPatientMutation = useCreatePatient();

  const [formData, setFormData] = useState<CreatePatientRequest>({
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
        postalCode: "",
        zipCode: "",
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
  });

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, name: "Personal Information", icon: User },
    { id: 2, name: "Medical Information", icon: FileText },
    { id: 3, name: "Review & Submit", icon: Shield },
  ];

  // Validation functions
  const validateStep1 = () => {
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

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (formData.medicalInfo?.emergencyContact) {
      if (!formData.medicalInfo.emergencyContact.name.trim()) {
        newErrors.emergencyContactName = "Emergency contact name is required";
      }
      if (!formData.medicalInfo.emergencyContact.phone.trim()) {
        newErrors.emergencyContactPhone = "Emergency contact phone is required";
      }
      if (!formData.medicalInfo.emergencyContact.relationship.trim()) {
        newErrors.emergencyContactRelationship =
          "Emergency contact relationship is required";
      }
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
      setErrors((prev) => ({
        ...prev,
        [field]: undefined,
      }));
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

    // Clear error when user starts typing
    const errorField = `emergencyContact${
      field.charAt(0).toUpperCase() + field.slice(1)
    }`;
    if (errors[errorField]) {
      setErrors((prev) => ({
        ...prev,
        [errorField]: undefined,
      }));
    }
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

  // Navigation handlers
  const handleNext = () => {
    if (currentStep === 1 && validateStep1()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateStep2()) {
      setCurrentStep(3);
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    try {
      const newPatient = await createPatientMutation.mutateAsync(formData);
      toast.success("Patient created successfully!");
      navigate(`/patients/${newPatient.id}`);
    } catch (error) {
      // Error is handled by the mutation
    }
  };

  const renderStep1 = () => (
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
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="email"
              value={formData.personalInfo.email}
              onChange={(e) =>
                handlePersonalInfoChange("email", e.target.value)
              }
              placeholder="Enter email address"
              className="pl-10"
              error={errors.email}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="tel"
              value={formData.personalInfo.phone}
              onChange={(e) =>
                handlePersonalInfoChange("phone", e.target.value)
              }
              placeholder="Enter phone number"
              className="pl-10"
              error={errors.phone}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date of Birth *
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="date"
              value={formData.personalInfo.dateOfBirth}
              onChange={(e) =>
                handlePersonalInfoChange("dateOfBirth", e.target.value)
              }
              className="pl-10"
              error={errors.dateOfBirth}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gender *
          </label>
          <select
            value={formData.personalInfo.gender}
            onChange={(e) => handlePersonalInfoChange("gender", e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 ${
              errors.gender ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
          {errors.gender && (
            <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
          )}
        </div>
      </div>

      {/* Address */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Address</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Street Address
            </label>
            <Input
              type="text"
              value={formData.personalInfo.address.street}
              onChange={(e) => handleAddressChange("street", e.target.value)}
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
                onChange={(e) => handleAddressChange("city", e.target.value)}
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
                onChange={(e) => handleAddressChange("state", e.target.value)}
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
                onChange={(e) => handleAddressChange("zipCode", e.target.value)}
                placeholder="Enter ZIP code"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Allergies
        </label>
        <Input
          type="text"
          value={formData.medicalInfo.allergies.join(", ")}
          onChange={(e) => handleArrayFieldChange("allergies", e.target.value)}
          placeholder="Enter allergies separated by commas"
        />
        <p className="mt-1 text-xs text-gray-500">
          Separate multiple allergies with commas (e.g., Penicillin, Shellfish,
          Nuts)
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
          Emergency Contact *
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <Input
              type="text"
              value={formData.medicalInfo.emergencyContact.name}
              onChange={(e) =>
                handleEmergencyContactChange("name", e.target.value)
              }
              placeholder="Contact name"
              error={errors.emergencyContactName}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Relationship *
            </label>
            <Input
              type="text"
              value={formData.medicalInfo.emergencyContact.relationship}
              onChange={(e) =>
                handleEmergencyContactChange("relationship", e.target.value)
              }
              placeholder="e.g., Spouse, Parent, Sibling"
              error={errors.emergencyContactRelationship}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone Number *
            </label>
            <Input
              type="tel"
              value={formData.medicalInfo.emergencyContact.phone}
              onChange={(e) =>
                handleEmergencyContactChange("phone", e.target.value)
              }
              placeholder="Contact phone"
              error={errors.emergencyContactPhone}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <Alert variant="info">
        Please review all the information before submitting. You can edit these
        details later if needed.
      </Alert>

      {/* Personal Information Review */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Name</p>
            <p className="font-medium">
              {formData.personalInfo.firstName} {formData.personalInfo.lastName}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="font-medium">{formData.personalInfo.email}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Phone</p>
            <p className="font-medium">{formData.personalInfo.phone}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Date of Birth</p>
            <p className="font-medium">{formData.personalInfo.dateOfBirth}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Gender</p>
            <p className="font-medium capitalize">
              {formData.personalInfo.gender}
            </p>
          </div>
          {formData.personalInfo.address.street && (
            <div>
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium">
                {formData.personalInfo.address.street}
                <br />
                {formData.personalInfo.address.city},{" "}
                {formData.personalInfo.address.state}{" "}
                {formData.personalInfo.address.zipCode}
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Medical Information Review */}
      <Card className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Medical Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {formData.medicalInfo.bloodType && (
            <div>
              <p className="text-sm text-gray-600">Blood Type</p>
              <p className="font-medium">{formData.medicalInfo.bloodType}</p>
            </div>
          )}
          {formData.medicalInfo.allergies.length > 0 && (
            <div>
              <p className="text-sm text-gray-600">Allergies</p>
              <p className="font-medium">
                {formData.medicalInfo.allergies.join(", ")}
              </p>
            </div>
          )}
          {formData.medicalInfo.medications.length > 0 && (
            <div>
              <p className="text-sm text-gray-600">Current Medications</p>
              <p className="font-medium">
                {formData.medicalInfo.medications.join(", ")}
              </p>
            </div>
          )}
          <div className="md:col-span-2">
            <p className="text-sm text-gray-600">Emergency Contact</p>
            <p className="font-medium">
              {formData.medicalInfo.emergencyContact.name} (
              {formData.medicalInfo.emergencyContact.relationship})
              <br />
              {formData.medicalInfo.emergencyContact.phone}
            </p>
          </div>
        </div>
        {formData.medicalInfo.medicalHistory && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Medical History</p>
            <p className="font-medium">{formData.medicalInfo.medicalHistory}</p>
          </div>
        )}
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
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
          <h1 className="text-3xl font-bold text-gray-900">Add New Patient</h1>
          <p className="text-gray-600 mt-2">
            Create a new patient record with personal and medical information
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center justify-center space-x-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div key={step.id} className="flex items-center">
              <div
                className={`flex items-center space-x-2 ${
                  isActive
                    ? "text-blue-600"
                    : isCompleted
                    ? "text-green-600"
                    : "text-gray-400"
                }`}
              >
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center border-2 ${
                    isActive
                      ? "border-blue-600 bg-blue-50"
                      : isCompleted
                      ? "border-green-600 bg-green-50"
                      : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">{step.name}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`hidden md:block w-24 h-px mx-4 ${
                    isCompleted ? "bg-green-600" : "bg-gray-300"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Form Content */}
      <Card className="p-8">
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <div>
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="flex items-center space-x-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>
          )}
        </div>

        <div className="flex space-x-3">
          <Button variant="outline" onClick={() => navigate("/patients")}>
            Cancel
          </Button>

          {currentStep < 3 ? (
            <Button
              variant="primary"
              onClick={handleNext}
              className="flex items-center space-x-2"
            >
              <span>Next</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={createPatientMutation.isPending}
              className="flex items-center space-x-2"
            >
              <Save className="h-4 w-4" />
              <span>
                {createPatientMutation.isPending
                  ? "Creating..."
                  : "Create Patient"}
              </span>
            </Button>
          )}
        </div>
      </div>

      {/* HIPAA Notice */}
      <Card className="p-4 bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">
              HIPAA Compliance Notice
            </h4>
            <p className="text-sm text-blue-700 mt-1">
              All patient information is encrypted and stored securely in
              compliance with HIPAA regulations. Access is logged and monitored
              for security purposes.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CreatePatient;
