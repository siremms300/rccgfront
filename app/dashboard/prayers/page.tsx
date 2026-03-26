'use client';

import { useState, useEffect } from 'react';
import { 
  Eye, Edit, Trash2, X, Loader2, RefreshCw, 
  Heart, CheckCircle, Clock, User, Mail, Lock, Globe 
} from 'lucide-react';
import { prayerAPI, userAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface PrayerRequest {
  _id: string;
  name: string;
  email: string;
  request: string;
  isAnonymous: boolean;
  isPublic: boolean;
  status: 'pending' | 'praying' | 'answered';
  assignedTo?: { name: string; email: string; _id: string };
  testimony?: string;
  createdAt: string;
}

export default function ManagePrayerRequests() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPrayer, setSelectedPrayer] = useState<PrayerRequest | null>(null);
  const [formData, setFormData] = useState({
    status: '',
    testimony: '',
    assignedTo: '',
  });
  const [users, setUsers] = useState<{ _id: string; name: string; email: string }[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [prayersRes, usersRes] = await Promise.all([
        prayerAPI.getAll(),
        userAPI.getAll({ limit: 1000 }),
      ]);
      setPrayers(prayersRes.data.prayerRequests);
      setUsers(usersRes.data.users);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedPrayer) return;
    
    const toastId = toast.loading('Updating prayer request...');
    try {
      await prayerAPI.update(selectedPrayer._id, {
        status: formData.status,
        testimony: formData.testimony,
        assignedTo: formData.assignedTo || undefined,
      });
      toast.success('Prayer request updated successfully', { id: toastId });
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error('Failed to update prayer request', { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prayer request?')) return;
    
    const toastId = toast.loading('Deleting prayer request...');
    try {
      await prayerAPI.delete(id);
      toast.success('Prayer request deleted successfully', { id: toastId });
      fetchData();
    } catch (error) {
      toast.error('Failed to delete prayer request', { id: toastId });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'answered':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'praying':
        return <Heart className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'answered': return 'Answered';
      case 'praying': return 'Praying';
      default: return 'Pending';
    }
  };

  const filteredPrayers = prayers.filter(prayer => {
    if (filter === 'all') return true;
    return prayer.status === filter;
  });

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
          <h1 className="text-2xl font-bold text-gray-900">Prayer Requests</h1>
          <p className="text-gray-600 mt-1">Manage and respond to prayer requests</p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all' ? 'bg-[#0EBC5F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({prayers.length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'pending' ? 'bg-[#0EBC5F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Pending ({prayers.filter(p => p.status === 'pending').length})
        </button>
        <button
          onClick={() => setFilter('praying')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'praying' ? 'bg-[#0EBC5F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Praying ({prayers.filter(p => p.status === 'praying').length})
        </button>
        <button
          onClick={() => setFilter('answered')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'answered' ? 'bg-[#0EBC5F] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Answered ({prayers.filter(p => p.status === 'answered').length})
        </button>
      </div>

      {/* Prayer Requests List */}
      <div className="space-y-4">
        {filteredPrayers.map((prayer) => (
          <div key={prayer._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <div className="flex-shrink-0">
                  {prayer.isAnonymous ? (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-gray-500" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#29156C] flex items-center justify-center text-white font-bold">
                      {prayer.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2 flex-wrap">
                    <span className="font-medium text-gray-900">
                      {prayer.isAnonymous ? 'Anonymous' : prayer.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(prayer.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                      prayer.status === 'answered' ? 'bg-green-100 text-green-700' :
                      prayer.status === 'praying' ? 'bg-red-100 text-red-700' :
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {getStatusIcon(prayer.status)}
                      {getStatusText(prayer.status)}
                    </span>
                    {prayer.assignedTo && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <User className="w-3 h-3" />
                        Assigned to: {prayer.assignedTo.name}
                      </span>
                    )}
                    {prayer.isPublic ? (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        Public
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Lock className="w-3 h-3" />
                        Private
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700 mb-3">{prayer.request}</p>
                  {prayer.testimony && (
                    <div className="mt-2 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-700">
                        <strong>Testimony:</strong> {prayer.testimony}
                      </p>
                    </div>
                  )}
                  {!prayer.isAnonymous && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                      <Mail className="w-3 h-3" />
                      {prayer.email}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2 ml-4">
                <button
                  onClick={() => {
                    setSelectedPrayer(prayer);
                    setFormData({
                      status: prayer.status,
                      testimony: prayer.testimony || '',
                      assignedTo: prayer.assignedTo?._id || '',
                    });
                    setShowModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800 p-1"
                  title="Edit"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleDelete(prayer._id)}
                  className="text-red-600 hover:text-red-800 p-1"
                  title="Delete"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredPrayers.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No prayer requests found</p>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {showModal && selectedPrayer && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Update Prayer Request</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                >
                  <option value="pending">Pending</option>
                  <option value="praying">Praying</option>
                  <option value="answered">Answered</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign to Prayer Team Member</label>
                <select
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                >
                  <option value="">Unassigned</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Testimony (if answered)</label>
                <textarea
                  rows={3}
                  value={formData.testimony}
                  onChange={(e) => setFormData({ ...formData, testimony: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                  placeholder="Share how God answered this prayer..."
                />
              </div>
              
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdate}
                  className="px-6 py-2 bg-[#0EBC5F] text-white rounded-lg hover:bg-[#0BA050] transition-colors"
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}