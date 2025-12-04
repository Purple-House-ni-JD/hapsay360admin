import React from 'react';
import { X, Calendar, MapPin, FileText, Tag, Image as ImageIcon } from 'lucide-react';
import Modal from './Modal';

const AnnouncementViewModal = ({ isOpen, onClose, announcement }) => {
  if (!isOpen || !announcement) return null;

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusClass =
    announcement.status === "PUBLISHED"
      ? "bg-green-100 text-green-700 border-green-300"
      : announcement.status === "DRAFT"
      ? "bg-yellow-100 text-yellow-700 border-yellow-300"
      : announcement.status === "ARCHIVED"
      ? "bg-red-100 text-red-700 border-red-300"
      : "bg-gray-100 text-gray-700 border-gray-300";

  const station = announcement.station_id?.name ?? "All Stations";

  // Get server base URL for image URLs
  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
  const serverBaseUrl = apiUrl.replace('/api', '');

  // Helper to get full image URL - FIXED VERSION
  const getImageUrl = (attachment, index) => {
    // Always construct URL based on announcement ID and index
    if (announcement._id) {
      return `${serverBaseUrl}/api/announcements/${announcement._id}/attachments/${index}`;
    }
    return '';
  };

  return (
    <Modal onClose={onClose} maxWidth="max-w-3xl">
      <div className="bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Announcement Details</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-purple-800 rounded-full p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* ID and Status Row */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Tag size={18} className="text-purple-600" />
              <span className="text-sm text-gray-500">ID:</span>
              <span className="font-mono font-semibold text-purple-600">
                {announcement.custom_id}
              </span>
            </div>
            <span
              className={`${statusClass} px-3 py-1 rounded-full text-sm font-semibold border`}
            >
              {announcement.status || "Published"}
            </span>
          </div>

          {/* Title */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {announcement.title}
            </h3>
          </div>

          {/* Meta Information Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <MapPin size={20} className="text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Station Assigned</p>
                <p className="text-gray-800 font-semibold">{station}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar size={20} className="text-purple-600 mt-1 flex-shrink-0" />
              <div>
                <p className="text-sm text-gray-500 font-medium">Date Published</p>
                <p className="text-gray-800 font-semibold">{formatDate(announcement.date)}</p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={20} className="text-purple-600" />
              <h4 className="text-lg font-semibold text-gray-800">Content</h4>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              <div 
                className="text-gray-700 leading-relaxed prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: announcement.details || "No content available." }}
              />
            </div>
          </div>

          {/* Attachments Section */}
          {announcement.attachments && Array.isArray(announcement.attachments) && announcement.attachments.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon size={20} className="text-purple-600" />
                <h4 className="text-lg font-semibold text-gray-800">
                  Attached Images ({announcement.attachments.length})
                </h4>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {announcement.attachments.map((attachment, index) => {
                  const imageUrl = getImageUrl(attachment, index);
                  return (
                    <div 
                      key={index} 
                      className="relative group border-2 border-gray-200 rounded-lg overflow-hidden hover:border-purple-300 transition-all"
                    >
                      <img 
                        src={imageUrl} 
                        alt={attachment.filename || `Attachment ${index + 1}`}
                        className="object-cover w-full h-48 cursor-pointer"
                        onError={(e) => {
                          console.error('Image load error:', imageUrl);
                          e.target.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="200" height="200"%3E%3Crect fill="%23ddd" width="200" height="200"/%3E%3Ctext fill="%23999" font-family="sans-serif" font-size="14" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EImage not found%3C/text%3E%3C/svg%3E';
                        }}
                      />
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                        <p className="text-white text-xs truncate">
                          {attachment.filename || `Attachment ${index + 1}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Additional Details if available */}
          {announcement.createdAt && (
            <div className="text-sm text-gray-500 border-t pt-4">
              <p>Created: {formatDate(announcement.createdAt)}</p>
              {announcement.updatedAt && announcement.updatedAt !== announcement.createdAt && (
                <p className="mt-1">Last Updated: {formatDate(announcement.updatedAt)}</p>
              )}
            </div>
          )}
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

export default AnnouncementViewModal;