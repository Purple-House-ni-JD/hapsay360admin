import React from "react"; 
import { Search, Download, Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "../Components/Sidebar";
import AdminHeader from "../Components/AdminHeader";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const apiBaseUrl = baseUrl?.endsWith("/") ? baseUrl : `${baseUrl}/`;

const fetchAnnouncements = async () => {
  const response = await fetch(`${apiBaseUrl}announcements/`);
  if (!response.ok) {
    throw new Error("Unable to fetch announcements");
  }
  const data = await response.json();
  return data?.data ?? [];
};

const AnnouncementTable = () => {
  const {
    data: announcements = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  return (
    <div>
      {/* Title and welcome */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-3xl font-bold">Announcement Management</h2>
        <button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-lg font-medium shadow-lg hover:shadow-2xl transition-shadow mt-4 md:mt-0">
          <Plus size={18} /> Create Announcement
        </button>
      </div>

      {/* Search & Export Platform */}
      <div className="bg-white p-6 rounded-xl shadow-2xl mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 w-full md:w-1/2 shadow-lg hover:shadow-2xl transition-shadow">
          <Search size={20} className="text-gray-600 mr-3" />
          <input
            type="text"
            placeholder="Search by title or station ID..."
            className="bg-transparent focus:outline-none w-full text-gray-700"
          />
        </div>

        <div className="flex items-center gap-4">
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none">
            <option>Status: All</option>
            <option>Published</option>
            <option>Draft</option>
            <option>Archived</option>
          </select>

          <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-lg font-medium shadow-lg hover:shadow-2xl transition-shadow">
            <Download size={18} /> Export data (CSV)
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-gray-600 font-semibold">STATION ID</th>
              <th className="p-3 text-gray-600 font-semibold">TITLE</th>
              <th className="p-3 text-gray-600 font-semibold">AUTHOR</th>
              <th className="p-3 text-gray-600 font-semibold">DATE PUBLISHED</th>
              <th className="p-3 text-gray-600 font-semibold">STATUS</th>
              <th className="p-3 text-gray-600 font-semibold">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="6" className="p-3 text-center text-gray-600">
                  Loading announcements...
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan="6" className="p-3 text-center text-red-600">
                  Unable to load announcements.
                </td>
              </tr>
            )}
            {!isLoading && !isError && announcements.length === 0 && (
              <tr>
                <td colSpan="6" className="p-3 text-center text-gray-700">
                  No announcements found.
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              announcements.map((item) => {
                const statusClass =
                  item.status === "Published"
                    ? "bg-green-100 text-green-700"
                    : item.status === "Draft"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-gray-100 text-gray-700";

                return (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-purple-600 font-medium">
                      {item.station_id || "ALL"}
                    </td>
                    <td className="p-3 font-medium">{item.title}</td>
                    <td className="p-3">{item.author || "Admin"}</td>
                    <td className="p-3">{formatDate(item.date)}</td>
                    <td className="p-3">
                      <span
                        className={`${statusClass} px-2 py-1 rounded-full text-sm font-semibold`}
                      >
                        {item.status || "Published"}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <button className="text-blue-600 hover:underline">
                          View
                        </button>
                        <span className="text-gray-400">|</span>
                        <button className="text-purple-600 hover:underline">
                          Edit
                        </button>
                        <span className="text-gray-400">|</span>
                        <button className="text-red-600 hover:underline">
                          Delete
                        </button>
                      </div>
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

const AnnouncementPage = () => {
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
        activePage="announcements"
        isCollapsed={isCollapsed}
        toggleCollapse={toggleCollapse}
      />

      <main
        className={`
          flex-1 h-screen overflow-y-auto bg-gray-100 p-10
          transition-all duration-300 ease-in-out
          ${isCollapsed ? 'ml-20' : 'ml-96'}
        `}
      >
        {/* ---- sticky header ---- */}
        <div className="sticky -top-10 z-20 bg-gray-100 pt-4 pb-4">
          <AdminHeader title="Announcements" username="Admin User" />
        </div>

        <AnnouncementTable />
      </main>
    </div>
  );
};

export default AnnouncementPage;