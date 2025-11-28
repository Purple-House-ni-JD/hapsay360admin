import React, { useState } from "react";
import { X, UserPlus, Send } from "lucide-react";

// Assuming you pass the list of stations to this modal to populate the dropdown
const AddPersonnelModal = ({ isOpen, onClose, stations = [] }) => {
  // Initial state for the new officer form
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    rank: "",
    mobileNumber: "",
    email: "",
    stationId: "", // To be selected from the stations list
  });

  if (!isOpen) {
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Submitting new personnel data:", formData);
    // TODO: Implement actual API call to register the new officer
    alert("Personnel added (Check console for data)");
    onClose(); // Close the modal after submission
    // You would typically refetch the officer data after a successful creation here.
  };

  return (
    // Modal Overlay: Changed bg-opacity-50 to bg-opacity-20 for greater transparency
    <div className="fixed inset-0 bg-white bg-opacity-70 flex justify-center items-center z-50">
      {/* Modal Content (White box in the center) */}
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100 opacity-100">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-2xl font-semibold text-indigo-700 flex items-center gap-2">
            <UserPlus size={24} /> Add New Personnel
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Name Row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g. Juan"
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Dela Cruz"
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              />
            </div>
          </div>

          {/* Rank & Contact Row */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="rank" className="block text-sm font-medium text-gray-700 mb-1">Rank</label>
              <input
                type="text"
                id="rank"
                name="rank"
                value={formData.rank}
                onChange={handleChange}
                placeholder="e.g. Police Major"
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              />
            </div>
            <div>
              <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <input
                type="tel"
                id="mobileNumber"
                name="mobileNumber"
                value={formData.mobileNumber}
                onChange={handleChange}
                placeholder="e.g. 09123456789"
                required
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              />
            </div>
          </div>

          {/* Email & Station Row */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Optional contact email"
                className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              />
            </div>
            <div>
              <label htmlFor="stationId" className="block text-sm font-medium text-gray-700 mb-1">Station Assigned</label>
              <select
                id="stationId"
                name="stationId"
                value={formData.stationId}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
              >
                <option value="" disabled>Select a Station</option>
                {stations.map((station) => (
                  <option key={station._id} value={station._id}>
                    {station.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg"
            >
              <Send size={18} /> Add Personnel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddPersonnelModal;