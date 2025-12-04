import React, { useState, useCallback, useRef, useEffect } from "react";
import { X, Home, Send, MapPin, Loader2, AlertTriangle, CheckCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "../utils/api";

// Fix Leaflet marker icons OUTSIDE component - runs once when module loads
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// --- OpenStreetMap Picker Component ---
const GoogleMapPicker = ({ initialPosition, onLocationSelect }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  const defaultCenter = { lat: 8.4542, lng: 124.6319 }; // Cagayan de Oro
  const center = initialPosition || defaultCenter;

  useEffect(() => {
    // Only initialize if map hasn't been created yet
    if (!mapInstanceRef.current && mapRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [center.lat, center.lng],
        initialPosition ? 15 : 13
      );

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors",
      }).addTo(mapInstanceRef.current);

      if (initialPosition) {
        markerRef.current = L.marker([center.lat, center.lng]).addTo(
          mapInstanceRef.current
        );
      }

      mapInstanceRef.current.on("click", (e) => {
        // Coordinates should be strings as per your Mongoose schema
        const lat = e.latlng.lat.toFixed(6);
        const lng = e.latlng.lng.toFixed(6);

        onLocationSelect({ lat, lng });

        if (markerRef.current) {
          markerRef.current.setLatLng(e.latlng);
        } else {
          markerRef.current = L.marker(e.latlng).addTo(mapInstanceRef.current);
        }
      });
    }

    // Cleanup on unmount
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
      }
    };
  }, []); // Empty dependency array - only run once

  return (
    <div className="w-full h-full rounded-lg shadow-inner relative">
      <div ref={mapRef} className="w-full h-full rounded-lg bg-gray-200"></div>

      <div className="absolute top-2 right-2 bg-blue-100 border border-blue-400 text-blue-700 text-xs px-2 py-1 rounded shadow z-10">
        Click map to set pin
      </div>
    </div>
  );
};

