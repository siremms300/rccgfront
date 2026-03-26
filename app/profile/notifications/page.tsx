'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Bell, Mail, Calendar, BookOpen, Megaphone, Save } from 'lucide-react';
import toast from 'react-hot-toast';

interface NotificationPreferences {
  emailNotifications: {
    events: boolean;
    announcements: boolean;
    teachings: boolean;
  };
  eventReminders: {
    enabled: boolean;
    timing: number;
  };
}

export default function NotificationSettingsPage() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailNotifications: {
      events: true,
      announcements: true,
      teachings: false,
    },
    eventReminders: {
      enabled: true,
      timing: 24,
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/preferences`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.preferences) {
        setPreferences(data.preferences);
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(preferences),
      });
      
      if (response.ok) {
        toast.success('Notification preferences saved!');
      } else {
        throw new Error('Failed to save');
      }
    } catch (error) {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
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
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-[#29156C] to-[#0EBC5F] p-6 text-white">
            <Bell className="w-8 h-8 mb-2" />
            <h1 className="text-2xl font-bold">Notification Preferences</h1>
            <p className="text-white/80 mt-1">
              Choose how you want to receive updates from the church
            </p>
          </div>
          
          <div className="p-6">
            {/* Email Notifications */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Mail className="w-5 h-5 text-[#0EBC5F]" />
                Email Notifications
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium text-gray-900">Event Updates</p>
                    <p className="text-sm text-gray-500">Receive emails about new events and changes</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications.events}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        emailNotifications: {
                          ...preferences.emailNotifications,
                          events: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0EBC5F]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0EBC5F]"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium text-gray-900">Church Announcements</p>
                    <p className="text-sm text-gray-500">Important updates and news from the church</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications.announcements}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        emailNotifications: {
                          ...preferences.emailNotifications,
                          announcements: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0EBC5F]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0EBC5F]"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium text-gray-900">New Teachings</p>
                    <p className="text-sm text-gray-500">Get notified when new teachings are uploaded</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.emailNotifications.teachings}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        emailNotifications: {
                          ...preferences.emailNotifications,
                          teachings: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0EBC5F]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0EBC5F]"></div>
                  </label>
                </div>
              </div>
            </div>
            
            {/* Event Reminders */}
            <div className="mb-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-[#0EBC5F]" />
                Event Reminders
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <div>
                    <p className="font-medium text-gray-900">Enable Reminders</p>
                    <p className="text-sm text-gray-500">Get reminders before events you registered for</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preferences.eventReminders.enabled}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        eventReminders: {
                          ...preferences.eventReminders,
                          enabled: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0EBC5F]/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0EBC5F]"></div>
                  </label>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reminder Timing
                  </label>
                  <select
                    value={preferences.eventReminders.timing}
                    onChange={(e) => setPreferences({
                      ...preferences,
                      eventReminders: {
                        ...preferences.eventReminders,
                        timing: parseInt(e.target.value)
                      }
                    })}
                    disabled={!preferences.eventReminders.enabled}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F] disabled:opacity-50"
                  >
                    <option value={1}>1 hour before</option>
                    <option value={2}>2 hours before</option>
                    <option value={6}>6 hours before</option>
                    <option value={12}>12 hours before</option>
                    <option value={24}>1 day before</option>
                    <option value={48}>2 days before</option>
                  </select>
                </div>
              </div>
            </div>
            
            {/* Save Button */}
            <div className="pt-4">
              <button
                onClick={savePreferences}
                disabled={saving}
                className="w-full bg-[#0EBC5F] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#0BA050] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}