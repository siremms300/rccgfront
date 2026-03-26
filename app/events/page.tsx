'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  ChevronRight, 
  Filter,
  Search,
  X,
  Bell,
  Video,
  Link as LinkIcon
} from 'lucide-react';
import { eventAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Event {
  _id: string;
  title: string;
  description: string;
  type: 'service' | 'conference' | 'program' | 'meeting' | 'outreach';
  level: 'region' | 'province' | 'zone' | 'area' | 'parish';
  startDate: string;
  endDate: string;
  venue: string;
  speaker?: string;
  image?: string;
  registrationLink?: string;
  liveStreamLink?: string;
  capacity?: number;
  attendees: string[];
  isRegistered?: boolean;
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('upcoming');
  const [typeFilter, setTypeFilter] = useState('');
  const [levelFilter, setLevelFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
    limit: 10,
  });

  useEffect(() => {
    fetchEvents();
  }, [filter, typeFilter, levelFilter, searchQuery, pagination.page]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const params: any = {
        page: pagination.page,
        limit: pagination.limit,
      };
      if (filter === 'upcoming') params.upcoming = true;
      if (typeFilter) params.type = typeFilter;
      if (levelFilter) params.level = levelFilter;
      if (searchQuery) params.search = searchQuery;
      
      const response = await eventAPI.getAll(params);
      setEvents(response.data.events);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (eventId: string) => {
    try {
      await eventAPI.register(eventId);
      toast.success('Successfully registered for event!');
      fetchEvents();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed');
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'service': return 'bg-green-500';
      case 'conference': return 'bg-purple-500';
      case 'program': return 'bg-blue-500';
      case 'meeting': return 'bg-yellow-500';
      case 'outreach': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getEventTypeIcon = (type: string) => {
    switch (type) {
      case 'service': return '⛪';
      case 'conference': return '🎤';
      case 'program': return '📖';
      case 'meeting': return '👥';
      case 'outreach': return '🤝';
      default: return '📅';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const eventTypes = [
    { value: '', label: 'All Types' },
    { value: 'service', label: 'Services' },
    { value: 'conference', label: 'Conferences' },
    { value: 'program', label: 'Programs' },
    { value: 'meeting', label: 'Meetings' },
    { value: 'outreach', label: 'Outreach' },
  ];

  const eventLevels = [
    { value: '', label: 'All Levels' },
    { value: 'region', label: 'Region' },
    { value: 'province', label: 'Province' },
    { value: 'zone', label: 'Zone' },
    { value: 'area', label: 'Area' },
    { value: 'parish', label: 'Parish' },
  ];

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#29156C] to-[#0EBC5F]" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
              Events & Programs
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto animate-fade-in">
              Stay updated on upcoming services, conferences, and special programs
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="sticky top-16 z-20 bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search events by title, speaker, or venue..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter('upcoming')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'upcoming'
                      ? 'bg-[#0EBC5F] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Upcoming
                </button>
                <button
                  onClick={() => setFilter('past')}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    filter === 'past'
                      ? 'bg-[#0EBC5F] text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Past
                </button>
              </div>
            </div>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
              >
                {eventTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
              >
                {eventLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </section>

      {/* Events List */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0EBC5F]"></div>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No events found</p>
            </div>
          ) : (
            <div className="space-y-6">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Date Badge */}
                    <div className="md:w-32 bg-[#29156C] text-white p-4 flex flex-row md:flex-col items-center justify-between md:justify-center">
                      <div className="text-3xl font-bold">
                        {new Date(event.startDate).getDate()}
                      </div>
                      <div className="text-sm">
                        {new Date(event.startDate).toLocaleString('default', { month: 'short' })}
                      </div>
                      <div className="text-xs opacity-80">
                        {new Date(event.startDate).getFullYear()}
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex items-start justify-between flex-wrap gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2 flex-wrap">
                            <span className={`px-2 py-1 rounded text-xs text-white ${getEventTypeColor(event.type)}`}>
                              {getEventTypeIcon(event.type)} {event.type.toUpperCase()}
                            </span>
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                              {event.level.toUpperCase()}
                            </span>
                            {event.liveStreamLink && (
                              <span className="flex items-center gap-1 text-xs text-red-500">
                                <Video className="w-3 h-3" />
                                Live Stream Available
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-[#0EBC5F] transition-colors">
                            <Link href={`/events/${event._id}`}>{event.title}</Link>
                          </h3>
                          <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-500 mb-4">
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(event.startDate)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              <span>{formatTime(event.startDate)} - {formatTime(event.endDate)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>{event.venue}</span>
                            </div>
                          </div>
                          
                          {event.speaker && (
                            <div className="text-sm text-gray-500 mb-4">
                              🎤 Speaker: {event.speaker}
                            </div>
                          )}
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col gap-2 min-w-[140px]">
                          <Link
                            href={`/events/${event._id}`}
                            className="text-center px-4 py-2 border border-[#0EBC5F] text-[#0EBC5F] rounded-lg hover:bg-[#0EBC5F] hover:text-white transition-colors"
                          >
                            View Details
                          </Link>
                          {new Date(event.startDate) > new Date() && (
                            <button
                              onClick={() => handleRegister(event._id)}
                              disabled={event.isRegistered}
                              className="text-center px-4 py-2 bg-[#0EBC5F] text-white rounded-lg hover:bg-[#0BA050] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {event.isRegistered ? 'Registered ✓' : 'Register'}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Pagination */}
          {pagination.pages > 1 && (
            <div className="flex justify-center mt-12 space-x-2">
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Previous
              </button>
              <span className="px-4 py-2">
                Page {pagination.page} of {pagination.pages}
              </span>
              <button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}