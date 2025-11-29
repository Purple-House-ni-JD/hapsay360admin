import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";

const Modal = ({ onClose, maxWidth, children }) => {
    return (
        <div 
            className="fixed inset-0 bg-opacity-80 backdrop-blur-sm flex justify-center items-center z-50"
            onClick={onClose} 
        >
            <div 
                className={`relative ${maxWidth || 'max-w-2xl'} w-full mx-4`}
                onClick={(e) => e.stopPropagation()} 
            >
                {children}
            </div>
        </div>
    );
};

const EditStationModal = ({ station, onClose }) => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    const apiBaseUrl = baseUrl?.endsWith("/") ? baseUrl : `${baseUrl}/`;

    const queryClient = useQueryClient();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [form, setForm] = useState({
        name: station.name || "",
        address: station.address || "",
        phone_number: station.contact?.phone_number || "",
        email: station.contact?.email || "",
        landline: station.contact?.landline || "",
        latitude: station.location?.latitude || "",
        longitude: station.location?.longitude || "",
    });
    
    const updateStation = async (payload) => {
        const response = await fetch(`${apiBaseUrl}stations/update/${station._id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error(`Server error. Status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || data.error || "Unable to update station.");
        }
        
        return data;
    };

    const deleteStation = async () => {
        const response = await fetch(`${apiBaseUrl}stations/${station._id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            throw new Error(`Server error. Status: ${response.status}`);
        }

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || data.error || "Unable to delete station.");
        }
        
        return data;
    };

    const updateMutation = useMutation({
        mutationFn: updateStation,
        onSuccess: (data) => {
            console.log("Station updated successfully", data);
            alert("Station updated successfully!");
            queryClient.invalidateQueries(["stations"]);
            setTimeout(() => {
                onClose();
            }, 1500);
        },
        onError: (error) => {
            console.error("Error updating station:", error);
            alert(error.message || "Unable to update station.");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteStation,
        onSuccess: (data) => {
            console.log("Station deleted successfully", data);
            alert("Station deleted successfully!");
            queryClient.invalidateQueries(["stations"]);
            onClose();
        },
        onError: (error) => {
            console.error("Error deleting station:", error);
            alert(error.message || "Unable to delete station.");
        }
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        updateMutation.mutate(form);
    };

    const handleDelete = () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = () => {
        deleteMutation.mutate();
        setShowDeleteConfirm(false);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const inner = (
        <div className="relative w-full max-w-lg bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
                {updateMutation.isSuccess && (
                    <div className="mb-3 rounded-md bg-green-50 border border-green-100 text-green-700 px-3 py-2">
                        Updated successfully.
                    </div>
                )}

                {updateMutation.isError && (
                    <div className="mb-3 rounded-md bg-red-50 border border-red-100 text-red-700 px-3 py-2">
                        {(updateMutation.error && updateMutation.error.message) || 'Unable to update station.'}
                    </div>
                )}

                {deleteMutation.isError && (
                    <div className="mb-3 rounded-md bg-red-50 border border-red-100 text-red-700 px-3 py-2">
                        {(deleteMutation.error && deleteMutation.error.message) || 'Unable to delete station.'}
                    </div>
                )}

                {showDeleteConfirm ? (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Confirm Deletion
                        </h3>
                        <p className="text-gray-600">
                            Are you sure you want to delete "{station.name}"? This action cannot be undone.
                        </p>
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={confirmDelete}
                                disabled={deleteMutation.isLoading}
                                className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700 disabled:opacity-60"
                            >
                                {deleteMutation.isLoading ? 'Deleting...' : 'Yes, Delete'}
                            </button>
                            <button
                                type="button"
                                onClick={cancelDelete}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Station Name
                            </label>
                            <input
                                type="text"
                                placeholder="Station Name"
                                name="name"
                                value={form.name}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Address
                            </label>
                            <input
                                type="text"
                                placeholder="Address"
                                name="address"
                                value={form.address}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    name="phone_number"
                                    value={form.phone_number}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Landline
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Landline"
                                    name="landline"
                                    value={form.landline}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                placeholder="Email"
                                name="email"
                                value={form.email}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Latitude
                                </label>
                                <input
                                    type="text"
                                    placeholder="Latitude"
                                    name="latitude"
                                    value={form.latitude}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Longitude
                                </label>
                                <input
                                    type="text"
                                    placeholder="Longitude"
                                    name="longitude"
                                    value={form.longitude}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={updateMutation.isLoading}
                                className="flex-1 bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600 disabled:opacity-60"
                            >
                                {updateMutation.isLoading ? 'Saving...' : 'Update Station'}
                            </button>

                            <button
                                type="button"
                                onClick={() => onClose && onClose()}
                                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                        </div>

                        <button
                            type="button"
                            onClick={handleDelete}
                            className="w-full bg-red-600 text-white py-2 rounded-md hover:bg-red-700 mt-2"
                        >
                            Delete Station
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <Modal onClose={onClose} maxWidth="max-w-lg">
            {inner}
        </Modal>
    );
};

export default EditStationModal;