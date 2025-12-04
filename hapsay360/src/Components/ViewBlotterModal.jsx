import React from 'react';
import { X, User, Calendar, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import Modal from './Modal';

const ViewBlotterModal = ({ isOpen, onClose, blotter }) => {
  if (!isOpen || !blotter) return null;

  const reporterName = blotter?.reporter?.fullName || 'Unknown Reporter';
  const officerName = blotter?.assigned_Officer
    ? `${blotter.assigned_Officer.first_name} ${blotter.assigned_Officer.last_name}`.trim()
    : 'Unassigned';
  const type = blotter?.incident?.type || 'Unknown';
  const dateFiled = blotter?.created_at ? new Date(blotter.created_at).toLocaleDateString() : 'N/A';
  const status = blotter?.status || 'Unknown';
  const notes = blotter?.notes || 'None';

  return (
    <Modal onClose={onClose} maxWidth="max-w-md">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Blotter Details</h2>
          <button onClick={onClose} className="text-white hover:bg-purple-800 rounded-full p-2 transition-colors">
            <X size={22} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border">
              <User size={32} className="text-gray-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{reporterName}</h3>
              <p className="text-sm text-gray-500 mt-1">
                BLOTTER #: <span className="font-mono text-purple-600">{blotter.blotterNumber || blotter.custom_id}</span>
              </p>
              <p className="text-sm text-gray-500 mt-1">Type: {type}</p>
              <p className="text-sm text-gray-500 mt-1">Assigned Officer: {officerName}</p>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-lg p-4 space-y-3">
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="text-gray-800 font-semibold flex items-center gap-2">
                {status.toLowerCase() === 'resolved' ? <CheckCircle size={16} className="text-green-600" /> : <AlertCircle size={16} className="text-yellow-600" />}
                {status}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Date Filed</p>
              <p className="text-gray-800 font-semibold flex items-center gap-2">
                <Calendar size={16} /> {dateFiled}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">Notes</p>
              <p className="text-gray-800 mt-1">{notes}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewBlotterModal;
