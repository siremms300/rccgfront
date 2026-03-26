'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, Filter, Download, Play, Headphones, FileText, Calendar, User, Eye } from 'lucide-react';
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
}

export default function TeachingsPage() {
  const [teachings, setTeachings] = useState<Teaching[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 0,
    limit: 12,
  });

  

    const fetchTeachings = async () => {
    setLoading(true);
    try {
        const params: any = {
        page: pagination.page,
        limit: pagination.limit,
        };
        if (search) params.search = search;
        if (selectedType) params.type = selectedType;
        if (selectedTopic) params.topic = selectedTopic;
        
        const response = await teachingAPI.getAll(params);
        setTeachings(response.data.teachings);
        setPagination(response.data.pagination);
    } catch (error) {
        console.error('Error fetching teachings:', error);
        toast.error('Failed to load teachings');
    } finally {
        setLoading(false);
    }
    };


   useEffect(() => {
    fetchTeachings();
    }, [search, selectedType, selectedTopic, pagination.page]);

  const handleDownload = async (id: string, url: string) => {
    try {
      await teachingAPI.incrementDownload(id);
      window.open(url, '_blank');
      toast.success('Download started');
    } catch (error) {
      toast.error('Download failed');
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Play className="w-5 h-5" />;
      case 'audio':
        return <Headphones className="w-5 h-5" />;
      default:
        return <FileText className="w-5 h-5" />;
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const topics = ['All', 'Excellence', 'Faith', 'Purpose', 'Prayer', 'Worship', 'Leadership'];

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#29156C] to-[#0EBC5F]" />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
              Teachings Library
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto animate-fade-in">
              Access sermons, Bible studies, and spiritual resources to grow your faith
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter Section */}
      <section className="py-8 bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by title, speaker, or topic..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
              />
            </div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
            >
              <option value="">All Types</option>
              <option value="video">Videos</option>
              <option value="audio">Audio</option>
              <option value="document">Documents</option>
            </select>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
            >
              {topics.map((topic) => (
                <option key={topic} value={topic === 'All' ? '' : topic}>
                  {topic}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Teachings Grid */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0EBC5F]"></div>
            </div>
          ) : teachings.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No teachings found</p>
            </div>
          ) : (
            <>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {teachings.map((teaching) => (
                  <Link
                    key={teaching._id}
                    href={`/teachings/${teaching._id}`}
                    className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    <div className="relative h-48 bg-gray-200">
                      {teaching.thumbnail ? (
                        <Image
                          src={teaching.thumbnail}
                          alt={teaching.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0EBC5F] to-[#29156C]">
                          {getTypeIcon(teaching.type)}
                        </div>
                      )}
                      {teaching.type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                          <Play className="w-12 h-12 text-white" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
                        {teaching.type.toUpperCase()}
                      </div>
                    </div>
                    
                    <div className="p-6">
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(teaching.date).toLocaleDateString()}</span>
                        {teaching.duration && (
                          <>
                            <span>•</span>
                            <span>{formatDuration(teaching.duration)}</span>
                          </>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#0EBC5F] transition-colors line-clamp-2">
                        {teaching.title}
                      </h3>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
                        <User className="w-4 h-4" />
                        <span>{teaching.speaker}</span>
                      </div>
                      
                      <p className="text-gray-600 mb-4 line-clamp-2">
                        {teaching.description}
                      </p>
                      
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-3">
                          <span className="flex items-center space-x-1">
                            <Eye className="w-4 h-4 text-gray-400" />
                            <span>{teaching.views}</span>
                          </span>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleDownload(teaching._id, teaching.url);
                            }}
                            className="flex items-center space-x-1 hover:text-[#0EBC5F]"
                          >
                            <Download className="w-4 h-4" />
                            <span>{teaching.downloads}</span>
                          </button>
                        </div>
                        <span className="text-[#0EBC5F] font-medium">Listen Now →</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
              
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
            </>
          )}
        </div>
      </section>
    </div>
  );
}














































// 'use client';

// import { useState, useEffect } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import { Search, Filter, Download, Play, Headphones, FileText, Calendar, User, Eye } from 'lucide-react';

// interface Teaching {
//   _id: string;
//   title: string;
//   description: string;
//   speaker: string;
//   type: 'audio' | 'video' | 'document';
//   url: string;
//   thumbnail?: string;
//   duration?: number;
//   topics: string[];
//   scriptureReferences: string[];
//   date: string;
//   downloads: number;
//   views: number;
// }

// export default function TeachingsPage() {
//   const [teachings, setTeachings] = useState<Teaching[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [search, setSearch] = useState('');
//   const [selectedType, setSelectedType] = useState('');
//   const [selectedTopic, setSelectedTopic] = useState('');
//   const [pagination, setPagination] = useState({
//     page: 1,
//     total: 0,
//     pages: 0,
//     limit: 12,
//   });

//   // Mock data for now - will connect to API later
//   useEffect(() => {
//     // Simulate API call
//     setTimeout(() => {
//       const mockTeachings: Teaching[] = [
//         {
//           _id: '1',
//           title: 'The Power of Excellence',
//           description: 'Discover how excellence in faith transforms lives and brings glory to God.',
//           speaker: 'Pastor Deji Afuye',
//           type: 'video',
//           url: '#',
//           thumbnail: '/assets/teachings/thumb1.jpg',
//           duration: 3600,
//           topics: ['Excellence', 'Faith'],
//           scriptureReferences: ['Daniel 6:3', 'Colossians 3:23'],
//           date: '2024-03-15',
//           downloads: 234,
//           views: 1234,
//         },
//         {
//           _id: '2',
//           title: 'Walking in Divine Purpose',
//           description: 'Understanding God\'s unique calling for your life and walking in it.',
//           speaker: 'Pastor Obonge',
//           type: 'audio',
//           url: '#',
//           thumbnail: '/assets/teachings/thumb2.jpg',
//           duration: 2700,
//           topics: ['Purpose', 'Calling'],
//           scriptureReferences: ['Jeremiah 29:11', 'Ephesians 2:10'],
//           date: '2024-03-10',
//           downloads: 456,
//           views: 2345,
//         },
//         {
//           _id: '3',
//           title: 'The Spirit of Excellence Study Guide',
//           description: 'A comprehensive guide to developing excellence in your spiritual walk.',
//           speaker: 'Regional Team',
//           type: 'document',
//           url: '#',
//           thumbnail: '/assets/teachings/thumb3.jpg',
//           topics: ['Study Guide', 'Excellence'],
//           scriptureReferences: ['Philippians 4:8'],
//           date: '2024-03-05',
//           downloads: 789,
//           views: 567,
//         },
//       ];
//       setTeachings(mockTeachings);
//       setLoading(false);
//     }, 1000);
//   }, []);

//   const getTypeIcon = (type: string) => {
//     switch (type) {
//       case 'video':
//         return <Play className="w-5 h-5" />;
//       case 'audio':
//         return <Headphones className="w-5 h-5" />;
//       default:
//         return <FileText className="w-5 h-5" />;
//     }
//   };

//   const formatDuration = (seconds?: number) => {
//     if (!seconds) return '';
//     const hours = Math.floor(seconds / 3600);
//     const minutes = Math.floor((seconds % 3600) / 60);
//     if (hours > 0) return `${hours}h ${minutes}m`;
//     return `${minutes}m`;
//   };

//   const topics = ['All', 'Excellence', 'Faith', 'Purpose', 'Prayer', 'Worship', 'Leadership'];

//   return (
//     <div className="pt-16">
//       {/* Hero Section */}
//       <section className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-r from-[#29156C] to-[#0EBC5F]" />
//         <div className="relative z-10 h-full flex items-center justify-center">
//           <div className="container mx-auto px-4 text-center">
//             <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
//               Teachings Library
//             </h1>
//             <p className="text-xl text-white/90 max-w-2xl mx-auto animate-fade-in">
//               Access sermons, Bible studies, and spiritual resources to grow your faith
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Search and Filter Section */}
//       <section className="py-8 bg-white border-b">
//         <div className="container mx-auto px-4">
//           <div className="flex flex-col md:flex-row gap-4">
//             {/* Search */}
//             <div className="flex-1 relative">
//               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
//               <input
//                 type="text"
//                 placeholder="Search by title, speaker, or topic..."
//                 value={search}
//                 onChange={(e) => setSearch(e.target.value)}
//                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F] focus:border-transparent"
//               />
//             </div>
            
//             {/* Type Filter */}
//             <select
//               value={selectedType}
//               onChange={(e) => setSelectedType(e.target.value)}
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
//             >
//               <option value="">All Types</option>
//               <option value="video">Videos</option>
//               <option value="audio">Audio</option>
//               <option value="document">Documents</option>
//             </select>
            
//             {/* Topic Filter */}
//             <select
//               value={selectedTopic}
//               onChange={(e) => setSelectedTopic(e.target.value)}
//               className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
//             >
//               {topics.map((topic) => (
//                 <option key={topic} value={topic === 'All' ? '' : topic}>
//                   {topic}
//                 </option>
//               ))}
//             </select>
//           </div>
//         </div>
//       </section>

//       {/* Teachings Grid */}
//       <section className="py-12 bg-gray-50">
//         <div className="container mx-auto px-4">
//           {loading ? (
//             <div className="flex justify-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0EBC5F]"></div>
//             </div>
//           ) : teachings.length === 0 ? (
//             <div className="text-center py-12">
//               <p className="text-gray-500 text-lg">No teachings found</p>
//             </div>
//           ) : (
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//               {teachings.map((teaching) => (
//                 <Link
//                   key={teaching._id}
//                   href={`/teachings/${teaching._id}`}
//                   className="group bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
//                 >
//                   {/* Thumbnail */}
//                   <div className="relative h-48 bg-gray-200">
//                     {teaching.thumbnail ? (
//                       <Image
//                         src={teaching.thumbnail}
//                         alt={teaching.title}
//                         fill
//                         className="object-cover group-hover:scale-105 transition-transform duration-300"
//                       />
//                     ) : (
//                       <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#0EBC5F] to-[#29156C]">
//                         {getTypeIcon(teaching.type)}
//                       </div>
//                     )}
//                     {teaching.type === 'video' && (
//                       <div className="absolute inset-0 flex items-center justify-center bg-black/40">
//                         <Play className="w-12 h-12 text-white" />
//                       </div>
//                     )}
//                     <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 rounded text-xs text-white">
//                       {teaching.type.toUpperCase()}
//                     </div>
//                   </div>
                  
//                   {/* Content */}
//                   <div className="p-6">
//                     <div className="flex items-center space-x-2 text-sm text-gray-500 mb-2">
//                       <Calendar className="w-4 h-4" />
//                       <span>{new Date(teaching.date).toLocaleDateString()}</span>
//                       {teaching.duration && (
//                         <>
//                           <span>•</span>
//                           <span>{formatDuration(teaching.duration)}</span>
//                         </>
//                       )}
//                     </div>
                    
//                     <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#0EBC5F] transition-colors line-clamp-2">
//                       {teaching.title}
//                     </h3>
                    
//                     <div className="flex items-center space-x-2 text-sm text-gray-500 mb-3">
//                       <User className="w-4 h-4" />
//                       <span>{teaching.speaker}</span>
//                     </div>
                    
//                     <p className="text-gray-600 mb-4 line-clamp-2">
//                       {teaching.description}
//                     </p>
                    
//                     <div className="flex items-center justify-between text-sm">
//                       <div className="flex items-center space-x-3">
//                         <span className="flex items-center space-x-1">
//                           <Eye className="w-4 h-4 text-gray-400" />
//                           <span>{teaching.views}</span>
//                         </span>
//                         <span className="flex items-center space-x-1">
//                           <Download className="w-4 h-4 text-gray-400" />
//                           <span>{teaching.downloads}</span>
//                         </span>
//                       </div>
//                       <span className="text-[#0EBC5F] font-medium">Listen Now →</span>
//                     </div>
//                   </div>
//                 </Link>
//               ))}
//             </div>
//           )}
          
//           {/* Pagination */}
//           {pagination.pages > 1 && (
//             <div className="flex justify-center mt-12 space-x-2">
//               <button
//                 onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
//                 disabled={pagination.page === 1}
//                 className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
//               >
//                 Previous
//               </button>
//               <span className="px-4 py-2">
//                 Page {pagination.page} of {pagination.pages}
//               </span>
//               <button
//                 onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
//                 disabled={pagination.page === pagination.pages}
//                 className="px-4 py-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
//               >
//                 Next
//               </button>
//             </div>
//           )}
//         </div>
//       </section>
//     </div>
//   );
// }