'use client';

import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { BookOpen, Calendar, Users, Heart, TrendingUp, Eye, Download } from 'lucide-react';
import Link from 'next/link';
import { teachingAPI, eventAPI, prayerAPI, userAPI } from '@/lib/api';

interface DashboardStats {
  totalTeachings: number;
  totalEvents: number;
  totalUsers: number;
  totalPrayers: number;
  recentTeachings: any[];
  upcomingEvents: any[];
}

export default function DashboardOverview() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalTeachings: 0,
    totalEvents: 0,
    totalUsers: 0,
    totalPrayers: 0,
    recentTeachings: [],
    upcomingEvents: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [teachingsRes, eventsRes, prayersRes, usersRes] = await Promise.all([
        teachingAPI.getAll({ limit: 5 }),
        eventAPI.getAll({ upcoming: true, limit: 5 }),
        prayerAPI.getAll({ limit: 5 }),
        userAPI.getAll({ limit: 1 }),
      ]);

      setStats({
        totalTeachings: teachingsRes.data.pagination?.total || 0,
        totalEvents: eventsRes.data.pagination?.total || 0,
        totalUsers: usersRes.data.pagination?.total || 0,
        totalPrayers: prayersRes.data.pagination?.total || 0,
        recentTeachings: teachingsRes.data.teachings || [],
        upcomingEvents: eventsRes.data.events || [],
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Teachings',
      value: stats.totalTeachings,
      icon: BookOpen,
      color: 'bg-blue-500',
      link: '/dashboard/teachings',
    },
    {
      title: 'Upcoming Events',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'bg-green-500',
      link: '/dashboard/events',
    },
    {
      title: 'Total Members',
      value: stats.totalUsers,
      icon: Users,
      color: 'bg-purple-500',
      link: '/dashboard/users',
    },
    {
      title: 'Prayer Requests',
      value: stats.totalPrayers,
      icon: Heart,
      color: 'bg-red-500',
      link: '/dashboard/prayers',
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0EBC5F]"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.name}! 👋
        </h1>
        <p className="text-gray-600">
          Here's what's happening with your church today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.title}
              href={stat.link}
              className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <TrendingUp className="w-5 h-5 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900">{stat.value.toLocaleString()}</h3>
              <p className="text-gray-600 text-sm">{stat.title}</p>
            </Link>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Teachings */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Teachings</h2>
            <Link href="/dashboard/teachings" className="text-sm text-[#0EBC5F] hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {stats.recentTeachings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No teachings yet</p>
            ) : (
              stats.recentTeachings.map((teaching: any) => (
                <div key={teaching._id} className="flex items-center justify-between py-2 border-b">
                  <div>
                    <h3 className="font-medium text-gray-900">{teaching.title}</h3>
                    <p className="text-sm text-gray-500">{teaching.speaker}</p>
                  </div>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <Eye className="w-4 h-4" />
                    <span>{teaching.views}</span>
                    <Download className="w-4 h-4 ml-2" />
                    <span>{teaching.downloads}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Upcoming Events</h2>
            <Link href="/dashboard/events" className="text-sm text-[#0EBC5F] hover:underline">
              View All
            </Link>
          </div>
          <div className="space-y-4">
            {stats.upcomingEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No upcoming events</p>
            ) : (
              stats.upcomingEvents.map((event: any) => (
                <div key={event._id} className="py-2 border-b">
                  <h3 className="font-medium text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-500">
                    {new Date(event.startDate).toLocaleDateString()} • {event.venue}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}