import React from "react";
import { useState } from "react";
import { Search } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "../Components/Sidebar";
import AdminHeader from "../Components/AdminHeader";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const apiBaseUrl = baseUrl?.endsWith("/") ? baseUrl : `${baseUrl}/`;

const fetchBlotters = async () => {
  const response = await fetch(`${apiBaseUrl}blotters/getBlotters`);
  if (!response.ok) {
    throw new Error("Unable to fetch blotter reports");
  }
  const data = await response.json();
  return data?.data ?? [];
};

const BlotterTable = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const {
    data: blotters = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["blotters"],
    queryFn: fetchBlotters,
  });

  const filteredBlotters = blotters.filter((blotter) => {
    const givenName = blotter?.user_id?.personal_info?.given_name || "";
    const surname = blotter?.user_id?.personal_info?.surname || "";
    const incidentType = blotter?.incident?.incident_type || "";
    const status = blotter?.status || "";

    const nameMatch = givenName?.toLowerCase().includes(searchQuery.toLowerCase()) 
    || surname?.toLowerCase().includes(searchQuery.toLowerCase());

    const typeMatch = typeFilter === "All" ? true : incidentType.toLowerCase() === typeFilter.toLowerCase()

    const statusMatch = statusFilter === "All" ? true : status.toLowerCase() === statusFilter.toLowerCase() 

    return nameMatch && typeMatch && statusMatch;
  });

  return (
    <div>
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-3xl font-bold">Blotter Incident Reports</h2>
      </div>

      {/* Search + Filters + Export */}
      <div className="bg-white p-6 rounded-xl shadow mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        {/* Search Bar */}
        <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 w-full md:w-1/2 shadow">
          <Search size={20} className="text-gray-600 mr-3" />
          <input
            type="text"
            placeholder="Search by applicant name or ID..."
            className="bg-transparent w-full focus:outline-none text-gray-700"
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Status Dropdown + Export Button */}
        <div className="flex items-center gap-4">
          <form>
            <label htmlFor="status">Status: </label>
            <select id="status" className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none"
              onChange={(e) => setStatusFilter(e.target.value)}>
              <option>All</option>
              <option>Pending</option>
              <option>Under Review</option>
              <option>Investigating</option>
              <option>Resolved</option>
              <option>Closed</option>
            </select>
          </form>

          <button className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg shadow font-medium">
            Export user list
          </button>
        </div>

        {/* Type Dropdown */}
        <div className="flex items-center gap-4">
          <form>
            <label htmlFor="type">Type: </label>
            <select id="type" className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none"
              onChange={(e) => setTypeFilter(e.target.value)}>
              <option>All</option>
              <option>Theft</option>
              <option>Robbery</option>
              <option>Assault</option>
            </select>
          </form>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-gray-600 font-semibold">ID</th>
              <th className="p-3 text-gray-600 font-semibold">REPORTER</th>
              <th className="p-3 text-gray-600 font-semibold">TYPE</th>
              <th className="p-3 text-gray-600 font-semibold">DATE FILED</th>
              <th className="p-3 text-gray-600 font-semibold">STATUS</th>
              <th className="p-3 text-gray-600 font-semibold">
                ASSIGNED OFFICER
              </th>
              <th className="p-3 text-gray-600 font-semibold">ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="7" className="p-3 text-center text-gray-600">
                  Loading blotter reports...
                </td>
              </tr>
            )}

            {isError && (
              <tr>
                <td colSpan="7" className="p-3 text-center text-red-600">
                  Unable to load reports.
                </td>
              </tr>
            )}

            {!isLoading && !isError && blotters.length === 0 && (
              <tr>
                <td colSpan="7" className="p-3 text-center text-gray-700">
                  No records found.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              filteredBlotters.map((item) => {
                // Badge colors from screenshot
                const statusClass =
                  item.status === "NEW"
                    ? "bg-red-100 text-red-600"
                    : item.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-green-100 text-green-700";

                  const reporter = item?.user_id?.personal_info ?? {given_name: "Unknown", surname: ""};
                  const assignedOfficer = item?.assigned_officer ?? {first_name: "Unknown", last_name: ""};
                  const incidentType = item?.incident?.incident_type ?? "Unknown";

                return (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-purple-600 font-medium">
                      {item._id}
                    </td>
                    <td className="p-3">{reporter.given_name} {reporter.surname}</td>
                    <td className="p-3">{incidentType}</td>
                    <td className="p-3">{item.created_at}</td>

                    <td className="p-3">
                      <span
                        className={`${statusClass} px-3 py-1 text-sm font-semibold rounded-full`}
                      >
                        {item.status}
                      </span>
                    </td>

                    <td className="p-3">{assignedOfficer.first_name } {assignedOfficer.last_name }</td>

                    <td className="p-3">
                      <button className="text-purple-600 hover:underline">
                        {item.status === "NEW"
                          ? "Assign & View"
                          : "Update Status"}
                      </button>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const BlotterPage = () => (
  <div className="flex">
    <Sidebar activePage="blotter" />
    <main className="ml-96 flex-1 min-h-screen bg-gray-100 overflow-y-auto p-10">
      <AdminHeader title="Blotter Incident Reports" username="Admin User" />
      <BlotterTable />
    </main>
  </div>
);

export default BlotterPage;
