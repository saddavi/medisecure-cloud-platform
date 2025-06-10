// Development Testing Component
// Component for testing AWS integration during development

import React, { useState } from "react";
import { amplifyAuthService } from "@/services/amplifyAuth";
import { apiService } from "@/services/api";

interface TestResult {
  test: string;
  status: "idle" | "running" | "success" | "error";
  message: string;
  data?: any;
}

const DevTestPanel: React.FC = () => {
  const [tests, setTests] = useState<TestResult[]>([]);
  const [testEmail, setTestEmail] = useState("test@medisecure.dev");
  const [testPassword, setTestPassword] = useState("TempPass123!");

  const updateTest = (
    testName: string,
    status: TestResult["status"],
    message: string,
    data?: any
  ) => {
    setTests((prev) => {
      const existing = prev.find((t) => t.test === testName);
      if (existing) {
        existing.status = status;
        existing.message = message;
        existing.data = data;
        return [...prev];
      } else {
        return [...prev, { test: testName, status, message, data }];
      }
    });
  };

  const testRegistration = async () => {
    updateTest("Registration", "running", "Attempting user registration...");

    try {
      const result = await amplifyAuthService.register({
        email: testEmail,
        password: testPassword,
        firstName: "Test",
        lastName: "User",
      });

      updateTest(
        "Registration",
        result.success ? "success" : "error",
        result.message,
        result
      );
    } catch (error: any) {
      updateTest(
        "Registration",
        "error",
        `Registration failed: ${error.message}`
      );
    }
  };

  const testLogin = async () => {
    updateTest("Login", "running", "Attempting user login...");

    try {
      const result = await amplifyAuthService.login({
        email: testEmail,
        password: testPassword,
      });

      updateTest(
        "Login",
        result.success ? "success" : "error",
        result.message,
        result
      );
    } catch (error: any) {
      updateTest("Login", "error", `Login failed: ${error.message}`);
    }
  };

  const testAPI = async () => {
    updateTest("API", "running", "Testing API connectivity...");

    try {
      const response = await apiService.getPatients({ limit: 1 });
      updateTest(
        "API",
        response.success ? "success" : "error",
        response.success ? "API connected successfully" : response.message,
        response
      );
    } catch (error: any) {
      updateTest("API", "error", `API test failed: ${error.message}`);
    }
  };

  if (import.meta.env.PROD) {
    return null; // Don't show in production
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg p-4 max-w-md border">
      <h3 className="font-semibold text-gray-800 mb-3">🔬 Dev Test Panel</h3>

      <div className="space-y-2 mb-4">
        <input
          type="email"
          placeholder="Test email"
          value={testEmail}
          onChange={(e) => setTestEmail(e.target.value)}
          className="w-full p-2 border rounded text-sm"
        />
        <input
          type="password"
          placeholder="Test password"
          value={testPassword}
          onChange={(e) => setTestPassword(e.target.value)}
          className="w-full p-2 border rounded text-sm"
        />
      </div>

      <div className="space-y-2 mb-4">
        <button
          onClick={testRegistration}
          className="w-full bg-blue-500 text-white p-2 rounded text-sm hover:bg-blue-600"
        >
          Test Registration
        </button>
        <button
          onClick={testLogin}
          className="w-full bg-green-500 text-white p-2 rounded text-sm hover:bg-green-600"
        >
          Test Login
        </button>
        <button
          onClick={testAPI}
          className="w-full bg-purple-500 text-white p-2 rounded text-sm hover:bg-purple-600"
        >
          Test API
        </button>
      </div>

      <div className="space-y-1 max-h-40 overflow-y-auto">
        {tests.map((test, idx) => (
          <div
            key={idx}
            className="text-xs p-2 rounded"
            style={{
              backgroundColor:
                test.status === "success"
                  ? "#dcfce7"
                  : test.status === "error"
                  ? "#fef2f2"
                  : test.status === "running"
                  ? "#fef3c7"
                  : "#f3f4f6",
            }}
          >
            <div className="font-semibold">
              {test.test}:{" "}
              {test.status === "running"
                ? "⏳"
                : test.status === "success"
                ? "✅"
                : test.status === "error"
                ? "❌"
                : "⚪"}
            </div>
            <div className="text-gray-600">{test.message}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DevTestPanel;
