import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "../Components/Sidebar";
import AdminHeader from "../Components/AdminHeader";
import UserDetailsModal from "../Components/UserDetailsModal";
import { Search, Download } from "lucide-react";
import ActionButton from "../Components/ActionButton";
import { Eye } from "lucide-react";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const apiBaseUrl = baseUrl?.endsWith("/") ? baseUrl : `${baseUrl}/`;

// Fetch all users
const fetchUsers = async () => {
  const response = await fetch(`${apiBaseUrl}users/`);
  if (!response.ok) throw new Error("Unable to fetch users");
  const data = await response.json();
  return data?.data ?? [];
};

// Export to CSV
const exportToCSV = (users) => {
  const headers = [
    "User ID",
    "Custom ID",
    "Name",
    "Phone",
    "Email",
    "Address",
    "Status",
    "Last Activity",
  ];

  const rows = users.map((user) => [
    user._id,
    user.custom_id || "",
    `${user.personal_info?.given_name || ""} ${
      user.personal_info?.middle_name || ""
    } ${user.personal_info?.surname || ""}`.trim(),
    user.phone_number || "",
    user.email || "",
    `${user.address?.house_no || ""} ${user.address?.street || ""}, ${
      user.address?.barangay || ""
    }, ${user.address?.city || ""}, ${user.address?.province || ""}`.trim(),
    user.status || "",
    user.last_activity || "",
  ]);

  const csvContent = [
    headers.join(","),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute(
    "download",
    `users_${new Date().toISOString().split("T")[0]}.csv`
  );
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const UserDatabaseTable = ({ openModal }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const {
    data: users = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  // Filter and search users
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const personalInfo = user.personal_info ?? {};
      const fullName = `${personalInfo.given_name || ""} ${
        personalInfo.middle_name || ""
      } ${personalInfo.surname || ""}`.toLowerCase();
      const userId = (user._id || "").toLowerCase();
      const customId = (user.custom_id || "").toLowerCase();

      const matchesSearch =
        fullName.includes(searchQuery.toLowerCase()) ||
        userId.includes(searchQuery.toLowerCase()) ||
        customId.includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || user.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, searchQuery, statusFilter]);

  const handleExport = () => {
    exportToCSV(filteredUsers);
  };

  return (
    <div>
      <h2 className="text-3xl font-bold mb-6">Registered User Database</h2>

      {/* Filters + Search */}
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="bg-gray-100 p-6 rounded-xl shadow-md mb-10">
          <div className="flex flex-col md:flex-row md:justify-between gap-4">
            <div className="flex items-center bg-gray-200 rounded-lg px-4 py-2 w-full md:w-1/2 shadow-md">
              <Search size={20} className="text-gray-600 mr-3" />
              <input
                type="text"
                placeholder="Search by applicant name or ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent focus:outline-none w-full text-gray-700"
              />
            </div>

            <div className="flex items-center gap-4">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2"
              >
                <option value="All">Status: All</option>
                <option value="Active">Active</option>
                <option value="Suspended">Suspended</option>
                <option value="Inactive">Inactive</option>
              </select>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 bg-green-500 text-white px-5 py-3 rounded-lg shadow-md"
              >
                <Download size={18} /> Export user list
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600">
          Showing {filteredUsers.length} of {users.length} users
        </div>

        {/* TABLE */}
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">USER ID</th>
              <th className="p-3 text-left">NAME</th>
              <th className="p-3 text-left">CONTACT</th>
              <th className="p-3 text-left">ADDRESS</th>
              <th className="p-3 text-left">ACCOUNT STATUS</th>
              <th className="p-3 text-left">LAST ACTIVITY</th>
              <th className="p-3 text-left">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {!isLoading &&
              !isError &&
              filteredUsers.map((user) => {
                const personalInfo = user.personal_info ?? {};
                const address = user.address ?? {};

                // Determine status badge color
                let statusClasses = "";
                switch (user.status) {
                  case "Active":
                    statusClasses = "bg-green-100 text-green-800";
                    break;
                  case "Suspended":
                    statusClasses = "bg-red-100 text-red-800";
                    break;
                  case "Inactive":
                    statusClasses = "bg-gray-100 text-gray-800";
                    break;
                  default:
                    statusClasses = "bg-yellow-100 text-yellow-800";
                }

                // Use updated_at if available, else fallback to last_activity
                const lastActivity = user.updated_at || user.last_activity;

                return (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="p-3">{user.custom_id || user._id}</td>
                    <td className="p-3">
                      {personalInfo.given_name || "N/A"}{" "}
                      {personalInfo.middle_name || ""}{" "}
                      {personalInfo.surname || ""}
                    </td>
                    <td className="p-3">{user.phone_number || "N/A"}</td>
                    <td className="p-3">
                      {address.barangay || "N/A"}, {address.city || "N/A"}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${statusClasses}`}
                      >
                        {user.status || "Unknown"}
                      </span>
                    </td>
                    <td className="p-3">
                      {lastActivity
                        ? new Date(lastActivity).toLocaleDateString()
                        : "N/A"}
                    </td>
                    <td className="p-3 flex items-center gap-2">
                      <ActionButton
                        label="View"
                        variant="info"
                        size="sm"
                        icon={Eye}
                        onClick={() => openModal(user._id)}
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

const UserDatabasePage = () => {
  const [isCollapsed, setIsCollapsed] = React.useState(() => {
    const saved = localStorage.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState(null);

  const openModal = (id) => {
    setSelectedUserId(id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedUserId(null);
  };

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const newValue = !prev;
      localStorage.setItem("sidebarCollapsed", JSON.stringify(newValue));
      return newValue;
    });
  };

  return (
    <div className="flex">
      <Sidebar
        activePage="users"
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
      />

      <main
        className={`flex-1 h-screen overflow-y-auto bg-gray-100 p-10 transition-all ${
          isCollapsed ? "ml-20" : "ml-96"
        }`}
      >
        <AdminHeader title="Registered Users" username="Admin User" />

        <div className="pt-10">
          <UserDatabaseTable openModal={openModal} />
        </div>

        {/* MODAL HERE */}
        <UserDetailsModal
          isOpen={isModalOpen}
          onClose={closeModal}
          userId={selectedUserId}
        />
      </main>
    </div>
  );
};

export default UserDatabasePage;
