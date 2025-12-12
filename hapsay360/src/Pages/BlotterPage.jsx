import React, { useState } from "react";
import { Search, UserPlus, RefreshCw, Trash, Eye, Pencil } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "../Components/Sidebar";
import AdminHeader from "../Components/AdminHeader";
import ActionButton from "../Components/ActionButton";
import ViewBlotterModal from "../Components/ViewBlotterModal";
import EditBlotterModal from "../Components/EditBlotterModal";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const apiBaseUrl = baseUrl?.endsWith("/") ? baseUrl : `${baseUrl}/`;

// Fetch blotters
const fetchBlotters = async () => {
  const token = localStorage.getItem('token') || localStorage.getItem('authToken');
  if (!token) throw new Error("No authentication token found");

  const response = await fetch(`${apiBaseUrl}blotters/getBlotters`, {
    headers: { 
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json' 
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Unable to fetch blotter reports");
  }

  const data = await response.json();
  return data?.data ?? [];
};

// Export blotters to CSV
const exportBlottersToCSV = (blotters) => {
  if (!blotters || blotters.length === 0) return;

  const headers = [
    "Blotter #",
    "Reporter",
    "Type",
    "Date Filed",
    "Status",
    "Assigned Officer",
  ];

  const rows = blotters.map((b) => [
    b.blotterNumber || b.custom_id || "",
    b.reporter?.fullName || "Unknown",
    b.incident?.type || "Unknown",
    b.created_at
      ? new Date(b.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
        })
      : "",
    b.status || "",
    b.assigned_Officer
      ? `${b.assigned_Officer.first_name || ""} ${b.assigned_Officer.last_name || ""}`.trim()
      : "Unassigned",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute(
    "download",
    `blotters_${new Date().toISOString().split("T")[0]}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const BlotterTable = () => {
  const queryClient = useQueryClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");

  // Modal states
  const [selectedBlotter, setSelectedBlotter] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data: blotters = [], isLoading, isError, error } = useQuery({
    queryKey: ["blotters"],
    queryFn: fetchBlotters,
    retry: 1,
  });

  const filteredBlotters = blotters.filter((b) => {
    const reporter = `${b?.reporter?.fullName ?? ""}`.toLowerCase();
    const type = (b?.incident?.type ?? "").toLowerCase();
    const status = (b?.status ?? "").toLowerCase();

    return (
      reporter.includes(searchQuery.toLowerCase()) &&
      (typeFilter === "All" || type === typeFilter.toLowerCase()) &&
      (statusFilter === "All" || status === statusFilter.toLowerCase())
    );
  });

  // Delete Blotter mutation
  const deleteBlotter = async (id) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    const response = await fetch(`${apiBaseUrl}blotters/delete/${id}`, {
      method: "DELETE",
      headers: { 
        "Authorization": `Bearer ${token}`, 
        "Content-Type": "application/json" 
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Failed to delete blotter");
    return data;
  };

  const { mutate: mutateDeleteBlotter } = useMutation({
    mutationFn: deleteBlotter,
    onSuccess: () => {
      queryClient.invalidateQueries(["blotters"]);
      alert("Blotter deleted successfully!");
    },
    onError: (err) => {
      alert(err.message || "Failed to delete blotter");
    },
  });

  const handleDeleteBlotter = (id) => {
    if (window.confirm("Are you sure you want to delete this blotter?")) {
      mutateDeleteBlotter(id);
    }
  };

  const handleExport = () => {
    exportBlottersToCSV(filteredBlotters);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700";
      case "Under Review":
        return "bg-blue-100 text-blue-700";
      case "Investigating":
        return "bg-orange-100 text-orange-700";
      case "Resolved":
        return "bg-green-100 text-green-700";
      case "Closed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-red-100 text-red-600";
    }
  };

  return (
    <>
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-3xl font-bold">Blotter Incident Reports</h2>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-6 rounded-xl shadow mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 w-full md:w-1/2 shadow">
          <Search size={20} className="text-gray-600 mr-3" />
          <input
            type="text"
            placeholder="Search by reporter name..."
            className="bg-transparent w-full focus:outline-none text-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-4">
          <label className="text-gray-700 font-medium">Status:</label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option>All</option>
            <option>Pending</option>
            <option>Under Review</option>
            <option>Investigating</option>
            <option>Resolved</option>
            <option>Closed</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <label className="text-gray-700 font-medium">Type:</label>
          <select
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option>All</option>
            <option>Theft</option>
            <option>Robbery</option>
            <option>Assault</option>
            <option>Accident</option>
            <option>Other</option>
          </select>
        </div>

        <button
          onClick={handleExport}
          className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg shadow font-medium transition-colors"
        >
          Export blotter list (CSV)
        </button>
      </div>

      {/* Table Section */}
      <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-gray-600 font-semibold">BLOTTER #</th>
              <th className="p-3 text-gray-600 font-semibold">REPORTER</th>
              <th className="p-3 text-gray-600 font-semibold">TYPE</th>
              <th className="p-3 text-gray-600 font-semibold">DATE FILED</th>
              <th className="p-3 text-gray-600 font-semibold">STATUS</th>
              <th className="p-3 text-gray-600 font-semibold">ASSIGNED OFFICER</th>
              <th className="p-3 text-gray-600 font-semibold">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-600">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="animate-spin" size={20} />
                    Loading blotter reports…
                  </div>
                </td>
              </tr>
            )}
            
            {isError && (
              <tr>
                <td colSpan="7" className="p-6 text-center text-red-600">
                  {error?.message || "Unable to load reports."}
                </td>
              </tr>
            )}
            
            {!isLoading && !isError && filteredBlotters.length === 0 && (
              <tr>
                <td colSpan="7" className="p-6 text-center text-gray-700">
                  No records found.
                </td>
              </tr>
            )}
            
            {!isLoading && !isError && filteredBlotters.map((item) => {
              const reporter = item?.reporter?.fullName || "Unknown";
              const officer = item?.assigned_Officer 
                ? `${item.assigned_Officer.first_name || ""} ${item.assigned_Officer.last_name || ""}`.trim()
                : "Unassigned";
              const type = item?.incident?.type ?? "Unknown";
              const dateFormatted = new Date(item.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });
              
              return (
                <tr key={item._id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="p-3 text-purple-600 font-medium">
                    {item.blotterNumber || item.custom_id}
                  </td>
                  <td className="p-3">{reporter}</td>
                  <td className="p-3">{type}</td>
                  <td className="p-3">{dateFormatted}</td>
                  <td className="p-3">
                    <span className={`${getStatusClass(item.status)} px-3 py-1 text-sm font-semibold rounded-full`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="p-3">{officer}</td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <ActionButton
                        label="View"
                        icon={Eye}
                        variant="info"
                        size="sm"
                        onClick={() => { 
                          setSelectedBlotter(item); 
                          setIsViewOpen(true); 
                        }}
                      />
                      <ActionButton
                        label="Edit"
                        icon={Pencil}
                        variant="accent"
                        size="sm"
                        onClick={() => { 
                          setSelectedBlotter(item); 
                          setIsEditOpen(true); 
                        }}
                      />
                      <ActionButton
                        label="Delete"
                        icon={Trash}
                        variant="danger"
                        size="sm"
                        onClick={() => handleDeleteBlotter(item._id)}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {isViewOpen && selectedBlotter && (
        <ViewBlotterModal
          isOpen={isViewOpen}
          onClose={() => {
            setIsViewOpen(false);
            setSelectedBlotter(null);
          }}
          blotter={selectedBlotter}
        />
      )}
      
      {isEditOpen && selectedBlotter && (
        <EditBlotterModal
          isOpen={isEditOpen}
          onClose={() => {
            setIsEditOpen(false);
            setSelectedBlotter(null);
          }}
          blotter={selectedBlotter}
        />
      )}
    </>
  );
};

const BlotterPage = () => {
  const [isCollapsed, setIsCollapsed] = useState(() => {
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
        activePage="blotter"
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
      />
      <main 
        className={`
          flex-1 h-screen overflow-y-auto bg-gray-100 p-10 
          transition-all duration-300 
          ${isCollapsed ? 'ml-20' : 'ml-96'}
        `}
      >
        <div className="sticky -top-10 -bottom-10 pt-4 bg-gray-100 z-20 pb-4 w-full">
          <AdminHeader title="Blotter Incident Reports" username="Admin User" />
        </div>

        <div className="pt-10">
          <BlotterTable />
        </div>
      </main>
    </div>
  );
};

export default BlotterPage;
