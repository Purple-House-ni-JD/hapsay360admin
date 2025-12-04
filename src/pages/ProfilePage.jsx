import React, { useState, useEffect, useRef } from "react";
import { UserCircle, Edit2, Camera } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Sidebar from "../Components/Sidebar";
import AdminHeader from "../Components/AdminHeader";
import api from "../utils/api";

const fetchOfficerProfile = async () => {
  const response = await api.get("officers/profile");
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Unable to fetch profile");
  }
  const data = await response.json();
  return data?.data;
};

const updateOfficerProfile = async (profileData) => {
  const response = await api.put("officers/profile", profileData);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Unable to update profile");
  }
  return data;
};

const ProfilePage = () => {
  const queryClient = useQueryClient();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved ? JSON.parse(saved) : false;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    mobile_number: "",
    radio_id: ""
  });

  const [profileImage, setProfileImage] = useState(null);
  const [originalProfileImage, setOriginalProfileImage] = useState(null);
  const fileInputRef = useRef(null);

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const newValue = !prev;
      localStorage.setItem('sidebarCollapsed', JSON.stringify(newValue));
      return newValue;
    });
  };

  const {
    data: profile,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ["officerProfile"],
    queryFn: fetchOfficerProfile,
    retry: 1,
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        mobile_number: profile.contact?.mobile_number || "",
        radio_id: profile.contact?.radio_id || ""
      });
      setProfileImage(profile.profile_picture || null);
      setOriginalProfileImage(profile.profile_picture || null);
    }
  }, [profile]);

  const { mutate: updateProfile, isLoading: isUpdating } = useMutation({
    mutationFn: updateOfficerProfile,
    onSuccess: () => {
      queryClient.invalidateQueries(["officerProfile"]);
      setIsEditing(false);
      alert("Profile updated successfully!");
    },
    onError: (error) => {
      alert("Failed to update profile: " + error.message);
    }
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfile(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (profile) {
      setFormData({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        email: profile.email || "",
        mobile_number: profile.contact?.mobile_number || "",
        radio_id: profile.contact?.radio_id || ""
      });
      setProfileImage(originalProfileImage); // reset profile pic
    }
  };

  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out?")) {
      localStorage.removeItem('token');
      window.location.href = '/';
    }
  };

  const handleImageClick = () => {
    if (!isEditing) return; // only allow change in edit mode
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(reader.result);
        // Optionally, you can upload this to backend when saving
      };
      reader.readAsDataURL(file);
    }
  };

  if (isLoading) {
    return (
      <div className="flex">
        <Sidebar activePage="profile" isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
        <main className={`flex-1 h-screen overflow-y-auto bg-gray-100 p-10 transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-20' : 'ml-96'}`}>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-xl text-gray-600">Loading profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex">
        <Sidebar activePage="profile" isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
        <main className={`flex-1 h-screen overflow-y-auto bg-gray-100 p-10 transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-20' : 'ml-96'}`}>
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-xl text-red-600 mb-4">Failed to load profile</p>
              <p className="text-gray-600">{error?.message || "Please try again later"}</p>
              <button 
                onClick={() => window.location.reload()}
                className="mt-4 bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
              >
                Retry
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex">
      <Sidebar activePage="profile" isCollapsed={isCollapsed} toggleCollapse={toggleCollapse} />
      <main className={`flex-1 h-screen overflow-y-auto bg-gray-100 p-10 transition-all duration-300 ease-in-out ${isCollapsed ? 'ml-20' : 'ml-96'}`}>

        {/* Header */}
        <div className="sticky -top-10 z-20 bg-gray-100 pt-4 pb-4">
          <AdminHeader 
            title="My Profile" 
            username={`${profile?.first_name || ''} ${profile?.last_name || ''}`} 
          />
        </div>

        {/* Profile Section */}
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
          This section is for managing your personal details and contact information.
        </p>

        {/* Profile Card */}
        <div className="bg-white p-8 rounded-xl shadow-lg">
          <div className="flex flex-col md:flex-row gap-8">

            {/* Profile Picture Section */}
            <div className="flex flex-col items-center">
              <div className="relative cursor-pointer" onClick={handleImageClick}>
                <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  {profileImage ? (
                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover"/>
                  ) : (
                    <UserCircle size={180} className="text-gray-400" />
                  )}
                </div>
                {isEditing && (
                  <button className="absolute bottom-2 right-2 bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-full shadow-lg">
                    <Camera size={20} />
                  </button>
                )}
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={fileInputRef} 
                  onChange={handleImageChange} 
                  className="hidden" 
                />
              </div>
              <p className="mt-4 text-sm text-gray-500">{isEditing ? 'Click to change profile picture' : 'Profile picture'}</p>
            </div>

            {/* Profile Information Section */}
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

                  <div className="space-y-3">
                    <div className="flex gap-2"><p className="font-medium w-36">Role:</p><p>{profile?.role || 'Officer'}</p></div>
                    <div className="flex gap-2"><p className="font-medium w-36">Officer ID:</p><p>{profile?.custom_id || 'N/A'}</p></div>
                    <div className="flex gap-2"><p className="font-medium w-36">Name:</p><p>{profile?.first_name || ''} {profile?.last_name || ''}</p></div>
                    <div className="flex gap-2"><p className="font-medium w-36">Phone Number:</p><p>{profile?.contact?.mobile_number || 'Not provided'}</p></div>
                    <div className="flex gap-2"><p className="font-medium w-36">Email:</p><p>{profile?.email || 'Not provided'}</p></div>
                    <div className="flex gap-2"><p className="font-medium w-36">Radio ID:</p><p>{profile?.contact?.radio_id || 'Not provided'}</p></div>
                    {profile?.station_id && <div className="flex gap-2"><p className="font-medium w-36">Station:</p><p>{profile.station_id.name || 'Not assigned'}</p></div>}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold text-[#4f52e8] mb-4">Edit Profile Information</h3>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#4f52e8] mb-2">
                          First Name <span className="text-red-500">*</span>
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
                        <label className="block text-sm font-medium text-[#4f52e8] mb-2">
                          Last Name <span className="text-red-500">*</span>
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
                      <label className="block text-sm font-medium text-[#4f52e8] mb-2">
                        Email <span className="text-red-500">*</span>
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
                      <label className="block text-sm font-medium text-[#4f52e8] mb-2">
                        Mobile Number
                      </label>
                      <input
                        type="text"
                        name="mobile_number"
                        value={formData.mobile_number}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g. +63 912 345 6789"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#4f52e8] mb-2">
                        Radio ID
                      </label>
                      <input
                        type="text"
                        name="radio_id"
                        value={formData.radio_id}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="e.g. RADIO-001"
                      />
                    </div>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {isUpdating ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={isUpdating}
                      className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-6 py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Cancel
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
