import {useState} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import Modal from "./Modal";
import api from "../utils/api";

const EditPersonnel = ({officer, onClose, stations}) => {
    const queryClient = useQueryClient();

    const [form, setForm] = useState({
        first_name: officer.first_name || "",
        last_name: officer.last_name || "",
        email: officer.email || "",
        role: officer.role || "",
        station_id: officer.station_id?._id || "",
        mobile_number: officer.contact?.mobile_number || "",
        status: officer.status || "active",
    });
    
    const updateOfficer = async (payload) => {
        // Use shared api util so Authorization header (token) is included
        const response = await api.put(`officers/update/${officer._id}`, payload);
        const data = await response.json();
        console.log(data);
        if (response.ok) {
            alert("Personnel updated successfully!");
        } else {
            alert(data.message || "Unable to update personnel.");
        }
    };

    const {mutate, isLoading, isError, isSuccess, error} = useMutation({
        mutationFn: updateOfficer,
        onSuccess: (data) => {
            console.log("Personnel updated successfully", data);
            queryClient.invalidateQueries(["officers"]);
        },
        onError: (data) => {
            console.error("Error updating personnel", data.error);
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
        mutate(form);
        onClose();
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

                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last name</label>
                        <input
                            type="text"
                            placeholder="Last Name"
                            name="last_name"
                            value={form.last_name}
                            onChange={handleChange}
                            className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                            <option value="ON DUTY">ON DUTY</option>
                            <option value="SUSPENDED">SUSPENDED</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Station</label>
                        <select name="station_id" value={form.station_id} onChange={handleChange} className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            {stations.map((station) => (
                                <option key={station._id} value={station._id}>{station.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                            <input
                                type="text"
                                placeholder="Role"
                                name="role"
                                value={form.role}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile number</label>
                            <input
                                type="text"
                                placeholder="Mobile Number"
                                name="mobile_number"
                                value={form.mobile_number}
                                onChange={handleChange}
                                className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            onClick={handleSubmit}
                            disabled={isLoading}
                            className="flex-1 bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {isLoading ? 'Saving...' : 'Update Personnel'}
                        </button>

                        <button
                            type="button"
                            onClick={() => onClose && onClose()}
                            className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );

    return (
        <Modal onClose={onClose} maxWidth="max-w-lg">
            {inner}
        </Modal>
    );
    
};

export default EditPersonnel;