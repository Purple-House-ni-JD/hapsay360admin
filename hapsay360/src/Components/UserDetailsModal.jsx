import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, User } from "lucide-react";

const apiBaseUrl = (
  import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/?$/, "/");

// Fetch single user
const fetchUserById = async (userId) => {
  const response = await fetch(`${apiBaseUrl}users/${userId}`);
  if (!response.ok) throw new Error("Failed to load user");
  const result = await response.json();
  return result.data;
};

// Update user
const updateUserApi = async ({ userId, data }) => {
  const response = await fetch(`${apiBaseUrl}users/${userId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update user");
  return response.json();
};

// Delete user
const deleteUserApi = async (userId) => {
  const response = await fetch(`${apiBaseUrl}users/${userId}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete user");
  return response.json();
};

const UserDetailsModal = ({ isOpen, onClose, userId }) => {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    given_name: "",
    middle_name: "",
    surname: "",
    qualifier: "",
    sex: "",
    civil_status: "",
    birthday: "",
    pwd: false,
    nationality: "",
    phone_number: "",
    email: "",
    status: "Active",
    house_no: "",
    street: "",
    barangay: "",
    city: "",
    postal_code: "",
    province: "",
    country: "",
  });

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["user", userId],
    queryFn: () => fetchUserById(userId),
    enabled: !!userId && isOpen,
  });

  // Update form data when user data is loaded
  useEffect(() => {
    if (user) {
      setFormData({
        given_name: user.personal_info?.given_name || "",
        middle_name: user.personal_info?.middle_name || "",
        surname: user.personal_info?.surname || "",
        qualifier: user.personal_info?.qualifier || "",
        sex: user.personal_info?.sex || "",
        civil_status: user.personal_info?.civil_status || "",
        birthday: user.personal_info?.birthday
          ? new Date(user.personal_info.birthday).toISOString().split("T")[0]
          : "",
        pwd: user.personal_info?.pwd || false,
        nationality: user.personal_info?.nationality || "",
        phone_number: user.phone_number || "",
        email: user.email || "",
        status: user.status || "Active",
        house_no: user.address?.house_no || "",
        street: user.address?.street || "",
        barangay: user.address?.barangay || "",
        city: user.address?.city || "",
        postal_code: user.address?.postal_code || "",
        province: user.address?.province || "",
        country: user.address?.country || "",
      });
    }
  }, [user]);

  const updateMutation = useMutation({
    mutationFn: updateUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      queryClient.invalidateQueries(["user", userId]);
      alert("User updated successfully!");
      setIsEditing(false);
    },
    onError: (error) => {
      alert(`Error updating user: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUserApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["users"]);
      alert("User deleted successfully!");
      onClose();
    },
    onError: (error) => {
      alert(`Error deleting user: ${error.message}`);
    },
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    const updateData = {
      personal_info: {
        given_name: formData.given_name,
        middle_name: formData.middle_name,
        surname: formData.surname,
        qualifier: formData.qualifier,
        sex: formData.sex,
        civil_status: formData.civil_status,
        birthday: formData.birthday,
        pwd: formData.pwd,
        nationality: formData.nationality,
      },
      phone_number: formData.phone_number,
      email: formData.email,
      status: formData.status,
      address: {
        house_no: formData.house_no,
        street: formData.street,
        barangay: formData.barangay,
        city: formData.city,
        postal_code: formData.postal_code,
        province: formData.province,
        country: formData.country,
      },
    };
    updateMutation.mutate({ userId, data: updateData });
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this user? This action cannot be undone."
      )
    ) {
      deleteMutation.mutate(userId);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    // Reset form data to original user data
    if (user) {
      setFormData({
        given_name: user.personal_info?.given_name || "",
        middle_name: user.personal_info?.middle_name || "",
        surname: user.personal_info?.surname || "",
        qualifier: user.personal_info?.qualifier || "",
        sex: user.personal_info?.sex || "",
        civil_status: user.personal_info?.civil_status || "",
        birthday: user.personal_info?.birthday
          ? new Date(user.personal_info.birthday).toISOString().split("T")[0]
          : "",
        pwd: user.personal_info?.pwd || false,
        nationality: user.personal_info?.nationality || "",
        phone_number: user.phone_number || "",
        email: user.email || "",
        status: user.status || "Active",
        house_no: user.address?.house_no || "",
        street: user.address?.street || "",
        barangay: user.address?.barangay || "",
        city: user.address?.city || "",
        postal_code: user.address?.postal_code || "",
        province: user.address?.province || "",
        country: user.address?.country || "",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-80 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-2xl font-semibold text-indigo-700 flex items-center gap-2">
            <User size={24} /> {isEditing ? "Edit User" : "User Details"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* STATUS */}
        {isLoading && (
          <div className="text-gray-600 bg-gray-50 border border-gray-200 px-3 py-2 rounded mb-4">
            Loading user information...
          </div>
        )}

        {isError && (
          <div className="text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded mb-4">
            Error loading user.
          </div>
        )}

        {/* USER DETAILS */}
        {user && (
          <div className="space-y-6 mb-6">
            {/* Personal Information Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-3">
                Personal Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Given Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="given_name"
                      value={formData.given_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-medium">
                      {user.personal_info?.given_name}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Middle Name</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="middle_name"
                      value={formData.middle_name}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-medium">
                      {user.personal_info?.middle_name}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Surname</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="surname"
                      value={formData.surname}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-medium">{user.personal_info?.surname}</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Qualifier</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="qualifier"
                      value={formData.qualifier}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-medium">
                      {user.personal_info?.qualifier || "N/A"}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Sex</p>
                  {isEditing ? (
                    <select
                      name="sex"
                      value={formData.sex}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Select...</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  ) : (
                    <p className="font-medium">
                      {user.personal_info?.sex || "N/A"}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Civil Status</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="civil_status"
                      value={formData.civil_status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-medium">
                      {user.personal_info?.civil_status || "N/A"}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Birthday</p>
                  {isEditing ? (
                    <input
                      type="date"
                      name="birthday"
                      value={formData.birthday}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-medium">
                      {user.personal_info?.birthday
                        ? new Date(
                            user.personal_info.birthday
                          ).toLocaleDateString()
                        : "N/A"}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Nationality</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-medium">
                      {user.personal_info?.nationality || "N/A"}
                    </p>
                  )}
                </div>

                <div className="flex items-center">
                  <label className="flex items-center gap-2">
                    {isEditing ? (
                      <input
                        type="checkbox"
                        name="pwd"
                        checked={formData.pwd}
                        onChange={handleInputChange}
                        className="w-4 h-4"
                      />
                    ) : (
                      <input
                        type="checkbox"
                        checked={user.personal_info?.pwd}
                        disabled
                        className="w-4 h-4"
                      />
                    )}
                    <span className="text-sm text-gray-700">
                      Person with Disability (PWD)
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Contact Information Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-3">
                Contact Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="phone_number"
                      value={formData.phone_number}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-medium">{user.phone_number}</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-medium">{user.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Address Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-3">
                Address
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">House No.</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="house_no"
                      value={formData.house_no}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-medium">
                      {user.address?.house_no || "N/A"}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Street</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-medium">{user.address?.street}</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Barangay</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="barangay"
                      value={formData.barangay}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-medium">{user.address?.barangay}</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">City</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-medium">{user.address?.city}</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Province</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="province"
                      value={formData.province}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-medium">{user.address?.province}</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Postal Code</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="postal_code"
                      value={formData.postal_code}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-medium">{user.address?.postal_code}</p>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Country</p>
                  {isEditing ? (
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-medium">{user.address?.country}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Account Status Section */}
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-3">
                Account Status
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  {isEditing ? (
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="Active">Active</option>
                      <option value="Suspended">Suspended</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : user.status === "Suspended"
                          ? "bg-red-100 text-red-800"
                          : user.status === "Inactive"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {user.status}
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="font-medium text-xs">
                    {user.custom_id || user._id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">
                    {user.updated_at
                      ? new Date(user.updated_at).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ACTION BUTTONS */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <button
            onClick={isEditing ? handleCancelEdit : onClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
          >
            {isEditing ? "Cancel" : "Close"}
          </button>

          {!isEditing && (
            <>
              <button
                onClick={handleEdit}
                className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium shadow-md transition"
              >
                Edit
              </button>

              <button
                onClick={handleDelete}
                disabled={deleteMutation.isLoading}
                className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium shadow-md transition disabled:opacity-50"
              >
                {deleteMutation.isLoading ? "Deleting..." : "Delete"}
              </button>
            </>
          )}

          {isEditing && (
            <button
              onClick={handleSave}
              disabled={updateMutation.isLoading}
              className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium shadow-md transition disabled:opacity-50"
            >
              {updateMutation.isLoading ? "Updating..." : "Update"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal;
