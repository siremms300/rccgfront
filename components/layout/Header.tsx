'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, User, LogOut, ChevronDown, LayoutDashboard, BookOpen, Calendar, Image as ImageIcon, Users, Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Image from 'next/image';

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  // Public navigation links (visible to everyone)
  const publicLinks = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/teachings', label: 'Teachings' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/events', label: 'Events' },
    { href: '/groups', label: 'Groups' },
    { href: '/contact', label: 'Contact' },
  ];
  
  // User dashboard links (for authenticated users)
  const dashboardLinks = [
    { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
    { href: '/dashboard/teachings', label: 'My Teachings', icon: BookOpen, roles: ['super_admin', 'province_pastor', 'zonal_pastor', 'area_pastor', 'parish_pastor'] },
    { href: '/dashboard/events', label: 'My Events', icon: Calendar, roles: ['super_admin', 'province_pastor'] },
    { href: '/dashboard/gallery', label: 'My Gallery', icon: ImageIcon, roles: ['super_admin', 'media'] },
    { href: '/dashboard/prayers', label: 'Prayers', icon: Heart, roles: ['super_admin', 'province_pastor'] },
  ];
  
  // Filter dashboard links based on user role
  const accessibleDashboardLinks = user 
    ? dashboardLinks.filter(link => 
        link.roles?.includes(user.role) || link.roles === undefined
      )
    : [];
  
  const isActive = (href: string) => pathname === href;
  
  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg' 
            : 'bg-white'
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group" onClick={closeMenu}>
              <div className="relative w-10 h-10 md:w-12 md:h-12">
                <Image
                  src="/assets/logo.png"
                  alt="RCCG Revelation Sanctuary"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h1 className="font-bold text-base md:text-xl leading-tight text-gray-900">
                  RCCG Revelation
                </h1>
                <p className="text-xs text-gray-500 hidden sm:block">Oasis of Excellence</p>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative py-2 text-sm font-medium transition-colors duration-200 ${
                    isActive(link.href)
                      ? 'text-[#0EBC5F]'
                      : 'text-gray-700 hover:text-[#0EBC5F]'
                  }`}
                >
                  {link.label}
                  {isActive(link.href) && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0EBC5F] rounded-full" />
                  )}
                </Link>
              ))}
              
              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 text-gray-700 hover:text-[#0EBC5F] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#29156C] flex items-center justify-center text-white text-sm font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b">
                      <p className="text-sm font-semibold text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      <p className="text-xs text-[#0EBC5F] mt-1 capitalize">{user.role.replace('_', ' ')}</p>
                    </div>
                    
                    {/* Dashboard Links */}
                    {accessibleDashboardLinks.map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition-colors"
                        >
                          <Icon className="w-4 h-4 text-gray-500" />
                          <span className="text-sm">{link.label}</span>
                        </Link>
                      );
                    })}
                    
                    {/* Divider */}
                    <div className="border-t my-1"></div>
                    
                    {/* Logout Button */}
                    <button
                      onClick={logout}
                      className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition-colors w-full text-left text-red-600"
                    >
                      <LogOut className="w-4 h-4" />
                      <span className="text-sm">Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-[#0EBC5F] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#0BA050] transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  Sign In
                </Link>
              )}
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>
      
      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeMenu}
        />
      )}
      
      {/* Mobile Menu Panel */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-80 bg-white z-50 transform transition-transform duration-300 ease-out md:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Menu Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="relative w-10 h-10">
              <Image
                src="/assets/logo.png"
                alt="RCCG Revelation"
                fill
                className="object-contain"
              />
            </div>
            <button
              onClick={closeMenu}
              className="p-2 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* User Info (if logged in) */}
          {user && (
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-[#29156C] flex items-center justify-center text-white font-medium text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                  <p className="text-xs text-[#0EBC5F] mt-1 capitalize">{user.role.replace('_', ' ')}</p>
                </div>
              </div>
            </div>
          )}
          
          {/* Navigation Links */}
          <div className="flex-1 overflow-y-auto py-4">
            {/* Public Links */}
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Menu</p>
              {publicLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`block py-3 text-base font-medium transition-colors ${
                    isActive(link.href)
                      ? 'text-[#0EBC5F]'
                      : 'text-gray-700 hover:text-[#0EBC5F]'
                  }`}
                  onClick={closeMenu}
                >
                  {link.label}
                </Link>
              ))}
            </div>
            
            {/* Dashboard Links (if logged in) */}
            {user && accessibleDashboardLinks.length > 0 && (
              <div className="px-4 py-2 border-t mt-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Dashboard</p>
                {accessibleDashboardLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center space-x-3 py-3 text-base font-medium text-gray-700 hover:text-[#0EBC5F] transition-colors"
                      onClick={closeMenu}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{link.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* Menu Footer */}
          <div className="p-4 border-t">
            {user ? (
              <button
                onClick={() => {
                  logout();
                  closeMenu();
                }}
                className="flex items-center justify-center space-x-2 w-full bg-red-50 text-red-600 px-4 py-3 rounded-lg font-medium hover:bg-red-100 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                href="/login"
                className="block w-full text-center bg-[#0EBC5F] text-white px-4 py-3 rounded-lg font-semibold hover:bg-[#0BA050] transition-colors"
                onClick={closeMenu}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
}




// In the dropdown menu, add:
{/* <Link
  href="/profile/notifications"
  className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-50 transition-colors"
>
  <Bell className="w-4 h-4 text-gray-500" />
  <span className="text-sm">Notification Settings</span>
</Link> */}








































































// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { useState } from 'react';
// import { useAuth } from '@/hooks/useAuth';
// import Image from 'next/image';

// export default function Header() {
//   const [showMenu, setShowMenu] = useState(false);
//   const pathname = usePathname();
//   const { user, logout } = useAuth();
  
//   const navLinks = [
//     { href: '/', label: 'Home' },
//     { href: '/about', label: 'About' },
//     { href: '/teachings', label: 'Teachings' },
//     { href: '/gallery', label: 'Gallery' },
//     { href: '/events', label: 'Events' },
//     { href: '/groups', label: 'Groups' },
//     { href: '/contact', label: 'Contact' },
//   ];

//   return (
//     <>
//       {/* Header */}
//       <div className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
//         <div className="max-w-7xl mx-auto px-4">
//           <div className="flex justify-between items-center h-16">
//             {/* Logo */}
//             <Link href="/" className="flex items-center space-x-2">
//               <div className="relative w-10 h-10">
//                 <Image src="/assets/logo.png" alt="Logo" fill className="object-contain" />
//               </div>
//               <div>
//                 <div className="font-bold text-base">RCCG Revelation</div>
//                 <div className="text-xs text-gray-500 hidden sm:block">Oasis of Excellence</div>
//               </div>
//             </Link>
            
//             {/* Desktop Links */}
//             <div className="hidden md:flex space-x-6">
//               {navLinks.map(link => (
//                 <Link 
//                   key={link.href} 
//                   href={link.href}
//                   className={`text-sm ${pathname === link.href ? 'text-[#0EBC5F]' : 'text-gray-700 hover:text-[#0EBC5F]'}`}
//                 >
//                   {link.label}
//                 </Link>
//               ))}
//               {user ? (
//                 <button onClick={logout} className="text-sm text-red-600">Logout</button>
//               ) : (
//                 <Link href="/login" className="bg-[#0EBC5F] text-white px-3 py-1 rounded text-sm">Sign In</Link>
//               )}
//             </div>
            
//             {/* Hamburger Button */}
//             <button 
//               className="md:hidden text-2xl p-2"
//               onClick={() => setShowMenu(!showMenu)}
//               style={{ fontSize: '24px' }}
//             >
//               {showMenu ? '✕' : '☰'}
//             </button>
//           </div>
//         </div>
//       </div>
      
//       {/* Mobile Menu */}
//       {showMenu && (
//         <div 
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
//           onClick={() => setShowMenu(false)}
//         />
//       )}
      
//       <div 
//         className={`fixed top-0 right-0 bottom-0 w-64 bg-white z-50 transform transition-transform duration-300 md:hidden ${
//           showMenu ? 'translate-x-0' : 'translate-x-full'
//         }`}
//       >
//         <div className="p-4">
//           <button 
//             className="float-right text-2xl p-2"
//             onClick={() => setShowMenu(false)}
//           >
//             ✕
//           </button>
//           <div className="clear-both pt-12">
//             {navLinks.map(link => (
//               <Link 
//                 key={link.href} 
//                 href={link.href}
//                 className={`block py-3 text-base ${pathname === link.href ? 'text-[#0EBC5F]' : 'text-gray-700'}`}
//                 onClick={() => setShowMenu(false)}
//               >
//                 {link.label}
//               </Link>
//             ))}
//             {user ? (
//               <button 
//                 onClick={() => { logout(); setShowMenu(false); }}
//                 className="block w-full text-left py-3 text-red-600"
//               >
//                 Logout
//               </button>
//             ) : (
//               <Link 
//                 href="/login" 
//                 className="block mt-4 bg-[#0EBC5F] text-white text-center py-2 rounded"
//                 onClick={() => setShowMenu(false)}
//               >
//                 Sign In
//               </Link>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

















































// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { Menu, X, User, LogOut } from 'lucide-react';
// import { useState } from 'react';
// import { useAuth } from '@/hooks/useAuth';
// import Image from 'next/image';

// export default function Header() {
//   const [isOpen, setIsOpen] = useState(false);
//   const pathname = usePathname();
//   const { user, logout } = useAuth();
  
//   const navLinks = [
//     { href: '/', label: 'Home' },
//     { href: '/about', label: 'About' },
//     { href: '/teachings', label: 'Teachings' },
//     { href: '/gallery', label: 'Gallery' },
//     { href: '/events', label: 'Events' },
//     { href: '/groups', label: 'Groups' },
//     { href: '/contact', label: 'Contact' },
//   ];
  
//   const isActive = (href: string) => pathname === href;

//   const toggleMenu = () => {
//     setIsOpen(!isOpen);
//   };

//   const closeMenu = () => {
//     setIsOpen(false);
//   };

//   return (
//     <>
//       {/* Header */}
//       <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50">
//         <div className="container mx-auto px-4">
//           <div className="flex justify-between items-center h-16">
//             {/* Logo */}
//             <Link href="/" className="flex items-center space-x-2" onClick={closeMenu}>
//               <div className="relative w-10 h-10">
//                 <Image
//                   src="/assets/logo.png"
//                   alt="RCCG Revelation"
//                   fill
//                   className="object-contain"
//                 />
//               </div>
//               <div>
//                 <h1 className="font-bold text-base">RCCG Revelation</h1>
//                 <p className="text-xs text-gray-500 hidden sm:block">Oasis of Excellence</p>
//               </div>
//             </Link>
            
//             {/* Desktop Menu */}
//             <div className="hidden md:flex items-center space-x-6">
//               {navLinks.map((link) => (
//                 <Link
//                   key={link.href}
//                   href={link.href}
//                   className={`text-sm font-medium transition-colors ${
//                     isActive(link.href)
//                       ? 'text-[#0EBC5F]'
//                       : 'text-gray-700 hover:text-[#0EBC5F]'
//                   }`}
//                 >
//                   {link.label}
//                 </Link>
//               ))}
              
//               {user ? (
//                 <button
//                   onClick={logout}
//                   className="flex items-center space-x-2 text-gray-700 hover:text-red-600"
//                 >
//                   <LogOut className="w-4 h-4" />
//                   <span className="text-sm">Logout</span>
//                 </button>
//               ) : (
//                 <Link
//                   href="/login"
//                   className="bg-[#0EBC5F] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0BA050]"
//                 >
//                   Sign In
//                 </Link>
//               )}
//             </div>
            
//             {/* Mobile Menu Button */}
//             <button
//               onClick={toggleMenu}
//               className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
//               aria-label="Menu"
//             >
//               {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//             </button>
//           </div>
//         </div>
//       </header>
      
//       {/* Mobile Menu Overlay */}
//       {isOpen && (
//         <div
//           className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
//           onClick={closeMenu}
//         />
//       )}
      
//       {/* Mobile Menu Panel */}
//       <div
//         className={`fixed top-0 right-0 bottom-0 w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out md:hidden ${
//           isOpen ? 'translate-x-0' : 'translate-x-full'
//         }`}
//       >
//         <div className="flex flex-col h-full">
//           {/* Menu Header */}
//           <div className="flex justify-between items-center p-4 border-b">
//             <div className="relative w-10 h-10">
//               <Image
//                 src="/assets/logo.png"
//                 alt="RCCG Revelation"
//                 fill
//                 className="object-contain"
//               />
//             </div>
//             <button
//               onClick={toggleMenu}
//               className="p-2 rounded-lg hover:bg-gray-100"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>
          
//           {/* Menu Links */}
//           <div className="flex-1 py-4">
//             {navLinks.map((link) => (
//               <Link
//                 key={link.href}
//                 href={link.href}
//                 className={`block px-4 py-3 text-base ${
//                   isActive(link.href)
//                     ? 'text-[#0EBC5F] bg-[#0EBC5F]/5'
//                     : 'text-gray-700 hover:bg-gray-50'
//                 }`}
//                 onClick={closeMenu}
//               >
//                 {link.label}
//               </Link>
//             ))}
//           </div>
          
//           {/* Menu Footer */}
//           <div className="p-4 border-t">
//             {user ? (
//               <button
//                 onClick={() => {
//                   logout();
//                   closeMenu();
//                 }}
//                 className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
//               >
//                 Logout
//               </button>
//             ) : (
//               <Link
//                 href="/login"
//                 className="block w-full text-center bg-[#0EBC5F] text-white px-4 py-2 rounded-lg"
//                 onClick={closeMenu}
//               >
//                 Sign In
//               </Link>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }























































// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
// import { useState, useEffect, useRef } from 'react';
// import { useAuth } from '@/hooks/useAuth';
// import Image from 'next/image';

// export default function Header() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const pathname = usePathname();
//   const { user, logout } = useAuth();
//   const menuButtonRef = useRef<HTMLButtonElement>(null);
//   const menuPanelRef = useRef<HTMLDivElement>(null);
  
//   const navLinks = [
//     { href: '/', label: 'Home' },
//     { href: '/about', label: 'About' },
//     { href: '/teachings', label: 'Teachings' },
//     { href: '/gallery', label: 'Gallery' },
//     { href: '/events', label: 'Events' },
//     { href: '/groups', label: 'Groups' },
//     { href: '/contact', label: 'Contact' },
//   ];
  
//   const isActive = (href: string) => pathname === href;
  
//   // Handle scroll effect
//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 10);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);
  
//   // Prevent body scroll when mobile menu is open
//   useEffect(() => {
//     if (isMenuOpen) {
//       document.body.style.overflow = 'hidden';
//       document.body.style.position = 'fixed';
//       document.body.style.width = '100%';
//     } else {
//       document.body.style.overflow = '';
//       document.body.style.position = '';
//       document.body.style.width = '';
//     }
//     return () => {
//       document.body.style.overflow = '';
//       document.body.style.position = '';
//       document.body.style.width = '';
//     };
//   }, [isMenuOpen]);

//   // Close menu when route changes
//   useEffect(() => {
//     setIsMenuOpen(false);
//   }, [pathname]);

//   // Close menu when clicking outside on mobile
//   useEffect(() => {
//     const handleClickOutside = (event: TouchEvent | MouseEvent) => {
//       if (isMenuOpen && menuPanelRef.current && !menuPanelRef.current.contains(event.target as Node)) {
//         // Don't close if clicking on the menu button
//         if (menuButtonRef.current && menuButtonRef.current.contains(event.target as Node)) {
//           return;
//         }
//         setIsMenuOpen(false);
//       }
//     };

//     document.addEventListener('mousedown', handleClickOutside);
//     document.addEventListener('touchstart', handleClickOutside);
    
//     return () => {
//       document.removeEventListener('mousedown', handleClickOutside);
//       document.removeEventListener('touchstart', handleClickOutside);
//     };
//   }, [isMenuOpen]);

//   const toggleMenu = (e: React.MouseEvent | React.TouchEvent) => {
//     e.preventDefault();
//     e.stopPropagation();
//     setIsMenuOpen(!isMenuOpen);
//   };


// // Add this inside your Header component, right after the toggleMenu function
//   useEffect(() => {
//     const button = menuButtonRef.current;
//     if (button) {
//       const handleTouch = (e: TouchEvent) => {
//         console.log('Touch detected on button');
//         e.preventDefault();
//         toggleMenu(e as any);
//       };
      
//       button.addEventListener('touchstart', handleTouch);
//       return () => button.removeEventListener('touchstart', handleTouch);
//     }
//   }, []);





//   const closeMenu = () => {
//     setIsMenuOpen(false);
//   };

//   return (
//     <>
//       <header 
//         className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
//           isScrolled 
//             ? 'bg-white/95 backdrop-blur-md shadow-lg' 
//             : 'bg-white'
//         }`}
//       >
//         <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16 md:h-20">
//             {/* Logo */}
//             <Link href="/" className="flex items-center space-x-3 group z-10" onClick={closeMenu}>
//               <div className="relative w-10 h-10 md:w-12 md:h-12">
//                 <Image
//                   src="/assets/logo.png"
//                   alt="RCCG Revelation Sanctuary"
//                   fill
//                   className="object-contain"
//                   priority
//                 />
//               </div>
//               <div>
//                 <h1 className="font-bold text-base md:text-xl leading-tight text-gray-900">
//                   RCCG Revelation
//                 </h1>
//                 <p className="text-xs text-gray-500 hidden sm:block">Oasis of Excellence</p>
//               </div>
//             </Link>
            
//             {/* Desktop Navigation */}
//             <div className="hidden md:flex items-center space-x-8">
//               {navLinks.map((link) => (
//                 <Link
//                   key={link.href}
//                   href={link.href}
//                   className={`relative py-2 text-sm font-medium transition-colors duration-200 ${
//                     isActive(link.href)
//                       ? 'text-[#0EBC5F]'
//                       : 'text-gray-700 hover:text-[#0EBC5F]'
//                   }`}
//                 >
//                   {link.label}
//                   {isActive(link.href) && (
//                     <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0EBC5F] rounded-full" />
//                   )}
//                 </Link>
//               ))}
              
//               {user ? (
//                 <div className="relative group">
//                   <button className="flex items-center space-x-2 text-gray-700 hover:text-[#0EBC5F] transition-colors">
//                     <div className="w-8 h-8 rounded-full bg-[#29156C] flex items-center justify-center text-white text-sm font-medium">
//                       {user.name.charAt(0).toUpperCase()}
//                     </div>
//                     <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
//                     <ChevronDown className="w-4 h-4" />
//                   </button>
//                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
//                     <Link
//                       href="/dashboard"
//                       className="flex items-center space-x-2 px-4 py-2.5 hover:bg-gray-50 transition-colors"
//                     >
//                       <User className="w-4 h-4 text-gray-500" />
//                       <span className="text-sm">Dashboard</span>
//                     </Link>
//                     <button
//                       onClick={logout}
//                       className="flex items-center space-x-2 px-4 py-2.5 hover:bg-gray-50 transition-colors w-full text-left"
//                     >
//                       <LogOut className="w-4 h-4 text-gray-500" />
//                       <span className="text-sm">Logout</span>
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <Link
//                   href="/login"
//                   className="bg-[#0EBC5F] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#0BA050] transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
//                 >
//                   Sign In
//                 </Link>
//               )}
//             </div>
            
//             {/* Mobile Menu Button - Enhanced for touch */}
//             <button
//               ref={menuButtonRef}
//               className="md:hidden relative w-12 h-12 flex items-center justify-center rounded-lg active:bg-gray-100 transition-colors touch-manipulation z-50"
//               onClick={toggleMenu}
//               onTouchStart={(e) => {
//                 e.preventDefault();
//                 toggleMenu(e);
//               }}
//               aria-label={isMenuOpen ? "Close menu" : "Open menu"}
//               style={{ touchAction: 'manipulation' }}
//             >
//               {isMenuOpen ? (
//                 <X className="w-6 h-6 text-gray-700" />
//               ) : (
//                 <Menu className="w-6 h-6 text-gray-700" />
//               )}
//             </button>
//           </div>
//         </nav>
//       </header>
      
//       {/* Mobile Menu Overlay */}
//       <div
//         className={`fixed inset-0 bg-black/50 z-40 transition-all duration-300 md:hidden ${
//           isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
//         }`}
//         onClick={closeMenu}
//         onTouchStart={(e) => {
//           e.preventDefault();
//           closeMenu();
//         }}
//       />
      
//       {/* Mobile Menu Panel */}
//       <div
//         ref={menuPanelRef}
//         className={`fixed top-0 right-0 bottom-0 w-80 bg-white z-50 shadow-2xl transition-all duration-300 ease-out md:hidden ${
//           isMenuOpen ? 'translate-x-0' : 'translate-x-full'
//         }`}
//         style={{ touchAction: 'pan-y' }}
//       >
//         <div className="flex flex-col h-full">
//           {/* Mobile Menu Header */}
//           <div className="flex items-center justify-between p-6 border-b">
//             <div className="relative w-12 h-12">
//               <Image
//                 src="/assets/logo.png"
//                 alt="RCCG Revelation"
//                 fill
//                 className="object-contain"
//               />
//             </div>
//             <button
//               onClick={closeMenu}
//               onTouchStart={(e) => {
//                 e.preventDefault();
//                 closeMenu();
//               }}
//               className="p-3 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation"
//               aria-label="Close menu"
//               style={{ touchAction: 'manipulation' }}
//             >
//               <X className="w-6 h-6 text-gray-700" />
//             </button>
//           </div>
          
//           {/* Mobile Navigation Links */}
//           <div className="flex-1 overflow-y-auto py-4">
//             {navLinks.map((link) => (
//               <Link
//                 key={link.href}
//                 href={link.href}
//                 className={`block px-6 py-4 text-base font-medium transition-colors active:bg-gray-50 ${
//                   isActive(link.href)
//                     ? 'text-[#0EBC5F] bg-[#0EBC5F]/5 border-l-4 border-[#0EBC5F]'
//                     : 'text-gray-700 hover:text-[#0EBC5F] hover:bg-gray-50'
//                 }`}
//                 onClick={closeMenu}
//                 onTouchStart={(e) => {
//                   e.preventDefault();
//                   closeMenu();
//                   window.location.href = link.href;
//                 }}
//               >
//                 {link.label}
//               </Link>
//             ))}
//           </div>
          
//           {/* Mobile Menu Footer */}
//           <div className="p-6 border-t">
//             {user ? (
//               <>
//                 <div className="flex items-center space-x-3 px-4 py-3 mb-4 bg-gray-50 rounded-xl">
//                   <div className="w-12 h-12 rounded-full bg-[#29156C] flex items-center justify-center text-white font-medium text-lg">
//                     {user.name.charAt(0).toUpperCase()}
//                   </div>
//                   <div className="flex-1">
//                     <p className="text-base font-semibold text-gray-900">{user.name}</p>
//                     <p className="text-xs text-gray-500 truncate">{user.email}</p>
//                   </div>
//                 </div>
//                 <Link
//                   href="/dashboard"
//                   className="block w-full text-center bg-gray-100 text-gray-700 px-4 py-3 rounded-xl mb-3 active:bg-gray-200 transition-colors font-medium touch-manipulation"
//                   onClick={closeMenu}
//                   onTouchStart={(e) => {
//                     e.preventDefault();
//                     closeMenu();
//                     window.location.href = '/dashboard';
//                   }}
//                 >
//                   Dashboard
//                 </Link>
//                 <button
//                   onClick={() => {
//                     logout();
//                     closeMenu();
//                   }}
//                   onTouchStart={(e) => {
//                     e.preventDefault();
//                     logout();
//                     closeMenu();
//                   }}
//                   className="block w-full text-center bg-red-50 text-red-600 px-4 py-3 rounded-xl active:bg-red-100 transition-colors font-medium touch-manipulation"
//                   style={{ touchAction: 'manipulation' }}
//                 >
//                   Logout
//                 </button>
//               </>
//             ) : (
//               <Link
//                 href="/login"
//                 className="block w-full text-center bg-[#0EBC5F] text-white px-4 py-3 rounded-xl font-semibold active:bg-[#0BA050] transition-colors touch-manipulation"
//                 onClick={closeMenu}
//                 onTouchStart={(e) => {
//                   e.preventDefault();
//                   closeMenu();
//                   window.location.href = '/login';
//                 }}
//               >
//                 Sign In
//               </Link>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }

































































// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
// import { useState, useEffect } from 'react';
// import { useAuth } from '@/hooks/useAuth';
// import Image from 'next/image';

// export default function Header() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const pathname = usePathname();
//   const { user, logout } = useAuth();
  
//   const navLinks = [
//     { href: '/', label: 'Home' },
//     { href: '/about', label: 'About' },
//     { href: '/teachings', label: 'Teachings' },
//     { href: '/gallery', label: 'Gallery' },
//     { href: '/events', label: 'Events' },
//     { href: '/groups', label: 'Groups' },
//     { href: '/contact', label: 'Contact' },
//   ];
  
//   const isActive = (href: string) => pathname === href;
  
//   // Handle scroll effect
//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 10);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);
  
//   // Prevent body scroll when mobile menu is open
//   useEffect(() => {
//     if (isMenuOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }
//     return () => {
//       document.body.style.overflow = 'unset';
//     };
//   }, [isMenuOpen]);

//   // Close menu when route changes
//   useEffect(() => {
//     setIsMenuOpen(false);
//   }, [pathname]);

//   const toggleMenu = () => {
//     setIsMenuOpen(!isMenuOpen);
//   };

//   const closeMenu = () => {
//     setIsMenuOpen(false);
//   };

//   return (
//     <>
//       <header 
//         className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
//           isScrolled 
//             ? 'bg-white/95 backdrop-blur-md shadow-lg' 
//             : 'bg-white'
//         }`}
//       >
//         <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16 md:h-20">
//             {/* Logo */}
//             <Link href="/" className="flex items-center space-x-3 group" onClick={closeMenu}>
//               <div className="relative w-10 h-10 md:w-12 md:h-12">
//                 <Image
//                   src="/assets/logo.png"
//                   alt="RCCG Revelation Sanctuary"
//                   fill
//                   className="object-contain"
//                   priority
//                 />
//               </div>
//               <div>
//                 <h1 className="font-bold text-base md:text-xl leading-tight text-gray-900">
//                   RCCG Revelation
//                 </h1>
//                 <p className="text-xs text-gray-500 hidden sm:block">Oasis of Excellence</p>
//               </div>
//             </Link>
            
//             {/* Desktop Navigation */}
//             <div className="hidden md:flex items-center space-x-8">
//               {navLinks.map((link) => (
//                 <Link
//                   key={link.href}
//                   href={link.href}
//                   className={`relative py-2 text-sm font-medium transition-colors duration-200 ${
//                     isActive(link.href)
//                       ? 'text-[#0EBC5F]'
//                       : 'text-gray-700 hover:text-[#0EBC5F]'
//                   }`}
//                 >
//                   {link.label}
//                   {isActive(link.href) && (
//                     <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0EBC5F] rounded-full" />
//                   )}
//                 </Link>
//               ))}
              
//               {user ? (
//                 <div className="relative group">
//                   <button className="flex items-center space-x-2 text-gray-700 hover:text-[#0EBC5F] transition-colors">
//                     <div className="w-8 h-8 rounded-full bg-[#29156C] flex items-center justify-center text-white text-sm font-medium">
//                       {user.name.charAt(0).toUpperCase()}
//                     </div>
//                     <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
//                     <ChevronDown className="w-4 h-4" />
//                   </button>
//                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
//                     <Link
//                       href="/dashboard"
//                       className="flex items-center space-x-2 px-4 py-2.5 hover:bg-gray-50 transition-colors"
//                     >
//                       <User className="w-4 h-4 text-gray-500" />
//                       <span className="text-sm">Dashboard</span>
//                     </Link>
//                     <button
//                       onClick={logout}
//                       className="flex items-center space-x-2 px-4 py-2.5 hover:bg-gray-50 transition-colors w-full text-left"
//                     >
//                       <LogOut className="w-4 h-4 text-gray-500" />
//                       <span className="text-sm">Logout</span>
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <Link
//                   href="/login"
//                   className="bg-[#0EBC5F] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#0BA050] transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
//                 >
//                   Sign In
//                 </Link>
//               )}
//             </div>
            
//             {/* Mobile Menu Button */}
//             <button
//               className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors z-50"
//               onClick={toggleMenu}
//               aria-label={isMenuOpen ? "Close menu" : "Open menu"}
//             >
//               {isMenuOpen ? (
//                 <X className="w-6 h-6 text-gray-700" />
//               ) : (
//                 <Menu className="w-6 h-6 text-gray-700" />
//               )}
//             </button>
//           </div>
//         </nav>
//       </header>
      
//       {/* Mobile Menu Overlay */}
//       <div
//         className={`fixed inset-0 bg-black/50 z-40 transition-all duration-300 md:hidden ${
//           isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
//         }`}
//         onClick={closeMenu}
//       />
      
//       {/* Mobile Menu Panel */}
//       <div
//         className={`fixed top-0 right-0 bottom-0 w-80 bg-white z-50 shadow-2xl transition-all duration-300 ease-out md:hidden ${
//           isMenuOpen ? 'translate-x-0' : 'translate-x-full'
//         }`}
//       >
//         <div className="flex flex-col h-full">
//           {/* Mobile Menu Header */}
//           <div className="flex items-center justify-between p-6 border-b">
//             <div className="relative w-12 h-12">
//               <Image
//                 src="/assets/logo.png"
//                 alt="RCCG Revelation"
//                 fill
//                 className="object-contain"
//               />
//             </div>
//             <button
//               onClick={closeMenu}
//               className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
//               aria-label="Close menu"
//             >
//               <X className="w-6 h-6 text-gray-700" />
//             </button>
//           </div>
          
//           {/* Mobile Navigation Links */}
//           <div className="flex-1 overflow-y-auto py-6">
//             {navLinks.map((link) => (
//               <Link
//                 key={link.href}
//                 href={link.href}
//                 className={`block px-6 py-4 text-base font-medium transition-colors ${
//                   isActive(link.href)
//                     ? 'text-[#0EBC5F] bg-[#0EBC5F]/5 border-l-4 border-[#0EBC5F]'
//                     : 'text-gray-700 hover:text-[#0EBC5F] hover:bg-gray-50'
//                 }`}
//                 onClick={closeMenu}
//               >
//                 {link.label}
//               </Link>
//             ))}
//           </div>
          
//           {/* Mobile Menu Footer */}
//           <div className="p-6 border-t">
//             {user ? (
//               <>
//                 <div className="flex items-center space-x-3 px-4 py-3 mb-4 bg-gray-50 rounded-xl">
//                   <div className="w-12 h-12 rounded-full bg-[#29156C] flex items-center justify-center text-white font-medium text-lg">
//                     {user.name.charAt(0).toUpperCase()}
//                   </div>
//                   <div className="flex-1">
//                     <p className="text-base font-semibold text-gray-900">{user.name}</p>
//                     <p className="text-xs text-gray-500 truncate">{user.email}</p>
//                   </div>
//                 </div>
//                 <Link
//                   href="/dashboard"
//                   className="block w-full text-center bg-gray-100 text-gray-700 px-4 py-3 rounded-xl mb-3 hover:bg-gray-200 transition-colors font-medium"
//                   onClick={closeMenu}
//                 >
//                   Dashboard
//                 </Link>
//                 <button
//                   onClick={() => {
//                     logout();
//                     closeMenu();
//                   }}
//                   className="block w-full text-center bg-red-50 text-red-600 px-4 py-3 rounded-xl hover:bg-red-100 transition-colors font-medium"
//                 >
//                   Logout
//                 </button>
//               </>
//             ) : (
//               <Link
//                 href="/login"
//                 className="block w-full text-center bg-[#0EBC5F] text-white px-4 py-3 rounded-xl font-semibold hover:bg-[#0BA050] transition-colors"
//                 onClick={closeMenu}
//               >
//                 Sign In
//               </Link>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }




























































// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { Menu, X, ChevronDown, User, LogOut } from 'lucide-react';
// import { useState, useEffect } from 'react';
// import { useAuth } from '@/hooks/useAuth';
// import Image from 'next/image';

// export default function Header() {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);
//   const [isScrolled, setIsScrolled] = useState(false);
//   const pathname = usePathname();
//   const { user, logout } = useAuth();
  
  
//   const navLinks = [
//     { href: '/', label: 'Home' },
//     { href: '/about', label: 'About' },
//     { href: '/teachings', label: 'Teachings' },
//     { href: '/gallery', label: 'Gallery' },
//     { href: '/events', label: 'Events' },
//     { href: '/groups', label: 'Groups' },
//     { href: '/contact', label: 'Contact' },
//   ];




//   const isActive = (href: string) => pathname === href;
  
//   // Handle scroll effect
//   useEffect(() => {
//     const handleScroll = () => {
//       setIsScrolled(window.scrollY > 10);
//     };
//     window.addEventListener('scroll', handleScroll);
//     return () => window.removeEventListener('scroll', handleScroll);
//   }, []);
  
//   // Prevent body scroll when mobile menu is open
//   useEffect(() => {
//     if (isMenuOpen) {
//       document.body.style.overflow = 'hidden';
//     } else {
//       document.body.style.overflow = 'unset';
//     }
//     return () => {
//       document.body.style.overflow = 'unset';
//     };
//   }, [isMenuOpen]);
  
//   return (
//     <>
//       <header 
//         className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
//           isScrolled 
//             ? 'bg-white/95 backdrop-blur-md shadow-lg' 
//             : 'bg-white'
//         }`}
//       >
//         <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex justify-between items-center h-16 md:h-20">
//             {/* Logo */}
//             <Link href="/" className="flex items-center space-x-3 group">
//               <div className="relative w-10 h-10 md:w-12 md:h-12">
//                 <Image
//                   src="/assets/logo.png"
//                   alt="RCCG Revelation Sanctuary"
//                   fill
//                   className="object-contain"
//                   priority
//                 />
//               </div>
//               <div>
//                 <h1 className="font-bold text-base md:text-xl leading-tight text-gray-900">
//                   RCCG Revelation Sanctuary
//                 </h1>
//                 <p className="text-xs text-gray-500 hidden sm:block">Oasis of Excellence</p>
//               </div>
//             </Link>
            
//             {/* Desktop Navigation */}
//             <div className="hidden md:flex items-center space-x-8">
//               {navLinks.map((link) => (
//                 <Link
//                   key={link.href}
//                   href={link.href}
//                   className={`relative py-2 text-sm font-medium transition-colors duration-200 ${
//                     isActive(link.href)
//                       ? 'text-[#0EBC5F]'
//                       : 'text-gray-700 hover:text-[#0EBC5F]'
//                   }`}
//                 >
//                   {link.label}
//                   {isActive(link.href) && (
//                     <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0EBC5F] rounded-full" />
//                   )}
//                 </Link>
//               ))}
              
//               {user ? (
//                 <div className="relative group">
//                   <button className="flex items-center space-x-2 text-gray-700 hover:text-[#0EBC5F] transition-colors">
//                     <div className="w-8 h-8 rounded-full bg-[#29156C] flex items-center justify-center text-white text-sm font-medium">
//                       {user.name.charAt(0).toUpperCase()}
//                     </div>
//                     <span className="text-sm font-medium">{user.name.split(' ')[0]}</span>
//                     <ChevronDown className="w-4 h-4" />
//                   </button>
//                   <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
//                     <Link
//                       href="/dashboard"
//                       className="flex items-center space-x-2 px-4 py-2.5 hover:bg-gray-50 transition-colors"
//                     >
//                       <User className="w-4 h-4 text-gray-500" />
//                       <span className="text-sm">Dashboard</span>
//                     </Link>
//                     <button
//                       onClick={logout}
//                       className="flex items-center space-x-2 px-4 py-2.5 hover:bg-gray-50 transition-colors w-full text-left"
//                     >
//                       <LogOut className="w-4 h-4 text-gray-500" />
//                       <span className="text-sm">Logout</span>
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <Link
//                   href="/login"
//                   className="bg-[#0EBC5F] text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-[#0BA050] transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
//                 >
//                   Sign In
//                 </Link>
//               )}
//             </div>
            
//             {/* Mobile Menu Button */}
//             <button
//               className="md:hidden relative w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
//               onClick={() => setIsMenuOpen(!isMenuOpen)}
//               aria-label="Toggle menu"
//             >
//               {isMenuOpen ? (
//                 <X className="w-6 h-6 text-gray-700" />
//               ) : (
//                 <Menu className="w-6 h-6 text-gray-700" />
//               )}
//             </button>
//           </div>
//         </nav>
//       </header>
      
//       {/* Mobile Menu Overlay */}
//       <div
//         className={`fixed inset-0 bg-black/50 z-40 transition-opacity duration-300 md:hidden ${
//           isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
//         }`}
//         onClick={() => setIsMenuOpen(false)}
//       />
      
//       {/* Mobile Menu Panel */}
//       <div
//         className={`fixed top-0 right-0 bottom-0 w-64 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-out md:hidden ${
//           isMenuOpen ? 'translate-x-0' : 'translate-x-full'
//         }`}
//       >
//         <div className="flex flex-col h-full">
//           {/* Mobile Menu Header */}
//           <div className="flex items-center justify-between p-4 border-b">
//             <div className="relative w-10 h-10">
//               <Image
//                 src="/assets/logo.png"
//                 alt="RCCG Revelation"
//                 fill
//                 className="object-contain"
//               />
//             </div>
//             <button
//               onClick={() => setIsMenuOpen(false)}
//               className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
//               aria-label="Close menu"
//             >
//               <X className="w-5 h-5" />
//             </button>
//           </div>
          
//           {/* Mobile Navigation Links */}
//           <div className="flex-1 py-6">
//             {navLinks.map((link) => (
//               <Link
//                 key={link.href}
//                 href={link.href}
//                 className={`block px-6 py-3 text-base font-medium transition-colors ${
//                   isActive(link.href)
//                     ? 'text-[#0EBC5F] bg-[#0EBC5F]/5'
//                     : 'text-gray-700 hover:text-[#0EBC5F] hover:bg-gray-50'
//                 }`}
//                 onClick={() => setIsMenuOpen(false)}
//               >
//                 {link.label}
//               </Link>
//             ))}
//           </div>
          
//           {/* Mobile Menu Footer */}
//           <div className="p-4 border-t">
//             {user ? (
//               <>
//                 <div className="flex items-center space-x-3 px-2 py-3 mb-3 bg-gray-50 rounded-lg">
//                   <div className="w-10 h-10 rounded-full bg-[#29156C] flex items-center justify-center text-white font-medium">
//                     {user.name.charAt(0).toUpperCase()}
//                   </div>
//                   <div className="flex-1">
//                     <p className="text-sm font-medium text-gray-900">{user.name}</p>
//                     <p className="text-xs text-gray-500">{user.email}</p>
//                   </div>
//                 </div>
//                 <Link
//                   href="/dashboard"
//                   className="block w-full text-center bg-gray-100 text-gray-700 px-4 py-2.5 rounded-lg mb-2 hover:bg-gray-200 transition-colors"
//                   onClick={() => setIsMenuOpen(false)}
//                 >
//                   Dashboard
//                 </Link>
//                 <button
//                   onClick={() => {
//                     logout();
//                     setIsMenuOpen(false);
//                   }}
//                   className="block w-full text-center bg-red-50 text-red-600 px-4 py-2.5 rounded-lg hover:bg-red-100 transition-colors"
//                 >
//                   Logout
//                 </button>
//               </>
//             ) : (
//               <Link
//                 href="/login"
//                 className="block w-full text-center bg-[#0EBC5F] text-white px-4 py-2.5 rounded-lg font-medium hover:bg-[#0BA050] transition-colors"
//                 onClick={() => setIsMenuOpen(false)}
//               >
//                 Sign In
//               </Link>
//             )}
//           </div>
//         </div>
//       </div>
//     </>
//   );
// }