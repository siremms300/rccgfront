'use client';

import { useState, useEffect } from 'react';
import { Users, Heart, Star, BookOpen, Coffee, Music, Mic, Camera, UserPlus, LogIn } from 'lucide-react';
import { groupAPI, departmentAPI } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

interface Group {
  _id: string;
  name: string;
  description: string;
  type: 'natural' | 'department';
  leader: { name: string; email: string };
  members: string[];
  meetingDay?: string;
  meetingTime?: string;
  meetingSchedule?: string;
  location?: string;
  color: string;
  icon?: string;
}

export default function GroupsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'natural' | 'department'>('natural');
  const [groups, setGroups] = useState<Group[]>([]);
  const [departments, setDepartments] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const [groupsRes, deptsRes] = await Promise.all([
        groupAPI.getAll(),
        departmentAPI.getAll(),
      ]);
      setGroups(groupsRes.data.groups);
      setDepartments(deptsRes.data.departments);
    } catch (error) {
      console.error('Error fetching groups:', error);
      toast.error('Failed to load groups');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId: string) => {
    if (!user) {
      toast.error('Please login to join groups');
      return;
    }

    setJoining(groupId);
    try {
      await groupAPI.join(groupId);
      toast.success('Successfully joined the group!');
      fetchGroups();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to join group');
    } finally {
      setJoining(null);
    }
  };

  const handleJoinDepartment = async (deptId: string) => {
    if (!user) {
      toast.error('Please login to join departments');
      return;
    }

    setJoining(deptId);
    try {
      await departmentAPI.addMember(deptId, user.id);
      toast.success('Successfully joined the department!');
      fetchGroups();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to join department');
    } finally {
      setJoining(null);
    }
  };

  const isMember = (members: string[]) => {
    if (!user) return false;
    return members.includes(user.id);
  };

  const getIcon = (iconName?: string) => {
    const icons: Record<string, any> = {
      Users, Heart, Star, BookOpen, Coffee, Music, Mic, Camera, UserPlus
    };
    const Icon = icons[iconName || 'Users'];
    return Icon;
  };

  const displayGroups = activeTab === 'natural' ? groups : departments;

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
              Connect & Grow
            </h1>
            <p className="text-xl text-white/90 max-w-2xl mx-auto animate-fade-in">
              Find your community and discover your purpose
            </p>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <section className="sticky top-16 z-20 bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setActiveTab('natural')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                activeTab === 'natural'
                  ? 'bg-[#0EBC5F] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Natural Groups
            </button>
            <button
              onClick={() => setActiveTab('department')}
              className={`px-6 py-2 rounded-full font-semibold transition-all ${
                activeTab === 'department'
                  ? 'bg-[#0EBC5F] text-white shadow-lg'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Departments
            </button>
          </div>
        </div>
      </section>

      {/* Groups Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          {displayGroups.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No {activeTab === 'natural' ? 'groups' : 'departments'} found</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayGroups.map((group) => {
                const Icon = getIcon(group.icon);
                const userIsMember = isMember(group.members);
                return (
                  <div key={group._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-[#0EBC5F]/10 flex items-center justify-center">
                          <Icon className="w-6 h-6 text-[#0EBC5F]" />
                        </div>
                        {userIsMember && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            Member
                          </span>
                        )}
                      </div>
                      
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{group.name}</h3>
                      <p className="text-gray-600 mb-4">{group.description}</p>
                      
                      <div className="space-y-2 mb-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>Leader: {group.leader?.name || 'TBA'}</span>
                        </div>
                        {group.meetingDay && group.meetingTime && (
                          <div className="flex items-center gap-2">
                            <BookOpen className="w-4 h-4" />
                            <span>{group.meetingDay}s at {group.meetingTime}</span>
                          </div>
                        )}
                        {group.location && (
                          <div className="flex items-center gap-2">
                            <Coffee className="w-4 h-4" />
                            <span>{group.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <UserPlus className="w-4 h-4" />
                          <span>{group.members.length} members</span>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => activeTab === 'natural' 
                          ? handleJoinGroup(group._id) 
                          : handleJoinDepartment(group._id)
                        }
                        disabled={joining === group._id || userIsMember}
                        className={`w-full py-2 rounded-lg font-medium transition-all ${
                          userIsMember
                            ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                            : 'border-2 border-[#0EBC5F] text-[#0EBC5F] hover:bg-[#0EBC5F] hover:text-white'
                        }`}
                      >
                        {joining === group._id ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mx-auto" />
                        ) : userIsMember ? (
                          '✓ Member'
                        ) : (
                          'Join Group'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

























































// 'use client';

// import { useState } from 'react';
// import Image from 'next/image';
// import { Users, Heart, Star, BookOpen, Coffee, Music, Mic, Camera } from 'lucide-react';
// import Link from 'next/link';

// interface Group {
//   id: number;
//   name: string;
//   type: 'natural' | 'department';
//   description: string;
//   icon: any;
//   meetingDay: string;
//   meetingTime: string;
//   color: string;
//   leader: string;
// }

// const naturalGroups: Group[] = [
//   {
//     id: 1,
//     name: 'Excellent Men',
//     type: 'natural',
//     description: 'A fellowship for men to grow in faith, leadership, and purpose.',
//     icon: Users,
//     meetingDay: 'Saturdays',
//     meetingTime: '7:00 AM',
//     color: '#0EBC5F',
//     leader: 'Brother Emmanuel',
//   },
//   {
//     id: 2,
//     name: 'Good Women',
//     type: 'natural',
//     description: 'Empowering women through faith, fellowship, and community impact.',
//     icon: Heart,
//     meetingDay: 'Saturdays',
//     meetingTime: '4:00 PM',
//     color: '#29156C',
//     leader: 'Sister Mary',
//   },
//   {
//     id: 3,
//     name: 'YAYA (Youths & Young Adults)',
//     type: 'natural',
//     description: 'Vibrant community for youths and young adults to connect and grow.',
//     icon: Star,
//     meetingDay: 'Fridays',
//     meetingTime: '5:00 PM',
//     color: '#CB0000',
//     leader: 'Pastor Joshua',
//   },
//   {
//     id: 4,
//     name: 'Elders Forum',
//     type: 'natural',
//     description: 'Wisdom sharing, mentorship, and spiritual guidance.',
//     icon: BookOpen,
//     meetingDay: 'Wednesdays',
//     meetingTime: '10:00 AM',
//     color: '#0EBC5F',
//     leader: 'Deacon Samuel',
//   },
//   {
//     id: 5,
//     name: 'Junior Church',
//     type: 'natural',
//     description: 'Nurturing faith in children and teenagers through engaging programs.',
//     icon: Coffee,
//     meetingDay: 'Sundays',
//     meetingTime: '9:00 AM',
//     color: '#29156C',
//     leader: 'Sister Rachel',
//   },
// ];

// const departments: Group[] = [
//   {
//     id: 6,
//     name: 'Choir',
//     type: 'department',
//     description: 'Leading worship through music and songs of praise.',
//     icon: Music,
//     meetingDay: 'Thursdays',
//     meetingTime: '5:00 PM',
//     color: '#0EBC5F',
//     leader: 'Brother David',
//   },
//   {
//     id: 7,
//     name: 'Ushering',
//     type: 'department',
//     description: 'Creating a welcoming atmosphere for worshippers.',
//     icon: Users,
//     meetingDay: 'Saturdays',
//     meetingTime: '3:00 PM',
//     color: '#29156C',
//     leader: 'Deacon Peter',
//   },
//   {
//     id: 8,
//     name: 'Protocol',
//     type: 'department',
//     description: 'Ensuring order and excellence in church operations.',
//     icon: Heart,
//     meetingDay: 'Sundays',
//     meetingTime: '7:00 AM',
//     color: '#CB0000',
//     leader: 'Sister Deborah',
//   },
//   {
//     id: 9,
//     name: 'Media',
//     type: 'department',
//     description: 'Capturing and sharing God moments through various media.',
//     icon: Camera,
//     meetingDay: 'Saturdays',
//     meetingTime: '2:00 PM',
//     color: '#0EBC5F',
//     leader: 'Brother Michael',
//   },
//   {
//     id: 10,
//     name: 'Technical',
//     type: 'department',
//     description: 'Managing sound, lighting, and technical equipment.',
//     icon: Mic,
//     meetingDay: 'Fridays',
//     meetingTime: '4:00 PM',
//     color: '#29156C',
//     leader: 'Brother Andrew',
//   },
//   {
//     id: 11,
//     name: 'Sunday School',
//     type: 'department',
//     description: 'Teaching and nurturing the next generation.',
//     icon: BookOpen,
//     meetingDay: 'Sundays',
//     meetingTime: '8:00 AM',
//     color: '#CB0000',
//     leader: 'Sister Esther',
//   },
// ];

// export default function GroupsPage() {
//   const [activeTab, setActiveTab] = useState<'natural' | 'department'>('natural');
  
//   const displayedGroups = activeTab === 'natural' ? naturalGroups : departments;

//   return (
//     <div className="pt-16">
//       {/* Hero Section with Image */}
//       <section className="relative h-[60vh] min-h-[500px] w-full overflow-hidden">
//         <div className="absolute inset-0">
//           <Image
//             src="/assets/groups.jpg"
//             alt="Church Groups and Fellowship"
//             fill
//             className="object-cover"
//             priority
//             quality={100}
//           />
//           <div className="absolute inset-0 bg-black/60" />
//         </div>
//         <div className="relative z-10 h-full flex items-center justify-center">
//           <div className="container mx-auto px-4 text-center">
//             <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-fade-in">
//               Connect & Grow
//             </h1>
//             <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto animate-fade-in" style={{ animationDelay: '0.2s' }}>
//               Find your community and discover your purpose through our groups and departments
//             </p>
//           </div>
//         </div>
//       </section>

//       {/* Tabs */}
//       <section className="py-8 bg-white border-b">
//         <div className="container mx-auto px-4">
//           <div className="flex justify-center space-x-4">
//             <button
//               onClick={() => setActiveTab('natural')}
//               className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
//                 activeTab === 'natural'
//                   ? 'bg-[#0EBC5F] text-white shadow-lg'
//                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               Natural Groups
//             </button>
//             <button
//               onClick={() => setActiveTab('department')}
//               className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 ${
//                 activeTab === 'department'
//                   ? 'bg-[#0EBC5F] text-white shadow-lg'
//                   : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
//               }`}
//             >
//               Departments
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* Groups Grid */}
//       <section className="py-20 bg-gray-50">
//         <div className="container mx-auto px-4">
//           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
//             {displayedGroups.map((group) => {
//               const Icon = group.icon;
//               return (
//                 <div
//                   key={group.id}
//                   className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
//                 >
//                   <div className="p-6">
//                     <div className="flex items-center justify-between mb-4">
//                       <div
//                         className="w-12 h-12 rounded-xl flex items-center justify-center"
//                         style={{ backgroundColor: `${group.color}10` }}
//                       >
//                         <Icon className="w-6 h-6" style={{ color: group.color }} />
//                       </div>
//                       <span
//                         className="px-3 py-1 rounded-full text-xs font-medium"
//                         style={{
//                           backgroundColor: `${group.color}10`,
//                           color: group.color,
//                         }}
//                       >
//                         {group.type === 'natural' ? 'Natural Group' : 'Department'}
//                       </span>
//                     </div>
                    
