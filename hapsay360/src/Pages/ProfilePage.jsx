import React, { useState } from "react";
import { UserCircle, Edit2, Camera, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "../Components/Sidebar";
import AdminHeader from "../Components/AdminHeader";
import api from "../utils/api";

const fetchOfficerProfile = async () => {
  const response = await api.get("/officers/profile");
  if (!response.ok) throw new Error("Unable to fetch profile");
  const data = await response.json();
  return data?.data;
};

const fetchProfilePicture = async () => {
  try {
    const response = await api.get("/officers/profile/picture");
    if (!response.ok) return null;
    const blob = await response.blob();
    return URL.createObjectURL(blob);
  } catch (error) {
    console.error("Failed to fetch profile picture:", error);
    return null;
  }
};

const updateOfficerProfile = async (profileData) => {
  const response = await api.put("/officers/profile", profileData);
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || "Unable to update profile");
  return data;
};

const ProfilePage = () => {
  const queryClient = useQueryClient();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = window.localStorage?.getItem("sidebarCollapsed");
    return saved ? JSON.parse(saved) : false;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile_number: "",
    radio_id: "",
  });
  const [profileImageData, setProfileImageData] = useState(null);
  const [removeProfilePicture, setRemoveProfilePicture] = useState(false);

  const toggleCollapse = () => {
    setIsCollapsed((prev) => {
      const newValue = !prev;
      if (window.localStorage) {
        window.localStorage.setItem("sidebarCollapsed", JSON.stringify(newValue));
      }
      return newValue;
    });
  };

  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["officerProfile"],
    queryFn: fetchOfficerProfile,
  });

  // Update formData when profile is loaded
  React.useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        mobile_number: profile.contact?.mobile_number || "",
        radio_id: profile.contact?.radio_id || "",
      });
    }
  }, [profile]);

  const { data: profileImageUrl } = useQuery({
    queryKey: ["officerProfilePicture"],
    queryFn: fetchProfilePicture,
    enabled: !!profile?.profile_picture_url,
  });

  const updateProfilePicture = async (base64Data, filename, mimetype) => {
    const pictureResponse = await api.put("/officers/profile/picture", {
      profile_picture: { data: base64Data, filename, mimetype },
    });
    const pictureData = await pictureResponse.json();
    if (!pictureResponse.ok || !pictureData.success) {
      throw new Error(pictureData.message || "Unable to update profile picture");
    }
  };

  const deleteProfilePicture = async () => {
    const pictureResponse = await api.delete("/officers/profile/picture");
    const pictureData = await pictureResponse.json();
    if (!pictureResponse.ok || !pictureData.success) {
      throw new Error(pictureData.message || "Unable to remove profile picture");
    }
  };

  const { mutate: updateProfile, isLoading: isUpdating } = useMutation({
    mutationFn: updateOfficerProfile,
    onSuccess: async () => {
      try {
        // Handle profile picture removal
        if (removeProfilePicture) {
          await deleteProfilePicture();
          setRemoveProfilePicture(false);
        }
        // Handle profile picture upload
        else if (profileImageData) {
          await updateProfilePicture(
            profileImageData.data,
            profileImageData.filename,
            profileImageData.mimetype
          );
        }
        
        setProfileImageData(null);
        await queryClient.invalidateQueries(["officerProfile"]);
        await queryClient.invalidateQueries(["officerProfilePicture"]);
        setIsEditing(false);
        alert("Profile updated successfully");
      } catch (error) {
        console.error("Failed to update profile picture:", error);
        alert(
          "Profile details were updated, but updating the profile picture failed: " +
            error.message
        );
      }
    },
    onError: (error) => {
      alert("Failed to update profile: " + error.message);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return setProfileImageData(null);

    const reader = new FileReader();
    reader.onload = () => {
      setProfileImageData({
        data: reader.result,
        filename: file.name,
        mimetype: file.type,
      });
      setRemoveProfilePicture(false); // Cancel removal if new image selected
    };
    reader.onerror = () => {
      alert("Failed to read image file");
      setProfileImageData(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveProfilePicture = () => {
    setRemoveProfilePicture(true);
    setProfileImageData(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setProfileImageData(null);
    setRemoveProfilePicture(false);
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        mobile_number: profile.contact?.mobile_number || "",
        radio_id: profile.contact?.radio_id || "",
      });
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      if (window.localStorage) {
        window.localStorage.removeItem("token");
      }
      window.location.href = "/";
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      if (window.confirm("This will permanently delete all your data. Are you absolutely sure?")) {
        try {
          const response = await api.delete("/officers/profile");
          const data = await response.json();
          
          if (response.ok && data.success) {
            alert("Account deleted successfully");
            if (window.localStorage) {
              window.localStorage.removeItem("token");
            }
            window.location.href = "/";
          } else {
            alert("Failed to delete account: " + (data.message || "Unknown error"));
          }
        } catch (error) {
          console.error("Delete account error:", error);
          alert("Failed to delete account: " + error.message);
        }
      }
    }
  };

  // Determine which image to display
  const displayImageUrl = removeProfilePicture 
    ? null 
    : (profileImageData ? profileImageData.data : profileImageUrl);

  if (isLoading)
    return (
      <div className="flex">
        <Sidebar activePage="profile" isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
        <main
          className={`flex-1 h-screen overflow-y-auto bg-gray-100 p-10 transition-all duration-300 ease-in-out ${
            isCollapsed ? "ml-20" : "ml-96"
          }`}
        >
          <div className="flex items-center justify-center h-full">
            <p className="text-xl text-gray-600">Loading profile...</p>
          </div>
        </main>
      </div>
    );

  if (isError)
    return (
      <div className="flex">
        <Sidebar activePage="profile" isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
        <main
          className={`flex-1 h-screen overflow-y-auto bg-gray-100 p-10 transition-all duration-300 ease-in-out ${
            isCollapsed ? "ml-20" : "ml-96"
          }`}
        >
          <div className="flex items-center justify-center h-full">
            <p className="text-xl text-red-600">Failed to load profile</p>
          </div>
        </main>
      </div>
    );

  return (
    <div className="flex">
      <Sidebar activePage="profile" isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
      <main
        className={`flex-1 h-screen overflow-y-auto bg-gray-100 p-10 transition-all duration-300 ease-in-out ${
          isCollapsed ? "ml-20" : "ml-96"
        }`}
      >
        <div className="sticky -top-10 z-20 bg-gray-100 pt-4 pb-4">
          <AdminHeader
            title="My Profile"
            username={`${profile?.first_name || ""} ${profile?.last_name || ""}`}
          />
        </div>

        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6">
          <h2 className="text-3xl font-bold">My profile</h2>
          <button
            onClick={handleLogout}
            className="bg-red-500 hover:bg-red-600 text-white px-5 py-3 rounded-lg font-medium shadow-lg hover:shadow-2xl transition-shadow mt-4 md:mt-0"
          >
            Log out
          </button>
        </div>

        <p className="text-gray-600 mb-6">
          This section is for managing the Admin's personal details, password, and security settings.
        </p>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Profile Picture */}
            <div className="flex flex-col items-center">
              <div className="relative w-48 h-48">
                <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {displayImageUrl ? (
                    <img src={displayImageUrl} alt="Profile" className="w-48 h-48 object-cover" />
                  ) : (
                    <UserCircle size={180} className="text-gray-400" />
                  )}
                </div>
                {isEditing && (
                  <>
                    <label
                      htmlFor="profileImage"
                      className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow-md cursor-pointer hover:bg-gray-100"
                    >
                      <Camera size={20} className="text-gray-600" />
                      <input
                        type="file"
                        id="profileImage"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfileImageChange}
                      />
                    </label>
                    {(displayImageUrl || profileImageData) && !removeProfilePicture && (
                      <button
                        type="button"
                        onClick={handleRemoveProfilePicture}
                        className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 p-2 rounded-full shadow-md"
                        title="Remove profile picture"
                      >
                        <X size={20} className="text-white" />
                      </button>
                    )}
                  </>
                )}
                {isEditing && (
                  <p className="mt-2 text-sm text-gray-500 text-center">
                    {removeProfilePicture 
                      ? "Picture will be removed" 
                      : profileImageData 
                      ? "New image selected" 
                      : "Change profile picture"}
                  </p>
                )}
              </div>
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              {!isEditing ? (
                <div className="bg-[#eef2ff] rounded-lg p-6 text-[#4f52e8]">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-semibold text-[#4f52e8]">Profile Information</h3>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center gap-2 text-[#4f52e8] hover:text-[#3e40c0] font-medium"
                    >
                      <Edit2 size={16} />
                      Edit Information
                    </button>
                  </div>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-500">Role: {profile?.role || "Admin"}</p>
                    <p className="text-sm text-gray-500">Admin ID: {profile?.custom_id || "N/A"}</p>
                    <p className="text-sm text-gray-500">
                      Name: {profile?.first_name || ""} {profile?.last_name || ""}
                    </p>
                    <p className="text-sm text-gray-500">
                      Phone no: {profile?.contact?.mobile_number || "Not provided"}
                    </p>
                    <p className="text-sm text-gray-500">Email: {profile?.email || "Not provided"}</p>
                    <p className="text-sm text-gray-500">
                      Radio ID: {profile?.contact?.radio_id || "Not provided"}
                    </p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-[#4f52e8] mb-4">
                    Edit Profile Information
                  </h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          name="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        name="mobile_number"
                        value={formData.mobile_number}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Radio ID
                      </label>
                      <input
                        type="text"
                        name="radio_id"
                        value={formData.radio_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50"
                    >
                      {isUpdating ? "Saving..." : "Save Changes"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDeleteAccount}
                      className="bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-lg font-medium ml-auto"
                    >
                      Delete Account
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProfilePage;