import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { X, FileText, User, Calendar, CreditCard, Image as ImageIcon } from "lucide-react";

const apiBaseUrl = (
  import.meta.env.VITE_API_URL || "http://localhost:3000/api"
).replace(/\/?$/, "/");

// Fetch single clearance
const fetchClearanceById = async (clearanceId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${apiBaseUrl}clearance`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) throw new Error("Failed to load clearances");
  const result = await response.json();
  const clearances = result.data || [];
  const clearance = clearances.find((c) => c._id === clearanceId);
  if (!clearance) throw new Error("Clearance not found");
  return clearance;
};

// Update clearance
const updateClearanceApi = async ({ clearanceId, data }) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${apiBaseUrl}clearance/${clearanceId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error("Failed to update clearance");
  return response.json();
};

// Delete clearance
const deleteClearanceApi = async (clearanceId) => {
  const token = localStorage.getItem("token");
  const response = await fetch(`${apiBaseUrl}clearance/${clearanceId}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
  if (!response.ok) throw new Error("Failed to delete clearance");
  return response.json();
};

const ClearanceDetailsModal = ({ isOpen, onClose, clearanceId }) => {
  const queryClient = useQueryClient();
  const [isReviewing, setIsReviewing] = useState(false);
  const [formData, setFormData] = useState({
    status: "pending",
    paymentStatus: "pending",
    paymentProcessor: "",
    paymentTransactionId: "",
    price: "",
  });

  const {
    data: clearance,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["clearance", clearanceId],
    queryFn: () => fetchClearanceById(clearanceId),
    enabled: !!clearanceId && isOpen,
  });

  // Fetch clearance attachments as blob URLs
  const { data: attachmentUrls } = useQuery({
    queryKey: ["clearanceAttachments", clearanceId],
    queryFn: async () => {
      if (!clearance?._id || !clearance?.attachments || clearance.attachments.length === 0) return {};
      
      const urls = {};
      const token = localStorage.getItem("token");
      
      console.log('Fetching clearance attachments for:', clearance._id);
      console.log('Total attachments:', clearance.attachments.length);
      
      try {
        for (let i = 0; i < clearance.attachments.length; i++) {
          try {
            const url = `${apiBaseUrl}clearance/${clearance._id}/attachments/${i}`;
            console.log(`Fetching attachment ${i} from:`, url);
            
            const response = await fetch(url, {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            });
            
            console.log(`Attachment ${i} response status:`, response.status);
            
            if (!response.ok) {
              console.error(`Failed to fetch attachment ${i}: ${response.status} ${response.statusText}`);
              urls[i] = null;
              continue;
            }
            
            const blob = await response.blob();
            console.log(`Attachment ${i} blob size:`, blob.size, 'type:', blob.type);
            urls[i] = URL.createObjectURL(blob);
            console.log(`Created object URL for attachment ${i}:`, urls[i]);
          } catch (error) {
            console.error(`Error fetching attachment ${i}:`, error);
            urls[i] = null;
          }
        }
        console.log('Final attachment URLs:', urls);
        return urls;
      } catch (error) {
        console.error('Failed to fetch clearance attachments:', error);
        return {};
      }
    },
    enabled: isOpen && !!clearance?._id && !!clearance?.attachments?.length,
  });

  // Cleanup blob URLs when component unmounts or data changes
  useEffect(() => {
    return () => {
      if (attachmentUrls) {
        Object.values(attachmentUrls).forEach(url => {
          if (url) URL.revokeObjectURL(url);
        });
      }
    };
  }, [attachmentUrls]);

  // Update form data when clearance data is loaded
  useEffect(() => {
    if (clearance) {
      setFormData({
        status: clearance.status || "pending",
        paymentStatus: clearance.payment?.status || "pending",
        paymentProcessor: clearance.payment?.processor || "",
        paymentTransactionId: clearance.payment?.transaction_id || "",
        price: clearance.price || "",
      });
    }
  }, [clearance]);

  const updateMutation = useMutation({
    mutationFn: updateClearanceApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["clearances"]);
      queryClient.invalidateQueries(["clearance", clearanceId]);
      alert("Clearance updated successfully!");
      setIsReviewing(false);
    },
    onError: (error) => {
      alert(`Error updating clearance: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteClearanceApi,
    onSuccess: () => {
      queryClient.invalidateQueries(["clearances"]);
      alert("Clearance deleted successfully!");
      onClose();
    },
    onError: (error) => {
      alert(`Error deleting clearance: ${error.message}`);
    },
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = () => {
    const updateData = {
      status: formData.status,
      paymentStatus: formData.paymentStatus,
      payment: {
        status: formData.paymentStatus,
        processor: formData.paymentProcessor,
        transaction_id: formData.paymentTransactionId,
      },
    };

    // Only include price if it has a value
    if (formData.price) {
      updateData.price = Number(formData.price);
    }

    updateMutation.mutate({ clearanceId, data: updateData });
  };

  const handleReview = () => {
    setIsReviewing(true);
  };

  const handleCancelReview = () => {
    setIsReviewing(false);
    // Reset form data
    if (clearance) {
      setFormData({
        status: clearance.status || "pending",
        paymentStatus: clearance.payment?.status || "pending",
        paymentProcessor: clearance.payment?.processor || "",
        paymentTransactionId: clearance.payment?.transaction_id || "",
        price: clearance.price || "",
      });
    }
  };

  const handleApprove = () => {
    if (
      window.confirm(
        "Are you sure you want to approve this clearance application?"
      )
    ) {
      updateMutation.mutate({
        clearanceId,
        data: { status: "confirmed" },
      });
    }
  };

  const handleReject = () => {
    if (
      window.confirm(
        "Are you sure you want to reject this clearance application?"
      )
    ) {
      updateMutation.mutate({
        clearanceId,
        data: { status: "rejected" },
      });
    }
  };

  const handleDelete = () => {
    if (
      window.confirm(
        "Are you sure you want to delete this clearance application? This action cannot be undone."
      )
    ) {
      deleteMutation.mutate(clearanceId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-80 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-100 opacity-100">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h3 className="text-2xl font-semibold text-indigo-700 flex items-center gap-2">
            <FileText size={24} />{" "}
            {isReviewing ? "Review Application" : "Clearance Details"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Loading/Error States */}
        {isLoading && (
          <div className="text-gray-600 bg-gray-50 border border-gray-200 px-3 py-2 rounded mb-4">
            Loading clearance information...
          </div>
        )}

        {isError && (
          <div className="text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded mb-4">
            Error loading clearance.
          </div>
        )}

        {/* Clearance Details */}
        {clearance && (
          <div className="space-y-6 mb-6">
            {/* Application Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <FileText size={20} /> Application Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Application ID</p>
                  <p className="font-medium text-purple-600">
                    {clearance.custom_id || clearance._id}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Date Applied</p>
                  <p className="font-medium">
                    {clearance.created_at
                      ? new Date(clearance.created_at).toLocaleString()
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Purpose</p>
                  <p className="font-medium">{clearance.purpose || "N/A"}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Price</p>
                  {isReviewing ? (
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="Enter price"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-medium">
                      {clearance.price
                        ? `₱${clearance.price.toFixed(2)}`
                        : "Not set"}
                    </p>
                  )}
                </div>

                {clearance.appointment_date && (
                  <div>
                    <p className="text-sm text-gray-500">Appointment Date</p>
                    <p className="font-medium">
                      {new Date(
                        clearance.appointment_date
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {clearance.time_slot && (
                  <div>
                    <p className="text-sm text-gray-500">Time Slot</p>
                    <p className="font-medium">{clearance.time_slot}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Applicant Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <User size={20} /> Applicant Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Full Name</p>
                  <p className="font-medium">
                    {clearance.user_id?.personal_info
                      ? `${clearance.user_id.personal_info.given_name || ""} ${
                          clearance.user_id.personal_info.middle_name || ""
                        } ${
                          clearance.user_id.personal_info.surname || ""
                        }`.trim()
                      : "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">
                    {clearance.user_id?.email || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Phone Number</p>
                  <p className="font-medium">
                    {clearance.user_id?.phone_number || "N/A"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Address</p>
                  <p className="font-medium">
                    {clearance.user_id?.address
                      ? `${clearance.user_id.address.barangay || ""}, ${
                          clearance.user_id.address.city || ""
                        }, ${clearance.user_id.address.province || ""}`.trim()
                      : "N/A"}
                  </p>
                </div>

                {clearance.user_id?.personal_info?.birthday && (
                  <div>
                    <p className="text-sm text-gray-500">Birthday</p>
                    <p className="font-medium">
                      {new Date(
                        clearance.user_id.personal_info.birthday
                      ).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {clearance.user_id?.personal_info?.sex && (
                  <div>
                    <p className="text-sm text-gray-500">Sex</p>
                    <p className="font-medium">
                      {clearance.user_id.personal_info.sex}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <CreditCard size={20} /> Payment Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Payment Status</p>
                  {isReviewing ? (
                    <select
                      name="paymentStatus"
                      value={formData.paymentStatus}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="success">Success</option>
                      <option value="failed">Failed</option>
                    </select>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${
                        clearance.payment?.status === "paid" ||
                        clearance.payment?.status === "success"
                          ? "bg-green-100 text-green-800"
                          : clearance.payment?.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {clearance.payment?.status || "pending"}
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Payment Processor</p>
                  {isReviewing ? (
                    <input
                      type="text"
                      name="paymentProcessor"
                      value={formData.paymentProcessor}
                      onChange={handleInputChange}
                      placeholder="e.g., GCash, PayMaya"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-medium">
                      {clearance.payment?.processor || "Not specified"}
                    </p>
                  )}
                </div>

                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Transaction ID</p>
                  {isReviewing ? (
                    <input
                      type="text"
                      name="paymentTransactionId"
                      value={formData.paymentTransactionId}
                      onChange={handleInputChange}
                      placeholder="Enter transaction ID"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  ) : (
                    <p className="font-medium">
                      {clearance.payment?.transaction_id || "Not available"}
                    </p>
                  )}
                </div>

                {/* Payment Proof Attachments */}
                <div className="col-span-2">
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                    <ImageIcon size={16} />
                    Payment Proof
                  </p>
                  {clearance.attachments && clearance.attachments.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {clearance.attachments.map((att, idx) => {
                        const isImage = att.mimetype ? att.mimetype.startsWith('image/') : false;
                        const attachmentUrl = attachmentUrls?.[idx];
                        
                        return (
                          <a 
                            key={idx} 
                            href={attachmentUrl || '#'} 
                            download={!isImage}
                            target={isImage ? '_blank' : undefined}
                            rel="noopener noreferrer" 
                            className={`group block border border-gray-200 rounded-lg overflow-hidden transition-shadow ${attachmentUrl ? 'hover:shadow-md cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
                            style={{ minHeight: isImage ? 150 : 80 }}
                          >
                            {isImage && attachmentUrl ? (
                              <img 
                                src={attachmentUrl} 
                                alt={att.filename || 'Payment Proof'}
                                className="w-full h-full object-cover" 
                                onError={(e) => {
                                  console.error('Image failed to load:', att.filename);
                                  e.target.style.display = 'none';
                                }}
                              />
                            ) : (
                              <div className="h-full flex flex-col items-center justify-center p-3 text-center bg-gray-50 group-hover:bg-gray-100 transition-colors">
                                <FileText size={24} className="text-indigo-500 mb-1" />
                                <span className="text-xs text-gray-700 font-medium truncate w-full px-1">
                                  {att.filename || 'File Attachment'}
                                </span>
                                {!attachmentUrl && <span className="text-xs text-red-500 mt-1">Failed to load</span>}
                              </div>
                            )}
                          </a>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-gray-400 text-sm italic">No payment proof uploaded</p>
                  )}
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div>
              <h4 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Calendar size={20} /> Status Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Clearance Status</p>
                  {isReviewing ? (
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold inline-block ${
                        clearance.status === "confirmed"
                          ? "bg-green-100 text-green-800"
                          : clearance.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {clearance.status === "confirmed"
                        ? "APPROVED"
                        : clearance.status || "pending"}
                    </span>
                  )}
                </div>

                <div>
                  <p className="text-sm text-gray-500">Last Updated</p>
                  <p className="font-medium">
                    {clearance.updated_at
                      ? new Date(clearance.updated_at).toLocaleString()
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-between pt-4 border-t">
          <div className="flex gap-3">
            {!isReviewing && clearance?.status === "pending" && (
              <>
                <button
                  onClick={handleApprove}
                  disabled={updateMutation.isLoading}
                  className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-medium shadow-md transition disabled:opacity-50"
                >
                  {updateMutation.isLoading ? "Processing..." : "Approve"}
                </button>

                <button
                  onClick={handleReject}
                  disabled={updateMutation.isLoading}
                  className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium shadow-md transition disabled:opacity-50"
                >
                  {updateMutation.isLoading ? "Processing..." : "Reject"}
                </button>
              </>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={isReviewing ? handleCancelReview : onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors shadow-sm"
            >
              {isReviewing ? "Cancel" : "Close"}
            </button>

            {!isReviewing ? (
              <>
                <button
                  onClick={handleReview}
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
            ) : (
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
    </div>
  );
};

export default ClearanceDetailsModal;