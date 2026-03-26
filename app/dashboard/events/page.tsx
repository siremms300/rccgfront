'use client';

import { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Calendar as CalendarIcon, 
  Users, 
  MapPin, 
  Clock,
  Eye,
  Mail,
  Bell,
  X,
  Save,
  Video,
  Link as LinkIcon,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { eventAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { useAuth } from '@/hooks/useAuth';

interface Event {
  _id: string;
  title: string;
  description: string;
  type: string;
  level: string;
  startDate: string;
  endDate: string;
  venue: string;
  speaker?: string;
  image?: string;
  registrationLink?: string;
  liveStreamLink?: string;
  capacity?: number;
  attendees: string[];
  notificationSettings?: {
    sendEmail: boolean;
    emailRecipients: 'all' | 'role' | 'specific';
    recipientRoles: string[];
    specificRecipients: string[];
    reminderTiming: number;
    sendReminder: boolean;
  };
  isActive: boolean;
}

interface EventFormData {
  title: string;
  description: string;
  type: string;
  level: string;
  startDate: string;
  endDate: string;
  venue: string;
  speaker: string;
  image: string;
  registrationLink: string;
  liveStreamLink: string;
  capacity: string;
  notificationSettings: {
    sendEmail: boolean;
    emailRecipients: 'all' | 'role' | 'specific';
    recipientRoles: string[];
    specificRecipients: string[];
    reminderTiming: number;
    sendReminder: boolean;
  };
}

const getNotificationSettings = (event: Event) => {
  return {
    sendEmail: event.notificationSettings?.sendEmail ?? true,
    sendReminder: event.notificationSettings?.sendReminder ?? true,
    reminderTiming: event.notificationSettings?.reminderTiming ?? 24,
    emailRecipients: event.notificationSettings?.emailRecipients ?? 'all',
    recipientRoles: event.notificationSettings?.recipientRoles ?? [],
    specificRecipients: event.notificationSettings?.specificRecipients ?? [],
  };
};

export default function ManageEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    type: 'service',
    level: 'region',
    startDate: '',
    endDate: '',
    venue: '',
    speaker: '',
    image: '',
    registrationLink: '',
    liveStreamLink: '',
    capacity: '',
    notificationSettings: {
      sendEmail: true,
      emailRecipients: 'all',
      recipientRoles: [],
      specificRecipients: [],
      reminderTiming: 24,
      sendReminder: true,
    },
  });

  const eventTypes = [
    { value: 'service', label: 'Service' },
    { value: 'conference', label: 'Conference' },
    { value: 'program', label: 'Program' },
    { value: 'meeting', label: 'Meeting' },
    { value: 'outreach', label: 'Outreach' },
  ];

  const eventLevels = [
    { value: 'region', label: 'Region' },
    { value: 'province', label: 'Province' },
    { value: 'zone', label: 'Zone' },
    { value: 'area', label: 'Area' },
    { value: 'parish', label: 'Parish' },
  ];

  const recipientOptions = [
    { value: 'all', label: 'All Members' },
    { value: 'role', label: 'Specific Roles' },
    { value: 'specific', label: 'Specific Users' },
  ];

  const roleOptions = [
    { value: 'province_pastor', label: 'Province Pastors' },
    { value: 'zonal_pastor', label: 'Zonal Pastors' },
    { value: 'area_pastor', label: 'Area Pastors' },
    { value: 'parish_pastor', label: 'Parish Pastors' },
    { value: 'department_lead', label: 'Department Leads' },
    { value: 'member', label: 'Members' },
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await eventAPI.getAll();
      setEvents(response.data.events);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate || !formData.endDate) {
      toast.error('Please select start and end dates');
      return;
    }

    setSubmitting(true);
    const toastId = toast.loading(editingId ? 'Updating event...' : 'Creating event...');
    
    try {
      const eventData = {
        title: formData.title,
        description: formData.description,
        type: formData.type,
        level: formData.level,
        startDate: formData.startDate,
        endDate: formData.endDate,
        venue: formData.venue,
        speaker: formData.speaker || undefined,
        image: formData.image || undefined,
        registrationLink: formData.registrationLink || undefined,
        liveStreamLink: formData.liveStreamLink || undefined,
        capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
        notificationSettings: {
          sendEmail: formData.notificationSettings.sendEmail,
          emailRecipients: formData.notificationSettings.emailRecipients,
          recipientRoles: formData.notificationSettings.recipientRoles || [],
          specificRecipients: formData.notificationSettings.specificRecipients || [],
          reminderTiming: formData.notificationSettings.reminderTiming,
          sendReminder: formData.notificationSettings.sendReminder,
        },
      };

      if (editingId) {
        await eventAPI.update(editingId, eventData);
        toast.success('Event updated successfully', { id: toastId });
      } else {
        await eventAPI.create(eventData);
        toast.success('Event created successfully! Notifications will be sent to selected recipients.', { id: toastId });
      }
      
      setShowModal(false);
      setEditingId(null);
      resetForm();
      fetchEvents();
    } catch (error: any) {
      console.error('Save error:', error);
      toast.error(error.response?.data?.message || 'Failed to save event', { id: toastId });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this event? This will also cancel any scheduled notifications.')) return;
    
    const toastId = toast.loading('Deleting event...');
    try {
      await eventAPI.delete(id);
      toast.success('Event deleted successfully', { id: toastId });
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event', { id: toastId });
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'service',
      level: 'region',
      startDate: '',
      endDate: '',
      venue: '',
      speaker: '',
      image: '',
      registrationLink: '',
      liveStreamLink: '',
      capacity: '',
      notificationSettings: {
        sendEmail: true,
        emailRecipients: 'all',
        recipientRoles: [],
        specificRecipients: [],
        reminderTiming: 24,
        sendReminder: true,
      },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getEventTypeColor = (type: string) => {
    const colors = {
      service: 'bg-green-100 text-green-700',
      conference: 'bg-purple-100 text-purple-700',
      program: 'bg-blue-100 text-blue-700',
      meeting: 'bg-yellow-100 text-yellow-700',
      outreach: 'bg-red-100 text-red-700',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
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
          <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
          <p className="text-gray-600 mt-1">Create and manage church events with email notifications</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchEvents}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => {
              setEditingId(null);
              resetForm();
              setShowModal(true);
            }}
            className="bg-[#0EBC5F] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#0BA050] transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendees</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notifications</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.map((event) => {
                const notificationSettings = getNotificationSettings(event);
                return (
                  <tr key={event._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-gray-900">{event.title}</div>
                        {event.speaker && (
                          <div className="text-sm text-gray-500 mt-1">Speaker: {event.speaker}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{formatDate(event.startDate)}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
                        {event.type.toUpperCase()}
                      </span>
                      <div className="text-xs text-gray-500 mt-1">{event.level}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 max-w-[200px] truncate" title={event.venue}>
                      {event.venue}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {event.attendees.length} registered
                      {event.capacity && ` / ${event.capacity}`}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        {notificationSettings.sendEmail && (
                          <Mail className="w-4 h-4 text-green-500" title="Email notifications enabled" />
                        )}
                        {notificationSettings.sendReminder && (
                          <Bell className="w-4 h-4 text-blue-500" title="Reminders enabled" />
                        )}
                        <span className="text-xs text-gray-500 ml-1">
                          {notificationSettings.reminderTiming}h before
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => window.open(`/events/${event._id}`, '_blank')}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                          aria-label="View event"
                          title="View event"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setEditingId(event._id);
                            const settings = getNotificationSettings(event);
                            setFormData({
                              title: event.title,
                              description: event.description,
                              type: event.type,
                              level: event.level,
                              startDate: new Date(event.startDate).toISOString().slice(0, 16),
                              endDate: new Date(event.endDate).toISOString().slice(0, 16),
                              venue: event.venue,
                              speaker: event.speaker || '',
                              image: event.image || '',
                              registrationLink: event.registrationLink || '',
                              liveStreamLink: event.liveStreamLink || '',
                              capacity: event.capacity?.toString() || '',
                              notificationSettings: {
                                sendEmail: settings.sendEmail,
                                emailRecipients: settings.emailRecipients,
                                recipientRoles: settings.recipientRoles,
                                specificRecipients: settings.specificRecipients,
                                reminderTiming: settings.reminderTiming,
                                sendReminder: settings.sendReminder,
                              },
                            });
                            setShowModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 transition-colors p-1"
                          aria-label="Edit event"
                          title="Edit event"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(event._id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1"
                          aria-label="Delete event"
                          title="Delete event"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {events.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No events found. Click "Create Event" to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold">
                {editingId ? 'Edit Event' : 'Create New Event'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                      placeholder="e.g., Sunday Service, YAYA Conference 2024"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea
                      rows={3}
                      required
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                      placeholder="Describe the event, what to expect, special instructions..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Type *</label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                    >
                      {eventTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Level *</label>
                    <select
                      required
                      value={formData.level}
                      onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                    >
                      {eventLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time *</label>
                    <input
                      type="datetime-local"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                    />
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
                    <input
                      type="text"
                      required
                      value={formData.venue}
                      onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                      placeholder="e.g., Revelation Sanctuary Auditorium"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Speaker</label>
                    <input
                      type="text"
                      value={formData.speaker}
                      onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                      placeholder="e.g., Pastor Deji Afuye (Optional)"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Capacity</label>
                    <input
                      type="number"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                      placeholder="e.g., 500 (Optional)"
                    />
                  </div>
                </div>
              </div>
              
              {/* Media & Links */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Media & Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Image URL <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Registration Link <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={formData.registrationLink}
                      onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                      placeholder="https://..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Live Stream Link <span className="text-gray-400 text-xs">(Optional)</span>
                    </label>
                    <input
                      type="url"
                      value={formData.liveStreamLink}
                      onChange={(e) => setFormData({ ...formData, liveStreamLink: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                      placeholder="https://youtube.com/live/..."
                    />
                  </div>
                </div>
              </div>
              
              {/* Notification Settings */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#0EBC5F]" />
                  Email Notifications
                </h3>
                
                <div className="space-y-4">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={formData.notificationSettings.sendEmail}
                      onChange={(e) => setFormData({
                        ...formData,
                        notificationSettings: {
                          ...formData.notificationSettings,
                          sendEmail: e.target.checked
                        }
                      })}
                      className="w-4 h-4 text-[#0EBC5F] rounded focus:ring-[#0EBC5F]"
                    />
                    <span className="text-sm text-gray-700">Send email notifications when this event is created</span>
                  </label>
                  
                  {formData.notificationSettings.sendEmail && (
                    <div className="ml-6 space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Send to:</label>
                        <div className="space-y-2">
                          {recipientOptions.map(option => (
                            <label key={option.value} className="flex items-center space-x-3">
                              <input
                                type="radio"
                                value={option.value}
                                checked={formData.notificationSettings.emailRecipients === option.value}
                                onChange={(e) => setFormData({
                                  ...formData,
                                  notificationSettings: {
                                    ...formData.notificationSettings,
                                    emailRecipients: e.target.value as any
                                  }
                                })}
                                className="w-4 h-4 text-[#0EBC5F]"
                              />
                              <span className="text-sm text-gray-700">{option.label}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                      
                      {formData.notificationSettings.emailRecipients === 'role' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Select Roles:</label>
                          <div className="grid grid-cols-2 gap-2">
                            {roleOptions.map(role => (
                              <label key={role.value} className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  value={role.value}
                                  checked={formData.notificationSettings.recipientRoles?.includes(role.value)}
                                  onChange={(e) => {
                                    const currentRoles = [...(formData.notificationSettings.recipientRoles || [])];
                                    if (e.target.checked) {
                                      setFormData({
                                        ...formData,
                                        notificationSettings: {
                                          ...formData.notificationSettings,
                                          recipientRoles: [...currentRoles, role.value]
                                        }
                                      });
                                    } else {
                                      setFormData({
                                        ...formData,
                                        notificationSettings: {
                                          ...formData.notificationSettings,
                                          recipientRoles: currentRoles.filter(r => r !== role.value)
                                        }
                                      });
                                    }
                                  }}
                                  className="w-4 h-4 text-[#0EBC5F] rounded"
                                />
                                <span className="text-sm text-gray-700">{role.label}</span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="border-t pt-4">
                    <label className="flex items-center space-x-3 mb-4">
                      <input
                        type="checkbox"
                        checked={formData.notificationSettings.sendReminder}
                        onChange={(e) => setFormData({
                          ...formData,
                          notificationSettings: {
                            ...formData.notificationSettings,
                            sendReminder: e.target.checked
                          }
                        })}
                        className="w-4 h-4 text-[#0EBC5F] rounded focus:ring-[#0EBC5F]"
                      />
                      <span className="text-sm text-gray-700">Send reminder emails to registered attendees</span>
                    </label>
                    
                    {formData.notificationSettings.sendReminder && (
                      <div className="ml-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Timing:</label>
                        <select
                          value={formData.notificationSettings.reminderTiming}
                          onChange={(e) => setFormData({
                            ...formData,
                            notificationSettings: {
                              ...formData.notificationSettings,
                              reminderTiming: parseInt(e.target.value)
                            }
                          })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
                        >
                          <option value={1}>1 hour before</option>
                          <option value={2}>2 hours before</option>
                          <option value={6}>6 hours before</option>
                          <option value={12}>12 hours before</option>
                          <option value={24}>1 day before</option>
                          <option value={48}>2 days before</option>
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Form Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#0EBC5F] text-white rounded-lg hover:bg-[#0BA050] transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>{editingId ? 'Update Event' : 'Create Event'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}






























































// 'use client';

// import { useState, useEffect } from 'react';
// import { 
//   Plus, 
//   Edit, 
//   Trash2, 
//   Calendar as CalendarIcon, 
//   Users, 
//   MapPin, 
//   Clock,
//   Eye,
//   Mail,
//   Bell,
//   X,
//   Save,
//   Video,
//   Link as LinkIcon
// } from 'lucide-react';
// import { eventAPI } from '@/lib/api';
// import toast from 'react-hot-toast';
// import { useAuth } from '@/hooks/useAuth';

// interface Event {
//   _id: string;
//   title: string;
//   description: string;
//   type: string;
//   level: string;
//   startDate: string;
//   endDate: string;
//   venue: string;
//   speaker?: string;
//   image?: string;
//   registrationLink?: string;
//   liveStreamLink?: string;
//   capacity?: number;
//   attendees: string[];
//   notificationSettings?: {
//     sendEmail: boolean;
//     emailRecipients: 'all' | 'role' | 'specific';
//     recipientRoles: string[];
//     specificRecipients: string[];
//     reminderTiming: number;
//     sendReminder: boolean;
//   };
//   isActive: boolean;
// }

// // Form data interface with optional fields
// interface EventFormData {
//   title: string;
//   description: string;
//   type: string;
//   level: string;
//   startDate: string;
//   endDate: string;
//   venue: string;
//   speaker: string;
//   image: string;
//   registrationLink: string;
//   liveStreamLink: string;
//   capacity: string;
//   notificationSettings: {
//     sendEmail: boolean;
//     emailRecipients: 'all' | 'role' | 'specific';
//     recipientRoles: string[];
//     specificRecipients: string[];
//     reminderTiming: number;
//     sendReminder: boolean;
//   };
// }

// // Helper function to get notification settings with defaults
// const getNotificationSettings = (event: Event) => {
//   return {
//     sendEmail: event.notificationSettings?.sendEmail ?? true,
//     sendReminder: event.notificationSettings?.sendReminder ?? true,
//     reminderTiming: event.notificationSettings?.reminderTiming ?? 24,
//     emailRecipients: event.notificationSettings?.emailRecipients ?? 'all',
//     recipientRoles: event.notificationSettings?.recipientRoles ?? [],
//     specificRecipients: event.notificationSettings?.specificRecipients ?? [],
//   };
// };

// export default function ManageEvents() {
//   const { user } = useAuth();
//   const [events, setEvents] = useState<Event[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [showModal, setShowModal] = useState(false);
//   const [editingId, setEditingId] = useState<string | null>(null);
//   const [formData, setFormData] = useState<EventFormData>({
//     title: '',
//     description: '',
//     type: 'service',
//     level: 'region',
//     startDate: '',
//     endDate: '',
//     venue: '',
//     speaker: '',
//     image: '',
//     registrationLink: '',
//     liveStreamLink: '',
//     capacity: '',
//     notificationSettings: {
//       sendEmail: true,
//       emailRecipients: 'all',
//       recipientRoles: [],
//       specificRecipients: [],
//       reminderTiming: 24,
//       sendReminder: true,
//     },
//   });

//   const eventTypes = [
//     { value: 'service', label: 'Service' },
//     { value: 'conference', label: 'Conference' },
//     { value: 'program', label: 'Program' },
//     { value: 'meeting', label: 'Meeting' },
//     { value: 'outreach', label: 'Outreach' },
//   ];

//   const eventLevels = [
//     { value: 'region', label: 'Region' },
//     { value: 'province', label: 'Province' },
//     { value: 'zone', label: 'Zone' },
//     { value: 'area', label: 'Area' },
//     { value: 'parish', label: 'Parish' },
//   ];

//   const recipientOptions = [
//     { value: 'all', label: 'All Members' },
//     { value: 'role', label: 'Specific Roles' },
//     { value: 'specific', label: 'Specific Users' },
//   ];

//   const roleOptions = [
//     { value: 'province_pastor', label: 'Province Pastors' },
//     { value: 'zonal_pastor', label: 'Zonal Pastors' },
//     { value: 'area_pastor', label: 'Area Pastors' },
//     { value: 'parish_pastor', label: 'Parish Pastors' },
//     { value: 'department_lead', label: 'Department Leads' },
//     { value: 'member', label: 'Members' },
//   ];

//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   const fetchEvents = async () => {
//     try {
//       const response = await eventAPI.getAll();
//       setEvents(response.data.events);
//     } catch (error) {
//       toast.error('Failed to load events');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     const toastId = toast.loading(editingId ? 'Updating event...' : 'Creating event...');
    
//     try {
//       const eventData = {
//         ...formData,
//         capacity: formData.capacity ? parseInt(formData.capacity) : undefined,
//         notificationSettings: {
//           ...formData.notificationSettings,
//           recipientRoles: formData.notificationSettings.recipientRoles || [],
//           specificRecipients: formData.notificationSettings.specificRecipients || [],
//           reminderTiming: formData.notificationSettings.reminderTiming,
//         },
//       };

//       if (editingId) {
//         await eventAPI.update(editingId, eventData);
//         toast.success('Event updated successfully', { id: toastId });
//       } else {
//         await eventAPI.create(eventData);
//         toast.success('Event created successfully! Notifications will be sent to selected recipients.', { id: toastId });
//       }
      
//       setShowModal(false);
//       setEditingId(null);
//       resetForm();
//       fetchEvents();
//     } catch (error: any) {
//       console.error('Save error:', error);
//       toast.error(error.response?.data?.message || 'Failed to save event', { id: toastId });
//     }
//   };

//   const handleDelete = async (id: string) => {
//     if (!confirm('Are you sure you want to delete this event? This will also cancel any scheduled notifications.')) return;
    
//     const toastId = toast.loading('Deleting event...');
//     try {
//       await eventAPI.delete(id);
//       toast.success('Event deleted successfully', { id: toastId });
//       fetchEvents();
//     } catch (error) {
//       toast.error('Failed to delete event', { id: toastId });
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       title: '',
//       description: '',
//       type: 'service',
//       level: 'region',
//       startDate: '',
//       endDate: '',
//       venue: '',
//       speaker: '',
//       image: '',
//       registrationLink: '',
//       liveStreamLink: '',
//       capacity: '',
//       notificationSettings: {
//         sendEmail: true,
//         emailRecipients: 'all',
//         recipientRoles: [],
//         specificRecipients: [],
//         reminderTiming: 24,
//         sendReminder: true,
//       },
//     });
//   };

//   const formatDate = (dateString: string) => {
//     return new Date(dateString).toLocaleDateString('en-US', {
//       month: 'short',
//       day: 'numeric',
//       year: 'numeric',
//     });
//   };

//   const getEventTypeColor = (type: string) => {
//     const colors = {
//       service: 'bg-green-100 text-green-700',
//       conference: 'bg-purple-100 text-purple-700',
//       program: 'bg-blue-100 text-blue-700',
//       meeting: 'bg-yellow-100 text-yellow-700',
//       outreach: 'bg-red-100 text-red-700',
//     };
//     return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-64">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0EBC5F]"></div>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-900">Manage Events</h1>
//           <p className="text-gray-600 mt-1">Create and manage church events with email notifications</p>
//         </div>
//         <button
//           onClick={() => {
//             setEditingId(null);
//             resetForm();
//             setShowModal(true);
//           }}
//           className="bg-[#0EBC5F] text-white px-4 py-2 rounded-lg flex items-center space-x-2 hover:bg-[#0BA050] transition-colors"
//         >
//           <Plus className="w-5 h-5" />
//           <span>Create Event</span>
//         </button>
//       </div>

//       {/* Events Table */}
//       <div className="bg-white rounded-xl shadow-sm overflow-hidden">
//         <div className="overflow-x-auto">
//           <table className="w-full">
//             <thead className="bg-gray-50">
//               <tr>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Event</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date & Time</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Venue</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Attendees</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notifications</th>
//                 <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-gray-200">
//               {events.map((event) => {
//                 const notificationSettings = getNotificationSettings(event);
//                 return (
//                   <tr key={event._id} className="hover:bg-gray-50">
//                     <td className="px-6 py-4">
//                       <div>
//                         <div className="font-medium text-gray-900">{event.title}</div>
//                         {event.speaker && (
//                           <div className="text-sm text-gray-500">Speaker: {event.speaker}</div>
//                         )}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="text-sm text-gray-900">{formatDate(event.startDate)}</div>
//                       <div className="text-xs text-gray-500">
//                         {new Date(event.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEventTypeColor(event.type)}`}>
//                         {event.type.toUpperCase()}
//                       </span>
//                       <div className="text-xs text-gray-500 mt-1">{event.level}</div>
//                     </td>
//                     <td className="px-6 py-4 text-sm text-gray-600">{event.venue}</td>
//                     <td className="px-6 py-4 text-sm text-gray-600">
//                       {event.attendees.length} registered
//                       {event.capacity && ` / ${event.capacity}`}
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center space-x-1">
//                         {notificationSettings.sendEmail && (
//                           <Mail className="w-4 h-4 text-green-500" />
//                         )}
//                         {notificationSettings.sendReminder && (
//                           <Bell className="w-4 h-4 text-blue-500" />
//                         )}
//                         <span className="text-xs text-gray-500 ml-1">
//                           {notificationSettings.reminderTiming}h before
//                         </span>
//                       </div>
//                     </td>
//                     <td className="px-6 py-4">
//                       <div className="flex items-center space-x-2">
//                         <button
//                           onClick={() => window.open(`/events/${event._id}`, '_blank')}
//                           className="text-blue-600 hover:text-blue-800"
//                           aria-label="View event"
//                         >
//                           <Eye className="w-5 h-5" />
//                         </button>
//                         <button
//                           onClick={() => {
//                             setEditingId(event._id);
//                             setFormData({
//                               title: event.title,
//                               description: event.description,
//                               type: event.type,
//                               level: event.level,
//                               startDate: new Date(event.startDate).toISOString().slice(0, 16),
//                               endDate: new Date(event.endDate).toISOString().slice(0, 16),
//                               venue: event.venue,
//                               speaker: event.speaker || '',
//                               image: event.image || '',
//                               registrationLink: event.registrationLink || '',
//                               liveStreamLink: event.liveStreamLink || '',
//                               capacity: event.capacity?.toString() || '',
//                               notificationSettings: {
//                                 sendEmail: notificationSettings.sendEmail,
//                                 emailRecipients: notificationSettings.emailRecipients,
//                                 recipientRoles: notificationSettings.recipientRoles,
//                                 specificRecipients: notificationSettings.specificRecipients,
//                                 reminderTiming: notificationSettings.reminderTiming,
//                                 sendReminder: notificationSettings.sendReminder,
//                               },
//                             });
//                             setShowModal(true);
//                           }}
//                           className="text-blue-600 hover:text-blue-800"
//                           aria-label="Edit event"
//                         >
//                           <Edit className="w-5 h-5" />
//                         </button>
//                         <button
//                           onClick={() => handleDelete(event._id)}
//                           className="text-red-600 hover:text-red-800"
//                           aria-label="Delete event"
//                         >
//                           <Trash2 className="w-5 h-5" />
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 );
//               })}
//               {events.length === 0 && (
//                 <tr>
//                   <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
//                     No events found. Click "Create Event" to get started.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Create/Edit Modal */}
//       {showModal && (
//         <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
//           <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//             <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
//               <h2 className="text-2xl font-bold">
//                 {editingId ? 'Edit Event' : 'Create New Event'}
//               </h2>
//               <button
//                 onClick={() => setShowModal(false)}
//                 className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
//                 aria-label="Close modal"
//               >
//                 <X className="w-5 h-5" />
//               </button>
//             </div>
            
//             <form onSubmit={handleSubmit} className="p-6 space-y-6">
//               {/* Basic Information */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
//                     <input
//                       type="text"
//                       required
//                       value={formData.title}
//                       onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
//                       placeholder="e.g., Sunday Service, YAYA Conference 2024"
//                     />
//                   </div>
                  
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
//                     <textarea
//                       rows={3}
//                       required
//                       value={formData.description}
//                       onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
//                       placeholder="Describe the event, what to expect, special instructions..."
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Event Type *</label>
//                     <select
//                       required
//                       value={formData.type}
//                       onChange={(e) => setFormData({ ...formData, type: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
//                     >
//                       {eventTypes.map(type => (
//                         <option key={type.value} value={type.value}>{type.label}</option>
//                       ))}
//                     </select>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Event Level *</label>
//                     <select
//                       required
//                       value={formData.level}
//                       onChange={(e) => setFormData({ ...formData, level: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
//                     >
//                       {eventLevels.map(level => (
//                         <option key={level.value} value={level.value}>{level.label}</option>
//                       ))}
//                     </select>
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Start Date & Time *</label>
//                     <input
//                       type="datetime-local"
//                       required
//                       value={formData.startDate}
//                       onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">End Date & Time *</label>
//                     <input
//                       type="datetime-local"
//                       required
//                       value={formData.endDate}
//                       onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
//                     />
//                   </div>
                  
//                   <div className="md:col-span-2">
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
//                     <input
//                       type="text"
//                       required
//                       value={formData.venue}
//                       onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
//                       placeholder="e.g., Revelation Sanctuary Auditorium"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Speaker (Optional)</label>
//                     <input
//                       type="text"
//                       value={formData.speaker}
//                       onChange={(e) => setFormData({ ...formData, speaker: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
//                       placeholder="e.g., Pastor Deji Afuye"
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Capacity (Optional)</label>
//                     <input
//                       type="number"
//                       value={formData.capacity}
//                       onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
//                       placeholder="e.g., 500"
//                     />
//                   </div>
//                 </div>
//               </div>
              
//               {/* Media & Links */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4">Media & Links</h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Event Image URL</label>
//                     <input
//                       type="url"
//                       value={formData.image}
//                       onChange={(e) => setFormData({ ...formData, image: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
//                       placeholder="https://..."
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Registration Link</label>
//                     <input
//                       type="url"
//                       value={formData.registrationLink}
//                       onChange={(e) => setFormData({ ...formData, registrationLink: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
//                       placeholder="https://..."
//                     />
//                   </div>
                  
//                   <div>
//                     <label className="block text-sm font-medium text-gray-700 mb-1">Live Stream Link</label>
//                     <input
//                       type="url"
//                       value={formData.liveStreamLink}
//                       onChange={(e) => setFormData({ ...formData, liveStreamLink: e.target.value })}
//                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
//                       placeholder="https://youtube.com/live/..."
//                     />
//                   </div>
//                 </div>
//               </div>
              
//               {/* Notification Settings */}
//               <div>
//                 <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
//                   <Mail className="w-5 h-5 text-[#0EBC5F]" />
//                   Email Notifications
//                 </h3>
                
//                 <div className="space-y-4">
//                   <label className="flex items-center space-x-3">
//                     <input
//                       type="checkbox"
//                       checked={formData.notificationSettings.sendEmail}
//                       onChange={(e) => setFormData({
//                         ...formData,
//                         notificationSettings: {
//                           ...formData.notificationSettings,
//                           sendEmail: e.target.checked
//                         }
//                       })}
//                       className="w-4 h-4 text-[#0EBC5F] rounded focus:ring-[#0EBC5F]"
//                     />
//                     <span className="text-sm text-gray-700">Send email notifications when this event is created</span>
//                   </label>
                  
//                   {formData.notificationSettings.sendEmail && (
//                     <div className="ml-6 space-y-4">
//                       <div>
//                         <label className="block text-sm font-medium text-gray-700 mb-2">Send to:</label>
//                         <div className="space-y-2">
//                           {recipientOptions.map(option => (
//                             <label key={option.value} className="flex items-center space-x-3">
//                               <input
//                                 type="radio"
//                                 value={option.value}
//                                 checked={formData.notificationSettings.emailRecipients === option.value}
//                                 onChange={(e) => setFormData({
//                                   ...formData,
//                                   notificationSettings: {
//                                     ...formData.notificationSettings,
//                                     emailRecipients: e.target.value as any
//                                   }
//                                 })}
//                                 className="w-4 h-4 text-[#0EBC5F]"
//                               />
//                               <span className="text-sm text-gray-700">{option.label}</span>
//                             </label>
//                           ))}
//                         </div>
//                       </div>
                      
//                       {formData.notificationSettings.emailRecipients === 'role' && (
//                         <div>
//                           <label className="block text-sm font-medium text-gray-700 mb-2">Select Roles:</label>
//                           <div className="grid grid-cols-2 gap-2">
//                             {roleOptions.map(role => (
//                               <label key={role.value} className="flex items-center space-x-2">
//                                 <input
//                                   type="checkbox"
//                                   value={role.value}
//                                   checked={formData.notificationSettings.recipientRoles?.includes(role.value)}
//                                   onChange={(e) => {
//                                     const currentRoles = [...(formData.notificationSettings.recipientRoles || [])];
//                                     if (e.target.checked) {
//                                       setFormData({
//                                         ...formData,
//                                         notificationSettings: {
//                                           ...formData.notificationSettings,
//                                           recipientRoles: [...currentRoles, role.value]
//                                         }
//                                       });
//                                     } else {
//                                       setFormData({
//                                         ...formData,
//                                         notificationSettings: {
//                                           ...formData.notificationSettings,
//                                           recipientRoles: currentRoles.filter(r => r !== role.value)
//                                         }
//                                       });
//                                     }
//                                   }}
//                                   className="w-4 h-4 text-[#0EBC5F] rounded"
//                                 />
//                                 <span className="text-sm text-gray-700">{role.label}</span>
//                               </label>
//                             ))}
//                           </div>
//                         </div>
//                       )}
//                     </div>
//                   )}
                  
//                   <div className="border-t pt-4">
//                     <label className="flex items-center space-x-3 mb-4">
//                       <input
//                         type="checkbox"
//                         checked={formData.notificationSettings.sendReminder}
//                         onChange={(e) => setFormData({
//                           ...formData,
//                           notificationSettings: {
//                             ...formData.notificationSettings,
//                             sendReminder: e.target.checked
//                           }
//                         })}
//                         className="w-4 h-4 text-[#0EBC5F] rounded focus:ring-[#0EBC5F]"
//                       />
//                       <span className="text-sm text-gray-700">Send reminder emails to registered attendees</span>
//                     </label>
                    
//                     {formData.notificationSettings.sendReminder && (
//                       <div className="ml-6">
//                         <label className="block text-sm font-medium text-gray-700 mb-2">Reminder Timing:</label>
//                         <select
//                           value={formData.notificationSettings.reminderTiming}
//                           onChange={(e) => setFormData({
//                             ...formData,
//                             notificationSettings: {
//                               ...formData.notificationSettings,
//                               reminderTiming: parseInt(e.target.value)
//                             }
//                           })}
//                           className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
//                         >
//                           <option value={1}>1 hour before</option>
//                           <option value={2}>2 hours before</option>
//                           <option value={6}>6 hours before</option>
//                           <option value={12}>12 hours before</option>
//                           <option value={24}>1 day before</option>
//                           <option value={48}>2 days before</option>
//                         </select>
//                       </div>
//                     )}
//                   </div>
//                 </div>
//               </div>
              
//               {/* Form Actions */}
//               <div className="flex justify-end space-x-3 pt-4 border-t">
//                 <button
//                   type="button"
//                   onClick={() => setShowModal(false)}
//                   className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   type="submit"
//                   className="px-6 py-2 bg-[#0EBC5F] text-white rounded-lg hover:bg-[#0BA050] transition-colors flex items-center space-x-2"
//                 >
//                   <Save className="w-4 h-4" />
//                   <span>{editingId ? 'Update Event' : 'Create Event'}</span>
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }