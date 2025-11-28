import React, { useState } from "react";
import { Search, Download, UserPlus, Home, Users } from "lucide-react";
import Sidebar from "../Components/Sidebar";
import AdminHeader from "../Components/AdminHeader";
import AddPersonnelModal from "../Components/AddPersonnelModal";
import AddStationModal from "../Components/AddStationModal";
import { useQuery, useQueryClient } from "@tanstack/react-query";

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
  const response = await fetch(`${apiBaseUrl}stations/getStations`);
  if (!response.ok) {
      throw new Error("Unable to fetch stations");
  }
  const data = await response.json();
  return data?.data ?? [];
};

const OfficerDatabaseTable = () => {
  const { data: officers = [], isLoading } = useQuery({
    queryKey: ["officers"],
    queryFn: fetchOfficers,
  });

  if (isLoading) return <div>Loading officers...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Badge Number</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {officers.map((officer) => (
            <tr key={officer._id}>
              <td className="px-6 py-4">{officer.first_name} {officer.last_name}</td>
              <td className="px-6 py-4">{officer.rank}</td>
              <td className="px-6 py-4">{officer.badge_number || 'N/A'}</td>
              <td className="px-6 py-4">{officer.email}</td>
              <td className="px-6 py-4">{officer.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const StationDatabaseTable = () => {
  const { data: stations = [], isLoading } = useQuery({
    queryKey: ["stations"],
    queryFn: fetchStations,
  });

  if (isLoading) return <div>Loading stations...</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Station Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Address</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {stations.map((station) => (
            <tr key={station._id}>
              <td className="px-6 py-4">{station.name}</td>
              <td className="px-6 py-4">{station.address}</td>
              <td className="px-6 py-4">{station.contact?.phone_number || 'N/A'}</td>
              <td className="px-6 py-4">{station.contact?.email || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const StationsAndPersonnel = () => {
    console.log("StationsAndPersonnel component rendering");

    const queryClient = useQueryClient();
    
    const { data: stations = [], isLoading: stationsLoading } = useQuery({
        queryKey: ["stations"],
        queryFn: fetchStations,
    });
    const [isCollapsed, setIsCollapsed] = useState(() => {
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });

    const [currentView, setCurrentView] = useState('personnel');    
    
    // 1. New State for Modals
    const [isAddPersonnelModalOpen, setIsAddPersonnelModalOpen] = useState(false);
    const [isAddStationModalOpen, setIsAddStationModalOpen] = useState(false); // State for the station modal from your image

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
                    {/* Header: ... (same as before) */}
                    <div className="sticky -top-10 -bottom-10 pt-4 bg-gray-100 z-20 pb-4 w-full">
                        <AdminHeader 
                            title={`Stations & Personnel / ${currentTitle}`} 
                            username="Admin User" 
                        />
                    </div>

                    <div className="pt-10">
                        {/* Search, Filter, and Action Platform */}
                        <div className="bg-white p-8 rounded-xl shadow-lg mb-8">
                            
                            {/* View Toggler - ... (same as before) */}
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
                                
                                {/* Search Bar (Left Side) - ... (same as before) */}
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
                                    
                                    {/* Add Personnel Button -> OPEN MODAL */}
                                    <button 
                                        onClick={() => setIsAddPersonnelModalOpen(true)} // 3. Open personnel modal
                                        className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow whitespace-nowrap"
                                    >
                                        <UserPlus size={18} /> Add Personnel
                                    </button>
                                    
                                    {/* Add Station Button -> OPEN MODAL */}
                                    <button 
                                        onClick={() => setIsAddStationModalOpen(true)} // Open station modal
                                        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow whitespace-nowrap"
                                    >
                                        <Home size={18} /> Add Station
                                    </button>

                                    {/* Export Button - ... (same as before) */}
                                    <button className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-3 rounded-lg font-medium shadow-md hover:shadow-lg transition-shadow whitespace-nowrap">
                                        <Download size={18} /> Export PDF
                                    </button>
                                </div>
                            </div>
                            
                        </div>

                        {/* Dynamic Table Rendering - ... (same as before) */}
                        <div className="bg-white p-8 rounded-xl shadow-lg">
                        {currentView === 'personnel' ? (
                            <OfficerDatabaseTable />
                        ) : (
                            <StationDatabaseTable />
                        )}
                        </div>
                        
                    </div>
                    
                </main>
            </div>

            {/* Render Modals */}
            <AddPersonnelModal 
                isOpen={isAddPersonnelModalOpen} 
                onClose={() => setIsAddPersonnelModalOpen(false)} 
                stations={stations} // 2. Pass stations data to the modal
            />
            
            {/* The modal from your image */}
            <AddStationModal 
                isOpen={isAddStationModalOpen} 
                onClose={() => setIsAddStationModalOpen(false)}
                onStationAdded={() => {
                    queryClient.invalidateQueries(['stations']);
                }}
            />
        </>
    );
};

export default StationsAndPersonnel;