import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import Modal from './Modal';
import api from '../utils/api';

const EditBlotterModal = ({ isOpen, onClose, blotter, officers }) => {
  if (!isOpen || !blotter) return null;

  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    status: blotter.status || 'Pending',
    assigned_officer_id: blotter.assigned_Officer?._id || '',
    notes: blotter.notes || '',
  });

  const updateBlotter = async (payload) => {
    const response = await api.put(`blotters/update/${blotter._id}`, payload);
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Unable to update blotter.');
    return data;
  };

  const { mutate, isLoading, isError, isSuccess, error } = useMutation({
    mutationFn: updateBlotter,
    onSuccess: () => {
      queryClient.invalidateQueries(['blotters']);
      alert('Blotter updated successfully!');
    },
    onError: (err) => {
      alert(err.message || 'Failed to update blotter');
    },
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    mutate(form);
    onClose();
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-lg">
      <div className="relative w-full bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Edit Blotter</h2>

          {isSuccess && (
            <div className="mb-3 rounded-md bg-green-50 border border-green-100 text-green-700 px-3 py-2">
              Updated successfully!
            </div>
          )}

          {isError && (
            <div className="mb-3 rounded-md bg-red-50 border border-red-100 text-red-700 px-3 py-2">
              {error?.message || 'Unable to update blotter.'}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>Pending</option>
                <option>Under Review</option>
                <option>Investigating</option>
                <option>Resolved</option>
                <option>Closed</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Officer</label>
              <select
                name="assigned_officer_id"
                value={form.assigned_officer_id}
                onChange={handleChange}
                className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Unassigned</option>
                {officers?.map((officer) => (
                  <option key={officer._id} value={officer._id}>
                    {officer.first_name} {officer.last_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Enter any notes..."
                className="w-full border border-gray-200 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-purple-600 text-white py-2 rounded-md hover:bg-purple-700 disabled:opacity-60"
              >
                {isLoading ? 'Saving...' : 'Save Changes'}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
};

export default EditBlotterModal;
