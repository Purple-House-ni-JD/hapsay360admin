import React from 'react';
import { X, User, Calendar, FileText, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
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

  // FIXED: Fetch blotter attachments as blob URLs
  const { data: blotterAttachmentUrls } = useQuery({
    queryKey: ['blotterAttachments', blotter?._id],
    queryFn: async () => {
      if (!blotter?._id || !blotter?.attachments || blotter.attachments.length === 0) return {};
      
      const urls = {};
      const token = localStorage.getItem('authToken');
      
      // Get the base URL from your api instance or construct it
      const baseURL = api.defaults?.baseURL || 'http://localhost:3000/api';
      
      console.log('Fetching blotter attachments for:', blotter._id);
      console.log('Total attachments:', blotter.attachments.length);
      
      try {
        for (let i = 0; i < blotter.attachments.length; i++) {
          try {
            const url = `${baseURL}/blotters/${blotter._id}/attachments/${i}`;
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
        console.error('Failed to fetch blotter attachments:', error);
        return {};
      }
    },
    enabled: isOpen && !!blotter?._id && !!blotter?.attachments?.length,
  });

  // Cleanup blob URLs when component unmounts or data changes
  React.useEffect(() => {
    return () => {
      if (officerProfilePicUrl) {
        URL.revokeObjectURL(officerProfilePicUrl);
      }
      if (blotterAttachmentUrls) {
        Object.values(blotterAttachmentUrls).forEach(url => {
          if (url) URL.revokeObjectURL(url);
        });
      }
    };
  }, [officerProfilePicUrl, blotterAttachmentUrls]);

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
  const userProfilePic = blotter?.user_id?.profile_picture;

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
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border">
              {userProfilePic ? (
                <img src={userProfilePic} alt="User" className="w-full h-full object-cover" />
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

          <div className="bg-white border border-gray-100 rounded-lg p-4 space-y-3">
            <p className="text-sm text-gray-500 mb-2">Attachments</p>
            {blotter.attachments && blotter.attachments.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {blotter.attachments.map((att, idx) => {
                  // Check if it's an image based on mimetype
                  const isImage = att.mimetype ? att.mimetype.startsWith('image/') : false;
                  
                  // Use the fetched blob URL from the query
                  const attachmentUrl = blotterAttachmentUrls?.[idx];
                  
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
                        // Image Preview
                        <img 
                          src={attachmentUrl} 
                          alt={att.filename || 'Attachment'}
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            console.error('Image failed to load:', att.filename);
                            e.target.src = ''; // Hide image if it fails to load
                          }}
                        />
                      ) : (
                        // File Download/Link (for PDF, Word, etc.)
                        <div className="h-full flex flex-col items-center justify-center p-3 text-center bg-gray-50 group-hover:bg-gray-100 transition-colors">
                          <FileText size={24} className="text-purple-500 mb-1" />
                          <span className="text-xs text-gray-700 font-medium truncate w-full px-1">{att.filename || 'File Attachment'}</span>
                          {!attachmentUrl && <span className="text-xs text-red-500 mt-1">Failed to load</span>}
                        </div>
                      )}
                    </a>
                  );
                })}
              </div>
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
