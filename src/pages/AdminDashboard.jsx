import React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Home,
  FileText,
  AlertTriangle,
  Users,
  Bell,
  Database,
  Shield,
  UserCircle,
  ArrowRight,
} from "lucide-react";
import DashboardCard from "../Components/DashboardCard";
import AdminHeader from "../Components/AdminHeader";
import Sidebar from "../Components/Sidebar";
import api from "../utils/api";
import ActionButton from "../Components/ActionButton";

// Authenticated API calls - automatically includes Authorization header
const fetchUserCount = async () => {
  const response = await api.get("users/count");
  if (!response.ok) {
    throw new Error("Unable to fetch user count");
  }
  const data = await response.json();
  return data?.count ?? 0;
};

const fetchClearances = async () => {
  const response = await api.get("clearance/");
  if (!response.ok) {
    throw new Error("Unable to fetch clearances");
  }
  const data = await response.json();
  return data?.data ?? [];
};

const fetchBlotters = async () => {
  const response = await api.get("blotters/getBlotters");
  if (!response.ok) {
    throw new Error("Unable to fetch blotter reports");
  }
  const data = await response.json();
  return data?.data ?? [];
};


const DashboardCards = () => {
  const {
    data: userCount = 0,
    isLoading: isUserCountLoading,
    isError: isUserCountError,
  } = useQuery({
    queryKey: ["userCount"],
    queryFn: fetchUserCount,
  });

  const {
    data: clearances = [],
    isLoading: isClearanceLoading,
    isError: isClearanceError,
  } = useQuery({
    queryKey: ["clearances"],
    queryFn: fetchClearances,
  });

  const {
    data: blotters = [],
    isLoading: isBlotterLoading,
    isError: isBlotterError,
  } = useQuery({
    queryKey: ["blotters"],
    queryFn: fetchBlotters,
  });

  const pendingBlottersCount = blotters.filter(
    (blotter) => blotter.status.toLowerCase() === "pending"
  ).length;

  const pendingClearancesCount = clearances.filter(
    (clearance) => clearance.status === "pending"
  ).length;

  return (
    <div className="grid grid-cols-2 gap-6">
      <DashboardCard
        title={"Pending Clearances"}
        value={
          isClearanceLoading
            ? "Loading..."
            : isClearanceError
              ? "Error"
              : pendingClearancesCount
        }
        color={"#4338ca"}
        subtitle={"New Application in the last 24 hours"}
      ></DashboardCard>

      <DashboardCard
      title={"New Blotter Incidents"}
      value={
        isBlotterLoading ? "Loading..." : isBlotterError ? "Error" : pendingBlottersCount
      }
      color={"#4338ca"}
      subtitle={"Awaiting Police Review"}>
      </DashboardCard>

      <DashboardCard
      title={"Active SOS Alerts"}
      value={2}
      color={"#ef4444"}
      subtitle={"Active alerts requiring attention"}>
      </DashboardCard>

      <DashboardCard
        title={"Total Registered Users"}
        value={
          isUserCountLoading ? "Loading..." : isUserCountError ? "Error" : userCount
        }
        color={"#16a34a"}
        subtitle={"Total citizen registered in the system"}
      ></DashboardCard>
    </div>
  );
};

