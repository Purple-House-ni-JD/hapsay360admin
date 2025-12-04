import React from 'react';
import { X, User, Calendar, FileText, CheckCircle, AlertCircle, Trash2 } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from './Modal';
import api from '../utils/api';

const ViewBlotterModal = ({ isOpen, onClose, blotter, onEdit }) => {
  if (!isOpen || !blotter) return null;

  const queryClient = useQueryClient();

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

            <div>
              <p className="text-sm text-gray-500">Assigned Officer</p>
              <p className="text-gray-800 font-semibold">{officerName}</p>
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
              <div className="flex flex-col gap-2">
                {blotter.attachments.map((att, idx) => (
                  <a key={idx} href={att.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-purple-600 hover:underline">
                    <FileText size={16} />
                    <span>{att.name || att.type || "Attachment"}</span>
                  </a>
                ))}
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