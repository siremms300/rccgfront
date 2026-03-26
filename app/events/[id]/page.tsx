'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  ArrowLeft,
  Share2,
  Video,
  Link as LinkIcon,
  Mail,
  Bell,
  CheckCircle,
  User,
  Globe,
  CalendarDays,
  Loader2,
  ExternalLink
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
  createdBy: {
    name: string;
    _id: string;
  };
}

// Helper function to check if a URL is a valid image
const isValidImageUrl = (url: string): boolean => {
  if (!url) return false;
  
  // Check for common image extensions
  if (/\.(jpg|jpeg|png|gif|webp|svg|bmp|ico)$/i.test(url)) return true;
  
  // Check for image hosting services
  const imageHosts = [
    'cloudinary.com',
    'images.unsplash.com',
    'imgur.com',
    'ibb.co',
    'postimg.cc',
    'flickr.com',
    'photobucket.com',
    'googleusercontent.com',
    'ggpht.com',
    'pinimg.com',
    'staticflickr.com'
  ];
  
  // Check if URL contains any known image hosting domains
  if (imageHosts.some(host => url.includes(host))) return true;
  
  // Check for common image CDNs
  if (url.includes('cdn') && (url.includes('image') || url.includes('img'))) return true;
  
  return false;
};

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [params.id]);

  const fetchEvent = async () => {
    try {
      const response = await eventAPI.getOne(params.id as string);
      setEvent(response.data.event);
      if (user) {
        setIsRegistered(response.data.event.attendees.includes(user.id));
      }
    } catch (error) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event');
      router.push('/events');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!user) {
      toast.error('Please login to register for events');
      router.push('/login');
      return;
    }

    const toastId = toast.loading('Registering...');
    try {
      await eventAPI.register(event!._id);
      setIsRegistered(true);
      toast.success('Successfully registered for event!', { id: toastId });
      fetchEvent();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed', { id: toastId });
    }
  };

  const handleSetReminder = async () => {
    if (!user) {
      toast.error('Please login to set reminders');
      router.push('/login');
      return;
    }

    setShowReminder(true);
    toast.success('Reminder set! You will be notified before the event.');
    setTimeout(() => setShowReminder(false), 3000);
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

  const addToGoogleCalendar = () => {
    if (!event) return;
    const start = new Date(event.startDate).toISOString().replace(/-|:|\./g, '');
    const end = new Date(event.endDate).toISOString().replace(/-|:|\./g, '');
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.venue)}`;
    window.open(url, '_blank');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: event?.title,
        text: event?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
    setShowShareMenu(false);
  };

  const getEventTypeInfo = (type: string) => {
    const types: Record<string, { icon: string; color: string; label: string }> = {
      service: { icon: '⛪', color: 'bg-green-100 text-green-700', label: 'Service' },
      conference: { icon: '🎤', color: 'bg-purple-100 text-purple-700', label: 'Conference' },
      program: { icon: '📖', color: 'bg-blue-100 text-blue-700', label: 'Program' },
      meeting: { icon: '👥', color: 'bg-yellow-100 text-yellow-700', label: 'Meeting' },
      outreach: { icon: '🤝', color: 'bg-red-100 text-red-700', label: 'Outreach' },
    };
    return types[type] || { icon: '📅', color: 'bg-gray-100 text-gray-700', label: type };
  };

  const getLevelInfo = (level: string) => {
    const levels: Record<string, { icon: string; label: string }> = {
      region: { icon: '🌍', label: 'Region' },
      province: { icon: '🏛️', label: 'Province' },
      zone: { icon: '📍', label: 'Zone' },
      area: { icon: '🏘️', label: 'Area' },
      parish: { icon: '⛪', label: 'Parish' },
    };
    return levels[level] || { icon: '📍', label: level };
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-[#0EBC5F] animate-spin" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <CalendarDays className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">Event not found</p>
          <Link href="/events" className="mt-4 inline-block text-[#0EBC5F] hover:underline">
            Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const isUpcoming = new Date(event.startDate) > new Date();
  const typeInfo = getEventTypeInfo(event.type);
  const levelInfo = getLevelInfo(event.level);
  const hasValidImage = event.image && isValidImageUrl(event.image) && !imageError;

  return (
    <div className="pt-16 bg-gray-50 min-h-screen">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-[#0EBC5F] transition-colors group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Events</span>
        </button>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Event Image - Handles any URL gracefully */}
              {event.image ? (
                <div className="relative h-64 md:h-80">
                  {hasValidImage ? (
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      className="object-cover"
                      onError={() => setImageError(true)}
                      unoptimized={!event.image.startsWith('https://res.cloudinary.com')}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-r from-[#29156C] to-[#0EBC5F] flex flex-col items-center justify-center text-white p-6">
                      <Calendar className="w-16 h-16 mb-4 opacity-50" />
                      <p className="text-sm opacity-75 text-center">Image not available</p>
                      {event.image && (
                        <a 
                          href={event.image} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="mt-3 text-xs underline opacity-75 hover:opacity-100 flex items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          View Link <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                </div>
              ) : (
                <div className="h-64 md:h-80 bg-gradient-to-r from-[#29156C] to-[#0EBC5F] flex items-center justify-center">
                  <Calendar className="w-24 h-24 text-white/30" />
                </div>
              )}
              
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeInfo.color}`}>
                    {typeInfo.icon} {typeInfo.label}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1">
                    {levelInfo.icon} {levelInfo.label}
                  </span>
                  {event.liveStreamLink && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      Live Stream
                    </span>
                  )}
                </div>
                
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                  {event.title}
                </h1>
                
                <p className="text-gray-600 mb-6 leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-[#0EBC5F] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Date</p>
                      <p className="text-gray-600">{formatDate(event.startDate)}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-[#0EBC5F] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Time</p>
                      <p className="text-gray-600">
                        {formatTime(event.startDate)} - {formatTime(event.endDate)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-[#0EBC5F] mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-gray-900">Venue</p>
                      <p className="text-gray-600">{event.venue}</p>
                    </div>
                  </div>
                  {event.speaker && (
                    <div className="flex items-start gap-3">
                      <User className="w-5 h-5 text-[#0EBC5F] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Speaker</p>
                        <p className="text-gray-600">{event.speaker}</p>
                      </div>
                    </div>
                  )}
                  {event.capacity && (
                    <div className="flex items-start gap-3">
                      <Users className="w-5 h-5 text-[#0EBC5F] mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium text-gray-900">Capacity</p>
                        <p className="text-gray-600">{event.attendees.length} / {event.capacity} registered</p>
                        <div className="w-32 mt-1">
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className="bg-[#0EBC5F] rounded-full h-1.5 transition-all"
                              style={{ width: `${(event.attendees.length / event.capacity) * 100}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Registration Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration</h3>
              
              {isUpcoming ? (
                <>
                  {event.capacity && event.capacity - event.attendees.length <= 10 && (
                    <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
                      <p className="text-sm text-yellow-700">
                        ⚡ Only {event.capacity - event.attendees.length} spots left!
                      </p>
                    </div>
                  )}
                  
                  {isRegistered ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-green-700 font-medium">You're registered!</p>
                      <p className="text-sm text-green-600 mt-1">We'll send you event updates.</p>
                    </div>
                  ) : (
                    <button
                      onClick={handleRegister}
                      className="w-full bg-[#0EBC5F] text-white px-4 py-3 rounded-lg hover:bg-[#0BA050] transition-colors font-medium"
                    >
                      Register for Event
                    </button>
                  )}
                  
                  <button
                    onClick={handleSetReminder}
                    className="w-full mt-3 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Bell className="w-4 h-4" />
                    Set Reminder
                  </button>
                </>
              ) : (
                <div className="text-center py-4">
                  <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">This event has ended</p>
                  <p className="text-xs text-gray-400 mt-1">Check back for future events</p>
                </div>
              )}
            </div>
            
            {/* Quick Links */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <div className="space-y-3">
                {event.liveStreamLink && (
                  <a
                    href={event.liveStreamLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-[#0EBC5F] hover:underline p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Video className="w-5 h-5" />
                    <span>Watch Live Stream</span>
                  </a>
                )}
                {event.registrationLink && (
                  <a
                    href={event.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 text-[#0EBC5F] hover:underline p-2 hover:bg-gray-50 rounded-lg transition-colors"
                  >
                    <Globe className="w-5 h-5" />
                    <span>External Registration</span>
                  </a>
                )}
                <button
                  onClick={addToGoogleCalendar}
                  className="flex items-center gap-3 text-gray-600 hover:text-[#0EBC5F] transition-colors w-full p-2 hover:bg-gray-50 rounded-lg text-left"
                >
                  <Calendar className="w-5 h-5" />
                  <span>Add to Google Calendar</span>
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success('Link copied!');
                  }}
                  className="flex items-center gap-3 text-gray-600 hover:text-[#0EBC5F] transition-colors w-full p-2 hover:bg-gray-50 rounded-lg text-left"
                >
                  <LinkIcon className="w-5 h-5" />
                  <span>Copy Event Link</span>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex items-center gap-3 text-gray-600 hover:text-[#0EBC5F] transition-colors w-full p-2 hover:bg-gray-50 rounded-lg text-left"
                  >
                    <Share2 className="w-5 h-5" />
                    <span>Share Event</span>
                  </button>
                  {showShareMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />
                      <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border p-2 w-48 z-50">
                        <button
                          onClick={handleShare}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm"
                        >
                          Share via...
                        </button>
                        <button
                          onClick={() => {
                            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(window.location.href)}`);
                            setShowShareMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm"
                        >
                          Twitter
                        </button>
                        <button
                          onClick={() => {
                            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`);
                            setShowShareMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm"
                        >
                          Facebook
                        </button>
                        <button
                          onClick={() => {
                            window.open(`https://wa.me/?text=${encodeURIComponent(event.title + ' - ' + window.location.href)}`);
                            setShowShareMenu(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm"
                        >
                          WhatsApp
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
            
            {/* Organizer Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Organized By</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0EBC5F] to-[#29156C] flex items-center justify-center text-white font-bold text-lg">
                  {event.createdBy.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{event.createdBy.name}</p>
                  <p className="text-sm text-gray-500">RCCG Revelation Sanctuary</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <p className="text-xs text-gray-500 flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  For inquiries, contact the church office
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Reminder Toast */}
      {showReminder && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in z-50 flex items-center gap-2">
          <Bell className="w-4 h-4" />
          Reminder set! You'll be notified before the event.
        </div>
      )}
    </div>
  );
}













































































































































// 'use client';

// import { useState, useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import Image from 'next/image';
// import Link from 'next/link';
// import { 
//   Calendar, 
//   MapPin, 
//   Clock, 
//   Users, 
//   ArrowLeft,
//   Share2,
//   Video,
//   Link as LinkIcon,
//   Mail,
//   Bell,
//   CheckCircle,
//   User,
//   Tag,
//   Globe,
//   CalendarDays,
//   X,
//   Loader2
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
//   createdBy: {
//     name: string;
//     _id: string;
//   };
// }

// export default function EventDetailPage() {
//   const params = useParams();
//   const router = useRouter();
//   const { user } = useAuth();
//   const [event, setEvent] = useState<Event | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [isRegistered, setIsRegistered] = useState(false);
//   const [showReminder, setShowReminder] = useState(false);
//   const [showShareMenu, setShowShareMenu] = useState(false);
//   const [imageError, setImageError] = useState(false);

//   useEffect(() => {
//     fetchEvent();
//   }, [params.id]);

//   const fetchEvent = async () => {
//     try {
//       const response = await eventAPI.getOne(params.id as string);
//       setEvent(response.data.event);
//       if (user) {
//         setIsRegistered(response.data.event.attendees.includes(user.id));
//       }
//     } catch (error) {
//       console.error('Error fetching event:', error);
//       toast.error('Failed to load event');
//       router.push('/events');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRegister = async () => {
//     if (!user) {
//       toast.error('Please login to register for events');
//       router.push('/login');
//       return;
//     }

//     const toastId = toast.loading('Registering...');
//     try {
//       await eventAPI.register(event!._id);
//       setIsRegistered(true);
//       toast.success('Successfully registered for event!', { id: toastId });
//       fetchEvent();
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Registration failed', { id: toastId });
//     }
//   };

//   const handleSetReminder = async () => {
//     if (!user) {
//       toast.error('Please login to set reminders');
//       router.push('/login');
//       return;
//     }

//     // In production, this would save to user preferences
//     setShowReminder(true);
//     toast.success('Reminder set! You will be notified before the event.');
//     setTimeout(() => setShowReminder(false), 3000);
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { 
//       weekday: 'long',
//       month: 'long', 
//       day: 'numeric',
//       year: 'numeric'
//     });
//   };

//   const formatTime = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleTimeString('en-US', { 
//       hour: 'numeric', 
//       minute: '2-digit',
//       hour12: true 
//     });
//   };

//   const addToGoogleCalendar = () => {
//     if (!event) return;
//     const start = new Date(event.startDate).toISOString().replace(/-|:|\./g, '');
//     const end = new Date(event.endDate).toISOString().replace(/-|:|\./g, '');
//     const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.venue)}`;
//     window.open(url, '_blank');
//   };

//   const handleShare = () => {
//     if (navigator.share) {
//       navigator.share({
//         title: event?.title,
//         text: event?.description,
//         url: window.location.href,
//       });
//     } else {
//       navigator.clipboard.writeText(window.location.href);
//       toast.success('Link copied to clipboard!');
//     }
//     setShowShareMenu(false);
//   };

//   const getEventTypeInfo = (type: string) => {
//     const types: Record<string, { icon: string; color: string; label: string }> = {
//       service: { icon: '⛪', color: 'bg-green-100 text-green-700', label: 'Service' },
//       conference: { icon: '🎤', color: 'bg-purple-100 text-purple-700', label: 'Conference' },
//       program: { icon: '📖', color: 'bg-blue-100 text-blue-700', label: 'Program' },
//       meeting: { icon: '👥', color: 'bg-yellow-100 text-yellow-700', label: 'Meeting' },
//       outreach: { icon: '🤝', color: 'bg-red-100 text-red-700', label: 'Outreach' },
//     };
//     return types[type] || { icon: '📅', color: 'bg-gray-100 text-gray-700', label: type };
//   };

//   const getLevelInfo = (level: string) => {
//     const levels: Record<string, { icon: string; label: string }> = {
//       region: { icon: '🌍', label: 'Region' },
//       province: { icon: '🏛️', label: 'Province' },
//       zone: { icon: '📍', label: 'Zone' },
//       area: { icon: '🏘️', label: 'Area' },
//       parish: { icon: '⛪', label: 'Parish' },
//     };
//     return levels[level] || { icon: '📍', label: level };
//   };

//   if (loading) {
//     return (
//       <div className="pt-16 min-h-screen flex items-center justify-center">
//         <Loader2 className="w-12 h-12 text-[#0EBC5F] animate-spin" />
//       </div>
//     );
//   }

//   if (!event) {
//     return (
//       <div className="pt-16 min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <CalendarDays className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//           <p className="text-gray-500 text-lg">Event not found</p>
//           <Link href="/events" className="mt-4 inline-block text-[#0EBC5F] hover:underline">
//             Back to Events
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const isUpcoming = new Date(event.startDate) > new Date();
//   const typeInfo = getEventTypeInfo(event.type);
//   const levelInfo = getLevelInfo(event.level);
//   const hasValidImage = event.image && event.image.startsWith('http') && !imageError;

//   return (
//     <div className="pt-16 bg-gray-50 min-h-screen">
//       {/* Back Button */}
//       <div className="container mx-auto px-4 py-6">
//         <button
//           onClick={() => router.back()}
//           className="flex items-center space-x-2 text-gray-600 hover:text-[#0EBC5F] transition-colors group"
//         >
//           <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
//           <span>Back to Events</span>
//         </button>
//       </div>

//       <div className="container mx-auto px-4 py-8">
//         <div className="grid lg:grid-cols-3 gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//               {/* Event Image */}
//               {hasValidImage ? (
//                 <div className="relative h-64 md:h-80">
//                   <Image
//                     src={event.image}
//                     alt={event.title}
//                     fill
//                     className="object-cover"
//                     onError={() => setImageError(true)}
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
//                 </div>
//               ) : (
//                 <div className="h-64 md:h-80 bg-gradient-to-r from-[#29156C] to-[#0EBC5F] flex items-center justify-center">
//                   <Calendar className="w-24 h-24 text-white/30" />
//                 </div>
//               )}
              
//               <div className="p-6">
//                 <div className="flex items-center gap-3 mb-4 flex-wrap">
//                   <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeInfo.color}`}>
//                     {typeInfo.icon} {typeInfo.label}
//                   </span>
//                   <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1">
//                     {levelInfo.icon} {levelInfo.label}
//                   </span>
//                   {event.liveStreamLink && (
//                     <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-1">
//                       <Video className="w-3 h-3" />
//                       Live Stream
//                     </span>
//                   )}
//                 </div>
                
//                 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
//                   {event.title}
//                 </h1>
                
//                 <p className="text-gray-600 mb-6 leading-relaxed">
//                   {event.description}
//                 </p>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
//                   <div className="flex items-start gap-3">
//                     <Calendar className="w-5 h-5 text-[#0EBC5F] mt-0.5" />
//                     <div>
//                       <p className="font-medium text-gray-900">Date</p>
//                       <p className="text-gray-600">{formatDate(event.startDate)}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <Clock className="w-5 h-5 text-[#0EBC5F] mt-0.5" />
//                     <div>
//                       <p className="font-medium text-gray-900">Time</p>
//                       <p className="text-gray-600">
//                         {formatTime(event.startDate)} - {formatTime(event.endDate)}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <MapPin className="w-5 h-5 text-[#0EBC5F] mt-0.5" />
//                     <div>
//                       <p className="font-medium text-gray-900">Venue</p>
//                       <p className="text-gray-600">{event.venue}</p>
//                     </div>
//                   </div>
//                   {event.speaker && (
//                     <div className="flex items-start gap-3">
//                       <User className="w-5 h-5 text-[#0EBC5F] mt-0.5" />
//                       <div>
//                         <p className="font-medium text-gray-900">Speaker</p>
//                         <p className="text-gray-600">{event.speaker}</p>
//                       </div>
//                     </div>
//                   )}
//                   {event.capacity && (
//                     <div className="flex items-start gap-3">
//                       <Users className="w-5 h-5 text-[#0EBC5F] mt-0.5" />
//                       <div>
//                         <p className="font-medium text-gray-900">Capacity</p>
//                         <p className="text-gray-600">{event.attendees.length} / {event.capacity} registered</p>
//                         <div className="w-32 mt-1">
//                           <div className="w-full bg-gray-200 rounded-full h-1.5">
//                             <div 
//                               className="bg-[#0EBC5F] rounded-full h-1.5 transition-all"
//                               style={{ width: `${(event.attendees.length / event.capacity) * 100}%` }}
//                             />
//                           </div>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Registration Card */}
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration</h3>
              
//               {isUpcoming ? (
//                 <>
//                   {event.capacity && event.capacity - event.attendees.length <= 10 && (
//                     <div className="mb-4 p-2 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
//                       <p className="text-sm text-yellow-700">
//                         ⚡ Only {event.capacity - event.attendees.length} spots left!
//                       </p>
//                     </div>
//                   )}
                  
//                   {isRegistered ? (
//                     <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
//                       <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
//                       <p className="text-green-700 font-medium">You're registered!</p>
//                       <p className="text-sm text-green-600 mt-1">We'll send you event updates.</p>
//                     </div>
//                   ) : (
//                     <button
//                       onClick={handleRegister}
//                       className="w-full bg-[#0EBC5F] text-white px-4 py-3 rounded-lg hover:bg-[#0BA050] transition-colors font-medium"
//                     >
//                       Register for Event
//                     </button>
//                   )}
                  
//                   <button
//                     onClick={handleSetReminder}
//                     className="w-full mt-3 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
//                   >
//                     <Bell className="w-4 h-4" />
//                     Set Reminder
//                   </button>
//                 </>
//               ) : (
//                 <div className="text-center py-4">
//                   <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-2" />
//                   <p className="text-gray-500">This event has ended</p>
//                   <p className="text-xs text-gray-400 mt-1">Check back for future events</p>
//                 </div>
//               )}
//             </div>
            
//             {/* Quick Links */}
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
//               <div className="space-y-3">
//                 {event.liveStreamLink && (
//                   <a
//                     href={event.liveStreamLink}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="flex items-center gap-3 text-[#0EBC5F] hover:underline p-2 hover:bg-gray-50 rounded-lg transition-colors"
//                   >
//                     <Video className="w-5 h-5" />
//                     <span>Watch Live Stream</span>
//                   </a>
//                 )}
//                 {event.registrationLink && (
//                   <a
//                     href={event.registrationLink}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="flex items-center gap-3 text-[#0EBC5F] hover:underline p-2 hover:bg-gray-50 rounded-lg transition-colors"
//                   >
//                     <Globe className="w-5 h-5" />
//                     <span>External Registration</span>
//                   </a>
//                 )}
//                 <button
//                   onClick={addToGoogleCalendar}
//                   className="flex items-center gap-3 text-gray-600 hover:text-[#0EBC5F] transition-colors w-full p-2 hover:bg-gray-50 rounded-lg"
//                 >
//                   <Calendar className="w-5 h-5" />
//                   <span>Add to Google Calendar</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigator.clipboard.writeText(window.location.href);
//                     toast.success('Link copied!');
//                   }}
//                   className="flex items-center gap-3 text-gray-600 hover:text-[#0EBC5F] transition-colors w-full p-2 hover:bg-gray-50 rounded-lg"
//                 >
//                   <LinkIcon className="w-5 h-5" />
//                   <span>Copy Event Link</span>
//                 </button>
//                 <div className="relative">
//                   <button
//                     onClick={() => setShowShareMenu(!showShareMenu)}
//                     className="flex items-center gap-3 text-gray-600 hover:text-[#0EBC5F] transition-colors w-full p-2 hover:bg-gray-50 rounded-lg"
//                   >
//                     <Share2 className="w-5 h-5" />
//                     <span>Share Event</span>
//                   </button>
//                   {showShareMenu && (
//                     <>
//                       <div className="fixed inset-0 z-40" onClick={() => setShowShareMenu(false)} />
//                       <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border p-2 w-48 z-50">
//                         <button
//                           onClick={handleShare}
//                           className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm"
//                         >
//                           Share via...
//                         </button>
//                         <button
//                           onClick={() => {
//                             window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(window.location.href)}`);
//                             setShowShareMenu(false);
//                           }}
//                           className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm"
//                         >
//                           Twitter
//                         </button>
//                         <button
//                           onClick={() => {
//                             window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`);
//                             setShowShareMenu(false);
//                           }}
//                           className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm"
//                         >
//                           Facebook
//                         </button>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               </div>
//             </div>
            
//             {/* Organizer Card */}
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Organized By</h3>
//               <div className="flex items-center gap-3">
//                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0EBC5F] to-[#29156C] flex items-center justify-center text-white font-bold text-lg">
//                   {event.createdBy.name.charAt(0).toUpperCase()}
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-900">{event.createdBy.name}</p>
//                   <p className="text-sm text-gray-500">RCCG Revelation Sanctuary</p>
//                 </div>
//               </div>
//               <div className="mt-4 pt-4 border-t">
//                 <p className="text-xs text-gray-500 flex items-center gap-1">
//                   <Mail className="w-3 h-3" />
//                   For inquiries, contact the church office
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* Reminder Toast */}
//       {showReminder && (
//         <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in z-50 flex items-center gap-2">
//           <Bell className="w-4 h-4" />
//           Reminder set! You'll be notified before the event.
//         </div>
//       )}
//     </div>
//   );
// }

















































// 'use client';

// import { useState, useEffect } from 'react';
// import { useParams, useRouter } from 'next/navigation';
// import Image from 'next/image';
// import Link from 'next/link';
// import { 
//   Calendar, 
//   MapPin, 
//   Clock, 
//   Users, 
//   ArrowLeft,
//   Share2,
//   Video,
//   Link as LinkIcon,
//   Mail,
//   Bell,
//   CheckCircle,
//   User,
//   Tag,
//   Globe,
//   CalendarDays
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
//   createdBy: {
//     name: string;
//   };
// }

// export default function EventDetailPage() {
//   const params = useParams();
//   const router = useRouter();
//   const { user } = useAuth();
//   const [event, setEvent] = useState<Event | null>(null);
//   const [loading, setLoading] = useState(true);
//   const [isRegistered, setIsRegistered] = useState(false);
//   const [showReminder, setShowReminder] = useState(false);
//   const [showShareMenu, setShowShareMenu] = useState(false);

//   useEffect(() => {
//     fetchEvent();
//   }, [params.id]);

//   const fetchEvent = async () => {
//     try {
//       const response = await eventAPI.getOne(params.id as string);
//       setEvent(response.data.event);
//       if (user) {
//         setIsRegistered(response.data.event.attendees.includes(user.id));
//       }
//     } catch (error) {
//       console.error('Error fetching event:', error);
//       toast.error('Failed to load event');
//       router.push('/events');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRegister = async () => {
//     try {
//       await eventAPI.register(event!._id);
//       setIsRegistered(true);
//       toast.success('Successfully registered for event!');
//       fetchEvent();
//     } catch (error: any) {
//       toast.error(error.response?.data?.message || 'Registration failed');
//     }
//   };

//   const handleSetReminder = () => {
//     // In production, this would save to user preferences
//     setShowReminder(true);
//     toast.success('Reminder set! You will be notified before the event.');
//     setTimeout(() => setShowReminder(false), 3000);
//   };

//   const formatDate = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { 
//       weekday: 'long',
//       month: 'long', 
//       day: 'numeric',
//       year: 'numeric'
//     });
//   };

//   const formatTime = (dateString: string) => {
//     const date = new Date(dateString);
//     return date.toLocaleTimeString('en-US', { 
//       hour: 'numeric', 
//       minute: '2-digit',
//       hour12: true 
//     });
//   };

//   const addToGoogleCalendar = () => {
//     if (!event) return;
//     const start = new Date(event.startDate).toISOString().replace(/-|:|\./g, '');
//     const end = new Date(event.endDate).toISOString().replace(/-|:|\./g, '');
//     const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${start}/${end}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.venue)}`;
//     window.open(url, '_blank');
//   };

//   const getEventTypeInfo = (type: string) => {
//     const types: Record<string, { icon: string; color: string; label: string }> = {
//       service: { icon: '⛪', color: 'bg-green-100 text-green-700', label: 'Service' },
//       conference: { icon: '🎤', color: 'bg-purple-100 text-purple-700', label: 'Conference' },
//       program: { icon: '📖', color: 'bg-blue-100 text-blue-700', label: 'Program' },
//       meeting: { icon: '👥', color: 'bg-yellow-100 text-yellow-700', label: 'Meeting' },
//       outreach: { icon: '🤝', color: 'bg-red-100 text-red-700', label: 'Outreach' },
//     };
//     return types[type] || { icon: '📅', color: 'bg-gray-100 text-gray-700', label: type };
//   };

//   const getLevelInfo = (level: string) => {
//     const levels: Record<string, { icon: string; label: string }> = {
//       region: { icon: '🌍', label: 'Region' },
//       province: { icon: '🏛️', label: 'Province' },
//       zone: { icon: '📍', label: 'Zone' },
//       area: { icon: '🏘️', label: 'Area' },
//       parish: { icon: '⛪', label: 'Parish' },
//     };
//     return levels[level] || { icon: '📍', label: level };
//   };

//   if (loading) {
//     return (
//       <div className="pt-16 min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0EBC5F]"></div>
//       </div>
//     );
//   }

//   if (!event) {
//     return (
//       <div className="pt-16 min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
//           <p className="text-gray-500 text-lg">Event not found</p>
//           <Link href="/events" className="mt-4 inline-block text-[#0EBC5F] hover:underline">
//             Back to Events
//           </Link>
//         </div>
//       </div>
//     );
//   }

//   const isUpcoming = new Date(event.startDate) > new Date();
//   const typeInfo = getEventTypeInfo(event.type);
//   const levelInfo = getLevelInfo(event.level);

//   return (
//     <div className="pt-16 bg-gray-50 min-h-screen">
//       {/* Back Button */}
//       <div className="container mx-auto px-4 py-6">
//         <button
//           onClick={() => router.back()}
//           className="flex items-center space-x-2 text-gray-600 hover:text-[#0EBC5F] transition-colors group"
//         >
//           <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
//           <span>Back to Events</span>
//         </button>
//       </div>

//       <div className="container mx-auto px-4 py-8">
//         <div className="grid lg:grid-cols-3 gap-8">
//           {/* Main Content */}
//           <div className="lg:col-span-2">
//             <div className="bg-white rounded-xl shadow-lg overflow-hidden">
//               {/* Event Image */}
//               {event.image ? (
//                 <div className="relative h-64 md:h-80">
//                   <Image
//                     src={event.image}
//                     alt={event.title}
//                     fill
//                     className="object-cover"
//                   />
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
//                 </div>
//               ) : (
//                 <div className="h-64 md:h-80 bg-gradient-to-r from-[#29156C] to-[#0EBC5F] flex items-center justify-center">
//                   <Calendar className="w-24 h-24 text-white/30" />
//                 </div>
//               )}
              
//               <div className="p-6">
//                 <div className="flex items-center gap-3 mb-4 flex-wrap">
//                   <span className={`px-3 py-1 rounded-full text-sm font-medium ${typeInfo.color}`}>
//                     {typeInfo.icon} {typeInfo.label}
//                   </span>
//                   <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1">
//                     {levelInfo.icon} {levelInfo.label}
//                   </span>
//                   {event.liveStreamLink && (
//                     <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm flex items-center gap-1">
//                       <Video className="w-3 h-3" />
//                       Live Stream
//                     </span>
//                   )}
//                 </div>
                
//                 <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
//                   {event.title}
//                 </h1>
                
//                 <p className="text-gray-600 mb-6 leading-relaxed">
//                   {event.description}
//                 </p>
                
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-6">
//                   <div className="flex items-start gap-3">
//                     <Calendar className="w-5 h-5 text-[#0EBC5F] mt-0.5" />
//                     <div>
//                       <p className="font-medium text-gray-900">Date</p>
//                       <p className="text-gray-600">{formatDate(event.startDate)}</p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <Clock className="w-5 h-5 text-[#0EBC5F] mt-0.5" />
//                     <div>
//                       <p className="font-medium text-gray-900">Time</p>
//                       <p className="text-gray-600">
//                         {formatTime(event.startDate)} - {formatTime(event.endDate)}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-3">
//                     <MapPin className="w-5 h-5 text-[#0EBC5F] mt-0.5" />
//                     <div>
//                       <p className="font-medium text-gray-900">Venue</p>
//                       <p className="text-gray-600">{event.venue}</p>
//                     </div>
//                   </div>
//                   {event.speaker && (
//                     <div className="flex items-start gap-3">
//                       <User className="w-5 h-5 text-[#0EBC5F] mt-0.5" />
//                       <div>
//                         <p className="font-medium text-gray-900">Speaker</p>
//                         <p className="text-gray-600">{event.speaker}</p>
//                       </div>
//                     </div>
//                   )}
//                   {event.capacity && (
//                     <div className="flex items-start gap-3">
//                       <Users className="w-5 h-5 text-[#0EBC5F] mt-0.5" />
//                       <div>
//                         <p className="font-medium text-gray-900">Capacity</p>
//                         <p className="text-gray-600">{event.attendees.length} / {event.capacity} registered</p>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
//           </div>
          
//           {/* Sidebar */}
//           <div className="space-y-6">
//             {/* Registration Card */}
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Registration</h3>
              
//               {isUpcoming ? (
//                 <>
//                   {event.capacity && (
//                     <div className="mb-4">
//                       <div className="flex justify-between text-sm text-gray-600 mb-1">
//                         <span>Available Spots</span>
//                         <span>{event.capacity - event.attendees.length} / {event.capacity}</span>
//                       </div>
//                       <div className="w-full bg-gray-200 rounded-full h-2">
//                         <div 
//                           className="bg-[#0EBC5F] rounded-full h-2 transition-all"
//                           style={{ width: `${(event.attendees.length / event.capacity) * 100}%` }}
//                         />
//                       </div>
//                     </div>
//                   )}
                  
//                   {isRegistered ? (
//                     <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
//                       <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
//                       <p className="text-green-700 font-medium">You're registered!</p>
//                       <p className="text-sm text-green-600 mt-1">We'll send you event updates.</p>
//                     </div>
//                   ) : (
//                     <button
//                       onClick={handleRegister}
//                       className="w-full bg-[#0EBC5F] text-white px-4 py-3 rounded-lg hover:bg-[#0BA050] transition-colors font-medium"
//                     >
//                       Register for Event
//                     </button>
//                   )}
                  
//                   <button
//                     onClick={handleSetReminder}
//                     className="w-full mt-3 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
//                   >
//                     <Bell className="w-4 h-4" />
//                     Set Reminder
//                   </button>
//                 </>
//               ) : (
//                 <div className="text-center py-4">
//                   <CalendarDays className="w-12 h-12 text-gray-400 mx-auto mb-2" />
//                   <p className="text-gray-500">This event has ended</p>
//                 </div>
//               )}
//             </div>
            
//             {/* Quick Links */}
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
//               <div className="space-y-3">
//                 {event.liveStreamLink && (
//                   <a
//                     href={event.liveStreamLink}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="flex items-center gap-3 text-[#0EBC5F] hover:underline p-2 hover:bg-gray-50 rounded-lg transition-colors"
//                   >
//                     <Video className="w-5 h-5" />
//                     <span>Watch Live Stream</span>
//                   </a>
//                 )}
//                 {event.registrationLink && (
//                   <a
//                     href={event.registrationLink}
//                     target="_blank"
//                     rel="noopener noreferrer"
//                     className="flex items-center gap-3 text-[#0EBC5F] hover:underline p-2 hover:bg-gray-50 rounded-lg transition-colors"
//                   >
//                     <Globe className="w-5 h-5" />
//                     <span>External Registration</span>
//                   </a>
//                 )}
//                 <button
//                   onClick={addToGoogleCalendar}
//                   className="flex items-center gap-3 text-gray-600 hover:text-[#0EBC5F] transition-colors w-full p-2 hover:bg-gray-50 rounded-lg"
//                 >
//                   <Calendar className="w-5 h-5" />
//                   <span>Add to Google Calendar</span>
//                 </button>
//                 <button
//                   onClick={() => {
//                     navigator.clipboard.writeText(window.location.href);
//                     toast.success('Link copied!');
//                   }}
//                   className="flex items-center gap-3 text-gray-600 hover:text-[#0EBC5F] transition-colors w-full p-2 hover:bg-gray-50 rounded-lg"
//                 >
//                   <LinkIcon className="w-5 h-5" />
//                   <span>Copy Event Link</span>
//                 </button>
//                 <div className="relative">
//                   <button
//                     onClick={() => setShowShareMenu(!showShareMenu)}
//                     className="flex items-center gap-3 text-gray-600 hover:text-[#0EBC5F] transition-colors w-full p-2 hover:bg-gray-50 rounded-lg"
//                   >
//                     <Share2 className="w-5 h-5" />
//                     <span>Share Event</span>
//                   </button>
//                   {showShareMenu && (
//                     <div className="absolute bottom-full left-0 mb-2 bg-white rounded-lg shadow-lg border p-2 w-48">
//                       <button
//                         onClick={() => {
//                           if (navigator.share) {
//                             navigator.share({
//                               title: event.title,
//                               text: event.description,
//                               url: window.location.href,
//                             });
//                           } else {
//                             navigator.clipboard.writeText(window.location.href);
//                             toast.success('Link copied!');
//                           }
//                           setShowShareMenu(false);
//                         }}
//                         className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm"
//                       >
//                         Share via...
//                       </button>
//                       <button
//                         onClick={() => {
//                           window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(window.location.href)}`);
//                           setShowShareMenu(false);
//                         }}
//                         className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm"
//                       >
//                         Twitter
//                       </button>
//                       <button
//                         onClick={() => {
//                           window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`);
//                           setShowShareMenu(false);
//                         }}
//                         className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg text-sm"
//                       >
//                         Facebook
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>
            
//             {/* Organizer Card */}
//             <div className="bg-white rounded-xl shadow-lg p-6">
//               <h3 className="text-lg font-semibold text-gray-900 mb-4">Organized By</h3>
//               <div className="flex items-center gap-3">
//                 <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0EBC5F] to-[#29156C] flex items-center justify-center text-white font-bold text-lg">
//                   {event.createdBy.name.charAt(0)}
//                 </div>
//                 <div>
//                   <p className="font-medium text-gray-900">{event.createdBy.name}</p>
//                   <p className="text-sm text-gray-500">RCCG Revelation Sanctuary</p>
//                 </div>
//               </div>
//               <div className="mt-4 pt-4 border-t">
//                 <p className="text-xs text-gray-500 flex items-center gap-1">
//                   <Mail className="w-3 h-3" />
//                   For inquiries, contact the church office
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
      
//       {/* Reminder Toast */}
//       {showReminder && (
//         <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg animate-fade-in z-50">
//           ✅ Reminder set! You'll be notified before the event.
//         </div>
//       )}
//     </div>
//   );
// }