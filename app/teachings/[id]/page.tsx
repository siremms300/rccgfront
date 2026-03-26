'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  Play, 
  Download, 
  Headphones, 
  FileText, 
  Calendar, 
  User, 
  Eye, 
  Share2, 
  Heart,
  BookOpen,
//   Bible,
  ArrowLeft,
  Clock
} from 'lucide-react';
import { teachingAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface Teaching {
  _id: string;
  title: string;
  description: string;
  speaker: string;
  type: 'audio' | 'video' | 'document';
  url: string;
  thumbnail?: string;
  duration?: number;
  topics: string[];
  scriptureReferences: string[];
  date: string;
  downloads: number;
  views: number;
  createdBy: {
    name: string;
  };
}

export default function TeachingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [teaching, setTeaching] = useState<Teaching | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    fetchTeaching();
  }, [params.id]);

  const fetchTeaching = async () => {
    try {
      const response = await teachingAPI.getOne(params.id as string);
      setTeaching(response.data.teaching);
    } catch (error) {
      console.error('Error fetching teaching:', error);
      toast.error('Failed to load teaching');
      router.push('/teachings');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!teaching) return;
    
    const toastId = toast.loading('Preparing download...');
    try {
      await teachingAPI.incrementDownload(teaching._id);
      window.open(teaching.url, '_blank');
      toast.success('Download started!', { id: toastId });
    } catch (error) {
      toast.error('Download failed', { id: toastId });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: teaching?.title,
        text: teaching?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getTypeIcon = () => {
    if (!teaching) return null;
    switch (teaching.type) {
      case 'video':
        return <Play className="w-8 h-8" />;
      case 'audio':
        return <Headphones className="w-8 h-8" />;
      default:
        return <FileText className="w-8 h-8" />;
    }
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0EBC5F]"></div>
      </div>
    );
  }

  if (!teaching) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Teaching not found</p>
          <Link href="/teachings" className="mt-4 inline-block text-[#0EBC5F] hover:underline">
            Back to Teachings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 bg-gray-50 min-h-screen">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-gray-600 hover:text-[#0EBC5F] transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Back to Teachings</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Media Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Media Player */}
              <div className="relative bg-black">
                {teaching.type === 'video' && (
                  <video
                    src={teaching.url}
                    controls
                    className="w-full aspect-video"
                    poster={teaching.thumbnail}
                    autoPlay={false}
                  >
                    Your browser does not support the video tag.
                  </video>
                )}
                
                {teaching.type === 'audio' && (
                  <div className="p-8 bg-gradient-to-br from-[#29156C] to-[#0EBC5F]">
                    <div className="text-center text-white">
                      <Headphones className="w-20 h-20 mx-auto mb-4" />
                      <h3 className="text-xl font-semibold mb-2">Audio Teaching</h3>
                      <audio controls className="w-full mt-4 rounded-lg">
                        <source src={teaching.url} type="audio/mpeg" />
                        Your browser does not support the audio element.
                      </audio>
                    </div>
                  </div>
                )}
                
                {teaching.type === 'document' && (
                  <div className="p-12 text-center bg-gray-100">
                    <FileText className="w-24 h-24 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">Document Resource</h3>
                    <p className="text-gray-500 mb-4">Click download to access this resource</p>
                    <button
                      onClick={handleDownload}
                      className="inline-flex items-center space-x-2 bg-[#0EBC5F] text-white px-6 py-3 rounded-lg hover:bg-[#0BA050] transition-colors"
                    >
                      <Download className="w-5 h-5" />
                      <span>Download Document</span>
                    </button>
                  </div>
                )}
                
                {/* Overlay for thumbnail if no video */}
                {teaching.type === 'video' && teaching.thumbnail && !teaching.url && (
                  <div className="relative aspect-video">
                    <Image
                      src={teaching.thumbnail}
                      alt={teaching.title}
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                      <Play className="w-16 h-16 text-white" />
                    </div>
                  </div>
                )}
              </div>
              
              {/* Title and Actions */}
              <div className="p-6">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex-1">
                    {teaching.title}
                  </h1>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleShare}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Share"
                    >
                      <Share2 className="w-5 h-5 text-gray-600" />
                    </button>
                    <button
                      onClick={() => setIsLiked(!isLiked)}
                      className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      title="Like"
                    >
                      <Heart className={`w-5 h-5 ${isLiked ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {teaching.description}
                </p>
                
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 border-t pt-4">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>{teaching.speaker}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(teaching.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  {teaching.duration && (
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>{formatDuration(teaching.duration)}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Eye className="w-4 h-4" />
                    <span>{teaching.views.toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Download className="w-4 h-4" />
                    <span>{teaching.downloads.toLocaleString()} downloads</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Download Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Download Resource</h3>
              <button
                onClick={handleDownload}
                className="w-full bg-[#0EBC5F] text-white px-4 py-3 rounded-lg hover:bg-[#0BA050] transition-colors flex items-center justify-center space-x-2"
              >
                <Download className="w-5 h-5" />
                <span>Download {teaching.type === 'document' ? 'Document' : 'Media'}</span>
              </button>
              <p className="text-xs text-gray-500 mt-3 text-center">
                {teaching.type === 'video' && 'MP4 format, high quality'}
                {teaching.type === 'audio' && 'MP3 format, high quality'}
                {teaching.type === 'document' && 'PDF/DOC format'}
              </p>
            </div>
            
            {/* Topics */}
            {teaching.topics && teaching.topics.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <BookOpen className="w-5 h-5 text-[#0EBC5F]" />
                  <span>Topics Covered</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                  {teaching.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Scripture References */}
            {teaching.scriptureReferences && teaching.scriptureReferences.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  {/* it was bible and not book open */}
                  <BookOpen className="w-5 h-5 text-[#0EBC5F]" />
                  <span>Scripture References</span>
                </h3>
                <ul className="space-y-2">
                  {teaching.scriptureReferences.map((ref, index) => (
                    <li key={index} className="text-gray-600">
                      <span className="text-[#0EBC5F]">•</span> {ref}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* About the Speaker */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Speaker</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#0EBC5F] to-[#29156C] flex items-center justify-center text-white font-bold text-lg">
                  {teaching.speaker.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{teaching.speaker}</p>
                  <p className="text-sm text-gray-500">RCCG Revelation Sanctuary</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Related Teachings Section - Optional */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">More Teachings</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow-md text-center">
            <p className="text-gray-500">More teachings coming soon...</p>
          </div>
        </div>
      </div>
    </div>
  );
}