// --- AddStationModal Component ---
const AddStationModal = ({ isOpen, onClose }) => {
  const queryClient = useQueryClient();

  const [isAddStationSuccess, setIsAddStationSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone_number: "",
    email: "",
    landline: "",
    latitude: "",
    longitude: "",
  });

  const [error, setError] = useState(null);

  const addStation = async (payload) => {
    const response = await api.post("police-stations/create", payload);
    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || "Unable to add station.";
      throw new Error(errorMessage);
    }
    return data;
  };

  // API function using the correct endpoint

  const { mutate: addStationMutation, isLoading: isSubmitting, isError, error: mutationError } = useMutation({
    mutationFn: addStation,
    onSuccess: (data) => {
      console.log("Station added successfully", data);
      queryClient.invalidateQueries({ queryKey: ["stations"] });
      setIsAddStationSuccess(true);
      // Reset form
      setFormData({
        name: "",
        address: "",
        phone_number: "",
        email: "",
        landline: "",
        latitude: "",
        longitude: "",
      });
      setError(null);
      
    },
    onError: (err) => {
      console.error("Error adding station", err);
      setError(err.message);
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLocationSelect = useCallback((location) => {
    setFormData((prev) => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng,
    }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Frontend Validation
    const requiredFields = {
      name: formData.name,
      address: formData.address,
      phone_number: formData.phone_number,
      landline: formData.landline,
      latitude: formData.latitude,
      longitude: formData.longitude,
    };

    const missingFields = Object.keys(requiredFields).filter(
      (key) =>
        !requiredFields[key] ||
        (typeof requiredFields[key] === "string" &&
          requiredFields[key].trim() === "")
    );

    if (missingFields.length > 0) {
      const fieldNames = missingFields
        .map((key) => {
          if (key === "phone_number") return "Phone Number";
          if (key === "landline") return "Landline";
          if (key === "latitude" || key === "longitude")
            return "Location Pin on Map";
          return key.charAt(0).toUpperCase() + key.slice(1);
        })
        .join(", ");

      const errorMsg = `Missing required fields: ${fieldNames}`;
      setError(errorMsg);
      return;
    }

    // Submit the form
    addStationMutation(formData);
  };

  const handleClose = () => {
    setIsAddStationSuccess(false);
    onClose();
  }

  const displayLatitude = formData.latitude || "N/A";
  const displayLongitude = formData.longitude || "N/A";

  const initialMapPosition =
    formData.latitude && formData.longitude
      ? {
          lat: parseFloat(formData.latitude),
          lng: parseFloat(formData.longitude),
        }
      : null;

  // Return null AFTER all hooks have been called
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl h-full max-h-full transform transition-all duration-300 scale-100 opacity-100 flex flex-col p-4 sm:p-8">
        <div className="flex justify-between items-center mb-6 border-b pb-4 shrink-0">
          <h3 className="text-3xl font-extrabold text-yellow-700 flex items-center gap-2">
            <Home size={28} className="text-yellow-500" /> Add New Station
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            type="button"
            disabled={isSubmitting}
          >
            <X size={24} />
          </button>
        </div>

        {/* Success Message */}
        {isAddStationSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3">
            <CheckCircle className="text-green-500" size={20} />
            <div>
              <p className="text-green-800 font-medium">
                Station added successfully!
              </p>
            </div>
          </div>
        )}

        {/* Error Message */}
        {(error || isError) && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center gap-2">
            <AlertTriangle size={20} />
            <span className="font-medium">
              {error || mutationError?.message || "Unable to add station"}
            </span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="flex flex-col flex-grow min-h-0"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 flex-grow min-h-0">
            <div className="space-y-5 overflow-y-auto pr-2">
              <h4 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3">
                Station Details
              </h4>

              {/* Name (Required) */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Station Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Barangay 1 Station"
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500 transition duration-150 shadow-sm"
                />
              </div>

              {/* Address (Required) */}
              <div>
                <label
                  htmlFor="address"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Street, Barangay, City"
                  required
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500 transition duration-150 shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Phone Number (Required) */}
                <div>
                  <label
                    htmlFor="phone_number"
                    className="block text-sm font-semibold text-gray-700 mb-1"
                  >
                    Phone Number (Mobile) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    name="phone_number"
                    value={formData.phone_number}
                    onChange={handleChange}
                    placeholder="09123456789"
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500 transition duration-150 shadow-sm"
                  />
                </div>

                {/* Landline (Required) */}
                <div>
                  <label
                    htmlFor="landline"
                    className="block text-sm font-semibold text-gray-700 mb-1"
                  >
                    Landline <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    id="landline"
                    name="landline"
                    value={formData.landline}
                    onChange={handleChange}
                    placeholder="e.g. (02) 8123-4567"
                    required
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500 transition duration-150 shadow-sm"
                  />
                </div>
              </div>

              {/* Email (Optional) */}
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-semibold text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="station@example.com"
                  className="w-full border border-gray-300 rounded-lg p-3 focus:ring-yellow-500 focus:border-yellow-500 transition duration-150 shadow-sm"
                />
              </div>

              {/* Coordinates Display */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Latitude
                  </label>
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800 font-mono text-sm shadow-inner">
                    {displayLatitude}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Longitude
                  </label>
                  <div className="bg-gray-50 border border-gray-300 rounded-lg p-3 text-gray-800 font-mono text-sm shadow-inner">
                    {displayLongitude}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-5 flex flex-col h-full">
              <h4 className="text-xl font-semibold text-gray-800 border-b pb-2 mb-3 shrink-0">
                Location Pinning
              </h4>

              <div className="flex-grow min-h-96">
                <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
                  <MapPin size={18} className="text-yellow-500" /> Select
                  Station Location <span className="text-red-500">*</span>
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden shadow-md w-full h-full">
                  <GoogleMapPicker
                    initialPosition={initialMapPosition}
                    onLocationSelect={handleLocationSelect}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200 shrink-0">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-100 transition-colors shadow-sm"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-xl font-bold transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.01]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Adding Station...
                </>
              ) : (
                <>
                  <Send size={18} />
                  Add Station
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStationModal;