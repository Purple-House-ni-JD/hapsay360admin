import React from 'react';
import { X, MapPin, Phone, Mail, Users, Home } from 'lucide-react';
import Modal from './Modal';

const ViewPoliceStationModal = ({ isOpen, onClose, station }) => {
  if (!isOpen || !station) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-2xl">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Police Station Details</h2>
          <button onClick={onClose} className="text-white hover:bg-indigo-700 rounded-full p-2 transition-colors">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="mb-4">
            <h3 className="text-xl font-semibold text-gray-800">{station.name || 'Unnamed Station'}</h3>
            <p className="text-sm text-gray-500">Station ID: <span className="font-mono text-purple-600">{station.custom_id || station._id}</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Address</p>
                <p className="text-gray-800 font-semibold">{station.address || 'N/A'}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Home size={20} className="text-blue-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Jurisdiction / Area</p>
                <p className="text-gray-800 font-semibold">{station.jurisdiction || station.area || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-500">Contact (Landline)</p>
              <p className="text-gray-800 font-semibold flex items-center gap-2"><Phone size={16} />{station.contact?.landline || 'N/A'}</p>
              <p className="text-sm text-gray-500 mt-3">Contact (Mobile)</p>
              <p className="text-gray-800 font-semibold flex items-center gap-2"><Phone size={16} />{station.contact?.mobile || station.contact?.mobile_number || 'N/A'}</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-500">Email</p>
              <p className="text-gray-800 font-semibold flex items-center gap-2"><Mail size={16} />{station.contact?.email || 'N/A'}</p>
              <p className="text-sm text-gray-500 mt-3"># of Personnel</p>
              <p className="text-gray-800 font-semibold flex items-center gap-2"><Users size={16} />{station.officer_IDs?.length ?? station.officers?.length ?? 0}</p>
            </div>
          </div>

          {station.description && (
            <div className="mb-6">
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Description</h4>
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-gray-700">
                {station.description}
              </div>
            </div>
          )}

          <div className="text-sm text-gray-500 border-t pt-4">
            <p>Created: {formatDate(station.created_at || station.createdAt)}</p>
            {station.updated_at && station.updated_at !== station.created_at && (
              <p className="mt-1">Last Updated: {formatDate(station.updated_at)}</p>
            )}
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors">Close</button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewPoliceStationModal;
