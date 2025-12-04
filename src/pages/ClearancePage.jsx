import React from "react"; 
import { Search, Download, Printer, ClipboardCheck } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "../Components/Sidebar";
import AdminHeader from "../Components/AdminHeader";
import ActionButton from "../Components/ActionButton";

const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const apiBaseUrl = baseUrl?.endsWith("/") ? baseUrl : `${baseUrl}/`;

const fetchClearances = async () => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${apiBaseUrl}clearance`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) {
    throw new Error("Unable to fetch clearances");
  }
  const data = await response.json();
  return data?.data ?? [];
};

const ClearanceTable = () => {
  const {
    data: clearances = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["clearances"],
    queryFn: fetchClearances,
  });

  return (
    <div>
      {/* Title and welcome */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
        <h2 className="text-3xl font-bold">Clearance & Payments Management</h2>
      </div>

      {/* Search & Export Platform */}
      <div className="bg-white p-6 rounded-xl shadow-2xl mb-6 flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
        <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2 w-full md:w-1/2 shadow-lg hover:shadow-2xl transition-shadow">
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
            <option>Approved</option>
            <option>Pending</option>
            <option>Rejected</option>
          </select>
          <select className="border border-gray-300 rounded-lg px-3 py-2 text-gray-700 focus:outline-none">
            <option>Payment: All</option>
            <option>Success</option>
            <option>Pending</option>
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
              <th className="p-3 text-gray-600 font-semibold">ID</th>
              <th className="p-3 text-gray-600 font-semibold">APPLICANT</th>
              <th className="p-3 text-gray-600 font-semibold">PURPOSE</th>
              <th className="p-3 text-gray-600 font-semibold">DATE APPLIED</th>
              <th className="p-3 text-gray-600 font-semibold">
                PAYMENT STATUS
              </th>
              <th className="p-3 text-gray-600 font-semibold">
                CLEARANCE STATUS
              </th>
              <th className="p-3 text-gray-600 font-semibold">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr>
                <td colSpan="7" className="p-3 text-center text-gray-600">
                  Loading clearances...
                </td>
              </tr>
            )}
            {isError && (
              <tr>
                <td colSpan="7" className="p-3 text-center text-red-600">
                  Unable to load clearances.
                </td>
              </tr>
            )}
            {!isLoading && !isError && clearances.length === 0 && (
              <tr>
                <td colSpan="7" className="p-3 text-center text-gray-700">
                  No records found.
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              clearances.map((item) => {
                const paymentStatus = item.payment?.status;
                const lowerPayment = String(paymentStatus || "").toLowerCase();
                const paymentClass =
                  lowerPayment === "success" || lowerPayment === "paid"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-700";
                const clearanceClass =
                  item.status === "APPROVED" || item.status === "confirmed"
                    ? "bg-green-100 text-green-700"
                    : item.status === "PENDING"
                    ? "bg-yellow-100 text-yellow-700"
                    : "bg-red-100 text-red-700";
                

                const applicant = item.user_id?.personal_info ??{ given_name: "Unknown", surname: "" };
                const status = item.status || "pending";
                return (
                  <tr key={item._id || item.id || item.custom_id} className="border-b hover:bg-gray-50">
                    <td className="p-3 text-purple-600 font-medium">
                      {item.custom_id}
                    </td>
                    <td className="p-3">{`${applicant.given_name} ${applicant.surname}`}</td>
                    <td className="p-3">{item.purpose}</td>
                    <td className="p-3">{item.created_at}</td>
                    <td className="p-3">
                      <span
                        className={`${paymentClass} px-2 py-1 rounded-full text-sm font-semibold`}
                      >
                        {paymentStatus ? paymentStatus : "pending"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`${clearanceClass} px-2 py-1 rounded-full text-sm font-semibold`}
                      >
                        {status ? status === 'confirmed' ? 'APPROVED' : "Waiting for Review" : "N/A"}
                      </span>
                    </td>
                    <td className="p-3">
                      <ActionButton
                        label={status === "APPROVED" ? "View / Print" : "Review"}
                        icon={status === "APPROVED" ? Printer : ClipboardCheck}
                        variant={status === "APPROVED" ? "info" : "warning"}
                        onClick={() => {}}
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

const ClearancePage = () => {
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
        activePage="clearance"
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
          <AdminHeader title="Clearance Application" username="Admin User" />
        </div>

        <ClearanceTable />
      </main>
    </div>
  );
};


export default ClearancePage;
