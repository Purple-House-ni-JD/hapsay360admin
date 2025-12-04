import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, AlertCircle, MapPin, Phone, User, Shield } from "lucide-react";

const apiBaseUrl = (
  import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/?$/, "/");

// Fetch single SOS request
const fetchSOSById = async (sosId) => {
  const response = await fetch(`${apiBaseUrl}sos/${sosId}`);
  if (!response.ok) throw new Error("Failed to load SOS request");
  const result = await response.json();
  return result.data;
};

// Fetch all police stations
const fetchPoliceStations = async () => {
  const response = await fetch(`${apiBaseUrl}police-stations/getStations`, {
    headers: {
      // Include auth token if your backend requires it
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });
  if (!response.ok) throw new Error("Failed to load police stations");
  const result = await response.json();
  return result.data;
};

// Update SOS request
const updateSOSApi = async ({ sosId, data }) => {
  const response = await fetch(`${apiBaseUrl}sos/${sosId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update SOS request");
  return response.json();
};

// Delete SOS request
const deleteSOSApi = async (sosId) => {
  const response = await fetch(`${apiBaseUrl}sos/${sosId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete SOS request");
  return response.json();
};

const SOSDetailsModal = ({ isOpen, onClose, sosId }) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    status: "PENDING",
    responder_station_id: "",
  });

  const {
    data: sosRequest,
    isLoading: sosLoading,
    isError: sosError,
  } = useQuery({
    queryKey: ["sos", sosId],
    queryFn: () => fetchSOSById(sosId),
    enabled: !!sosId && isOpen,
  });

  const { data: policeStations = [], isLoading: stationsLoading } = useQuery({
    queryKey: ["policeStations"],
    queryFn: fetchPoliceStations,
    enabled: isOpen,
  });

  // Update form data when SOS data is loaded
  useEffect(() => {
    if (sosRequest) {
      setFormData({
        status: sosRequest.status || "PENDING",
        responder_station_id: sosRequest.responder_station_id?._id || "",
      });
    }
  }, [sosRequest]);

  const updateMutation = useMutation({
    mutationFn: updateSOSApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["sosRequests"]);
      queryClient.invalidateQueries(["sos", sosId]);
      alert("SOS request updated successfully!");
      setIsEditing(false);
    },
    onError: (error) => {
      alert(`Error updating SOS request: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSOSApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["sosRequests"]);
      alert("SOS request deleted successfully!");
      onClose();
    },
    onError: (error) => {
      alert(`Error deleting SOS request: ${error.message}`);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    const updateData = {
      status: formData.status.toLowerCase(),
      responder_station_id: formData.responder_station_id || null,
    };
    updateMutation.mutate({ sosId, data: updateData });
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this SOS request? This action cannot be undone."
      )
    ) {
      deleteMutation.mutate(sosId);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    if (sosRequest) {
      setFormData({
        status: sosRequest.status || "PENDING",
        responder_station_id: sosRequest.responder_station_id?._id || "",
      });
    }
  };

  const openInGoogleMaps = () => {
    if (sosRequest?.location) {
      const url = `https://www.google.com/maps?q=${sosRequest.location.latitude},${sosRequest.location.longitude}`;
      window.open(url, "_blank");
    }
  };

  if (!isOpen) return null;

  const isLoading = sosLoading || stationsLoading;

  return (
    <div className="fixed inset-0 bg-transparent backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto transform transition-all duration-300">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-2xl font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle size={28} className="text-red-600" />
            {isEditing ? "Update SOS Request" : "SOS Request Details"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* STATUS */}
        {isLoading && (
          <div className="text-gray-600 bg-gray-50 border border-gray-200 px-3 py-2 rounded mb-4">
            Loading SOS request information...
          </div>
        )}

        {sosError && (
          <div className="text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded mb-4">
            Error loading SOS request.
          </div>
        )}

        {/* SOS DETAILS */}
        {sosRequest && (
          <div className="space-y-6 mb-6">
            {/* Request Information Section */}
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <h4 className="text-lg font-semibold text-red-800 mb-3 flex items-center gap-2">
                <AlertCircle size={20} />
                Emergency Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Request ID</p>
                  <p className="font-semibold text-red-700">
                    {sosRequest.custom_id || sosRequest._id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  {isEditing ? (
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ACTIVE">Active</option>
                      <option value="RESPONDING">Responding</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${
                        sosRequest.status?.toUpperCase() === "PENDING"
                          ? "bg-yellow-100 text-yellow-800"
                          : sosRequest.status?.toUpperCase() === "ACTIVE"
                          ? "bg-red-100 text-red-800"
                          : sosRequest.status?.toUpperCase() === "RESPONDING"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {sosRequest.status?.toUpperCase() || "PENDING"}
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-600">Timestamp</p>
                  <p className="font-medium">
                    {sosRequest.created_at
                      ? new Date(sosRequest.created_at).toLocaleString()
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="font-medium">
                    {sosRequest.updated_at
                      ? new Date(sosRequest.updated_at).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Caller Information Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <User size={20} />
                Caller Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Name</p>
                  <p className="font-medium">
                    {sosRequest.user_id?.personal_info
                      ? `${sosRequest.user_id.personal_info.given_name} ${sosRequest.user_id.personal_info.surname}`
                      : sosRequest.user_id?.name || "Unknown"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium flex items-center gap-2">
                    <Phone size={16} />
                    {sosRequest.user_id?.phone_number || "N/A"}
                  </p>
                </div>

                <div className="col-span-2">
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-medium text-xs text-gray-600">
                    {sosRequest.user_id?.custom_id || sosRequest.user_id?._id}
                  </p>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <MapPin size={20} />
                Location Details
              </h4>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <p className="text-sm text-gray-500">GPS Coordinates</p>
                  <p className="font-medium">
                    Lat: {sosRequest.location?.latitude?.toFixed(6)}, Lng:{" "}
                    {sosRequest.location?.longitude?.toFixed(6)}
                  </p>
                </div>

                <div>
                  <button
                    onClick={openInGoogleMaps}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium shadow-md transition flex items-center gap-2"
                  >
                    <MapPin size={18} />
                    View on Google Maps
                  </button>
                </div>
              </div>
            </div>

            {/* Responder Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Shield size={20} />
                Responding Station
              </h4>
              <div className="grid grid-cols-1 gap-4">
                {isEditing ? (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">
                      Assign Responding Station
                    </p>
                    <select
                      name="responder_station_id"
                      value={formData.responder_station_id}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Station...</option>
                      {policeStations.map((station) => (
                        <option key={station._id} value={station._id}>
                          {station.name} - {station.address}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm text-gray-500">Station</p>
                    <p className="font-medium">
                      {sosRequest.responder_station_id?.name ||
                        "Not yet assigned"}
                    </p>
                    {sosRequest.responder_station_id && (
                      <p className="text-sm text-gray-600 mt-1">
                        {sosRequest.responder_station_id.address}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={isEditing ? handleCancelEdit : onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            {isEditing ? "Cancel" : "Close"}
          </button>

          {!isEditing && (
            <>
              <button
                onClick={handleEdit}
                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium shadow-md transition"
              >
                Update Status
              </button>

              <button
                onClick={handleDelete}
                disabled={deleteMutation.isLoading}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium shadow-md transition disabled:opacity-50"
              >
                {deleteMutation.isLoading ? "Deleting..." : "Delete"}
              </button>
            </>
          )}

          {isEditing && (
            <button
              onClick={handleSave}
              disabled={updateMutation.isLoading}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-md transition disabled:opacity-50"
            >
              {updateMutation.isLoading ? "Updating..." : "Save Changes"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SOSDetailsModal;
