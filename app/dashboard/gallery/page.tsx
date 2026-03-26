'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, Eye, X, Save, Loader2, RefreshCw, 
  Upload, Image as ImageIcon, FolderPlus, Camera 
} from 'lucide-react';
import { galleryAPI, uploadAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface GalleryImage {
  _id: string;
  title: string;
  description: string;
  album: string;
  images: {
    url: string;
    publicId: string;
    caption?: string;
    uploadedBy: { name: string };
  }[];
  date: string;
  createdBy: { name: string };
}

interface GalleryFormData {
  title: string;
  description: string;
  album: string;
  images: { url: string; publicId: string; caption: string }[];
}

export default function ManageGallery() {
  const [galleries, setGalleries] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [albums, setAlbums] = useState<string[]>([]);
  const [formData, setFormData] = useState<GalleryFormData>({
    title: '',
    description: '',
    album: '',
    images: [],
  });
  const [tempImageUrl, setTempImageUrl] = useState('');
  const [tempImageCaption, setTempImageCaption] = useState('');

  useEffect(() => {
    fetchGalleries();
    fetchAlbums();
  }, []);

  const fetchGalleries = async () => {
    try {
      const response = await galleryAPI.getAll();
      setGalleries(response.data.galleries);
    } catch (error) {
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbums = async () => {
    try {
      const response = await galleryAPI.getAll({ limit: 1000 });
      const uniqueAlbums = [...new Set(response.data.galleries.map((g: GalleryImage) => g.album))];
      setAlbums(uniqueAlbums);
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const toastId = toast.loading('Uploading image...');
    
    try {
      const response = await uploadAPI.uploadSingle(file, 'gallery');
      setTempImageUrl(response.data.url);
      toast.success('Image uploaded! Add a caption and click "Add Image"', { id: toastId });
    } catch (error) {
      toast.error('Upload failed', { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const addImage = () => {
    if (!tempImageUrl) {
      toast.error('Please upload an image first');
      return;
    }
    
    setFormData({
      ...formData,
      images: [...formData.images, {
        url: tempImageUrl,
        publicId: `temp_${Date.now()}`,
        caption: tempImageCaption,
      }],
    });
    setTempImageUrl('');
    setTempImageCaption('');
    toast.success('Image added to gallery');
  };

  const removeImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.images.length === 0) {
      toast.error('Please add at least one image');
      return;
    }
    
    setSubmitting(true);
    const toastId = toast.loading(editingId ? 'Updating gallery...' : 'Creating gallery...');
    
    try {
      const galleryData = {
        ...formData,
        images: formData.images.map(img => ({
          url: img.url,
          publicId: img.publicId,
          caption: img.caption,
        })),
      };

      if (editingId) {
        await galleryAPI.update(editingId, galleryData);
        toast.success('Gallery updated successfully', { id: toastId });
      } else {
        await galleryAPI.create(galleryData);
        toast.success('Gallery created successfully', { id: toastId });
      }
      
      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchGalleries();
      fetchAlbums();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save gallery', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this gallery? All images will be permanently removed.')) return;
    
    const toastId = toast.loading('Deleting gallery...');
    try {
      await galleryAPI.delete(id);
      toast.success('Gallery deleted successfully', { id: toastId });
      fetchGalleries();
    } catch (error) {
      toast.error('Failed to delete gallery', { id: toastId });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      album: '',
      images: [],
    });
    setTempImageUrl('');
    setTempImageCaption('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-12 h-12 text-[#0EBC5F] animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Gallery</h1>
          <p className="text-gray-600 mt-1">Create and manage photo galleries</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchGalleries}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              resetForm();
              setShowModal(true);
            }}
            className="bg-[#0EBC5F] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#0BA050] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>New Gallery</span>
          </button>
        </div>
      </div>

      {/* Galleries Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleries.map((gallery) => (
          <div key={gallery._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="relative h-48 bg-gray-200">
              {gallery.images[0] && (
                <Image
                  src={gallery.images[0].url}
                  alt={gallery.title}
                  fill
                  className="object-cover"
                />
              )}
              <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                {gallery.images.length} photos
              </div>
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-1">{gallery.title}</h3>
              <p className="text-sm text-gray-500 mb-2 line-clamp-2">{gallery.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">
                  {new Date(gallery.date).toLocaleDateString()}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.open(`/gallery`, '_blank')}
                    className="text-blue-600 hover:text-blue-800 p-1"
                    title="View"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setEditingId(gallery._id);
                      setFormData({
                        title: gallery.title,
                        description: gallery.description || '',
                        album: gallery.album,
                        images: gallery.images.map(img => ({
                          url: img.url,
                          publicId: img.publicId,
                          caption: img.caption || '',
                        })),
                      });
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800 p-1"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(gallery._id)}
                    className="text-red-600 hover:text-red-800 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {editingId ? 'Edit Gallery' : 'Create New Gallery'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gallery Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                    placeholder="e.g., Sunday Service March 2024"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                    placeholder="Brief description of this gallery"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Album Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.album}
                    onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                    placeholder="e.g., Sunday Services, Events, Conferences"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Or Select Existing</label>
                  <select
                    value={formData.album}
                    onChange={(e) => setFormData({ ...formData, album: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                  >
                    <option value="">-- Select album --</option>
                    {albums.map(album => (
                      <option key={album} value={album}>{album}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Image Upload */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Images</h3>
                
                {/* Upload Area */}
                <div className="mb-4 p-4 border-2 border-dashed border-gray-300 rounded-lg text-center">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={uploading}
                  />
                  <label
                    htmlFor="image-upload"
                    className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    {uploading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Upload className="w-5 h-5" />
                    )}
                    Upload Image
                  </label>
                  
                  {tempImageUrl && (
                    <div className="mt-4">
                      <div className="relative w-32 h-32 mx-auto mb-2">
                        <Image
                          src={tempImageUrl}
                          alt="Preview"
                          fill
                          className="object-cover rounded-lg"
                        />
                      </div>
                      <input
                        type="text"
                        placeholder="Caption (optional)"
                        value={tempImageCaption}
                        onChange={(e) => setTempImageCaption(e.target.value)}
                        className="mt-2 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F] w-full"
                      />
                      <button
                        type="button"
                        onClick={addImage}
                        className="mt-2 px-4 py-2 bg-[#0EBC5F] text-white rounded-lg hover:bg-[#0BA050]"
                      >
                        Add to Gallery
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Image List */}
                {formData.images.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative group">
                        <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                          <Image
                            src={img.url}
                            alt={img.caption || `Image ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {img.caption && (
                          <p className="text-xs text-gray-500 mt-1 truncate">{img.caption}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#0EBC5F] text-white rounded-lg hover:bg-[#0BA050] transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {editingId ? 'Update Gallery' : 'Create Gallery'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}