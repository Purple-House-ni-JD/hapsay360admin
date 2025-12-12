import {useState, useEffect} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import Modal from "./Modal";
import { Shield } from "lucide-react";
import api from "../utils/api";

const EditPersonnel = ({officer, onClose, stations}) => {
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        first_name: officer.first_name || "",
        last_name: officer.last_name || "",
        email: officer.email || "",
        role: officer.role || "",
        station_id: officer.station_id?._id || officer.station_id || "",
        mobile_number: officer.contact?.mobile_number || "",
        status: officer.status || "ACTIVE",
        is_admin: (officer.role || "").toUpperCase() === "ADMIN",
        password: "",
        confirm_password: "",
    });

    useEffect(() => {
        setForm({
            first_name: officer.first_name || "",
            last_name: officer.last_name || "",
            email: officer.email || "",
            role: officer.role || "",
            station_id: officer.station_id?._id || officer.station_id || "",
            mobile_number: officer.contact?.mobile_number || "",
            status: officer.status || "ACTIVE",
            is_admin: (officer.role || "").toUpperCase() === "ADMIN",
            password: "",
            confirm_password: "",
        });
    }, [officer]);
    
    const updateOfficer = async (payload) => {
        // Clean up the payload before sending
        const cleanPayload = { ...payload };
        
        // Remove confirm_password
        delete cleanPayload.confirm_password;
        
        // Remove password if empty
        if (!cleanPayload.password || cleanPayload.password.trim() === "") {
            delete cleanPayload.password;
        }
        
        // Remove is_admin flag
        delete cleanPayload.is_admin;
        
        // For admins, we might need to handle empty station_id and mobile_number
        if (cleanPayload.role.toUpperCase() === "ADMIN") {
            // If station_id is empty string, set to undefined
            if (cleanPayload.station_id === "") {
                delete cleanPayload.station_id;
            }
            // If mobile_number is empty string, set to undefined
            if (cleanPayload.mobile_number === "") {
                delete cleanPayload.mobile_number;
            }
        }

        console.log("Sending payload:", cleanPayload);

        const response = await api.put(`officers/update/${officer._id}`, cleanPayload);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || "Unable to update personnel.");
        }
        
        return data;
    };

    const {mutate, isLoading, isError, isSuccess, error} = useMutation({
        mutationFn: updateOfficer,
        onSuccess: (data) => {
            console.log("Personnel updated successfully", data);
            queryClient.invalidateQueries(["officers"]);
            alert("Personnel updated successfully!");
            onClose();
        },
        onError: (error) => {
            console.error("Error updating personnel", error);
            alert(error.message || "Unable to update personnel.");
        }
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        
        if (name === 'is_admin') {
            const newIsAdmin = checked;
            setForm((prevForm) => ({
                ...prevForm,
                is_admin: newIsAdmin,
                role: newIsAdmin ? "ADMIN" : prevForm.role === "ADMIN" ? "" : prevForm.role,
                // Keep station_id if switching from admin to officer, otherwise clear
                station_id: newIsAdmin ? "" : prevForm.station_id,
                // Keep mobile_number if switching from admin to officer, otherwise clear
                mobile_number: newIsAdmin ? "" : prevForm.mobile_number,
            }));
        } else {
            setForm((prevForm) => ({
                ...prevForm,
                [name]: type === 'checkbox' ? checked : value,
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!form.first_name || !form.last_name || !form.email || !form.role) {
            alert("First name, last name, email, and role are required.");
            return;
        }

        if (form.password && form.password !== form.confirm_password) {
            alert("Passwords do not match.");
            return;
        }

        if (form.is_admin && form.password && form.password.length < 6) {
            alert("Password must be at least 6 characters for admin accounts.");
            return;
        }

        if (!form.is_admin && !form.station_id) {
            alert("Please select a station for officer accounts.");
            return;
        }

        if (!form.is_admin && !form.mobile_number) {
            alert("Please provide a mobile number for officer accounts.");
            return;
        }

        const payload = {
            first_name: form.first_name,
            last_name: form.last_name,
            email: form.email,
            role: form.is_admin ? "ADMIN" : form.role,
            status: form.status,
            password: form.password || undefined,
            confirm_password: form.confirm_password,
            is_admin: form.is_admin,
        };

        if (form.station_id) {
            payload.station_id = form.station_id;
        }

        if (form.mobile_number) {
            payload.mobile_number = form.mobile_number;
        }

        console.log("Submitting payload:", payload);
        mutate(payload);
    };

    const inner = (
        <div className="relative w-full max-w-lg bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
                {isSuccess && (
                    <div className="mb-3 rounded-md bg-green-50 border border-green-100 text-green-700 px-3 py-2">Updated successfully.</div>
                )}

                {isError && (
                    <div className="mb-3 rounded-md bg-red-50 border border-red-100 text-red-700 px-3 py-2">{(error && error.message) || 'Unable to update personnel.'}</div>
                )}

                {/* Admin Toggle */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            name="is_admin"
                            checked={form.is_admin}
                            onChange={handleChange}
                            disabled={isLoading}
                            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                        <div className="flex items-center gap-2">
                            <Shield size={18} className="text-blue-600" />
                            <span className="font-medium text-blue-800">Admin User</span>
                        </div>
                    </label>
                    <p className="text-sm text-blue-600 mt-2 ml-7">
                        {form.is_admin 
                            ? "This user has full administrative privileges."
                            : "This user is a regular officer."
                        }
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                First name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="First Name"
                                name="first_name"
                                value={form.first_name}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Last name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Last Name"
                                name="last_name"
                                value={form.last_name}
                                onChange={handleChange}
                                required
                                disabled={isLoading}
                                className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            disabled={isLoading}
                            className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                            <select 
                                name="status" 
                                value={form.status} 
                                onChange={handleChange}
                                disabled={isLoading}
                                className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                            >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                                <option value="ON DUTY">ON DUTY</option>
                                <option value="SUSPENDED">SUSPENDED</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder={form.is_admin ? "ADMIN (auto-set)" : "e.g. Police Major"}
                                name="role"
                                value={form.is_admin ? "ADMIN" : form.role}
                                onChange={handleChange}
                                required
                                disabled={isLoading || form.is_admin}
                                className={`w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100 ${
                                    form.is_admin ? 'bg-gray-100 text-gray-600' : ''
                                }`}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Station {!form.is_admin && <span className="text-red-500">*</span>}
                        </label>
                        <select 
                            name="station_id" 
                            value={form.station_id} 
                            onChange={handleChange}
                            required={!form.is_admin}
                            disabled={isLoading}
                            className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                        >
                            <option value="">Select a Station</option>
                            {stations.map((station) => (
                                <option key={station._id} value={station._id}>{station.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mobile number {!form.is_admin && <span className="text-red-500">*</span>}
                        </label>
                        <input
                            type="text"
                            placeholder="Mobile Number"
                            name="mobile_number"
                            value={form.mobile_number}
                            onChange={handleChange}
                            required={!form.is_admin}
                            disabled={isLoading}
                            className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                        />
                    </div>

                    {/* Password Change Section */}
                    <div className="border-t pt-4 mt-4">
                        <h3 className="text-lg font-medium text-gray-800 mb-3">Change Password (Optional)</h3>
                        <div className="space-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    New Password
                                </label>
                                <input
                                    type="password"
                                    placeholder={form.is_admin ? "Minimum 6 characters" : "Leave empty to keep current"}
                                    name="password"
                                    value={form.password}
                                    onChange={handleChange}
                                    minLength={form.is_admin ? 6 : 0}
                                    disabled={isLoading}
                                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm New Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="Confirm new password"
                                    name="confirm_password"
                                    value={form.confirm_password}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                                />
                            </div>
                            <p className="text-xs text-gray-500">
                                {form.is_admin 
                                    ? "Password is required for admin accounts. Leave empty to keep current password."
                                    : "Leave empty to keep current password or auto-generated password."
                                }
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className={`flex-1 py-2 rounded-md text-white hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed ${
                                form.is_admin 
                                    ? 'bg-purple-600 hover:bg-purple-700' 
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                            }`}
                        >
                            {isLoading ? 'Saving...' : 'Update Personnel'}
                        </button>

                        <button
                            type="button"
                            onClick={() => !isLoading && onClose && onClose()}
                            disabled={isLoading}
                            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <Modal onClose={isLoading ? undefined : onClose} maxWidth="max-w-lg">
            {inner}
        </Modal>
    );
    
};

export default EditPersonnel;