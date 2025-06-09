import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Home,
  Users,
  Calendar,
  FileText,
  Settings,
  Shield,
  Activity,
  UserPlus,
  X,
  Stethoscope,
} from "lucide-react";
import { Button } from "../ui";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Home,
    description: "Overview and analytics",
  },
  {
    name: "Patients",
    href: "/patients",
    icon: Users,
    description: "Patient management",
  },
  {
    name: "Appointments",
    href: "/appointments",
    icon: Calendar,
    description: "Schedule and manage appointments",
  },
  {
    name: "Medical Records",
    href: "/records",
    icon: FileText,
    description: "Patient medical history",
  },
  {
    name: "Provider Dashboard",
    href: "/provider-dashboard",
    icon: Stethoscope,
    description: "Healthcare provider tools",
  },
  {
    name: "Analytics",
    href: "/analytics",
    icon: Activity,
    description: "Health analytics and reports",
  },
];

const secondaryNavigation = [
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "System configuration",
  },
  {
    name: "Security",
    href: "/security",
    icon: Shield,
    description: "HIPAA compliance and security",
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  const isActive = (href: string) => {
    return (
      location.pathname === href || location.pathname.startsWith(href + "/")
    );
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex flex-col w-64">
          <div className="flex flex-col flex-grow bg-white border-r border-gray-200 pt-5 pb-4 overflow-y-auto">
            {/* Logo */}
            <div className="flex items-center flex-shrink-0 px-6">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Shield className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    MediSecure
                  </h1>
                  <p className="text-xs text-gray-500">Cloud Platform</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-8 flex-grow flex flex-col">
              <nav className="flex-1 px-4 space-y-1">
                {/* Primary Navigation */}
                <div className="space-y-1">
                  {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={`
                          group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150
                          ${
                            isActive(item.href)
                              ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                              : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                          }
                        `}
                      >
                        <Icon
                          className={`
                            mr-3 h-5 w-5 flex-shrink-0
                            ${
                              isActive(item.href)
                                ? "text-blue-500"
                                : "text-gray-400 group-hover:text-gray-500"
                            }
                          `}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {item.description}
                          </div>
                        </div>
                      </NavLink>
                    );
                  })}
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                  <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Quick Actions
                  </h3>
                  <div className="mt-2 space-y-1">
                    <NavLink
                      to="/patients/new"
                      className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900"
                    >
                      <UserPlus className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                      Add New Patient
                    </NavLink>
                  </div>
                </div>

                {/* Secondary Navigation */}
                <div className="mt-auto pt-8">
                  <div className="space-y-1">
                    {secondaryNavigation.map((item) => {
                      const Icon = item.icon;
                      return (
                        <NavLink
                          key={item.name}
                          to={item.href}
                          className={`
                            group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-150
                            ${
                              isActive(item.href)
                                ? "bg-blue-50 text-blue-700"
                                : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                            }
                          `}
                        >
                          <Icon
                            className={`
                              mr-3 h-5 w-5 flex-shrink-0
                              ${
                                isActive(item.href)
                                  ? "text-blue-500"
                                  : "text-gray-400 group-hover:text-gray-500"
                              }
                            `}
                          />
                          {item.name}
                        </NavLink>
                      );
                    })}
                  </div>
                </div>
              </nav>
            </div>

            {/* HIPAA Compliance Badge */}
            <div className="flex-shrink-0 px-4 pb-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div className="ml-2">
                    <p className="text-xs font-medium text-green-800">
                      HIPAA Compliant
                    </p>
                    <p className="text-xs text-green-600">Secure & Encrypted</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <div
        className={`lg:hidden fixed inset-0 z-50 ${
          isOpen ? "block" : "hidden"
        }`}
      >
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75"
          onClick={onClose}
        />
        <div className="fixed inset-y-0 left-0 flex flex-col w-80 max-w-xs bg-white">
          {/* Mobile header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">MediSecure</h1>
                <p className="text-xs text-gray-500">Cloud Platform</p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Mobile navigation */}
          <div className="flex-1 overflow-y-auto">
            <nav className="px-4 py-4 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={`
                      group flex items-center px-3 py-2 text-sm font-medium rounded-lg
                      ${
                        isActive(item.href)
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    <Icon
                      className={`
                        mr-3 h-5 w-5 flex-shrink-0
                        ${
                          isActive(item.href)
                            ? "text-blue-500"
                            : "text-gray-400 group-hover:text-gray-500"
                        }
                      `}
                    />
                    {item.name}
                  </NavLink>
                );
              })}

              {/* Mobile Quick Actions */}
              <div className="mt-8">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Quick Actions
                </h3>
                <div className="mt-2">
                  <NavLink
                    to="/patients/new"
                    onClick={onClose}
                    className="group flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-lg hover:bg-gray-50 hover:text-gray-900"
                  >
                    <UserPlus className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" />
                    Add New Patient
                  </NavLink>
                </div>
              </div>

              {/* Mobile Secondary Navigation */}
              <div className="mt-8">
                {secondaryNavigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      onClick={onClose}
                      className={`
                        group flex items-center px-3 py-2 text-sm font-medium rounded-lg
                        ${
                          isActive(item.href)
                            ? "bg-blue-50 text-blue-700"
                            : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                        }
                      `}
                    >
                      <Icon
                        className={`
                          mr-3 h-5 w-5 flex-shrink-0
                          ${
                            isActive(item.href)
                              ? "text-blue-500"
                              : "text-gray-400 group-hover:text-gray-500"
                          }
                        `}
                      />
                      {item.name}
                    </NavLink>
                  );
                })}
              </div>
            </nav>
          </div>

          {/* Mobile HIPAA Badge */}
          <div className="px-4 pb-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <Shield className="h-5 w-5 text-green-600" />
                <div className="ml-2">
                  <p className="text-xs font-medium text-green-800">
                    HIPAA Compliant
                  </p>
                  <p className="text-xs text-green-600">Secure & Encrypted</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
