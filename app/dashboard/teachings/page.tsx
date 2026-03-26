'use client';

import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, Download, Play, Headphones, FileText, Upload } from 'lucide-react';
import { teachingAPI, uploadAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Teaching {
  _id: string;
  title: string;
  description: string;
  speaker: string;
  type: 'audio' | 'video' | 'document';
  url: string;
  thumbnail?: string;
  duration?: number;
  date: string;
  downloads: number;
  views: number;
}

export default function ManageTeachings() {
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    speaker: '',
    type: 'video' as 'audio' | 'video' | 'document',
    url: '',
    thumbnail: '',
    duration: '',
    date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    fetchTeachings();
  }, []);

  const fetchTeachings = async () => {
    try {
      const response = await teachingAPI.getAll();
      setTeachings(response.data.teachings);
    } catch (error) {
      toast.error('Failed to load teachings');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'url' | 'thumbnail') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const toastId = toast.loading(`Uploading ${field === 'url' ? 'media' : 'thumbnail'}...`);
    
    try {
      const folder = field === 'url' ? 'teachings' : 'thumbnails';
      const response = await uploadAPI.uploadSingle(file, folder);
      setFormData({ ...formData, [field]: response.data.url });
      toast.success(`${field === 'url' ? 'Media' : 'Thumbnail'} uploaded successfully!`, { id: toastId });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.message || 'Upload failed', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.url) {
      toast.error('Please upload a media file');
      return;
    }
    
    const toastId = toast.loading(editingId ? 'Updating teaching...' : 'Creating teaching...');
    
    try {
      const teachingData = {
        ...formData,
        duration: formData.duration ? parseInt(formData.duration) : undefined,
      };

      if (editingId) {
        await teachingAPI.update(editingId, teachingData);
        toast.success('Teaching updated successfully', { id: toastId });
      } else {
        await teachingAPI.create(teachingData);
        toast.success('Teaching created successfully', { id: toastId });
      }
      
      setShowModal(false);
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        speaker: '',
        type: 'video',
        url: '',
        thumbnail: '',
        duration: '',
        date: new Date().toISOString().split('T')[0],
      });
      fetchTeachings();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save teaching', { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teaching?')) return;
    
    const toastId = toast.loading('Deleting teaching...');
    try {
      await teachingAPI.delete(id);
      toast.success('Teaching deleted successfully', { id: toastId });
      fetchTeachings();
    } catch (error) {
      toast.error('Failed to delete teaching', { id: toastId });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Play className="w-4 h-4" />;
      case 'audio': return <Headphones className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0EBC5F]"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manage Teachings</h1>
        <button
          onClick={() => {
            setEditingId(null);
            setFormData({
              title: '',
              description: '',
              speaker: '',
              type: 'video',
              url: '',
              thumbnail: '',
              duration: '',
              date: new Date().toISOString().split('T')[0],
            });
            setShowModal(true);
          }}
          className="bg-[#0EBC5F] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#0BA050] transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Teaching</span>
        </button>
      </div>

      {/* Teachings Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Speaker</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stats</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {teachings.map((teaching) => (
                <tr key={teaching._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      {teaching.thumbnail && (
                        <div className="relative w-10 h-10 rounded overflow-hidden">
                          <Image
                            src={teaching.thumbnail}
                            alt={teaching.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{teaching.title}</div>
                        <div className="text-sm text-gray-500 line-clamp-1">{teaching.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{teaching.speaker}</td>
                  <td className="px-6 py-4">
                    <span className="flex items-center space-x-1">
                      {getTypeIcon(teaching.type)}
                      <span className="capitalize">{teaching.type}</span>
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(teaching.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3 text-sm">
                      <span className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{teaching.views}</span>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Download className="w-4 h-4" />
                        <span>{teaching.downloads}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          setEditingId(teaching._id);
                          setFormData({
                            title: teaching.title,
                            description: teaching.description,
                            speaker: teaching.speaker,
                            type: teaching.type,
                            url: teaching.url,
                            thumbnail: teaching.thumbnail || '',
                            duration: teaching.duration?.toString() || '',
                            date: new Date(teaching.date).toISOString().split('T')[0],
                          });
                          setShowModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(teaching._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">
                {editingId ? 'Edit Teaching' : 'Add New Teaching'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                    placeholder="Teaching title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                  <textarea
                    rows={3}
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                    placeholder="Brief description of the teaching"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Speaker *</label>
                    <input
                      type="text"
                      required
                      value={formData.speaker}
                      onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                      placeholder="Pastor name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                    >
                      <option value="video">Video</option>
                      <option value="audio">Audio</option>
                      <option value="document">Document</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Media File *</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      accept={formData.type === 'video' ? 'video/*' : formData.type === 'audio' ? 'audio/*' : '.pdf,.doc,.docx'}
                      onChange={(e) => handleFileUpload(e, 'url')}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0EBC5F] file:text-white hover:file:bg-[#0BA050]"
                      disabled={uploading}
                    />
                    {uploading && <Upload className="w-5 h-5 animate-spin text-[#0EBC5F]" />}
                  </div>
                  {formData.url && (
                    <p className="text-sm text-green-600 mt-1 truncate">
                      ✓ File uploaded: {formData.url.split('/').pop()}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'thumbnail')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg file:mr-2 file:py-1 file:px-3 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    disabled={uploading}
                  />
                  {formData.thumbnail && (
                    <p className="text-sm text-green-600 mt-1">✓ Thumbnail uploaded</p>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (seconds)</label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
                    <input
                      type="date"
                      required
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !formData.url}
                    className="px-4 py-2 bg-[#0EBC5F] text-white rounded-lg hover:bg-[#0BA050] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {uploading ? 'Uploading...' : editingId ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}