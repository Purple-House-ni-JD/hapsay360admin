import React, { useState } from "react";
import { Search, MapPin, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "../Components/Sidebar";
import AdminHeader from "../Components/AdminHeader";
import ActionButton from "../Components/ActionButton";
import SOSDetailsModal from "../Components/SOSDetailsModal";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const apiBaseUrl = baseUrl?.endsWith("/") ? baseUrl : `${baseUrl}/`;

const fetchSOS = async () => {
  const response = await fetch(`${apiBaseUrl}sos/`);
  if (!response.ok) throw new Error("Unable to fetch SOS requests");
  const data = await response.json();
  return data?.data ?? [];
};

const SOSRequestsTable = ({ openModal }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const {
    data: sosRequests = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["sosRequests"],
    queryFn: fetchSOS,
    refetchInterval: 10000,
  });

  const filteredData = sosRequests.filter((item) => {
    const matchesSearch =
      item.id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.caller?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ? true : item.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const openInGoogleMaps = (lat, lng) => {
    const url = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(url, "_blank");
  };

  return (
    <div>
      {/* Title */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-3xl font-bold tracking-wide">
          Real-time SOS Requests
        </h2>
      </div>

      {/* Search + Filters */}
      <div className="bg-white p-6 rounded-xl shadow-md mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 w-full md:w-1/2 shadow">
          <Search size={20} className="text-gray-600 mr-3" />
          <input
            type="text"
            placeholder="Search by Request ID or Caller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent focus:outline-none w-full text-gray-700"
          />
        </div>

        <div className="flex items-center gap-4">
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none shadow"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Status: All</option>
            <option value="PENDING">Pending</option>
            <option value="ACTIVE">Active</option>
            <option value="RESPONDING">Responding</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse"></div>
            <p className="text-red-600 font-semibold">LIVE Feed</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-gray-600 font-semibold">ID</th>
              <th className="p-3 text-gray-600 font-semibold">CALLER</th>
              <th className="p-3 text-gray-600 font-semibold">TIMESTAMP</th>
              <th className="p-3 text-gray-600 font-semibold">
                LOCATION (COORDS)
              </th>
              <th className="p-3 text-gray-600 font-semibold">STATUS</th>
              <th className="p-3 text-gray-600 font-semibold">RESPONDER</th>
              <th className="p-3 text-gray-600 font-semibold">ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="7" className="p-3 text-center text-gray-600">
                  Loading SOS requests...
                </td>
              </tr>
            )}

            {isError && (
              <tr>
                <td colSpan="7" className="p-3 text-center text-red-600">
                  Unable to load SOS requests.
                </td>
              </tr>
            )}

            {!isLoading && !isError && filteredData.length === 0 && (
              <tr>
                <td colSpan="7" className="p-3 text-center text-gray-700">
                  No SOS requests found.
                </td>
              </tr>
            )}

            {!isLoading &&
              !isError &&
              filteredData.map((item) => {
                const statusBadge =
                  item.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : item.status === "ACTIVE"
                    ? "bg-red-100 text-red-700"
                    : item.status === "RESPONDING"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700";

                return (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-purple-600 font-medium">
                      {item.id}
                    </td>
                    <td className="p-3">{item.caller}</td>
                    <td className="p-3">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="p-3 text-sm">
                      {item.lat?.toFixed(4)}, {item.lng?.toFixed(4)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`${statusBadge} px-3 py-1 rounded-full text-sm font-semibold`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-3">{item.responder}</td>
                    <td className="p-3 flex flex-wrap gap-2">
                      <ActionButton
                        label="View Details"
                        icon={Eye}
                        variant="info"
                        onClick={() => openModal(item._id || item.id)}
                      />
                      <ActionButton
                        label="View Map"
                        icon={MapPin}
                        variant="success"
                        onClick={() => openInGoogleMaps(item.lat, item.lng)}
                      />
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

const SOSRequestsPage = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSOSId, setSelectedSOSId] = useState(null);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const newValue = !prev;
      localStorage.setItem("sidebarCollapsed", JSON.stringify(newValue));
      return newValue;
    });
  };

  const openModal = (sosId) => {
    setSelectedSOSId(sosId);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSOSId(null);
  };

  return (
    <div className="flex">
      <Sidebar
        activePage="sosRequests"
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
      />

      <main
        className={`flex-1 h-screen overflow-y-auto bg-gray-100 p-10 transition-all duration-300 ease-in-out ${
          isCollapsed ? "ml-20" : "ml-96"
        }`}
      >
        <div className="sticky -top-10 z-20 bg-gray-100 pt-4 pb-4">
          <AdminHeader title="SOS Requests" username="Admin User" />
        </div>

        <SOSRequestsTable openModal={openModal} />
      </main>

      {/* Modal rendered outside the scrollable main */}
      <SOSDetailsModal
        isOpen={isModalOpen}
        onClose={closeModal}
        sosId={selectedSOSId}
      />
    </div>
  );
};

export default SOSRequestsPage;
