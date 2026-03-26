import { BookOpen, Calendar, Image, Users, Heart, Music, Mic, Video, Camera } from 'lucide-react';
import HeroSlider from '@/components/ui/HeroSlider';
import FeatureCard from '@/components/ui/FeatureCard';
import StatsSection from '@/components/ui/StatsSection';
import Link from 'next/link';

export default function Home() {
  const features = [
    {
      icon: BookOpen,
      title: 'Teachings Library',
      description: 'Access sermons, Bible studies, and spiritual resources from our pastors and ministers.',
      link: '/teachings',
      color: '#0EBC5F',
    },
    {
      icon: Image,
      title: 'Media Gallery',
      description: 'View photos and videos from our services, events, and special programs.',
      link: '/gallery',
      color: '#29156C',
    },
    {
      icon: Calendar,
      title: 'Events Calendar',
      description: 'Stay updated on upcoming services, conferences, and church programs.',
      link: '/events',
      color: '#CB0000',
    },
    {
      icon: Users,
      title: 'Groups & Departments',
      description: 'Connect with our natural groups and serve in various departments.',
      link: '/groups',
      color: '#0EBC5F',
    },
  ];

  const groups = [
    { name: 'Excellent Men', description: 'Men fellowship for spiritual growth and impact', color: '#0EBC5F' },
    { name: 'Good Women', description: 'Women empowering women through faith', color: '#29156C' },
    { name: 'YAYA', description: 'Youths and Young Adults vibrant community', color: '#CB0000' },
    { name: 'Elders Forum', description: 'Wisdom sharing and mentorship', color: '#0EBC5F' },
    { name: 'Junior Church', description: 'Nurturing faith in children and teens', color: '#29156C' },
  ];

  const departments = [
    { name: 'Choir', icon: Music },
    { name: 'Ushering', icon: Users },
    { name: 'Protocol', icon: Heart },
    { name: 'Media', icon: Video },
    { name: 'Technical', icon: Camera },
    { name: 'Sunday School', icon: BookOpen },
  ];

  return (
    <>
      {/* Hero Slider */}
      <HeroSlider />
      
      {/* Welcome Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Welcome to Your Digital Church Home
            </h2>
            <p className="text-lg text-gray-600">
              Revelation Sanctuary is more than a church - it's a family where everyone belongs, 
              grows, and thrives in their faith journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard key={index} {...feature} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Stats Section */}
      <StatsSection />
      
      {/* Natural Groups Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Natural Groups
            </h2>
            <p className="text-lg text-gray-600">
              Find your community and grow together with like-minded believers
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((group, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
              >
                <div 
                  className="w-12 h-1 rounded-full mb-6"
                  style={{ backgroundColor: group.color }}
                />
                <h3 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h3>
                <p className="text-gray-600">{group.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Departments Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Serve with Passion
            </h2>
            <p className="text-lg text-gray-600">
              Join one of our departments and use your gifts to serve the body of Christ
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {departments.map((dept, index) => {
              const Icon = dept.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#0EBC5F]/10 mb-3 group-hover:bg-[#0EBC5F]/20 transition-colors">
                    <Icon className="w-6 h-6 text-[#0EBC5F]" />
                  </div>
                  <h3 className="font-medium text-gray-900">{dept.name}</h3>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-20 bg-[#29156C]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Grow in Your Faith?
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Join us this Sunday and experience the difference of being part of a vibrant, 
            life-giving community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/about"
              className="inline-flex items-center px-8 py-3 bg-white text-[#29156C] rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              Plan Your Visit
            </Link>
            <Link
              href="/teachings"
              className="inline-flex items-center px-8 py-3 border-2 border-white text-white rounded-full font-semibold hover:bg-white/10 transition-all duration-300"
            >
              Watch Online
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}