import React from "react";
import { Search, Download, UserPlus, Home, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "../Components/Sidebar";
import AdminHeader from "../Components/AdminHeader";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const apiBaseUrl = baseUrl?.endsWith("/") ? baseUrl : `${baseUrl}/`;

const fetchOfficers = async () => {
  const response = await fetch(`${apiBaseUrl}officers/`);
  if (!response.ok) {
    throw new Error("Unable to fetch officers");
  }
  const data = await response.json();
  return data?.data ?? [];
};

const fetchStations = async () => {
  const response = await fetch(`${apiBaseUrl}stations/`);
  if (!response.ok) {
    throw new Error("Unable to fetch stations");
  }
  const data = await response.json();
  return data?.data ?? [];
};

const OfficerDatabaseTable = () => {
  const {
    data: officers = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["officers"],
    queryFn: fetchOfficers,
  });

  return (
    <div>
      {/* Title */}
      <h2 className="text-3xl font-bold mb-6">Police Personnel Database</h2>

      {/* Table */}
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left text-gray-600 font-semibold">
              OFFICER ID
            </th>
            <th className="p-3 text-left text-gray-600 font-semibold">NAME</th>
            <th className="p-3 text-left text-gray-600 font-semibold">RANK</th>
            <th className="p-3 text-left text-gray-600 font-semibold">
              CONTACT
            </th>
            <th className="p-3 text-left text-gray-600 font-semibold">
              STATUS
            </th>
            <th className="p-3 text-left text-gray-600 font-semibold">
              STATION ASSIGNED
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
                Loading officers...
              </td>
            </tr>
          )}
          {isError && (
            <tr>
              <td colSpan="7" className="p-3 text-center text-red-600">
                Unable to load officers.
              </td>
            </tr>
          )}
          {!isLoading && !isError && officers.length === 0 && (
            <tr>
              <td colSpan="7" className="p-3 text-gray-700 text-center">
                No officers found.
              </td>
            </tr>
          )}
          {!isLoading &&
            !isError &&
            officers.map((officer) => {
              const status = officer.status ?? "Unknown";
              const statusStyleMap = {
                active: "bg-green-100 text-green-700",
                on_leave: "bg-yellow-100 text-yellow-700", // Example status
                suspended: "bg-red-100 text-red-700", // Example status
              };
              const statusClass =
                statusStyleMap[status.toLowerCase()] ??
                "bg-gray-100 text-gray-600";

              return (
                <tr key={officer._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-gray-700">{officer._id}</td>
                  <td className="p-3 text-gray-700">
                    {officer.first_name || "N/A"} {officer.last_name || ""}
                  </td>
                  <td className="p-3 text-gray-700">
                    {officer.rank || "N/A"}
                  </td>
                  <td className="p-3 text-gray-700">
                    {officer.contact?.mobile_number || "N/A"}
                  </td>
                  <td className="p-3">
                    <span
                      className={`${statusClass} px-3 py-1 rounded-full text-sm font-semibold capitalize`}
                    >
                      {status}
                    </span>
                  </td>
                  {/* NOTE: If you populate the station_id field on the backend, 
                      you can display the station name here (e.g., officer.station_id.name) */}
                  <td className="p-3 text-gray-700">
                    {officer.station_id || "Unassigned"}
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
  );
};

// --- Station Table Component (Placeholder) ---

const StationDatabaseTable = () => {
  const {
    data: stations = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["stations"],
    queryFn: fetchStations,
  });

  return (
    <div>
      {/* Title */}
      <h2 className="text-3xl font-bold mb-6">Police Station Database</h2>

      {/* Table */}
      <table className="w-full border-collapse">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left text-gray-600 font-semibold">
              STATION ID
            </th>
            <th className="p-3 text-left text-gray-600 font-semibold">NAME</th>
            <th className="p-3 text-left text-gray-600 font-semibold">
              ADDRESS
            </th>
            <th className="p-3 text-left text-gray-600 font-semibold">
              CONTACT (LANDLINE)
            </th>
            <th className="p-3 text-left text-gray-600 font-semibold">
              # OF PERSONNEL
            </th>
            <th className="p-3 text-left text-gray-600 font-semibold">
              ACTIONS
            </th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan="6" className="p-3 text-center text-gray-600">
                Loading stations...
              </td>
            </tr>
          )}
          {isError && (
            <tr>
              <td colSpan="6" className="p-3 text-center text-red-600">
                Unable to load stations.
              </td>
            </tr>
          )}
          {!isLoading && !isError && stations.length === 0 && (
            <tr>
              <td colSpan="6" className="p-3 text-gray-700 text-center">
                No stations found.
              </td>
            </tr>
          )}
          {!isLoading &&
            !isError &&
            stations.map((station) => (
              <tr key={station._id} className="border-b hover:bg-gray-50">
                <td className="p-3 text-gray-700">{station._id}</td>
                <td className="p-3 text-gray-700">{station.name || "N/A"}</td>
                <td className="p-3 text-gray-700">{station.address || "N/A"}</td>
                <td className="p-3 text-gray-700">
                  {station.contact?.landline || "N/A"}
                </td>
                <td className="p-3 text-gray-700">
                  {station.officer_IDs?.length ?? 0}
                </td>
                <td className="p-3 text-gray-700">
                  <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow">
                    View
                  </button>
                </td>
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
};


const StationsAndPersonnel = () => {
    console.log("StationsAndPersonnel component rendering");
    
    const [isCollapsed, setIsCollapsed] = React.useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });

    const [currentView, setCurrentView] = React.useState('personnel');

    const toggleCollapse = () => {
        setIsCollapsed(prev => {
            const newValue = !prev;
            localStorage.setItem('sidebarCollapsed', JSON.stringify(newValue));
            return newValue;
        });
    };

    const currentTitle = currentView === 'personnel' ? 'Personnel' : 'Stations';

    return (
        <>
            <div className="flex">
                <Sidebar
                    activePage="stations_personnel"
                    isCollapsed={isCollapsed}
                    toggleCollapse={toggleCollapse}
                />
                <main className={`
                    flex-1 h-screen overflow-y-auto bg-gray-100 p-10 
                    transition-all duration-300 
                    ${isCollapsed ? 'ml-20' : 'ml-96'}
                  `}
                >
                    {/* Header: This block uses sticky positioning and has a white background set by AdminHeader */}
                    <div className="sticky -top-10 -bottom-10 pt-4 bg-gray-100 z-20 pb-4 w-full">
                        <AdminHeader 
                            title={`Stations & Personnel / ${currentTitle}`} 
                            username="Admin User" 
                        />
                    </div>

                    <div className="pt-10">
                        {/* Search, Filter, and Action Platform */}
                        <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
                            
                            {/* View Toggler - Keep this separate above the main row */}
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
                            
                            {/* Search Bar and Actions Container - ALIGNED HORIZONTALLY */}
                            <div className="flex justify-between items-center flex-wrap gap-4"> 
                                
                                {/* Search Bar (Left Side) */}
                                <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 w-full max-w-sm shadow-lg hover:shadow-2xl transition-shadow">
                                    <Search size={20} className="text-gray-600 mr-3" />
                                    <input
                                        type="text"
                                        placeholder="Search by applicant name or ID..."
                                        className="bg-transparent focus:outline-none w-full text-gray-700"
                                    />
                                </div>

                                {/* Action Buttons (Right Side) */}
                                <div className="flex items-center gap-4 flex-wrap">
                                    
                                    {/* Add Buttons */}
                                    <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow whitespace-nowrap">
                                        <UserPlus size={18} /> Add Personnel
                                    </button>
                                    <button className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow whitespace-nowrap">
                                        <Home size={18} /> Add Station
                                    </button>

                                    {/* Export Button */}
                                    <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow whitespace-nowrap">
                                        <Download size={18} /> Export PDF
                                    </button>
                                </div>
                            </div>
                            
                        </div>

                        {/* Dynamic Table Rendering */}
                        <div className="bg-white p-8 rounded-xl shadow-lg"> {/* ADDED bg-white HERE */}
                        {currentView === 'personnel' ? (
                            <OfficerDatabaseTable />
                        ) : (
                            <StationDatabaseTable />
                        )}
                        </div>
                        
                    </div>
                    
                </main>
            </div>
        </>
    );
};

export default StationsAndPersonnel;