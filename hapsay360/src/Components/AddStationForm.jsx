import {useState} from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import Modal from "./Modal";

const AddStationForm = ({ onClose } ) => {
	const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
	const apiBaseUrl = baseUrl?.endsWith("/") ? baseUrl : `${baseUrl}/`;

	const queryClient = useQueryClient();

	const [form, setForm] = useState({
		name: "", 
		address: "",
		phone_number:"",
		email: "",
		landline: "",
		latitude: "",
		longitude: "",
	});

	const addStation = async (payload) => {
		const response = await fetch(`${apiBaseUrl}police-stations/create`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(payload),
		});
		const data = await response.json();
		console.log(data);

		if (response.ok) {
			alert("Station added successfully!");
			setForm({name: "", 
					address: "",
					phone_number: "",
					email: "",
					landline: "",
					latitude: "",
					longitude: "",
				});

		} else {
			alert(data.message || "Unable to add station.");
		}
	};

	const { mutate } = useMutation({
		mutationFn: addStation,
		onSuccess: (data) => {
			console.log("Station added successfully", data);
			queryClient.invalidateQueries({ queryKey: ["stations"] });
		},
		onError: (data) => {
			console.error("Error adding station", data.error);
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		mutate(form);
		onClose();
	};

	const formCard = (
		<div className="w-full bg-white p-6 rounded-lg shadow-md">
			<h3 className="text-lg font-semibold mb-4">Add Station</h3>

			<form onSubmit={handleSubmit} className="space-y-4">
				<div>
					<label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Station Name</label>
					<input
						type="text"
						id="name"
						name="name"
						value={form.name}
						onChange={(e) => setForm({...form, name: e.target.value})}
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
						placeholder="e.g. Barangay 1 Station"
					/>
				</div>

				<div>
					<label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
					<input
						type="text"
						id="address"
						name="address"
						value={form.address}
						onChange={(e) => setForm({...form, address: e.target.value})}
						className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
						placeholder="Street, Barangay, City"
					/>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
						<input
							type="text"
							id="phone_number"
							name="phone_number"
							value={form.phone_number}
							onChange={(e) => setForm({...form, phone_number: e.target.value})}
							className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="Mobile or contact number"
						/>
					</div>

					<div>
						<label htmlFor="landline" className="block text-sm font-medium text-gray-700 mb-1">Landline</label>
						<input
							type="text"
							id="landline"
							name="landline"
							value={form.landline}
							onChange={(e) => setForm({...form, landline: e.target.value})}
							className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="Optional landline"
						/>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
						<input
							type="email"
							id="email"
							name="email"
							value={form.email}
							onChange={(e) => setForm({...form, email: e.target.value})}
							className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
							placeholder="Optional contact email"
						/>
					</div>

					<div className="flex gap-2">
						<div className="flex-1">
							<label htmlFor="latitude" className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
							<input
								type="text"
								id="latitude"
								name="latitude"
								value={form.latitude}
								onChange={(e) => setForm({...form, latitude: e.target.value})}
								className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
								placeholder="Optional"
							/>
						</div>

						<div className="flex-1">
							<label htmlFor="longitude" className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
							<input
								type="text"
								id="longitude"
								name="longitude"
								value={form.longitude}
								onChange={(e) => setForm({...form, longitude: e.target.value})}
								className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
								placeholder="Optional"
							/>
						</div>
					</div>
				</div>

				<div className="flex gap-3 pt-2">
					<button
						type="submit"
						className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-60"
					>
						Add Station
					</button>
					{onClose && (
						<button
							type="button"
							onClick={onClose}
							className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300"
						>
							Cancel
						</button>
					)}
				</div>
			</form>
		</div>
	);

	if (!onClose) return (
		<div className="w-full max-w-lg">
			{formCard}
		</div>
	);

	return (
		<Modal onClose={onClose} maxWidth="max-w-2xl">
			{formCard}
		</Modal>
	);
};

export default AddStationForm;