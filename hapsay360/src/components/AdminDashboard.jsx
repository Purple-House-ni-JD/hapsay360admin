import React from "react";
import {
  Home,
  FileText,
  AlertTriangle,
  Users,
  Bell,
  Database,
  Shield,
  UserCircle,
} from "lucide-react";

const Sidebar = () => (
  <aside className="fixed top-0 left-0 h-full w-96 bg-[#1A1740] text-white flex flex-col p-6">
    <div className="mb-4 flex justify-center">
      <img
        src="../images/icon.png"
        alt="HAPSAY360 Logo"
        className="w-24 h-24 object-contain"
      />
    </div>

    <div className="mb-10 text-center">
      <h1 className="text-3xl font-semibold">
        HAPSAY<span className="text-2xl font-semibold">360</span> Admin
      </h1>
      <p className="text-sm text-gray-300 mt-1">Barangay Service Portal</p>
    </div>

    <nav className="flex flex-col gap-4">
      <button className="flex items-center gap-4 px-6 py-4 text-left rounded bg-[#4C2DB1] text-lg font-medium">
        <Home size={24} /> Dashboard Overview
      </button>
      <button className="flex items-center gap-4 px-6 py-4 text-left rounded hover:bg-[#4C2DB1] text-lg font-medium">
        <FileText size={24} /> Clearance Application
      </button>
      <button className="flex items-center gap-4 px-6 py-4 text-left rounded hover:bg-[#4C2DB1] text-lg font-medium">
        <Shield size={24} /> Blotter Incident Reports
      </button>
      <button className="flex items-center gap-4 px-6 py-4 text-left rounded hover:bg-[#4C2DB1] text-lg font-medium">
        <AlertTriangle size={24} /> SOS Requests
      </button>
      <button className="flex items-center gap-4 px-6 py-4 text-left rounded hover:bg-[#4C2DB1] text-lg font-medium">
        <Users size={24} /> Stations & Personnel
      </button>
      <button className="flex items-center gap-4 px-6 py-4 text-left rounded hover:bg-[#4C2DB1] text-lg font-medium">
        <Bell size={24} /> Manage Announcements
      </button>
      <button className="flex items-center gap-4 px-6 py-4 text-left rounded hover:bg-[#4C2DB1] text-lg font-medium">
        <Database size={24} /> User Database
      </button>
    </nav>
  </aside>
);

const DashboardCards = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-12 gap-x-20 p-4">
    {/* Card 1 */}
    <div className="bg-[#4338CA] text-white p-6 rounded-2xl shadow-lg flex h-72">
      <div className="flex-1 flex flex-col justify-center gap-2">
        <p className="text-3xl font-semibold">Pending Clearances</p>
        <h2 className="text-7xl font-bold">12</h2>
        <p className="text-2xl text-gray-200">
          New applications in the last 24h
        </p>
      </div>
      <div className="flex items-start ml-4">
        <FileText size={48} className="text-white opacity-30" />
      </div>
    </div>

    {/* Card 2 */}
    <div className="bg-[#4338CA] text-white p-6 rounded-2xl shadow-lg flex h-72">
      <div className="flex-1 flex flex-col justify-center gap-2">
        <p className="text-3xl font-semibold">New Blotter Incidents</p>
        <h2 className="text-7xl font-bold">5</h2>
        <p className="text-2xl text-gray-200">Awaiting police review</p>
      </div>
      <div className="flex items-start ml-4">
        <FileText size={48} className="text-white opacity-30" />
      </div>
    </div>

    {/* Card 3 */}
    <div className="bg-[#DC2626] text-white p-6 rounded-2xl shadow-lg flex h-72">
      <div className="flex-1 flex flex-col justify-center gap-2">
        <p className="text-3xl font-semibold">Active SOS Alerts</p>
        <h2 className="text-7xl font-bold">2</h2>
        <p className="text-2xl text-gray-200">
          Active alerts requiring immediate dispatch
        </p>
      </div>
      <div className="flex items-start ml-4">
        <FileText size={48} className="text-white opacity-30" />
      </div>
    </div>

    {/* Card 4 */}
    <div className="bg-[#16A34A] text-white p-6 rounded-2xl shadow-lg flex h-72">
      <div className="flex-1 flex flex-col justify-center gap-2">
        <p className="text-3xl font-semibold">Total Registered Users</p>
        <h2 className="text-7xl font-bold">1,540</h2>
        <p className="text-2xl text-gray-200">Total citizens in the database</p>
      </div>
      <div className="flex items-start ml-4">
        <FileText size={48} className="text-white opacity-30" />
      </div>
    </div>
  </div>
);

const LatestClearanceTable = () => (
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
      <tbody>
        <tr className="border-t">
          <td className="p-3">2025-11-12</td>
          <td className="p-3">Maria S. Dela Cruz</td>
          <td className="p-3">Employment</td>
          <td className="p-3">
            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
              Employment
            </span>
          </td>
        </tr>
        <tr className="border-t">
          <td className="p-3">2025-11-12</td>
          <td className="p-3">Jose P. Rizal</td>
          <td className="p-3">Business Permit</td>
          <td className="p-3">
            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              Approved
            </span>
          </td>
        </tr>
        <tr className="border-t">
          <td className="p-3">2025-11-11</td>
          <td className="p-3">Eliza P. Santos</td>
          <td className="p-3">School Requirements</td>
          <td className="p-3">
            <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium">
              Rejected
            </span>
          </td>
        </tr>
      </tbody>
    </table>
    <p className="text-indigo-600 mt-3 font-medium cursor-pointer hover:underline">
      View All Clearances →
    </p>
  </div>
);

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

const AdminDashboard = () => (
  <div className="flex">
    <Sidebar />
    <main className="ml-96 flex-1 h-screen overflow-y-auto bg-gray-100 p-10">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-5xl font-bold text-gray-900">
            Dashboard Overview
          </h1>

          <div className="flex items-center gap-4">
            <p className="text-xl text-gray-700">
              Welcome, <span className="font-semibold">Admin User</span>
            </p>
            <button className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white px-5 py-3 rounded-full font-medium">
              <UserCircle size={20} /> Profile
            </button>
          </div>
        </div>
        <hr className="mt-6 border-gray-300" />
      </header>

      <DashboardCards />
      <div className="mt-10">
        <LatestClearanceTable />
        <Announcements />
      </div>
    </main>
  </div>
);

export default AdminDashboard;
