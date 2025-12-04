import React from 'react';
import { X, User, Phone, Mail, MapPin, Users } from 'lucide-react';
import Modal from './Modal';

const ViewPersonnelModal = ({ isOpen, onClose, officer }) => {
  if (!isOpen || !officer) return null;

  const fullName = `${officer.first_name || ''} ${officer.last_name || ''}`.trim() || 'Unnamed Officer';

  return (
    <Modal onClose={onClose} maxWidth="max-w-md">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Personnel Profile</h2>
          <button onClick={onClose} className="text-white hover:bg-purple-800 rounded-full p-2 transition-colors">
            <X size={22} />
          </button>
        </div>

        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden border">
              {officer.avatar ? (
                <img src={officer.avatar} alt={fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="text-gray-400"><User size={32} /></div>
              )}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-800">{fullName}</h3>
              <p className="text-sm text-gray-500">{officer.role || officer.rank || 'Role not set'}</p>
              <p className="text-sm text-gray-500 mt-1">ID: <span className="font-mono text-purple-600">{officer.custom_id || officer._id}</span></p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-500">Contact</p>
              <p className="text-gray-800 font-semibold flex items-center gap-2 mt-2"><Phone size={16} />{officer.contact?.mobile_number || officer.contact?.mobile || 'N/A'}</p>
              <p className="text-gray-800 font-semibold flex items-center gap-2 mt-2"><Mail size={16} />{officer.email || officer.contact?.email || 'N/A'}</p>
            </div>

            <div className="bg-white border border-gray-100 rounded-lg p-4">
              <p className="text-sm text-gray-500">Assigned Station</p>
              <p className="text-gray-800 font-semibold flex items-center gap-2 mt-2"><MapPin size={16} />{officer.station_id?.name || officer.station_name || 'Unassigned'}</p>
              <p className="text-sm text-gray-500 mt-3">Status</p>
              <p className="text-gray-800 font-semibold">{officer.status || 'Unknown'}</p>
            </div>

            {officer.notes && (
              <div className="bg-white border border-gray-100 rounded-lg p-4">
                <p className="text-sm text-gray-500">Notes</p>
                <p className="text-gray-800 mt-2">{officer.notes}</p>
              </div>
            )}
          </div>

          <div className="text-sm text-gray-500 border-t pt-4 mt-4">
            <p>Hired: {officer.hired_date ? new Date(officer.hired_date).toLocaleDateString() : (officer.created_at ? new Date(officer.created_at).toLocaleDateString() : 'N/A')}</p>
          </div>
        </div>

        <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg font-medium transition-colors">Close</button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewPersonnelModal;
