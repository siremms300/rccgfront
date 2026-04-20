'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { X, Download, Calendar, Camera, ChevronLeft, ChevronRight, Search, Filter } from 'lucide-react';
import { galleryAPI } from '@/lib/api';
import toast from 'react-hot-toast';

interface GalleryImage {
  _id: string;
  title: string;
  description: string;
  album: string;
  images: {
    url: string;
    publicId: string;
    caption?: string;
    uploadedBy: { name: string };
  }[];
  date: string;
  createdBy: { name: string };
}

export default function GalleryPage() {
  const [galleries, setGalleries] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<{ url: string; title: string; caption?: string } | null>(null);
  const [selectedAlbum, setSelectedAlbum] = useState('all');
  const [albums, setAlbums] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentGalleryImages, setCurrentGalleryImages] = useState<{ url: string; title: string; caption?: string }[]>([]);

  useEffect(() => {
    fetchGalleries();
    fetchAlbums();
  }, []);

  const fetchGalleries = async () => {
    try {
      const response = await galleryAPI.getAll();
      setGalleries(response.data.galleries);
    } catch (error) {
      console.error('Error fetching galleries:', error);
      toast.error('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  };

  const fetchAlbums = async () => {
    try {
      const response = await galleryAPI.getAll({ limit: 1000 });
      const uniqueAlbums = [...new Set(response.data.galleries.map((g: GalleryImage) => g.album))] as string[];
      setAlbums(uniqueAlbums);
    } catch (error) {
      console.error('Error fetching albums:', error);
    }
  };

  const filteredGalleries = galleries.filter(gallery => {
    const matchesAlbum = selectedAlbum === 'all' || gallery.album === selectedAlbum;
    const matchesSearch = searchQuery === '' || 
      gallery.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gallery.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesAlbum && matchesSearch;
  });

  const openLightbox = (gallery: GalleryImage, imageIndex: number) => {
    const images = gallery.images.map(img => ({
      url: img.url,
      title: gallery.title,
      caption: img.caption || gallery.description,
    }));
    setCurrentGalleryImages(images);
    setCurrentIndex(imageIndex);
    setSelectedImage(images[imageIndex]);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setCurrentGalleryImages([]);
    document.body.style.overflow = 'unset';
  };

  const navigateImage = (direction: 'prev' | 'next') => {
    const newIndex = direction === 'next' 
      ? (currentIndex + 1) % currentGalleryImages.length
      : (currentIndex - 1 + currentGalleryImages.length) % currentGalleryImages.length;
    setCurrentIndex(newIndex);
    setSelectedImage(currentGalleryImages[newIndex]);
  };

  const downloadImage = (url: string, title: string) => {
    window.open(url, '_blank');
    toast.success('Download started');
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
              Photo Gallery
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto animate-fade-in">
              Capturing God's moments and celebrating His faithfulness
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filter */}
      <section className="sticky top-16 z-20 bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search gallery..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
              />
            </div>
            <select
              value={selectedAlbum}
              onChange={(e) => setSelectedAlbum(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0EBC5F]"
            >
              <option value="all">All Albums</option>
              {albums.map(album => (
                <option key={album} value={album}>{album}</option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {filteredGalleries.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No photos found</p>
            </div>
          ) : (
            <div className="space-y-12">
              {filteredGalleries.map((gallery) => (
                <div key={gallery._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="p-6 border-b">
                    <h2 className="text-2xl font-bold text-gray-900">{gallery.title}</h2>
                    {gallery.description && (
                      <p className="text-gray-600 mt-1">{gallery.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(gallery.date).toLocaleDateString()}
                      </span>
                      <span>📷 {gallery.images.length} photos</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {gallery.images.map((image, idx) => (
                        <div
                          key={idx}
                          className="group relative aspect-square rounded-lg overflow-hidden cursor-pointer bg-gray-100"
                          onClick={() => openLightbox(gallery, idx)}
                        >
                          <Image
                            src={image.url}
                            alt={image.caption || gallery.title}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Camera className="w-8 h-8 text-white" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={closeLightbox}>
          <div className="relative max-w-5xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={closeLightbox}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X className="w-8 h-8" />
            </button>
            
            <div className="relative h-[70vh] w-full">
              <Image
                src={selectedImage.url}
                alt={selectedImage.title}
                fill
                className="object-contain"
              />
            </div>
            
            <div className="mt-4 text-center text-white">
              <h3 className="text-xl font-semibold mb-2">{selectedImage.title}</h3>
              {selectedImage.caption && (
                <p className="text-gray-300">{selectedImage.caption}</p>
              )}
              <button
                onClick={() => downloadImage(selectedImage.url, selectedImage.title)}
                className="mt-3 inline-flex items-center gap-2 text-sm text-[#0EBC5F] hover:text-[#0BA050]"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            </div>
            
            <button
              onClick={() => navigateImage('prev')}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
            >
              <ChevronLeft className="w-8 h-8" />
            </button>
            <button
              onClick={() => navigateImage('next')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
            >
              <ChevronRight className="w-8 h-8" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}











































// 'use client';

// import { useState, useEffect } from 'react';
// import Image from 'next/image';
// import { X, Download, Calendar, Camera, ChevronLeft, ChevronRight } from 'lucide-react';

// interface GalleryImage {
//   id: string;
//   url: string;
//   title: string;
//   caption?: string;
//   album: string;
//   date: string;
// }

// export default function GalleryPage() {
//   const [images, setImages] = useState<GalleryImage[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
//   const [selectedAlbum, setSelectedAlbum] = useState('all');
//   const [currentIndex, setCurrentIndex] = useState(0);

//   // Mock data
//   useEffect(() => {
//     setTimeout(() => {
//       const mockImages: GalleryImage[] = [
//         {
//           id: '1',
//           url: '/assets/gallery/sunday-service-1.jpg',
//           title: 'Sunday Worship Service',
//           caption: 'Powerful worship session during Sunday service',
//           album: 'Sunday Services',
//           date: '2024-03-17',
//         },
//         {
//           id: '2',
//           url: '/assets/gallery/yaya-conference.jpg',
//           title: 'YAYA Conference 2024',
//           caption: 'Youths and Young Adults gathering for spiritual revival',
//           album: 'Conferences',
//           date: '2024-03-10',
//         },
//         {
//           id: '3',
//           url: '/assets/gallery/choir-ministering.jpg',
//           title: 'Choir Ministering',
//           caption: 'The choir leading worship',
//           album: 'Worship',
//           date: '2024-03-03',
//         },
//       ];
//       setImages(mockImages);
//       setLoading(false);
//     }, 1000);
//   }, []);

//   const albums = ['all', ...new Set(images.map(img => img.album))];
//   const filteredImages = selectedAlbum === 'all' ? images : images.filter(img => img.album === selectedAlbum);

//   const openLightbox = (image: GalleryImage, index: number) => {
//     setSelectedImage(image);
//     setCurrentIndex(index);
//     document.body.style.overflow = 'hidden';
//   };

//   const closeLightbox = () => {
//     setSelectedImage(null);
//     document.body.style.overflow = 'unset';
//   };

//   const navigateImage = (direction: 'prev' | 'next') => {
//     const newIndex = direction === 'next' 
//       ? (currentIndex + 1) % filteredImages.length
//       : (currentIndex - 1 + filteredImages.length) % filteredImages.length;
//     setCurrentIndex(newIndex);
//     setSelectedImage(filteredImages[newIndex]);
//   };

//   const downloadImage = (url: string, title: string) => {
//     // In production, this would trigger actual download
//     window.open(url, '_blank');
//   };

//   return (
//     <div className="pt-16">
//       {/* Hero Section */}
//       <section className="relative h-[40vh] min-h-[300px] w-full overflow-hidden">
//         <div className="absolute inset-0 bg-gradient-to-r from-[#29156C] to-[#0EBC5F]" />
//         <div className="relative z-10 h-full flex items-center justify-center">
//           <div className="container mx-auto px-4 text-center">
//             <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 animate-fade-in">
//               Photo Gallery
//             </h1>
//             <p className="text-xl text-white/90 max-w-2xl mx-auto animate-fade-in">
//               Capturing God's moments and celebrating His faithfulness
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Album Filter */}
//       <section className="py-8 bg-white border-b overflow-x-auto">
//         <div className="container mx-auto px-4">
//           <div className="flex space-x-3">
//             {albums.map((album) => (
//               <button
//                 key={album}
//                 onClick={() => setSelectedAlbum(album)}
//                 className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
//                   selectedAlbum === album
//                     ? 'bg-[#0EBC5F] text-white'
//                     : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//                 }`}
//               >
//                 {album === 'all' ? 'All Photos' : album}
//               </button>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* Gallery Grid */}
//       <section className="py-12 bg-gray-50">
//         <div className="container mx-auto px-4">
//           {loading ? (
//             <div className="flex justify-center py-12">
//               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0EBC5F]"></div>
//             </div>
//           ) : filteredImages.length === 0 ? (
//             <div className="text-center py-12">
//               <p className="text-gray-500 text-lg">No images found</p>
//             </div>
//           ) : (
//             <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
//               {filteredImages.map((image, index) => (
//                 <div
//                   key={image.id}
//                   className="group relative bg-white rounded-xl overflow-hidden shadow-lg cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
//                   onClick={() => openLightbox(image, index)}
//                 >
//                   <div className="relative h-64">
//                     <Image
//                       src={image.url}
//                       alt={image.title}
//                       fill
//                       className="object-cover group-hover:scale-105 transition-transform duration-300"
//                     />
//                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
//                       <Camera className="w-8 h-8 text-white" />
//                     </div>
//                   </div>
//                   <div className="p-4">
//                     <h3 className="font-semibold text-gray-900 mb-1">{image.title}</h3>
//                     <div className="flex items-center text-sm text-gray-500">
//                       <Calendar className="w-4 h-4 mr-1" />
//                       <span>{new Date(image.date).toLocaleDateString()}</span>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>
//       </section>

//       {/* Lightbox Modal */}
//       {selectedImage && (
//         <div
//           className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
//           onClick={closeLightbox}
//         >
//           <div className="relative max-w-5xl w-full mx-4" onClick={(e) => e.stopPropagation()}>
//             {/* Close Button */}
//             <button
//               onClick={closeLightbox}
//               className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
//             >
//               <X className="w-8 h-8" />
//             </button>
            
//             {/* Image */}
//             <div className="relative h-[70vh] w-full">
//               <Image
//                 src={selectedImage.url}
//                 alt={selectedImage.title}
//                 fill
//                 className="object-contain"
//               />
//             </div>
            
//             {/* Caption */}
//             <div className="mt-4 text-center text-white">
//               <h3 className="text-xl font-semibold mb-2">{selectedImage.title}</h3>
//               <p className="text-gray-300">{selectedImage.caption}</p>
//               <div className="flex items-center justify-center space-x-4 mt-3">
//                 <span className="flex items-center text-sm text-gray-400">
//                   <Calendar className="w-4 h-4 mr-1" />
//                   {new Date(selectedImage.date).toLocaleDateString()}
//                 </span>
//                 <button
//                   onClick={() => downloadImage(selectedImage.url, selectedImage.title)}
//                   className="flex items-center text-sm text-[#0EBC5F] hover:text-[#0BA050]"
//                 >
//                   <Download className="w-4 h-4 mr-1" />
//                   Download
//                 </button>
//               </div>
//             </div>
            
//             {/* Navigation */}
//             <button
//               onClick={() => navigateImage('prev')}
//               className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
//             >
//               <ChevronLeft className="w-8 h-8" />
//             </button>
//             <button
//               onClick={() => navigateImage('next')}
//               className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-300 transition-colors"
//             >
//               <ChevronRight className="w-8 h-8" />
//             </button>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }