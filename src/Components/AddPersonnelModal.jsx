import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { X, UserPlus, Send } from "lucide-react";
import api from "../utils/api";

const AddPersonnelForm = ({ isOpen, onClose, stations = [] }) => {
	const queryClient = useQueryClient();

	const [form, setForm] = useState({
		first_name: "",
		last_name: "",
		email: "",
		role: "",
		station_id: "",
		mobile_number: "",
	});

	const [ isAddPersonnelSuccess, setIsAddPersonnelSuccess ] = useState(false);

	const addPersonnel = async (payload) => {
		const response = await api.post("officers/create", payload);
		const data = await response.json();
		console.log(data);

		if (response.ok) {
			alert("Personnel added successfully!");
			setForm({
				first_name: "",
				last_name: "",
				email: "",
				role: "",
				station_id: "",
				mobile_number: "",
			});
		} else {
			alert(data.message || "Unable to add personnel.");
		}
	};

	const { mutate: addPersonnelMutation, isLoading, isError, error } = useMutation({
		mutationFn: addPersonnel,
		onSuccess: (data) => {
			console.log("Personnel added:", data);
			queryClient.invalidateQueries(["officers"]);
			setForm({
				first_name: "",
				last_name: "",
				email: "",
				role: "",
				station_id: "",
				mobile_number: "",
			});
			setIsAddPersonnelSuccess(true);
		},
		onError: (data) => {
			console.error("Error adding personnel", data.error);
		},
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
		addPersonnelMutation(form);
		onClose();
	};

	if (!isOpen) {
    return null;
  }

	return (
		// Modal Overlay
		<div className="fixed inset-0 bg-opacity-80 backdrop-blur-sm flex justify-center items-center z-50">
			{/* Modal Content */}
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

				{/* Success/Error Messages */}
				{isAddPersonnelSuccess && (
					<div className="mb-4 text-green-700 bg-green-50 border border-green-100 px-3 py-2 rounded">
						Personnel added successfully.
					</div>
				)}

				{isError && (
					<div className="mb-4 text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded">
						{(error && error.message) || "Unable to add personnel."}
					</div>
				)}

				{/* Form */}
				<form onSubmit={handleSubmit}>
					{/* Name Row */}
					<div className="grid grid-cols-2 gap-4 mb-4">
						<div>
							<label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
								First Name
							</label>
							<input
								type="text"
								id="first_name"
								name="first_name"
								value={form.first_name}
								onChange={handleChange}
								placeholder="e.g. Juan"
								required
								className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
							/>
						</div>
						<div>
							<label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
								Last Name
							</label>
							<input
								type="text"
								id="last_name"
								name="last_name"
								value={form.last_name}
								onChange={handleChange}
								placeholder="e.g. Dela Cruz"
								required
								className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
							/>
						</div>
					</div>

					{/* Role & Contact Row */}
					<div className="grid grid-cols-2 gap-4 mb-4">
						<div>
							<label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
								Role
							</label>
							<input
								type="text"
								id="role"
								name="role"
								value={form.role}
								onChange={handleChange}
								placeholder="e.g. Police Major"
								required
								className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
							/>
						</div>
						<div>
							<label htmlFor="mobile_number" className="block text-sm font-medium text-gray-700 mb-1">
								Mobile Number
							</label>
							<input
								type="tel"
								id="mobile_number"
								name="mobile_number"
								value={form.mobile_number}
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
							<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
								Email
							</label>
							<input
								type="email"
								id="email"
								name="email"
								value={form.email}
								onChange={handleChange}
								placeholder="email@example.com"
								required
								className="w-full border border-gray-300 rounded-lg p-3 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
							/>
						</div>
						<div>
							<label htmlFor="station_id" className="block text-sm font-medium text-gray-700 mb-1">
								Station Assigned
							</label>
							<select
								id="station_id"
								name="station_id"
								value={form.station_id}
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
							disabled={isLoading}
							className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md hover:shadow-lg disabled:opacity-60"
						>
							<Send size={18} /> {isLoading ? "Adding..." : "Add Personnel"}
						</button>
					</div>
				</form>
			</div>
		</div>
	);
};

export default AddPersonnelForm;