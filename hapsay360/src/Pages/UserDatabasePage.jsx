import React from "react";
import { Search, Download } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "../Components/Sidebar";
import AdminHeader from "../Components/AdminHeader";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const apiBaseUrl = baseUrl?.endsWith("/") ? baseUrl : `${baseUrl}/`;


// Fetch All Users. Commented by Steve
const fetchUsers = async () => {
  const response = await fetch(`${apiBaseUrl}users/`);
  if (!response.ok) {
    throw new Error("Unable to fetch users");
  }
  const data = await response.json();
  return data?.data ?? [];
};

// User Database Table
const UserDatabaseTable = () => {
  const {
    data: users = [],
    isLoading,
    isError, 
  } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });

  return (
    <div>
      {/* Title */}
      <h2 className="text-3xl font-bold mb-6">Registered User Database</h2>

      {/* Search & Export Platform */}
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <div className="bg-gray-100 p-6 rounded-xl shadow-md mb-10">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center bg-gray-200 rounded-lg px-4 py-2 w-full md:w-1/2 shadow-md hover:shadow-lg transition-shadow">
              <Search size={20} className="text-gray-600 mr-3" />
              <input
                type="text"
                placeholder="Search by applicant name or ID..."
                className="bg-transparent focus:outline-none w-full text-gray-700"
              />
            </div>

            <div className="flex items-center gap-4">
              <select className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none">
                <option>Status: All</option>
                <option>Active</option>
                <option>Suspended</option>
              </select>

              <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow">
                <Download size={18} /> Export user list
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left text-gray-600 font-semibold">
                USER ID
              </th>
              <th className="p-3 text-left text-gray-600 font-semibold">
                NAME
              </th>
              <th className="p-3 text-left text-gray-600 font-semibold">
                CONTACT
              </th>
              <th className="p-3 text-left text-gray-600 font-semibold">
                ADDRESS
              </th>
              <th className="p-3 text-left text-gray-600 font-semibold">
                ACCOUNT STATUS
              </th>
              <th className="p-3 text-left text-gray-600 font-semibold">
                LAST ACTIVITY
              </th>
              <th className="p-3 text-left text-gray-600 font-semibold">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="7" className="p-3 text-center text-gray-600">
                  Loading users...
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan="7" className="p-3 text-center text-red-600">
                  Unable to load users.
                </td>
              </tr>
            )}
            {!isLoading && !isError && users.length === 0 && (
              <tr>
                <td colSpan="7" className="p-3 text-gray-700 text-center">
                  No users found.
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              users.map((user) => {
                const personalInfo = user.personal_info ?? {};
                const address = user.address ?? {};
                const status = user.status ?? "Unknown";
                const statusStyleMap = {
                  Active: "bg-green-100 text-green-700",
                  Suspended: "bg-red-100 text-red-700",
                };
                const statusClass =
                  statusStyleMap[status] ?? "bg-gray-100 text-gray-600";

                return (
                  <tr key={user._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-gray-700">{user._id}</td>
                    <td className="p-3 text-gray-700">
                      {personalInfo.given_name || personalInfo.firstName || "N/A"}{" "}
                      {personalInfo.surname || personalInfo.lastName || ""}
                    </td>
                    <td className="p-3 text-gray-700">
                      {user.phone_number || "N/A"}
                    </td>
                    <td className="p-3 text-gray-700">
                      {(address.barangay || "N/A") +
                        ", " +
                        (address.city || "N/A")}
                    </td>
                    <td className="p-3">
                      <span
                        className={`${statusClass} px-3 py-1 rounded-full text-sm font-semibold`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="p-3 text-gray-700">
                      {user.last_activity || "N/A"}
                    </td>
                    <td className="p-3 text-gray-700">
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow">
                        View
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

const UserDatabasePage = () => {
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
    <>
      <div className="flex">
        <Sidebar
          activePage="users"
          isCollapsed={isCollapsed}
          toggleCollapse={toggleCollapse}
        />
        <main className={`
                  flex-1 h-screen overflow-y-auto bg-gray-100 p-10 
                  transition-all duration-300 
                  ${isCollapsed ? 'ml-20' : 'ml-96'}
              `}
        >
          <div className="sticky -top-10 -bottom-10 pt-4 bg-gray-100 z-20 pb-4 **w-full**">
            <AdminHeader title="Registered Users" username="Admin User" />
          </div>

          <div className="pt-10">
            <UserDatabaseTable />
          </div>
          
        </main>
      </div>
    </>
  );
};

export default UserDatabasePage;
