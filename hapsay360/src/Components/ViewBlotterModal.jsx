import React from 'react';
import { X, User, Calendar, FileText, CheckCircle, AlertCircle, Trash2, Download } from 'lucide-react';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import Modal from './Modal';
import api from '../utils/api';

const ViewBlotterModal = ({ isOpen, onClose, blotter, onEdit }) => {
  const queryClient = useQueryClient();

  // Fetch officer profile picture as blob if it exists
  const { data: officerProfilePicUrl } = useQuery({
    queryKey: ['officerProfilePic', blotter?.assigned_Officer?._id],
    queryFn: async () => {
      if (!blotter?.assigned_Officer?._id) return null;
      try {
        const response = await api.get(`/officers/${blotter.assigned_Officer._id}/picture`);
        if (!response.ok) return null;
        const blob = await response.blob();
        return URL.createObjectURL(blob);
      } catch (error) {
        console.error('Failed to fetch officer profile picture:', error);
        return null;
      }
    },
    enabled: isOpen && !!blotter?.assigned_Officer?._id,
  });

  // Cleanup blob URL when component unmounts
  React.useEffect(() => {
    return () => {
      if (officerProfilePicUrl) {
        URL.revokeObjectURL(officerProfilePicUrl);
      }
    };
  }, [officerProfilePicUrl]);

  const deleteBlotter = async () => {
    const response = await api.delete(`blotters/delete/${blotter._id}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to delete blotter.');
    return data;
  };

  const { mutate: handleDelete, isLoading: isDeleting } = useMutation({
    mutationFn: deleteBlotter,
    onSuccess: () => {
      queryClient.invalidateQueries(['blotters']);
      alert('Blotter deleted successfully!');
      onClose();
    },
    onError: (err) => {
      alert(err.message || 'Failed to delete blotter');
    },
  });

  if (!isOpen || !blotter) return null;

  const confirmDelete = () => {
    if (window.confirm(`Are you sure you want to delete blotter #${blotter.blotterNumber || blotter.custom_id}? This action cannot be undone.`)) {
      handleDelete();
    }
  };

  const reporterName = blotter?.reporter?.fullName || 'Unknown Reporter';
  const reporterContact = blotter?.reporter?.contactNumber || 'N/A';
  const reporterAddress = blotter?.reporter?.address || 'N/A';
  
  const officerName = blotter?.assigned_Officer
    ? `${blotter.assigned_Officer.first_name} ${blotter.assigned_Officer.last_name}`.trim()
    : 'Unassigned';

  const type = blotter?.incident?.type || 'Unknown';
  const incidentDate = blotter?.incident?.date 
    ? new Date(blotter.incident.date).toLocaleDateString() 
    : 'N/A';
  const incidentTime = blotter?.incident?.time || 'N/A';
  const incidentDescription = blotter?.incident?.description || 'No description provided';
  const incidentLocation = blotter?.incident?.location?.address || 'Location not specified';
  
  const dateFiled = blotter?.created_at ? new Date(blotter.created_at).toLocaleDateString() : 'N/A';
  const status = blotter?.status || 'Unknown';
  const notes = blotter?.notes || 'None';

  const userName = blotter?.user_id?.personal_info
    ? `${blotter.user_id.personal_info.given_name} ${blotter.user_id.personal_info.middle_name} ${blotter.user_id.personal_info.surname}`.trim()
    : 'Unknown User';
  const userEmail = blotter?.user_id?.email || 'N/A';
  const userPhone = blotter?.user_id?.phone_number || 'N/A';

  // Helper to download attachment
  const downloadAttachment = (attachmentUrl, filename) => {
    const link = document.createElement('a');
    link.href = attachmentUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper to determine if attachment is an image
  const isImage = (mimetype) => {
    return mimetype && mimetype.startsWith('image/');
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Blotter Details</h2>
          <button onClick={onClose} className="text-white hover:bg-purple-800 rounded-full p-2 transition-colors">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          {/* User who filed the blotter */}
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border">
              {userProfilePicUrl ? (
                <img src={userProfilePicUrl} alt="User" className="w-full h-full object-cover" />
              ) : (
                <User size={32} className="text-gray-400" />
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{reporterName}</h3>
              <p className="text-sm text-gray-500 mt-1">Contact: {reporterContact}</p>
              <p className="text-sm text-gray-500">Address: {reporterAddress}</p>
              <p className="text-sm text-gray-500 mt-1">
                BLOTTER #: <span className="font-mono text-purple-600">{blotter.blotterNumber || blotter.custom_id}</span>
              </p>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-2">Filed by User</h4>
            <p className="text-sm text-gray-700">Name: {userName}</p>
            <p className="text-sm text-gray-700">Email: {userEmail}</p>
            <p className="text-sm text-gray-700">Phone: {userPhone}</p>
          </div>

          <div className="bg-white border border-gray-100 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-gray-800 mb-2">Incident Details</h4>
            <div>
              <p className="text-sm text-gray-500">Type</p>
              <p className="text-gray-800 font-semibold">{type}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Date & Time</p>
              <p className="text-gray-800">{incidentDate} at {incidentTime}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Location</p>
              <p className="text-gray-800">{incidentLocation}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Description</p>
              <p className="text-gray-800 mt-1">{incidentDescription}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-gray-800 font-semibold flex items-center gap-2">
                {status.toLowerCase() === 'resolved' ? (
                  <CheckCircle size={16} className="text-green-600" />
                ) : (
                  <AlertCircle size={16} className="text-yellow-600" />
                )}
                {status}
              </p>
            </div>

            {/* Assigned Officer with profile picture */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Assigned Officer</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border">
                  {officerProfilePicUrl ? (
                    <img src={officerProfilePicUrl} alt="Officer" className="w-full h-full object-cover" />
                  ) : (
                    <User size={20} className="text-gray-400" />
                  )}
                </div>
                <p className="text-gray-800 font-semibold">{officerName}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-500">Date Filed</p>
              <p className="text-gray-800 font-semibold flex items-center gap-2">
                <Calendar size={16} /> {dateFiled}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Admin Notes</p>
              <p className="text-gray-800 mt-1">{notes}</p>
            </div>
          </div>

          {/* Attachments Section with Blob URLs */}
          <div className="bg-white border border-gray-100 rounded-lg p-4 space-y-3">
            <p className="text-sm text-gray-500 mb-2">
              Attachments {blotter?.attachments?.length > 0 && `(${blotter.attachments.length})`}
            </p>
            
            {attachmentsLoading ? (
              <p className="text-gray-400">Loading attachments...</p>
            ) : attachmentsError ? (
              <p className="text-red-500">Error loading attachments: {attachmentsError.message}</p>
            ) : attachmentUrls && attachmentUrls.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {attachmentUrls.map((att, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-3">
                    {isImage(att.mimetype) ? (
                      // Display image preview
                      <div className="space-y-2">
                        <img 
                          src={att.url} 
                          alt={att.filename} 
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 truncate flex-1">
                            {att.filename}
                          </span>
                          <button
                            onClick={() => downloadAttachment(att.url, att.filename)}
                            className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm"
                          >
                            <Download size={16} />
                            Download
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Display file with download button
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 flex-1">
                          <FileText size={16} className="text-gray-400" />
                          <span className="text-sm text-gray-600 truncate">
                            {att.filename}
                          </span>
                        </div>
                        <button
                          onClick={() => downloadAttachment(att.url, att.filename)}
                          className="flex items-center gap-1 text-purple-600 hover:text-purple-700 text-sm"
                        >
                          <Download size={16} />
                          Download
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : blotter?.attachments?.length > 0 ? (
              <p className="text-yellow-600">Failed to load {blotter.attachments.length} attachment(s)</p>
            ) : (
              <p className="text-gray-400">No attachments</p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-between gap-3">
          <button
            onClick={confirmDelete}
            disabled={isDeleting}
            className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-60"
          >
            <Trash2 size={18} />
            {isDeleting ? 'Deleting...' : 'Delete'}
          </button>
          
          <div className="flex gap-3">
            {onEdit && (
              <button
                onClick={() => {
                  onClose();
                  onEdit();
                }}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Edit
              </button>
            )}
            <button onClick={onClose} className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors">
              Close
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default ViewBlotterModal;
