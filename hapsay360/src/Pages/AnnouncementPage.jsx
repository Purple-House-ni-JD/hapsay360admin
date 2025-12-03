import React from "react"; 
import { useState } from "react";
import { Search, Download, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "../Components/Sidebar";
import AdminHeader from "../Components/AdminHeader";
import api from "../utils/api";
import AnnouncementModal from "../Components/AnnouncementModal";
import AnnouncementViewModal from "../Components/AnnouncementViewModal";
import EditAnnouncementModal from "../Components/EditAnnouncementModal";

const fetchAnnouncements = async () => {
  const response = await api.get("/announcements/");
  if (!response.ok) {
    throw new Error("Unable to fetch announcements");
  }
  const data = await response.json();
  return data?.data ?? [];
};

const fetchStations = async () => {
  const response = await api.get("police-stations/getStations");
  if (!response.ok) {
    throw new Error("Unable to fetch stations");
  }
  const data = await response.json();
  return data?.data ?? [];
};

const deleteAnnouncement = async (announcementId) => {
  const response = await api.delete(`/announcements/delete/${announcementId}`);
  const data = await response.json();
  if (response.ok) {
    alert("Announcement deleted successfully");
  } else {
    alert("Unable to delete announcement: " + (data.message || ""));
  }
  return data;
};


const AnnouncementTable = () => {
  const queryClient = useQueryClient();
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);
  const [isViewAnnouncementOpen, setIsViewAnnouncementOpen] = useState(false);
  const [isEditAnnouncementOpen, setIsEditAnnouncementOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const {
    data: announcements = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["announcements"],
    queryFn: fetchAnnouncements,
  });

  const {
    data: stations = [],
  } = useQuery({
    queryKey: ["stations"],
    queryFn: fetchStations,
  });

  const { mutate: deleteAnnouncementMutation } = useMutation({
    mutationFn: deleteAnnouncement,
    onSuccess: () => {
      queryClient.invalidateQueries(["announcements"]);
    },
  });

  const handleDeleteAnnouncement = (announcementId) => {
    if (window.confirm("Are you sure you want to delete this announcement?")) {
      deleteAnnouncementMutation(announcementId);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };
  
  const [isCreateAnnouncementOpen, setIsCreateAnnouncementOpen] = useState(false);

  const openCreateAnnouncement = () => {
    setIsCreateAnnouncementOpen(true);
  };

  const closeCreateAnnouncement = () => {
    setIsCreateAnnouncementOpen(false);
  };

  const handleViewAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsViewAnnouncementOpen(true);
  };

  const handleEditAnnouncement = (announcement) => {
    setSelectedAnnouncement(announcement);
    setIsEditAnnouncementOpen(true);
  }

  const filteredAnnouncements = announcements.filter((announcement) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = query === "" || 
      announcement.title.toLowerCase().includes(query) ||
      (announcement.station_id?.name?.toLowerCase() || "").includes(query);
    
    const matchesStatus = statusFilter === "All" || 
      announcement.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <AnnouncementModal
        isOpen={isCreateAnnouncementOpen}
        onClose={closeCreateAnnouncement}
        onPosted={() => {}}
        stations={stations}
      />
      <AnnouncementViewModal 
      isOpen={isViewAnnouncementOpen} 
      onClose={() => setIsViewAnnouncementOpen(false)} 
      announcement={selectedAnnouncement} />

      <EditAnnouncementModal
        isOpen={isEditAnnouncementOpen}
        onClose={() => setIsEditAnnouncementOpen(false)}
        announcement={selectedAnnouncement}
        stations={stations}
      />
      
      {/* Title and welcome */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-3xl font-bold">Public Announcements Management</h2>
        <button onClick={openCreateAnnouncement} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-3 rounded-lg font-medium shadow-lg hover:shadow-2xl transition-shadow mt-4 md:mt-0">
          <Plus size={18} /> Create Announcement
        </button>
      </div>

      {/* Search & Export Platform */}
      <div className="bg-white p-6 rounded-xl shadow-2xl mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 w-full md:w-1/2 shadow-lg hover:shadow-2xl transition-shadow">
          <Search size={20} className="text-gray-600 mr-3" />
          <input
            type="text"
            placeholder="Search by title or station name..."
            className="bg-transparent focus:outline-none w-full text-gray-700"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <div className="flex items-center gap-4">
          <select 
            className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">Status: All</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="ARCHIVED">Archived</option>
          </select>

          {/* <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-lg font-medium shadow-lg hover:shadow-2xl transition-shadow">
            <Download size={18} /> Export data (CSV)
          </button> */}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white p-6 rounded-xl shadow-lg overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-gray-600 font-semibold">ANNOUNCEMENT ID</th>
              <th className="p-3 text-gray-600 font-semibold">TITLE</th>
              <th className="p-3 text-gray-600 font-semibold">STATION ASSIGNED</th>
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
              filteredAnnouncements.map((item) => {
                const statusClass =
                  item.status === "PUBLISHED"
                    ? "bg-green-100 text-green-700"
                    : item.status === "DRAFT"
                    ? "bg-yellow-100 text-yellow-700"
                    : item.status === "ARCHIVED"
                    ? "bg-red-100 text-red-700"
                    : "bg-gray-100 text-gray-700";
                const station = item.station_id?.name ?? "All Stations";

                return (
                  <tr key={item._id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-purple-600 font-medium">
                      {item.custom_id}
                    </td>
                    <td className="p-3 font-medium">{item.title}</td>
                    <td className="p-3">{station}</td>
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
                        <button onClick={() => handleViewAnnouncement(item)} className="text-blue-600 hover:underline">
                          View
                        </button>
                        <span className="text-gray-400">|</span>
                        <button onClick={() => handleEditAnnouncement(item)} className="text-purple-600 hover:underline">
                          Edit
                        </button>
                        <span className="text-gray-400">|</span>
                        <button onClick={() => handleDeleteAnnouncement(item._id)} className="text-red-600 hover:underline">
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
          <AdminHeader title="Manage Announcements" username="Admin User" />
        </div>

        <AnnouncementTable />
      </main>
    </div>
  );
};

export default AnnouncementPage;