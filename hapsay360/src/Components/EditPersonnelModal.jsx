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

const EditPersonnelModal = ({ officer, stations, onClose }) => {
    const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
    const apiBaseUrl = baseUrl?.endsWith("/") ? baseUrl : `${baseUrl}/`;

    const queryClient = useQueryClient();
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const [form, setForm] = useState({
        first_name: officer.first_name || "",
        last_name: officer.last_name || "",
        email: officer.email || "",
        badge_number: officer.badge_number || "",
        rank: officer.rank || "",
        station_id: officer.station_id?._id || officer.station_id || "",
        mobile_number: officer.contact?.mobile_number || "",
        radio_id: officer.contact?.radio_id || "",
        status: officer.status || "active",
        password: "", // Empty by default, only update if user enters new password
    });
    
    const updateOfficer = async (payload) => {
        const response = await fetch(`${apiBaseUrl}officers/${officer._id}`, {
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
            throw new Error(data.message || data.error || "Unable to update officer.");
        }
        
        return data;
    };

    const deleteOfficer = async () => {
        const response = await fetch(`${apiBaseUrl}officers/${officer._id}`, {
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
            throw new Error(data.message || data.error || "Unable to delete officer.");
        }
        
        return data;
    };

    const updateMutation = useMutation({
        mutationFn: updateOfficer,
        onSuccess: (data) => {
            console.log("Officer updated successfully", data);
            alert("Officer updated successfully!");
            queryClient.invalidateQueries(["officers"]);
            setTimeout(() => {
                onClose();
            }, 1500);
        },
        onError: (error) => {
            console.error("Error updating officer:", error);
            alert(error.message || "Unable to update officer.");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteOfficer,
        onSuccess: (data) => {
            console.log("Officer deleted successfully", data);
            alert("Officer deleted successfully!");
            queryClient.invalidateQueries(["officers"]);
            onClose();
        },
        onError: (error) => {
            console.error("Error deleting officer:", error);
            alert(error.message || "Unable to delete officer.");
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
        
        // Prepare payload with contact object
        const payload = {
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            badge_number: form.badge_number,
            rank: form.rank,
            station_id: form.station_id || null,
            contact: {
                mobile_number: form.mobile_number,
                radio_id: form.radio_id,
            },
            status: form.status,
        };

        // Only include password if it's not empty
        if (form.password && form.password.trim() !== "") {
            payload.password = form.password;
        }

        updateMutation.mutate(payload);
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
        <div className="relative w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
                {updateMutation.isSuccess && (
                    <div className="mb-3 rounded-md bg-green-50 border border-green-100 text-green-700 px-3 py-2">
                        Updated successfully.
                    </div>
                )}

                {updateMutation.isError && (
                    <div className="mb-3 rounded-md bg-red-50 border border-red-100 text-red-700 px-3 py-2">
                        {(updateMutation.error && updateMutation.error.message) || 'Unable to update officer.'}
                    </div>
                )}

                {deleteMutation.isError && (
                    <div className="mb-3 rounded-md bg-red-50 border border-red-100 text-red-700 px-3 py-2">
                        {(deleteMutation.error && deleteMutation.error.message) || 'Unable to delete officer.'}
                    </div>
                )}

                {showDeleteConfirm ? (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Confirm Deletion
                        </h3>
                        <p className="text-gray-600">
                            Are you sure you want to delete "{officer.first_name} {officer.last_name}"? This action cannot be undone.
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
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                            Edit Personnel
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    name="first_name"
                                    value={form.first_name}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    name="last_name"
                                    value={form.last_name}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
                                className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Badge Number
                                </label>
                                <input
                                    type="text"
                                    placeholder="Badge Number"
                                    name="badge_number"
                                    value={form.badge_number}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Rank
                                </label>
                                <input
                                    type="text"
                                    placeholder="Rank"
                                    name="rank"
                                    value={form.rank}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Station Assignment
                            </label>
                            <select
                                name="station_id"
                                value={form.station_id}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="">Unassigned</option>
                                {stations && stations.map((station) => (
                                    <option key={station._id} value={station._id}>
                                        {station.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Mobile Number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="Mobile Number"
                                    name="mobile_number"
                                    value={form.mobile_number}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Radio ID
                                </label>
                                <input
                                    type="text"
                                    placeholder="Radio ID"
                                    name="radio_id"
                                    value={form.radio_id}
                                    onChange={handleChange}
                                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                name="status"
                                value={form.status}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                New Password (leave blank to keep current)
                            </label>
                            <input
                                type="password"
                                placeholder="New Password"
                                name="password"
                                value={form.password}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={updateMutation.isLoading}
                                className="flex-1 bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600 disabled:opacity-60"
                            >
                                {updateMutation.isLoading ? 'Saving...' : 'Update Personnel'}
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
                            Delete Personnel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <Modal onClose={onClose} maxWidth="max-w-2xl">
            {inner}
        </Modal>
    );
};

export default EditPersonnelModal;