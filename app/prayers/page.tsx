'use client';

import { useState, useEffect } from 'react';
import { Heart, Eye, Lock, Globe, Send, CheckCircle, Clock, User } from 'lucide-react';
import { prayerAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface PrayerRequest {
  _id: string;
  name: string;
  request: string;
  isAnonymous: boolean;
  isPublic: boolean;
  status: 'pending' | 'praying' | 'answered';
  testimony?: string;
  createdAt: string;
}

export default function PrayerPage() {
  const { user } = useAuth();
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    request: '',
    isAnonymous: false,
    isPublic: true,
  });

  useEffect(() => {
    fetchPrayerRequests();
  }, []);

  const fetchPrayerRequests = async () => {
    try {
      const response = await prayerAPI.getAll({ public: true });
      setPrayerRequests(response.data.prayerRequests);
    } catch (error) {
      console.error('Error fetching prayer requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await prayerAPI.create(formData);
      toast.success('Prayer request submitted! We are praying with you.');
      setFormData({
        name: '',
        email: '',
        request: '',
        isAnonymous: false,
        isPublic: true,
      });
      setShowForm(false);
      fetchPrayerRequests();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit prayer request');
    } finally {
      setSubmitting(false);
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

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0EBC5F]"></div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#29156C] to-[#0EBC5F]" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
              Prayer Wall
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto animate-fade-in">
              Share your prayer requests and join us in prayer
            </p>
          </div>
        </div>
      </section>

      {/* Submit Prayer Button */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-[#0EBC5F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0BA050] transition-colors inline-flex items-center gap-2"
            >
              <Heart className="w-5 h-5" />
              Submit Prayer Request
            </button>
          </div>
        </div>
      </section>

      {/* Prayer Form */}
      {showForm && (
        <section className="py-8 bg-gray-50">
          <div className="container mx-auto px-4 max-w-2xl">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Share Your Prayer Request</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                {!formData.isAnonymous && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        required={!formData.isAnonymous}
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        required={!formData.isAnonymous}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                        placeholder="your@email.com"
                      />
                    </div>
                  </>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Prayer Request</label>
                  <textarea
                    rows={4}
                    required
                    value={formData.request}
                    onChange={(e) => setFormData({ ...formData, request: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                    placeholder="What would you like prayer for?"
                  />
                </div>
                
                <div className="flex flex-col gap-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isAnonymous}
                      onChange={(e) => setFormData({ ...formData, isAnonymous: e.target.checked })}
                      className="w-4 h-4 text-[#0EBC5F] rounded"
                    />
                    <span className="text-sm text-gray-700">Post anonymously</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                      className="w-4 h-4 text-[#0EBC5F] rounded"
                    />
                    <span className="text-sm text-gray-700">Make this public on the prayer wall</span>
                  </label>
                </div>
                
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-[#0EBC5F] text-white px-4 py-2 rounded-lg hover:bg-[#0BA050] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      )}

      {/* Prayer Requests List */}
      <section className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Prayer Requests</h2>
          
          {prayerRequests.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <Heart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No prayer requests yet</p>
              <p className="text-gray-400">Be the first to share a prayer request</p>
            </div>
          ) : (
            <div className="space-y-4">
              {prayerRequests.map((prayer) => (
                <div key={prayer._id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start gap-3">
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
                      <div className="flex items-center gap-2 mb-1">
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
                      </div>
                      <p className="text-gray-700 mb-2">{prayer.request}</p>
                      {prayer.testimony && (
                        <div className="mt-2 p-3 bg-green-50 rounded-lg">
                          <p className="text-sm text-green-700">
                            <strong>Testimony:</strong> {prayer.testimony}
                          </p>
                        </div>
                      )}
                      <button className="mt-2 text-sm text-[#0EBC5F] hover:underline flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        I'm praying
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}