import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import apiService from "../services/api";
import { Patient, CreatePatientRequest, UpdatePatientRequest } from "../types";
import toast from "react-hot-toast";

// Query Keys
export const patientKeys = {
  all: ["patients"] as const,
  lists: () => [...patientKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...patientKeys.lists(), { filters }] as const,
  details: () => [...patientKeys.all, "detail"] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
  search: (query: string) => [...patientKeys.all, "search", query] as const,
};

// Hooks for Patient Management

// Get all patients with pagination and filtering
export const usePatients = (
  params: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  } = {}
) => {
  return useQuery({
    queryKey: patientKeys.list(params),
    queryFn: async () => {
      const searchParams = new URLSearchParams();

      if (params.page) searchParams.append("page", params.page.toString());
      if (params.limit) searchParams.append("limit", params.limit.toString());
      if (params.search) searchParams.append("search", params.search);
      if (params.status) searchParams.append("status", params.status);
      if (params.sortBy) searchParams.append("sortBy", params.sortBy);
      if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);

      const response = await apiService.get(
        `/patients?${searchParams.toString()}`
      );
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get a single patient by ID
export const usePatient = (id: string) => {
  return useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: async () => {
      const response = await apiService.get(`/patients/${id}`);
      return response.data as Patient;
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

// Search patients
export const usePatientSearch = (query: string) => {
  return useQuery({
    queryKey: patientKeys.search(query),
    queryFn: async () => {
      const response = await apiService.get(
        `/patients/search?q=${encodeURIComponent(query)}`
      );
      return response.data;
    },
    enabled: query.length >= 2, // Only search when query is at least 2 characters
    staleTime: 2 * 60 * 1000, // 2 minutes for search results
  });
};

// Create a new patient
export const useCreatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePatientRequest) => {
      const response = await apiService.post("/patients", data);
      return response.data as Patient;
    },
    onSuccess: (newPatient) => {
      // Invalidate and refetch patients list
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });

      // Add the new patient to the cache
      queryClient.setQueryData(patientKeys.detail(newPatient.id), newPatient);

      toast.success("Patient created successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to create patient";
      toast.error(message);
    },
  });
};

// Update an existing patient
export const useUpdatePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePatientRequest;
    }) => {
      const response = await apiService.put(`/patients/${id}`, data);
      return response.data as Patient;
    },
    onSuccess: (updatedPatient) => {
      // Update the patient in the cache
      queryClient.setQueryData(
        patientKeys.detail(updatedPatient.id),
        updatedPatient
      );

      // Invalidate patients list to ensure consistency
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });

      toast.success("Patient updated successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update patient";
      toast.error(message);
    },
  });
};

// Delete a patient
export const useDeletePatient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiService.delete(`/patients/${id}`);
      return id;
    },
    onSuccess: (deletedId) => {
      // Remove the patient from cache
      queryClient.removeQueries({ queryKey: patientKeys.detail(deletedId) });

      // Invalidate patients list
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });

      toast.success("Patient deleted successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to delete patient";
      toast.error(message);
    },
  });
};

// Get patient statistics for dashboard
export const usePatientStats = () => {
  return useQuery({
    queryKey: ["patients", "stats"],
    queryFn: async () => {
      const response = await apiService.get("/patients/stats");
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

// Get recent patients activity
export const useRecentPatients = (limit: number = 10) => {
  return useQuery({
    queryKey: ["patients", "recent", limit],
    queryFn: async () => {
      const response = await apiService.get(`/patients/recent?limit=${limit}`);
      return response.data;
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
};

// Bulk operations
export const useBulkUpdatePatients = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { ids: string[]; updates: Partial<Patient> }) => {
      const response = await apiService.patch("/patients/bulk", data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all patient queries to ensure data consistency
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
      toast.success("Patients updated successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to update patients";
      toast.error(message);
    },
  });
};

// Export all patients data
export const useExportPatients = () => {
  return useMutation({
    mutationFn: async (format: "csv" | "xlsx" | "pdf") => {
      const response = await apiService.get(
        `/patients/export?format=${format}`,
        {
          responseType: "blob",
        }
      );

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `patients.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      return response.data;
    },
    onSuccess: () => {
      toast.success("Patients exported successfully");
    },
    onError: (error: any) => {
      const message =
        error.response?.data?.message || "Failed to export patients";
      toast.error(message);
    },
  });
};
