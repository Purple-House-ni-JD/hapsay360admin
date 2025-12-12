import React, { useEffect, useState } from "react";
import { Search, UserPlus, Home, Users, Trash, Download, Pencil, Eye } from "lucide-react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import Sidebar from "../Components/Sidebar";
import AdminHeader from "../Components/AdminHeader";
import AddPersonnelModal from "../Components/AddPersonnelModal";
import AddStationModal from "../Components/AddStationModal";
import EditPersonnel from "../Components/EditPersonnel";
import ViewPoliceStationModal from "../Components/ViewPoliceStationModal";
import ViewPersonnelModal from "../Components/ViewPersonnelModal";
import PersonnelExportPdf from "../Components/PersonnelExportPdf";
import StationsExportPdf from "../Components/StationsExportPdf";
import api from "../utils/api";
import ActionButton from "../Components/ActionButton";
import EditStationModal from "../Components/EditStationModal";

const StationsAndPersonnel = () => {
  const queryClient = useQueryClient();

  // State management
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });
  
  const [currentView, setCurrentView] = useState('personnel');
  const [searchInput, setSearchInput] = useState("");
  const [isAddStationOpen, setIsAddStationOpen] = useState(false);
  const [isAddPersonnelOpen, setIsAddPersonnelOpen] = useState(false);
  const [isEditPersonnelOpen, setIsEditPersonnelOpen] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [isViewStationOpen, setIsViewStationOpen] = useState(false);
  const [isViewPersonnelOpen, setIsViewPersonnelOpen] = useState(false);
  const [isEditStationOpen, setIsEditStationOpen] = useState(false);
  
  // NEW: Store snapshot of data when export is clicked
  const [exportData, setExportData] = useState(null);

  // Reset export data when vienw changes
  useEffect(() => {
    return () => setExportData(null);
  }, [currentView]);

  // Fetch Officers
  const fetchOfficers = async () => {
    const response = await api.get("officers/all");
    if (!response.ok) {
      throw new Error("Unable to fetch officers");
    }
    const data = await response.json();
    return data?.data ?? [];
  };

  const {
    data: officers = [],
    isLoading: isLoadingOfficers,
    isError: isErrorOfficers,
  } = useQuery({
    queryKey: ["officers"],
    queryFn: fetchOfficers,
  });

  // Fetch Stations
  const fetchStations = async () => {
    const response = await api.get("police-stations/getStations");
    if (!response.ok) {
      throw new Error("Unable to fetch stations");
    }
    const data = await response.json();
    return data?.data ?? [];
  };

  const {
    data: stations = [],
    isLoading: isLoadingStations,
    isError: isErrorStations,
  } = useQuery({
    queryKey: ["stations"],
    queryFn: fetchStations,
  });

  // Delete Officer
  const deleteOfficer = async (id) => {
    const response = await api.delete(`officers/delete/${id}`);
    const data = await response.json();
    if (response.ok) {
      alert("Officer deleted successfully");
    } else {
      alert("Unable to delete officer: " + (data.message || ""));
    }
    return data;
  };

  const deleteStation = async (id) => {
    const response = await api.delete(`police-stations/delete/${id}`);
    const data = await response.json();
    if (response.ok) {
      alert("Station deleted successfully");
    } else {
      alert("Unable to delete station: " + (data.message || ""));
    }
    return data;
  };

  const { mutate: mutateDeleteStation } = useMutation({
    mutationFn: deleteStation,
    onSuccess: () => {
      queryClient.invalidateQueries(["stations"]);
    },
  });

  const handleDeleteStation = (id) => {
    if (window.confirm("Are you sure you want to delete this station?")) {
      mutateDeleteStation(id);
    }
  };

  const { mutate: mutateDeleteOfficer } = useMutation({
    mutationFn: deleteOfficer,
    onSuccess: () => {
      queryClient.invalidateQueries(["officers"]);
    },
  });

  const handleDeleteOfficer = (id) => {
    if (window.confirm("Are you sure you want to delete this officer?")) {
      mutateDeleteOfficer(id);
    }
  };

  // Handlers
  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const newValue = !prev;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(newValue));
      return newValue;
    });
  };

  const showEditPersonnelModal = (officer) => {
    setSelectedOfficer(officer);
    setIsEditPersonnelOpen(true);
  };

  const showViewPersonnel = (officer) => {
    setSelectedOfficer(officer);
    setIsViewPersonnelOpen(true);
  };

  const showViewStation = (station) => {
    setSelectedStation(station);
    setIsViewStationOpen(true);
  };
  const showEditStationModal = (station) => {
    setSelectedStation(station);
    setIsEditStationOpen(true);
  };

  // Filter officers based on search
  const filteredOfficers = (officers || []).filter((officer) =>
    officer && `${officer.first_name} ${officer.last_name}`.toLowerCase().includes(searchInput.toLowerCase())
  );

  const filteredStations = (stations || []).filter((station) =>
    station && station.name?.toLowerCase().includes(searchInput.toLowerCase())
  );

  const currentTitle = currentView === 'personnel' ? 'Personnel' : 'Stations';

  // NEW: Handle export button click - take snapshot of current filtered data
  const handleExportClick = () => {
    if (currentView === 'personnel') {
      setExportData({ type: 'personnel', data: [...filteredOfficers] });
    } else {
      setExportData({ type: 'stations', data: [...filteredStations] });
    }
  };

  return (
    <>
      <div className="flex">
        <Sidebar
          activePage="stations"
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
          {/* Header */}
          <div className="sticky -top-10 -bottom-10 pt-4 bg-gray-100 z-20 pb-4 w-full">
            <AdminHeader
              title={`Stations & Personnel / ${currentTitle}`}
              username="Admin User"
            />
          </div>

          <div className="pt-10">
            {/* Search, Filter, and Action Platform */}
            <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
              {/* View Toggler */}
              <div className="flex justify-start mb-6 gap-4">
                <button
                  onClick={() => setCurrentView('personnel')}
                  className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-colors ${
                    currentView === 'personnel'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Users size={18} /> View Personnel
                </button>
                <button
                  onClick={() => setCurrentView('stations')}
                  className={`flex items-center gap-2 px-5 py-3 rounded-lg font-medium transition-colors ${
                    currentView === 'stations'
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <Home size={18} /> View Stations
                </button>
              </div>

              {/* Search Bar and Actions Container */}
              <div className="flex justify-between items-center flex-wrap gap-4">
                {/* Search Bar */}
                <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 w-full max-w-sm shadow-lg hover:shadow-2xl transition-shadow">
                  <Search size={20} className="text-gray-600 mr-3" />
                  <input
                    type="text"
                    placeholder={`Search ${currentView}...`}
                    className="bg-transparent focus:outline-none w-full text-gray-700"
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-4 flex-wrap">
                  <button
                    onClick={() => setIsAddPersonnelOpen(true)}
                    className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow whitespace-nowrap"
                  >
                    <UserPlus size={18} /> Add Personnel
                  </button>
                  <button
                    onClick={() => setIsAddStationOpen(true)}
                    className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow whitespace-nowrap"
                  >
                    <Home size={18} /> Add Station
                  </button>
                  
                  {/* NEW: Export button logic */}
                  {!exportData ? (
                    <button
                      onClick={handleExportClick}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow whitespace-nowrap"
                    >
                      <Download size={18} /> Export PDF
                    </button>
                  ) : (
                    exportData.type === 'personnel' ? (
                      <PersonnelExportPdf 
                        key={`personnel-${exportData.data.length}`}
                        filteredOfficers={exportData.data} 
                      />
                    ) : (
                      <StationsExportPdf 
                        key={`stations-${exportData.data.length}`}
                        filteredStations={exportData.data} 
                      />
                    )
                  )}
                </div>
              </div>
            </div>

            {/* Modals */}
            <AddPersonnelModal
              isOpen={isAddPersonnelOpen}
              onClose={() => setIsAddPersonnelOpen(false)}
              stations={stations}
            />
            <AddStationModal
              isOpen={isAddStationOpen}
              onClose={() => setIsAddStationOpen(false)}
            />
            {isEditPersonnelOpen && selectedOfficer && (
              <EditPersonnel
                onClose={() => setIsEditPersonnelOpen(false)}
                officer={selectedOfficer}
                stations={stations}
              />
            )}
            {isViewPersonnelOpen && selectedOfficer && (
              <ViewPersonnelModal
                isOpen={isViewPersonnelOpen}
                onClose={() => setIsViewPersonnelOpen(false)}
                officer={selectedOfficer}
              />
            )}
            {isViewStationOpen && selectedStation && (
              <ViewPoliceStationModal
                isOpen={isViewStationOpen}
                onClose={() => setIsViewStationOpen(false)}
                station={selectedStation}
              />
            )}
            {isEditStationOpen && selectedStation && (
              <EditStationModal
                isOpen={isEditStationOpen}
                onClose={() => setIsEditStationOpen(false)}
                selectedStation={selectedStation}
              />
            )}

            {/* Dynamic Table Rendering */}
            <div className="bg-white p-8 rounded-xl shadow-lg">
              {currentView === 'personnel' ? (
                <>
                  <h2 className="text-3xl font-bold mb-6">Police Personnel Database</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station Assigned</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {isLoadingOfficers ? (
                          <tr>
                            <td colSpan="7" className="px-6 py-4 text-center text-gray-600">
                              Loading officers...
                            </td>
                          </tr>
                        ) : isErrorOfficers ? (
                          <tr>
                            <td colSpan="7" className="px-6 py-4 text-center text-red-600">
                              Unable to load officers.
                            </td>
                          </tr>
                        ) : filteredOfficers.length === 0 ? (
                          <tr>
                            <td colSpan="7" className="px-6 py-4 text-center text-gray-600">
                              No officers found
                            </td>
                          </tr>
                        ) : (
                          filteredOfficers.map((officer) => {
                            const status = officer.status ?? "Unknown";
                            const statusStyleMap = {
                              active: "bg-green-100 text-green-700",
                              on_leave: "bg-yellow-100 text-yellow-700",
                              suspended: "bg-red-100 text-red-700",
                            };
                            const statusClass =
                              statusStyleMap[status.toLowerCase()] ??
                              "bg-gray-100 text-gray-600";

                            return (
                              <tr key={officer._id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {officer.custom_id}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {officer.first_name} {officer.last_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {officer.role || "Unassigned"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {officer.contact?.mobile_number ?? "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span
                                    className={`${statusClass} px-3 py-1 rounded-full text-xs font-semibold capitalize`}
                                  >
                                    {status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                  {officer.station_id?.name ?? "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <div className="flex gap-2">
                                    <ActionButton
                                      label="View"
                                      icon={Eye}
                                      variant="info"
                                      size="sm"
                                      onClick={() => showViewPersonnel(officer)}
                                    />
                                    <ActionButton
                                      label="Edit"
                                      icon={Pencil}
                                      variant="accent"
                                      size="sm"
                                      onClick={() => showEditPersonnelModal(officer)}
                                    />
                                    <ActionButton
                                      label="Delete"
                                      icon={Trash}
                                      variant="danger"
                                      size="sm"
                                      onClick={() => handleDeleteOfficer(officer._id)}
                                    />
                                  </div>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-3xl font-bold mb-6">Police Station Database</h2>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Station ID</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact (Landline)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"># of Personnel</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {isLoadingStations ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-4 text-center text-gray-600">
                              Loading stations...
                            </td>
                          </tr>
                        ) : isErrorStations ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-4 text-center text-red-600">
                              Unable to load stations.
                            </td>
                          </tr>
                        ) : filteredStations.length === 0 ? (
                          <tr>
                            <td colSpan="6" className="px-6 py-4 text-center text-gray-700">
                              No stations found.
                            </td>
                          </tr>
                        ) : (
                          filteredStations.map((station) => (
                            <tr key={station._id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {station.custom_id}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {station.name || "N/A"}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900">
                                {station.address || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {station.contact?.landline || "N/A"}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {station.officer_IDs?.length ?? 0}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <div className="flex gap-2">
                                  <ActionButton
                                    label="View"
                                    icon={Eye}
                                    variant="info"
                                    size="sm"
                                    onClick={() => showViewStation(station)}
                                  />
                                  <ActionButton
                                    label="Edit"
                                    icon={Pencil}
                                    variant="accent"
                                    size="sm"
                                    onClick={() => showEditStationModal(station)}
                                  />
                                  <ActionButton
                                    label="Delete"
                                    icon={Trash}
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDeleteStation(station._id)}
                                  />
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default StationsAndPersonnel;