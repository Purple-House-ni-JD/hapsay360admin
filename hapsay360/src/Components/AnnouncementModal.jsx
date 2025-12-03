import React, { useCallback, useEffect, useState } from 'react';
import Modal from './Modal';
import { EditorContent, useEditor } from '@tiptap/react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import api from '../utils/api';
import { X, Bold, Italic, ImagePlus, Check, AlertCircle, Trash2 } from 'lucide-react';

const createAnnouncement = async (payload) => {
	const response = await api.post('/announcements/create', payload);
	if (!response.ok) {
		throw new Error('Failed to create announcement');
	}
	return response.json();
};

const AnnouncementModal = ({ isOpen = true, onClose = () => {}, onPosted, stations = [] }) => {
	const [title, setTitle] = useState('');
	const [attachedFiles, setAttachedFiles] = useState([]);
	const [selectedStatus, setSelectedStatus] = useState('PUBLISHED');
	const [selectedStation, setSelectedStation] = useState(null);
	const [isAnnouncementSuccess, setIsAnnouncementSuccess] = useState(false);
	const [isAnnouncementError, setIsAnnouncementError] = useState(false);

	const queryClient = useQueryClient();

	const editor = useEditor({
		extensions: [
			StarterKit,
			Image,
			Link.configure({ openOnClick: true }),
			Placeholder.configure({ placeholder: 'Write your announcement details here...' }),
		],
		content: '',
		editorProps: {
			attributes: {
				class: 'prose prose-sm max-w-none focus:outline-none min-h-[160px] p-4',
			},
		},
	});

	useEffect(() => {
		if (!isOpen) {
			return () => {
				setTitle('');
				setAttachedFiles([]);
				editor && editor.commands.setContent('');
			};
		}
	}, [isOpen]);

	const { mutate: createAnnouncementMutation, isLoading, error } = useMutation({
		mutationFn: createAnnouncement,
		onSuccess: (data) => {
			console.log('Announcement created successfully', data);
			queryClient.invalidateQueries(["announcements"]);
			onPosted && onPosted(data);
			setTitle('');
			setSelectedStation(null);
			setSelectedStatus('PUBLISHED');
			editor && editor.commands.setContent('');
			setAttachedFiles([]);
			setIsAnnouncementSuccess(true);
			
			// Auto-close after 2 seconds on success
			setTimeout(() => {
				onClose();
			}, 2000);
		},
		onError: (data) => {
			console.error('Error creating announcement', data);
			setIsAnnouncementError(true);
		},
	});

	const fileToDataUrl = (file) => new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = reject;
		reader.readAsDataURL(file);
	});

	const handleFiles = useCallback(async (files) => {
		if (!files || files.length === 0) return;
		const arr = Array.from(files);
		for (const f of arr) {
			try {
				const dataUrl = await fileToDataUrl(f);
				// Only insert images into the editor; other files are just stored as attachments
				if (f.type.startsWith('image/')) {
					if (editor) {
						editor.chain().focus().setImage({ src: dataUrl, alt: f.name }).run();
					}
				}
				// store additional metadata so consumers can read mime type and original file
				setAttachedFiles((s) => [...s, { name: f.name, dataUrl, type: f.type, size: f.size, file: f }]);
			} catch (err) {
				console.error('Failed to read file', err);
			}
		}
	}, [editor]);

	const handleFileInput = (e) => {
		handleFiles(e.target.files);
		e.target.value = '';
	};

	const removeAttachment = (index) => {
		setAttachedFiles((s) => s.filter((_, i) => i !== index));
	};

	const handleSubmit = () => {
		if (!selectedStation) {
			alert('Please select a station.');
			return;
		}
		if (!title.trim()) {
			alert('Please enter a title.');
			return;
		}
		const details = editor ? editor.getHTML() : '';
		// Check if details is essentially empty (just <p></p> or whitespace)
		const cleanedDetails = details.replace(/<[^>]+>/g, '').trim();
		if (!cleanedDetails) {
			alert('Please add some content to the announcement.');
			return;
		}

		// Convert attached files to base64 format for MongoDB storage
		let attachments = [];
		if (attachedFiles.length > 0) {
			attachments = attachedFiles.map(fileData => ({
				filename: fileData.name,
				mimetype: fileData.type,
				data: fileData.dataUrl // Already base64 data URL from FileReader
			}));
		}

		// Create announcement with base64 attachments (will be converted to Buffer on backend)
		const payload = {
			title: title.trim(),
			details: cleanedDetails,
			station_id: selectedStation,
			status: selectedStatus,
			attachments: attachments
		};
		
		createAnnouncementMutation(payload);
		setIsAnnouncementSuccess(false);
		setIsAnnouncementError(false);
	};

	const handleClose = () => {
		onClose();
		setIsAnnouncementSuccess(false);
		setIsAnnouncementError(false);
	};

	if (!isOpen) return null;

	return (
		<Modal onClose={handleClose} maxWidth="max-w-4xl">
			<div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
				{/* Success/Error Notifications */}
				{isAnnouncementSuccess && (
					<div className="bg-green-500 text-white px-6 py-4 flex items-center gap-3">
						<Check size={24} className="flex-shrink-0" />
						<div>
							<p className="font-semibold">Success!</p>
							<p className="text-sm text-green-50">Announcement created successfully</p>
						</div>
					</div>
				)}
				{isAnnouncementError && (
					<div className="bg-red-500 text-white px-6 py-4">
						<div className="flex items-start gap-3">
							<AlertCircle size={24} className="flex-shrink-0 mt-0.5" />
							<div className="flex-1">
								<p className="font-semibold">Error creating announcement</p>
								<p className="text-sm text-red-50 mt-1">Please check the console for details</p>
								{error && (
									<pre className="mt-2 text-xs bg-red-600/50 p-2 rounded overflow-auto max-h-32">
										{JSON.stringify(error, null, 2)}
									</pre>
								)}
							</div>
						</div>
					</div>
				)}

				{/* Header */}
				<div className="bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-700 px-8 py-6 relative overflow-hidden">
					<div className="absolute inset-0 bg-black/10"></div>
					<div className="relative flex items-center justify-between">
						<div>
							<h3 className="text-2xl font-bold text-white">Create New Announcement</h3>
							<p className="text-purple-100 text-sm mt-1">Share important updates with your stations</p>
						</div>
						<button 
							className="text-white/90 hover:text-white hover:bg-white/20 rounded-full p-2 transition-all duration-200" 
							onClick={handleClose} 
							aria-label="Close"
						>
							<X size={24} />
						</button>
					</div>
				</div>

				{/* Form Content */}
				<div className="p-8 max-h-[70vh] overflow-y-auto">
					{/* Title Input */}
					<div className="mb-6">
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Announcement Title <span className="text-red-500">*</span>
						</label>
						<input
							value={title}
							onChange={(e) => setTitle(e.target.value)}
							className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none"
							placeholder="Enter a clear, concise title..."
						/>
					</div>

					{/* Station and Status Row */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
						{/* Station Select */}
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Target Station <span className="text-red-500">*</span>
							</label>
							<select
								value={selectedStation || ''}
								onChange={(e) => setSelectedStation(e.target.value)}
								className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none bg-white"
							>
								<option value="">Select a Station</option>
								{stations.map((station) => (
									<option key={station._id} value={station._id}>
										{station.name}
									</option>
								))}
							</select>
						</div>

						{/* Status Select */}
						<div>
							<label className="block text-sm font-semibold text-gray-700 mb-2">
								Publication Status
							</label>
							<select
								value={selectedStatus}
								onChange={(e) => setSelectedStatus(e.target.value)}
								className="w-full border-2 border-gray-200 rounded-lg px-4 py-3 text-gray-800 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all outline-none bg-white"
							>
								<option value="PUBLISHED">📢 Published</option>
								<option value="DRAFT">📝 Draft</option>
								<option value="ARCHIVED">🗄️ Archived</option>
							</select>
						</div>
					</div>

					{/* Rich Text Editor */}
					<div className="mb-6">
						<label className="block text-sm font-semibold text-gray-700 mb-2">
							Announcement Details
						</label>
						<div className="border-2 border-gray-200 rounded-lg overflow-hidden focus-within:border-purple-500 focus-within:ring-2 focus-within:ring-purple-200 transition-all">
							<EditorContent editor={editor} />
						</div>

						{/* Editor Toolbar */}
						<div className="mt-3 flex items-center gap-2 flex-wrap">
							<label className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-lg text-sm font-medium cursor-pointer transition-all shadow-md hover:shadow-lg">
								<ImagePlus size={16} />
								Add Files
								<input type="file" accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt" multiple onChange={handleFileInput} className="hidden" />
							</label>
							
							<button
								type="button"
								onClick={() => editor && editor.chain().focus().toggleBold().run()}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
									editor?.isActive('bold') 
										? 'bg-purple-100 text-purple-700 border-2 border-purple-300' 
										: 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
								}`}
							>
								<Bold size={16} className="inline" />
							</button>
							
							<button
								type="button"
								onClick={() => editor && editor.chain().focus().toggleItalic().run()}
								className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
									editor?.isActive('italic') 
										? 'bg-purple-100 text-purple-700 border-2 border-purple-300' 
										: 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
								}`}
							>
								<Italic size={16} className="inline" />
							</button>
						</div>
					</div>

					{/* Attachments Preview */}
					{attachedFiles.length > 0 && (
						<div className="mb-6">
							<label className="block text-sm font-semibold text-gray-700 mb-3">
								Attached Files ({attachedFiles.length})
							</label>
							<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
								{attachedFiles.map((f, i) => {
									const isImage = f.type.startsWith('image/');
									const getFileIcon = (type, name) => {
										if (type.startsWith('image/')) return '🖼️';
										if (type.includes('pdf')) return '📄';
										if (type.includes('word') || name.endsWith('.docx')) return '📝';
										if (type.includes('sheet') || name.endsWith('.xlsx')) return '📊';
										if (type.includes('presentation') || name.endsWith('.pptx')) return '🎯';
										return '📎';
									};
									return (
										<div key={i} className="relative group border-2 border-gray-200 rounded-lg overflow-hidden hover:border-purple-300 transition-all">
											{isImage ? (
												<img src={f.dataUrl} alt={f.name} className="object-cover w-full h-32" />
											) : (
												<div className="w-full h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
													<span className="text-4xl">{getFileIcon(f.type, f.name)}</span>
												</div>
											)}
											<button
												onClick={() => removeAttachment(i)}
												className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
												aria-label={`Remove ${f.name}`}
											>
												<Trash2 size={14} />
											</button>
											<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
												<p className="text-white text-xs truncate">{f.name}</p>
												<p className="text-gray-300 text-xs">{(f.size / 1024).toFixed(1)} KB</p>
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="bg-gray-50 px-8 py-5 flex justify-end gap-3 border-t border-gray-200">
					<button 
						onClick={handleClose} 
						className="px-6 py-2.5 bg-white border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-all"
						disabled={isLoading}
					>
						Cancel
					</button>
					<button
						onClick={handleSubmit}
						disabled={isLoading}
						className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
					>
						{isLoading ? (
							<>
								<div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
								Creating...
							</>
						) : (
							<>
								<Check size={18} />
								Create Announcement
							</>
						)}
					</button>
				</div>
			</div>
		</Modal>
	);
};

export default AnnouncementModal;