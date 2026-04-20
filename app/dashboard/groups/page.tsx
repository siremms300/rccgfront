'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, X, Save, Loader2, RefreshCw, 
  Users, UserPlus, UserMinus 
} from 'lucide-react';
import { groupAPI, userAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Group {
  _id: string;
  name: string;
  description: string;
  type: string;
  leader: { name: string; email: string; _id: string } | null;
  members: { name: string; email: string; _id: string }[];
  meetingDay: string;
  meetingTime: string;
  location: string;
  color: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  province?: string;
  zone?: string;
  area?: string;
  parish?: string;
  isActive?: boolean;
  isApproved?: boolean;
}

export default function ManageGroups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'excellent_men',
    leader: '',
    meetingDay: '',
    meetingTime: '',
    location: '',
    color: '#0EBC5F',
  });

  const groupTypes = [
    { value: 'excellent_men', label: 'Excellent Men' },
    { value: 'good_women', label: 'Good Women' },
    { value: 'yaya', label: 'YAYA (Youths & Young Adults)' },
    { value: 'elders_forum', label: 'Elders Forum' },
    { value: 'junior_church', label: 'Junior Church' },
  ];

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [groupsRes, usersRes] = await Promise.all([
        groupAPI.getAll(),
        userAPI.getAll({ limit: 1000 }),
      ]);
      setGroups(groupsRes.data.groups);
      setUsers(usersRes.data.users);
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const toastId = toast.loading(editingId ? 'Updating group...' : 'Creating group...');
    
    try {
      if (editingId) {
        await groupAPI.update(editingId, formData);
        toast.success('Group updated successfully', { id: toastId });
      } else {
        await groupAPI.create(formData);
        toast.success('Group created successfully', { id: toastId });
      }
      
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save group', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this group?')) return;
    
    const toastId = toast.loading('Deleting group...');
    try {
      await groupAPI.delete(id);
      toast.success('Group deleted successfully', { id: toastId });
      fetchData();
    } catch (error) {
      toast.error('Failed to delete group', { id: toastId });
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedGroup) return;
    
    const toastId = toast.loading('Adding member...');
    try {
      await groupAPI.join(selectedGroup._id);
      await groupAPI.update(selectedGroup._id, { members: [...selectedGroup.members.map(m => m._id), userId] });
      toast.success('Member added successfully', { id: toastId });
      fetchData();
      setShowMemberModal(false);
    } catch (error) {
      toast.error('Failed to add member', { id: toastId });
    }
  };

  const handleRemoveMember = async (groupId: string, userId: string) => {
    if (!confirm('Remove this member from the group?')) return;
    
    const toastId = toast.loading('Removing member...');
    try {
      await groupAPI.leave(groupId);
      toast.success('Member removed successfully', { id: toastId });
      fetchData();
    } catch (error) {
      toast.error('Failed to remove member', { id: toastId });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      type: 'excellent_men',
      leader: '',
      meetingDay: '',
      meetingTime: '',
      location: '',
      color: '#0EBC5F',
    });
  };

  const getTypeLabel = (type: string) => {
    return groupTypes.find(t => t.value === type)?.label || type;
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
          <h1 className="text-2xl font-bold text-gray-900">Manage Natural Groups</h1>
          <p className="text-gray-600 mt-1">Create and manage church fellowship groups</p>
        </div>
        <button
          onClick={() => {
            setEditingId(null);
            resetForm();
            setShowModal(true);
          }}
          className="bg-[#0EBC5F] text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-[#0BA050] transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>New Group</span>
        </button>
      </div>

      {/* Groups Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group) => (
          <div key={group._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${group.color}20` }}>
                  <Users className="w-6 h-6" style={{ color: group.color }} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(group._id);
                      setFormData({
                        name: group.name,
                        description: group.description,
                        type: group.type,
                        leader: group.leader?._id || '',
                        meetingDay: group.meetingDay || '',
                        meetingTime: group.meetingTime || '',
                        location: group.location || '',
                        color: group.color,
                      });
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(group._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-1">{group.name}</h3>
              <p className="text-xs text-[#0EBC5F] mb-2">{getTypeLabel(group.type)}</p>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{group.description}</p>
              
              {group.leader && (
                <div className="mb-2 text-sm">
                  <span className="text-gray-500">Leader:</span>
                  <span className="text-gray-700 ml-1">{group.leader.name}</span>
                </div>
              )}
              
              {group.meetingDay && group.meetingTime && (
                <div className="mb-2 text-sm text-gray-500">
                  📅 {group.meetingDay}s at {group.meetingTime}
                </div>
              )}
              
              {group.location && (
                <div className="mb-3 text-sm text-gray-500">
                  📍 {group.location}
                </div>
              )}
              
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="text-sm text-gray-500">
                  {group.members.length} members
                </div>
                <button
                  onClick={() => {
                    setSelectedGroup(group);
                    setShowMemberModal(true);
                  }}
                  className="text-sm text-[#0EBC5F] hover:underline flex items-center gap-1"
                >
                  <UserPlus className="w-3 h-3" />
                  Manage Members
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Group Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {editingId ? 'Edit Group' : 'Create New Group'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                  placeholder="e.g., Excellent Men"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Type *</label>
                <select
                  required
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                >
                  {groupTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                  placeholder="Describe the group's purpose and activities"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group Leader</label>
                <select
                  value={formData.leader}
                  onChange={(e) => setFormData({ ...formData, leader: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                >
                  <option value="">Select a leader</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>{user.name} ({user.role})</option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Day</label>
                  <select
                    value={formData.meetingDay}
                    onChange={(e) => setFormData({ ...formData, meetingDay: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                  >
                    <option value="">Select day</option>
                    {days.map(day => (
                      <option key={day} value={day}>{day}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Time</label>
                  <input
                    type="time"
                    value={formData.meetingTime}
                    onChange={(e) => setFormData({ ...formData, meetingTime: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                  placeholder="e.g., Main Auditorium, Room 101"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-12 h-10 border border-gray-300 rounded"
                  />
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                  />
                </div>
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
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#0EBC5F] text-white rounded-lg hover:bg-[#0BA050] transition-colors flex items-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {showMemberModal && selectedGroup && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Members - {selectedGroup.name}</h2>
              <button onClick={() => setShowMemberModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Current Members ({selectedGroup.members.length})</h3>
              <div className="space-y-2 mb-6">
                {selectedGroup.members.map(member => (
                  <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(selectedGroup._id, member._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {selectedGroup.members.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No members yet</p>
                )}
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-3">Add Members</h3>
              <div className="space-y-2">
                {users.filter(user => 
                  !selectedGroup.members.some(m => m._id === user._id) && 
                  user.role !== 'super_admin'
                ).map(user => (
                  <div key={user._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email} • {user.role}</p>
                    </div>
                    <button
                      onClick={() => handleAddMember(user._id)}
                      className="text-[#0EBC5F] hover:text-[#0BA050]"
                    >
                      <UserPlus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}