const LatestClearanceTable = () => {
  const {
    data: clearances = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["clearances"],
    queryFn: fetchClearances,
  });

  const renderBody = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan="4" className="p-3 text-center text-gray-600">
            Loading latest applications...
          </td>
        </tr>
      );
    }

    if (isError) {
      return (
        <tr>
          <td colSpan="4" className="p-3 text-center text-red-600">
            Unable to load applications right now.
          </td>
        </tr>
      );
    }

    if (!clearances.length) {
      return (
        <tr>
          <td colSpan="4" className="p-3 text-gray-700 text-center">
            No clearances found
          </td>
        </tr>
      );
    }

    return clearances.map((clearance) => {
      const applicant =
        clearance?.user_id?.personal_info ??
        { given_name: "Unknown", surname: "" };
      const status = clearance?.status || "pending";
      return (
        <tr key={clearance._id} className="border-b hover:bg-gray-50">
          <td className="p-3 text-gray-700">{clearance.created_at}</td>
          <td className="p-3 text-gray-700">
            {applicant.given_name} {applicant.surname}
          </td>
          <td className="p-3 text-gray-700">{clearance.purpose || "N/A"}</td>
          <td className="p-3">
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-green-100 text-green-700"
              }`}
            >
              {status}
            </span>
          </td>
        </tr>
      );
    });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg mb-8">
      <h3 className="text-2xl font-bold mb-4">Latest Clearance Applications</h3>
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left font-semibold text-gray-600">Date</th>
            <th className="p-3 text-left font-semibold text-gray-600">
              Applicant
            </th>
            <th className="p-3 text-left font-semibold text-gray-600">Purpose</th>
            <th className="p-3 text-left font-semibold text-gray-600">Status</th>
          </tr>
        </thead>
        <tbody>{renderBody()}</tbody>
      </table>
      <ActionButton
        label="View All Clearances"
        icon={ArrowRight}
        variant="link"
        size="md"
        className="mt-3"
        onClick={() => {}}
      />
    </div>
  );
};

const Announcements = () => (

  <div className="bg-white p-6 rounded-xl shadow-lg">
    <h3 className="text-2xl font-bold mb-4">Station Announcements</h3>
    <div className="flex flex-col gap-4">
      <div className="border p-4 rounded-lg hover:bg-gray-50">
        <p className="font-semibold">New PWD ID Processing Hours</p>
        <p className="text-sm text-gray-600">
          Details updated regarding the PWD field in the User table.
        </p>
        <p className="text-xs text-gray-400 mt-1">2025-11-10</p>
      </div>
      <div className="border p-4 rounded-lg hover:bg-gray-50">
        <p className="font-semibold">Barangay Security Meeting Schedule</p>
        <p className="text-sm text-gray-600">
          Mandatory attendance for all Police Officers assigned to San Jose
          Station.
        </p>
        <p className="text-xs text-gray-400 mt-1">2025-11-10</p>
      </div>
      <div className="border p-4 rounded-lg hover:bg-gray-50">
        <p className="font-semibold">New PWD ID Processing Hours</p>
        <p className="text-sm text-gray-600">
          The system will be offline for 2 hours on Friday for database updates.
        </p>
        <p className="text-xs text-gray-400 mt-1">2025-11-10</p>
      </div>
    </div>
  </div>
);

const AdminDashboard = () => {
    const [isCollapsed, setIsCollapsed] = React.useState(() => {
      const saved = localStorage.getItem('sidebarCollapsed');
      return saved ? JSON.parse(saved) : false;
    }); 
      
    const toggleCollapse = () => {
      setIsCollapsed(prev => {
          const newValue = !prev;
          localStorage.setItem('sidebarCollapsed', JSON.stringify(newValue));
          return newValue;
      });
    };
    return ( 
        <div className="flex">
            <Sidebar 
                activePage="dashboard" 
                isCollapsed={isCollapsed} 
                toggleCollapse={toggleCollapse} 
            />
    
            <main className={`
                    flex-1 h-screen overflow-y-auto bg-gray-100 p-10 
                    transition-all duration-300 ease-in-out
                    ${isCollapsed ? 'ml-20' : 'ml-96'} 
                `}
            >
                <div className="sticky -top-10 -bottom-10 pt-4 bg-gray-100 z-20 pb-4 **w-full**">
                    <AdminHeader title="Dashboard Overview" username="Admin User" />
                </div>

                <div className="pt-10">
                  <DashboardCards />
                </div>
                <div className="mt-10">
                    <LatestClearanceTable />
                    <Announcements />
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
