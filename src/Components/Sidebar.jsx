import React from "react"
import {
  Home,
  FileText,
  AlertTriangle,
  Users,
  Bell,
  Database,
  Shield,
  Menu
} from "lucide-react";

const Sidebar = ({ activePage, isCollapsed, toggleCollapse }) => {
  const menuItems = [
    {
      label: "Dashboard Overview",
      icon: <Home size={24} />,
      path: "/AdminDashboard",
      id: "dashboard",
    },
    {
      label: "Clearance Application",
      icon: <FileText size={24} />,
      path: "/ClearancePage",
      id: "clearance",
    },
    {
      label: "Blotter Incident Reports",
      icon: <Shield size={24} />,
      path: "/BlotterPage",
      id: "blotter",
    },
    {
      label: "SOS Requests",
      icon: <AlertTriangle size={24} />,
      path: "/SOSRequestsPage",
      id: "sos",
    },
    {
      label: "Stations & Personnel",
      icon: <Users size={24} />,
      path: "/StationsAndPersonnel",
      id: "stations_personnel",
    },
    {
      label: "Manage Announcements",
      icon: <Bell size={24} />,
      path: "/AnnouncementPage",
      id: "announcements",
    },
    {
      label: "User Database",
      icon: <Database size={24} />,
      path: "/UserDatabase",
      id: "users",
    },
  ];

  const MenuItem = ({ item }) => {
    const isActive = activePage === item.id;
    
    return (
      <a
        href={item.path}
        className={`
          relative flex items-center rounded text-lg font-medium transition-colors group
          ${isCollapsed
            ? 'justify-center p-4 my-2 w-auto'
            : 'w-full px-8 py-4 gap-4'}
          ${isActive ? 'bg-[#4C2DB1]' : 'hover:bg-[#4C2DB1]'}
        `}
      >
        <span className={`${isCollapsed ? 'mx-auto' : ''} flex justify-center items-center w-6 h-6`}>
          {item.icon}
        </span>

        {!isCollapsed && <span>{item.label}</span>}
        
        {/* Tooltip - only shown when collapsed */}
        {isCollapsed && (
          <div className="absolute left-full ml-6 px-4 py-2 bg-[#4C2DB1] text-white rounded-lg shadow-lg 
                          opacity-0 invisible group-hover:opacity-100 group-hover:visible 
                          transition-all duration-200 whitespace-nowrap z-50 pointer-events-none">
            {item.label}
            {/* Arrow pointing left */}
            <div className="absolute right-full top-1/2 -translate-y-1/2 
                            border-8 border-transparent border-r-[#4C2DB1]">
            </div>
          </div>
        )}
      </a>
    );
  };

  return (
    <aside 
      className={`
        fixed top-0 left-0 h-full bg-[#1A1740] text-white flex flex-col p-6 
        transition-all duration-300 ease-in-out z-30
        ${isCollapsed ? 'w-20' : 'w-96'}
      `}
    >
      
      {/* Header Row (Logo + Toggle Button) */}
      <div className="flex items-center justify-between mb-4">
        {/* Logo */}
        <div className="flex items-center"></div>

        {/* Sidebar Toggle Button (Hamburger) */}
        <button 
          onClick={toggleCollapse} 
          className="p-1 text-white hover:text-[#4C2DB1] transition-colors"
        > 
          <Menu 
            size={24} 
            className={`transition-transform duration-300 ${isCollapsed ? 'rotate-0' : 'rotate-180'} `} 
          />
        </button>
      </div>
      
      {/* 4. Conditionally Hide Title on Collapse */}
      {!isCollapsed && (
        <div className="-mt-10 mb-8 text-center">
            <img
              src="../images/icon.png"
              alt="HAPSAY360 Logo"
              className="w-20 h-20 object-contain mx-auto"
            />
            <h1 className="text-4xl font-semibold">
                HAPSAY<span className="text-2xl font-semibold">360</span> Admin
            </h1>
            <p className="text-3x1 text-gray-300 mt-1">Barangay Service Portal</p>
        </div>
      )}
      
      <nav className="flex flex-col gap-4"> 
        {menuItems.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;