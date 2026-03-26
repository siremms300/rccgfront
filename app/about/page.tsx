import Image from 'next/image';
import Link from 'next/link';
import { Users, Church, Globe, Heart, Target, Award } from 'lucide-react';

export default function AboutPage() {
  const values = [
    {
      icon: Heart,
      title: 'Love',
      description: 'Demonstrating God\'s love through authentic relationships and community care.',
    },
    {
      icon: Target,
      title: 'Excellence',
      description: 'Pursuing excellence in all we do as an Oasis of Excellence.',
    },
    {
      icon: Users,
      title: 'Community',
      description: 'Building a strong, supportive family where everyone belongs.',
    },
    {
      icon: Award,
      title: 'Integrity',
      description: 'Living with honesty, transparency, and moral courage.',
    },
  ];

  const leadership = [
    {
      name: 'Pastor Enoch Adejare Adeboye',
      role: 'General Overseer',
      description: 'Visionary leader of RCCG worldwide since 1980.',
    },
    {
      name: 'Pastor Obonge',
      role: 'Continental Overseer - Continent 11',
      description: 'Overseeing Region 30 and other regions in Continent 11.',
    },
    {
      name: 'Pastor Deji Afuye',
      role: 'Regional Pastor - Region 30',
      description: 'Leading Revelation Sanctuary and all provinces in Region 30.',
    },
  ];

  return (
    <div className="pt-16">
      {/* Hero Section with Image */}
      <section className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="/assets/adeboye.jpg"
            alt="Pastor Enoch Adejare Adeboye"
            fill
            className="object-cover"
            priority
            quality={100}
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fade-in">
              About Us
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Discover the story, vision, and values of RCCG Revelation Sanctuary
            </p>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-8">Our History</h2>
            <div className="prose prose-lg mx-auto">
              <p className="text-gray-600 mb-6">
                The Redeemed Christian Church of God (RCCG) was founded in 1952 by Reverend Josiah Olufemi Akindayomi, 
                following a divine mandate received through several years of prayer and fasting. After his passing in 1980, 
                Pastor Enoch Adejare Adeboye, then a lecturer in Mathematics at the University of Lagos, was appointed as 
                the General Overseer.
              </p>
              <p className="text-gray-600 mb-6">
                Under Pastor Adeboye's leadership, the church has experienced unprecedented growth, expanding from a single 
                parish in Nigeria to a global movement with presence in over 190 nations. The RCCG operates on a structured 
                hierarchy: General Overseer → Continental Overseers → Regional Pastors → Provincial Pastors → Zonal Pastors 
                → Area Pastors → Parish Pastors.
              </p>
              <p className="text-gray-600">
                Region 30, under the Continental Overseer of Continent 11, Pastor Obonge, stands as a testament to God's 
                faithfulness. Led by Regional Pastor Deji Afuye, the region encompasses 6 Provinces, each with their Pastor 
                in Charge of Province. Our headquarters, Revelation Sanctuary, embodies our motto as an "Oasis of Excellence"—a 
                place where lives are transformed, destinies are fulfilled, and God's presence is experienced.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto">
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold mb-4 text-[#0EBC5F]">Our Vision</h3>
              <p className="text-gray-600 text-lg">
                To be a beacon of hope and an Oasis of Excellence, impacting lives with the gospel of Jesus Christ 
                and raising disciples who will transform their world.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-lg">
              <h3 className="text-2xl font-bold mb-4 text-[#29156C]">Our Mission</h3>
              <p className="text-gray-600 text-lg">
                To make heaven, take as many people with us, and have a member of RCCG in every family of nations, 
                while demonstrating the love of God through excellent service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Core Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="text-center p-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0EBC5F]/10 mb-4">
                    <Icon className="w-8 h-8 text-[#0EBC5F]" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Leadership</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {leadership.map((leader, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#0EBC5F] to-[#29156C] mx-auto mb-4 flex items-center justify-center">
                  <Church className="w-16 h-16 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{leader.name}</h3>
                <p className="text-[#0EBC5F] font-medium mb-3">{leader.role}</p>
                <p className="text-gray-600">{leader.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Church Structure */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Church Structure</h2>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="space-y-4">
                <div className="text-center">
                  <div className="inline-block bg-[#29156C] text-white px-6 py-2 rounded-full font-semibold mb-4">
                    General Overseer
                  </div>
                </div>
                <div className="h-8 border-l-2 border-dashed border-gray-300 mx-auto w-0"></div>
                <div className="text-center">
                  <div className="inline-block bg-[#0EBC5F] text-white px-6 py-2 rounded-full font-semibold mb-4">
                    Continental Overseer (Continent 11)
                  </div>
                </div>
                <div className="h-8 border-l-2 border-dashed border-gray-300 mx-auto w-0"></div>
                <div className="text-center">
                  <div className="inline-block bg-[#CB0000] text-white px-6 py-2 rounded-full font-semibold mb-4">
                    Regional Pastor (Region 30)
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <strong className="block text-gray-900">6</strong>
                    <span className="text-sm text-gray-600">Provinces</span>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <strong className="block text-gray-900">Zones</strong>
                    <span className="text-sm text-gray-600">Multiple per Province</span>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <strong className="block text-gray-900">Areas</strong>
                    <span className="text-sm text-gray-600">Multiple per Zone</span>
                  </div>
                  <div className="bg-gray-100 p-4 rounded-lg text-center col-span-2 md:col-span-3">
                    <strong className="block text-gray-900">Parishes</strong>
                    <span className="text-sm text-gray-600">Multiple per Area</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-[#29156C] py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Join Our Family</h2>
          <p className="text-white/80 mb-8 max-w-2xl mx-auto">
            Experience the difference of being part of a vibrant, life-giving community.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center px-8 py-3 bg-white text-[#29156C] rounded-full font-semibold hover:bg-gray-100 transition-all duration-300"
          >
            Get in Touch
          </Link>
        </div>
      </section>
    </div>
  );
}