//                     <h3 className="text-xl font-bold mb-2">{group.name}</h3>
//                     <p className="text-gray-600 mb-4">{group.description}</p>
                    
//                     <div className="space-y-2 mb-4">
//                       <div className="flex items-center text-sm text-gray-500">
//                         <Users className="w-4 h-4 mr-2" />
//                         <span>Leader: {group.leader}</span>
//                       </div>
//                       <div className="flex items-center text-sm text-gray-500">
//                         <BookOpen className="w-4 h-4 mr-2" />
//                         <span>{group.meetingDay}s at {group.meetingTime}</span>
//                       </div>
//                     </div>
                    
//                     <button className="w-full py-2 border-2 rounded-lg font-medium transition-all duration-300 hover:bg-[#0EBC5F] hover:text-white hover:border-[#0EBC5F]"
//                       style={{ borderColor: group.color, color: group.color }}
//                     >
//                       Join Group
//                     </button>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </section>

//       {/* Call to Action */}
//       <section className="bg-[#0EBC5F] py-16">
//         <div className="container mx-auto px-4 text-center">
//           <h2 className="text-3xl font-bold text-white mb-4">Ready to Get Involved?</h2>
//           <p className="text-white/90 mb-8 max-w-2xl mx-auto">
//             Join any of our groups or departments and start making a difference today.
//           </p>
//           <button className="inline-flex items-center px-8 py-3 bg-white text-[#0EBC5F] rounded-full font-semibold hover:bg-gray-100 transition-all duration-300">
//             Contact Us to Join
//           </button>
//         </div>
//       </section>
//     </div>
//   );
// }