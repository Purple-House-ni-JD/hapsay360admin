import {useState} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import Modal from "./Modal";

const AddPersonnelForm = ({onClose, stations = []}) => {
	const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
	const apiBaseUrl = baseUrl?.endsWith("/") ? baseUrl : `${baseUrl}/`;

	const queryClient = useQueryClient();

	const [form, setForm] = useState({
		first_name: "",
		last_name: "",
		email: "",
		role: "",
		station_id: "",
		mobile_number: "",
	});
	
	const addPersonnel = async (payload) => {
		const response = await fetch(`${apiBaseUrl}officers/create`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});
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

	const {mutate, isLoading, isError, isSuccess, error} = useMutation({
		mutationFn: addPersonnel,
		onSuccess: (data) => {
			console.log("Personnel added successfully", data);
			queryClient.invalidateQueries(["officers"]);
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
		mutate(form);
		onClose();
	};

	const card = (
		<div className="w-full bg-white p-6 rounded-lg shadow-md">
			<h3 className="text-lg font-semibold mb-4">Add Personnel</h3>

			{isSuccess && (
				<div className="mb-4 text-green-700 bg-green-50 border border-green-100 px-3 py-2 rounded">
					Personnel added successfully.
				</div>
			)}

			{isError && (
				<div className="mb-4 text-red-700 bg-red-50 border border-red-100 px-3 py-2 rounded">
					{(error && error.message) || "Unable to add personnel."}
				</div>
			)}

			<form onSubmit={handleSubmit} className="space-y-3">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="first_name">First name</label>
					<input
						id="first_name"
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
						type="text"
						name="first_name"
						value={form.first_name}
						onChange={handleChange}
						placeholder="First Name"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="last_name">Last name</label>
					<input
						id="last_name"
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
						type="text"
						name="last_name"
						value={form.last_name}
						onChange={handleChange}
						placeholder="Last Name"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
					<input
						id="email"
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
						type="email"
						name="email"
						value={form.email}
						onChange={handleChange}
						placeholder="Email"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="role">Role</label>
					<input
						id="role"
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
						type="text"
						name="role"
						value={form.role}
						onChange={handleChange}
						placeholder="Role"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="mobile_number">Mobile Number</label>
					<input
						id="mobile_number"
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
						type="text"
						name="mobile_number"
						value={form.mobile_number}
						onChange={handleChange}
						placeholder="Mobile Number"
					/>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="station_id">Station ID</label>
					<select name="station_id" id="station_id" value={form.station_id} onChange={handleChange} 
					className="bg-gray-50 px-3 py-2 w-full border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
						<option value="">Select Station</option>
						{stations.map((station) => (
							<option key={station._id} value={station._id}>
								{station.name}
							</option>
						))}
					</select>
				</div>

				<div className="pt-2">
					<button
						type="submit"
						disabled={isLoading}
						className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-60"
					>
						{isLoading ? "Adding..." : "Add Personnel"}
					</button>

					<button
						type="button"
						onClick={onClose}
						className="w-full mt-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
					>
						Cancel
					</button>
				</div>
			</form>
		</div>
	);

	if (!onClose) {
		return (
			<div className="w-full max-w-md">
				{card}
			</div>
		);
	}

	return (
		<Modal onClose={onClose} maxWidth="max-w-2xl">
			{card}
		</Modal>
	);
};

export default AddPersonnelForm;
