import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

const UserModal = ({ user, onClose }) => {
  const [editData, setEditData] = useState(user);
  const [saving, setSaving] = useState(false);
  const apiBaseUrl = (
    import.meta.env.VITE_API_URL || "http://localhost:3000/api"
  ).replace(/\/$/, "");
  const queryClient = useQueryClient(); // For refreshing users

  // Update user
  const handleUpdate = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${apiBaseUrl}/users/${user._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`, // Make sure token is sent
        },
        body: JSON.stringify(editData),
      });

      const data = await res.json();
      if (res.ok) {
        alert("User updated successfully");
        onClose();
        queryClient.invalidateQueries(["users"]); // refresh table
      } else {
        alert("Update failed: " + data.message);
        console.error("Update failed:", res.status, data);
      }
    } catch (err) {
      console.error("Update error:", err);
      alert("Update failed: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  // Delete user
  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this account?")) return;

    try {
      const res = await fetch(`${apiBaseUrl}/users/${user._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("authToken")}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert("User deleted successfully");
        onClose();
        queryClient.invalidateQueries(["users"]); // refresh table
      } else {
        alert(`Delete failed: ${data.message}`);
        console.error("Delete failed:", res.status, data);
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed: " + err.message);
    }
  };

  return (
    <div className="absolute top-10 left-1/2 transform -translate-x-1/2 bg-white w-full max-w-lg p-6 rounded-xl shadow-xl z-50">
      <h2 className="text-2xl font-bold mb-6">User Details</h2>

      <div className="space-y-4">
        {/* First Name */}
        <div>
          <label className="font-medium block mb-1">First Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={editData.personal_info?.given_name || ""}
            onChange={(e) =>
              setEditData({
                ...editData,
                personal_info: {
                  ...editData.personal_info,
                  given_name: e.target.value,
                },
              })
            }
          />
        </div>

        {/* Last Name */}
        <div>
          <label className="font-medium block mb-1">Last Name</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={editData.personal_info?.surname || ""}
            onChange={(e) =>
              setEditData({
                ...editData,
                personal_info: {
                  ...editData.personal_info,
                  surname: e.target.value,
                },
              })
            }
          />
        </div>

        {/* Email */}
        <div>
          <label className="font-medium block mb-1">Email</label>
          <input
            type="email"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={editData.email || ""}
            onChange={(e) =>
              setEditData({ ...editData, email: e.target.value })
            }
          />
        </div>

        {/* Phone */}
        <div>
          <label className="font-medium block mb-1">Phone</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={editData.phone_number || ""}
            onChange={(e) =>
              setEditData({ ...editData, phone_number: e.target.value })
            }
          />
        </div>

        {/* Address */}
        <div>
          <label className="font-medium block mb-1">Address</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={
              editData.address
                ? `${editData.address.barangay}, ${editData.address.city}`
                : ""
            }
            onChange={(e) =>
              setEditData({
                ...editData,
                address: { ...editData.address, barangay: e.target.value },
              })
            }
          />
        </div>

        {/* Role */}
        <div>
          <label className="font-medium block mb-1">Role</label>
          <select
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={editData.role || "user"}
            onChange={(e) => setEditData({ ...editData, role: e.target.value })}
          >
            <option value="user">User</option>
            <option value="officer">Officer</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end mt-6 space-x-3">
        <button
          onClick={handleUpdate}
          disabled={saving}
          className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded-lg shadow disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Changes"}
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-lg shadow"
        >
          Delete User
        </button>
        <button
          onClick={onClose}
          className="bg-gray-300 hover:bg-gray-400 text-gray-900 px-5 py-2 rounded-lg shadow"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default UserModal;
