import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { X, UserPlus, Send, Shield } from "lucide-react";
import api from "../utils/api";

const AddPersonnelModal = ({ isOpen, onClose, stations = [] }) => {
	const queryClient = useQueryClient();

	const [form, setForm] = useState({
		first_name: "",
		last_name: "",
		email: "",
		role: "",
		station_id: "",
		mobile_number: "",
		password: "",
		is_admin: false,
	});

	const resetForm = () => {
		setForm({
			first_name: "",
			last_name: "",
			email: "",
			role: "",
			station_id: "",
			mobile_number: "",
			password: "",
			is_admin: false,
		});
	};

	const addPersonnel = async (payload) => {
		const endpoint = "officers/create";
		const response = await api.post(endpoint, payload);
		
		if (!response.ok) {
			const data = await response.json();
			throw new Error(data.message || "Unable to add personnel.");
		}
		
		return await response.json();
	};

	const { mutate: addPersonnelMutation, isLoading } = useMutation({
		mutationFn: addPersonnel,
		onSuccess: (data) => {
			console.log("Personnel added:", data);
			queryClient.invalidateQueries(["officers"]);
			
			alert(form.is_admin ? "Admin created successfully!" : "Personnel added successfully!");
			resetForm();
			onClose();
		},
		onError: (error) => {
			console.error("Error adding personnel:", error);
			alert(error.message || "Unable to add personnel.");
		},
	});

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		
		// When switching between admin and officer, adjust form requirements
		if (name === 'is_admin') {
			const newIsAdmin = checked;
			setForm((prevForm) => ({
				...prevForm,
				is_admin: newIsAdmin,
				// Reset station for admins, keep for officers
				station_id: newIsAdmin ? "" : prevForm.station_id,
				// Clear password if switching from admin to officer
				password: newIsAdmin ? prevForm.password : "",
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
		
		// Validation
		if (form.is_admin && (!form.password || form.password.length < 6)) {
			alert("Password must be at least 6 characters for admin accounts.");
			return;
		}
		
		if (!form.is_admin && !form.mobile_number) {
			alert("Please provide a mobile number for officer accounts.");
			return;
		}
		
		if (!form.is_admin && !form.station_id) {
			alert("Please select a station for officer accounts.");
			return;
		}
		
		// Prepare payload
		const payload = {
			first_name: form.first_name,
			last_name: form.last_name,
			email: form.email,
			role: form.role || (form.is_admin ? "ADMIN" : "OFFICER"),
			mobile_number: form.mobile_number,
			is_admin: form.is_admin,
		};
		
		// Add station_id only if provided (admins don't need it)
		if (form.station_id) {
			payload.station_id = form.station_id;
		}
		
		// Add password if provided (required for admins)
		if (form.is_admin) {
			payload.password = form.password;
		} else if (form.password && form.password.length > 0) {
			// Optional password for regular officers
			payload.password = form.password;
		}
		
		console.log("Submitting payload:", payload);
		addPersonnelMutation(payload);
	};

	const handleClose = () => {
		if (!isLoading) {
			resetForm();
			onClose();
		}
	};

	if (!isOpen) {
		return null;
	}

	return (
		// Modal Overlay
		<div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex justify-center items-center z-50">
			{/* Modal Content */}
			<div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-100 opacity-100">
				
				{/* Header */}
				<div className="flex justify-between items-center mb-6 border-b pb-4">
					<h3 className="text-2xl font-semibold text-indigo-700 flex items-center gap-2">
						<UserPlus size={24} /> Add New Personnel
					</h3>
					<button 
						onClick={handleClose} 
						className="text-gray-400 hover:text-gray-600 transition-colors"
						disabled={isLoading}
					>
						<X size={24} />
					</button>
				</div>

				{/* Admin Toggle */}
				<div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
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
							<Shield size={20} className="text-blue-600" />
							<span className="font-medium text-blue-800">Create as Admin User</span>
						</div>
					</label>
					<p className="text-sm text-blue-600 mt-2 ml-7">
						{form.is_admin 
							? "This user will have full administrative privileges. A password is required."
							: "This user will be a regular officer. Password will be auto-generated if not provided."
						}
					</p>
				</div>

				{/* Form */}
				<form onSubmit={handleSubmit}>
					{/* Name Row */}
					<div className="grid grid-cols-2 gap-4 mb-4">
						<div>
							<label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
								First Name <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="first_name"
								name="first_name"
								value={form.first_name}
								onChange={handleChange}
								placeholder="e.g. Juan"
								required
								disabled={isLoading}
								className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 disabled:bg-gray-100"
							/>
						</div>
						<div>
							<label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
								Last Name <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="last_name"
								name="last_name"
								value={form.last_name}
								onChange={handleChange}
								placeholder="e.g. Dela Cruz"
								required
								disabled={isLoading}
								className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 disabled:bg-gray-100"
							/>
						</div>
					</div>

					{/* Role & Contact Row */}
					<div className="grid grid-cols-2 gap-4 mb-4">
						<div>
							<label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
								Role <span className="text-red-500">*</span>
							</label>
							<input
								type="text"
								id="role"
								name="role"
								value={form.role}
								onChange={handleChange}
								placeholder={form.is_admin ? "e.g. System Administrator" : "e.g. Police Major"}
								required
								disabled={isLoading}
								className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 disabled:bg-gray-100"
							/>
						</div>
						<div>
							<label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700 mb-1">
								Mobile Number {!form.is_admin && <span className="text-red-500">*</span>}
							</label>
							<input
								type="tel"
								id="mobile_number"
								name="mobile_number"
								value={form.mobile_number}
								onChange={handleChange}
								placeholder="e.g. 09123456789"
								required={!form.is_admin}
								disabled={isLoading}
								className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 disabled:bg-gray-100"
							/>
						</div>
					</div>

					{/* Email & Station Row */}
					<div className="grid grid-cols-2 gap-4 mb-4">
						<div>
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
								Email <span className="text-red-500">*</span>
							</label>
							<input
								type="email"
								id="email"
								name="email"
								value={form.email}
								onChange={handleChange}
								placeholder="email@example.com"
								required
								disabled={isLoading}
								className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 disabled:bg-gray-100"
							/>
						</div>
						<div>
							<label htmlFor="station_id" className="block text-sm font-medium text-gray-700 mb-1">
								Station Assigned {!form.is_admin && <span className="text-red-500">*</span>}
							</label>
							<select
								id="station_id"
								name="station_id"
								value={form.station_id}
								onChange={handleChange}
								required={!form.is_admin}
								disabled={isLoading}
								className="w-full border border-gray-300 rounded-lg p-3 bg-white focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 disabled:bg-gray-100"
							>
								<option value="">Select a Station</option>
								{stations.map((station) => (
									<option key={station._id} value={station._id}>
										{station.name}
									</option>
								))}
							</select>
						</div>
					</div>

					{/* Password Row - Always show but with different requirements */}
					<div className="mb-4">
						<label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
							Password {form.is_admin && <span className="text-red-500">*</span>}
						</label>
						<input
							type="password"
							id="password"
							name="password"
							value={form.password}
							onChange={handleChange}
							placeholder={form.is_admin ? "Minimum 6 characters (required)" : "Optional - leave empty for auto-generated"}
							required={form.is_admin}
							minLength={form.is_admin ? 6 : 0}
							disabled={isLoading}
							className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 disabled:bg-gray-100"
						/>
						<p className="text-xs text-gray-500 mt-1">
							{form.is_admin 
								? "Password is required for admin accounts." 
								: "If left empty, a random password will be generated."
							}
						</p>
					</div>

					{/* Action Buttons */}
					<div className="flex justify-end gap-3 pt-4 border-t">
						<button
							type="button"
							onClick={handleClose}
							disabled={isLoading}
							className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
						>
							Cancel
						</button>
						<button
							type="submit"
							disabled={isLoading}
							className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed ${
								form.is_admin 
									? 'bg-purple-600 hover:bg-purple-700 text-white'
									: 'bg-indigo-600 hover:bg-indigo-700 text-white'
							}`}
						>
							<Send size={18} /> 
							{isLoading 
								? (form.is_admin ? "Creating Admin..." : "Adding...") 
								: (form.is_admin ? "Create Admin" : "Add Personnel")
							}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddPersonnelModal;