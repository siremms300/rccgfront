'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, Edit, Trash2, X, Save, Loader2, RefreshCw, 
  Users, UserPlus, UserMinus 
} from 'lucide-react';
import { departmentAPI, userAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Department {
  _id: string;
  name: string;
  description: string;
  leader: { name: string; email: string; _id: string } | null;
  members: { name: string; email: string; _id: string }[];
  schedule: string;
  color: string;
  icon: string;
}

interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
}

export default function ManageDepartments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    leader: '',
    schedule: '',
    color: '#0EBC5F',
    icon: 'Users',
  });

  const icons = ['Users', 'Heart', 'Star', 'BookOpen', 'Coffee', 'Music', 'Mic', 'Camera'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [deptsRes, usersRes] = await Promise.all([
        departmentAPI.getAll(),
        userAPI.getAll({ limit: 1000 }),
      ]);
      setDepartments(deptsRes.data.departments);
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
    const toastId = toast.loading(editingId ? 'Updating department...' : 'Creating department...');
    
    try {
      if (editingId) {
        await departmentAPI.update(editingId, formData);
        toast.success('Department updated successfully', { id: toastId });
      } else {
        await departmentAPI.create(formData);
        toast.success('Department created successfully', { id: toastId });
      }
      
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save department', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this department?')) return;
    
    const toastId = toast.loading('Deleting department...');
    try {
      await departmentAPI.delete(id);
      toast.success('Department deleted successfully', { id: toastId });
      fetchData();
    } catch (error) {
      toast.error('Failed to delete department', { id: toastId });
    }
  };

  const handleAddMember = async (userId: string) => {
    if (!selectedDept) return;
    
    const toastId = toast.loading('Adding member...');
    try {
      await departmentAPI.addMember(selectedDept._id, userId);
      toast.success('Member added successfully', { id: toastId });
      fetchData();
      setShowMemberModal(false);
    } catch (error) {
      toast.error('Failed to add member', { id: toastId });
    }
  };

  const handleRemoveMember = async (deptId: string, userId: string) => {
    if (!confirm('Remove this member from the department?')) return;
    
    const toastId = toast.loading('Removing member...');
    try {
      await departmentAPI.removeMember(deptId, userId);
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
      leader: '',
      schedule: '',
      color: '#0EBC5F',
      icon: 'Users',
    });
  };

  const nonMemberUsers = users.filter(user => 
    !selectedDept?.members.some(m => m._id === user._id) && user.role !== 'super_admin'
  );

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
          <h1 className="text-2xl font-bold text-gray-900">Manage Departments</h1>
          <p className="text-gray-600 mt-1">Create and manage church departments</p>
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
          <span>New Department</span>
        </button>
      </div>

      {/* Departments Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((dept) => (
          <div key={dept._id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
            <div className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${dept.color}20` }}>
                  <Users className="w-6 h-6" style={{ color: dept.color }} />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(dept._id);
                      setFormData({
                        name: dept.name,
                        description: dept.description,
                        leader: dept.leader?._id || '',
                        schedule: dept.schedule || '',
                        color: dept.color,
                        icon: dept.icon,
                      });
                      setShowModal(true);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(dept._id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <h3 className="text-lg font-bold text-gray-900 mb-1">{dept.name}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{dept.description}</p>
              
              {dept.leader && (
                <div className="mb-3 text-sm">
                  <span className="text-gray-500">Leader:</span>
                  <span className="text-gray-700 ml-1">{dept.leader.name}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between pt-3 border-t">
                <div className="text-sm text-gray-500">
                  {dept.members.length} members
                </div>
                <button
                  onClick={() => {
                    setSelectedDept(dept);
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

      {/* Department Form Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {editingId ? 'Edit Department' : 'Create Department'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                  placeholder="e.g., Choir, Ushering, Media"
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
                  placeholder="Describe the department's purpose and activities"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department Leader</label>
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Meeting Schedule</label>
                <input
                  type="text"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                  placeholder="e.g., Sundays 9:00 AM, Wednesdays 6:00 PM"
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
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <select
                  value={formData.icon}
                  onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                >
                  {icons.map(icon => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
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
      {showMemberModal && selectedDept && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">Manage Members - {selectedDept.name}</h2>
              <button onClick={() => setShowMemberModal(false)} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6">
              <h3 className="font-semibold text-gray-900 mb-3">Current Members ({selectedDept.members.length})</h3>
              <div className="space-y-2 mb-6">
                {selectedDept.members.map(member => (
                  <div key={member._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{member.name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                    </div>
                    <button
                      onClick={() => handleRemoveMember(selectedDept._id, member._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {selectedDept.members.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No members yet</p>
                )}
              </div>
              
              <h3 className="font-semibold text-gray-900 mb-3">Add Members</h3>
              <div className="space-y-2">
                {nonMemberUsers.map(user => (
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
                {nonMemberUsers.length === 0 && (
                  <p className="text-gray-500 text-center py-4">No users available to add</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}