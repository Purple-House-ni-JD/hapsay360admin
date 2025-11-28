import React from "react";
import { useState } from "react";
import Sidebar from "../Components/Sidebar";
import AdminHeader from "../Components/AdminHeader";
import AddPersonnelForm from "../Components/AddPersonnelForm";
import AddStationForm from "../Components/AddStationForm";
import EditPersonnel from "../Components/EditPersonnel";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Plus, Trash } from "lucide-react";

const StationsPage = () => {
	const baseUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
	const apiBaseUrl = baseUrl?.endsWith("/") ? baseUrl : `${baseUrl}/`;

	const queryClient = useQueryClient();

	const fetchOfficers = async () => {
		const response = await fetch(`${apiBaseUrl}officers/all`);
		if(!response.ok) {
			throw new Error("Unable to fetch officers");
		}
		const data = await response.json();
		return data?.data ?? [];
	}

	const deleteOfficer = async (id) => {
		const response = await fetch(`${apiBaseUrl}officers/delete/${id}`, {
			method: "DELETE",
		});
		const data = await response.json();
		if(response.ok) {
			alert("Officer deleted successfully");
		} else {
			alert("Unable to delete officer: " + (data.message || ""));
		}
		return data;
	}

	const { mutate: mutateDeleteOfficer } = useMutation({
		mutationFn: deleteOfficer,
		onSuccess: () => {	
			queryClient.invalidateQueries(["officers"]);
		}
	});	

	const handleDeleteOfficer = (id) => {
		if(window.confirm("Are you sure you want to delete this officer?")) {
			mutateDeleteOfficer(id);
		}
	}

	const {
		data: officers = [],
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["officers"],
		queryFn: fetchOfficers
	});

	const [input, setInput] = useState("");

	const [isAddStationOpen, setIsAddStationOpen] = useState(false);
	const [isAddPersonnelOpen, setIsAddPersonnelOpen] = useState(false);
	const [isEditPersonnelOpen, setIsEditPersonnelOpen] = useState(false);
	const [selectedOfficer, setSelectedOfficer] = useState(null);

	const showEditPersonnelModal = (officer) => {
		setSelectedOfficer(officer);
		setIsEditPersonnelOpen(true);
	}

	const filteredOfficers = officers.filter((officer) =>
		`${officer.first_name} ${officer.last_name}`.toLowerCase().includes(input.toLowerCase())
	);

	const fetchStations = async () => {
		const response = await fetch(`${apiBaseUrl}police-stations/getStations`);
		if(!response.ok) {
			throw new Error("Unable to fetch stations");
		}
		const data = await response.json();
		return data?.data ?? [];
	}

	const { 
		data: stations = [],
	} = useQuery({
		queryKey: ["stations"],
		queryFn: fetchStations
	});

	return (
		<div className="min-h-screen bg-gray-50">
			<Sidebar activePage={"stations"} />

			<main className="ml-96 p-10">
				<AdminHeader title={"Stations & Personnel"} username={"Admin User"} />

				<section className="mt-6">
					<h2 className="text-2xl font-bold text-gray-800">
						Barangay Stations & Personnel Management
					</h2>

					<div className="mt-6 bg-white rounded-2xl shadow-md p-6">
						<div className="flex items-center justify-between mb-6 gap-4">
							<div className="bg-gray-100 rounded-lg px-7 py-3 text-lg font-medium text-gray-700 w-1/2">
								<input type="text"
								placeholder="Search personnel..."
								className="bg-transparent focus:outline-none w-full text-gray-700"
								onChange= {(e) => setInput(e.target.value)}/>
							</div>

							<div className="flex gap-3">
								<button>
									<div
										onClick={() => setIsAddPersonnelOpen(true)}
										className="flex items-center gap-2 bg-violet-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-md transition cursor-pointer"
									>
										<Plus size={20} />
										Add Personnel
									</div>
								</button>

								<button>
									<div
										onClick={() => setIsAddStationOpen(true)}
										className="flex items-center gap-2 bg-violet-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg shadow-md transition cursor-pointer"
									>
										<Plus size={20} />
										Add Station
									</div>
								</button>
							</div>
						</div>

						{isAddPersonnelOpen && <AddPersonnelForm onClose={() => setIsAddPersonnelOpen(false)} stations={stations} />}
						{isAddStationOpen && <AddStationForm onClose={() => setIsAddStationOpen(false)}/>}
						
						<div className="overflow-x-auto">
							<table className="w-full text-left border-collapse">
								<thead>
									<tr>
										<th className="p-3 text-gray-600 font-semibold border-b">ID</th>
										<th className="p-3 text-gray-600 font-semibold border-b">NAME</th>
										<th className="p-3 text-gray-600 font-semibold border-b">ROLE</th>
										<th className="p-3 text-gray-600 font-semibold border-b">CONTACT</th>
										<th className="p-3 text-gray-600 font-semibold border-b">STATUS</th>
										<th className="p-3 text-gray-600 font-semibold border-b">STATION ASSIGNED</th>
										<th className="p-3 text-gray-600 font-semibold border-b">ACTIONS</th>
									</tr>
								</thead>

								<tbody>
									{isLoading ? (
										<tr>
											<td colSpan="5" className="p-3 text-center text-gray-600">
												Loading stations...
											</td>
										</tr>
									) : isError ? (
										<tr>
											<td colSpan="5" className="p-3 text-center text-red-600">
												Unable to load stations right now.
											</td>
										</tr>
									) : 	filteredOfficers.length === 0 ? (
										<tr>
											<td colSpan="5" className="p-3 text-center text-gray-600">
												No officers found
											</td>
										</tr>
									) : (
										filteredOfficers.map((officer) => (
											<tr key={officer._id} className="hover:bg-gray-50">
												<td className="p-3 border-b text-gray-700">{officer.custom_id}</td>
												<td className="p-3 border-b text-gray-700">{officer.first_name} {officer.last_name}</td>
												<td className="p-3 border-b text-gray-700">{officer.role || "Unassigned"} </td>
												<td className="p-3 border-b text-gray-700">{officer.contact?.mobile_number ?? "N/A"}</td>
												<td className="p-3 border-b text-gray-700">{officer.status || "Unassigned"}</td>
												<td className="p-3 border-b text-gray-700">{officer.station_id?.name ?? "N/A"}</td>
												<td className="p-3 border-b text-gray-700 gap-2 flex">
													<button
														onClick={() => showEditPersonnelModal(officer)}
														className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 cursor-pointer"
													>
														Edit
													</button>
													<button
														onClick={() => handleDeleteOfficer(officer._id)}
														className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 cursor-pointer"
													>
														<Trash size={16} />
													</button>
												</td>
											</tr>
										))
									)}

									{isEditPersonnelOpen && selectedOfficer && (
										<EditPersonnel
											onClose={() => setIsEditPersonnelOpen(false)}
											officer={selectedOfficer}
											stations={stations}
										/>
									)}
								</tbody>
							</table>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
};

export default StationsPage;
