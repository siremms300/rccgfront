'use client';

import { useEffect, useState } from 'react';
import { Users, Building2, Calendar, BookOpen } from 'lucide-react';

interface Stat {
  icon: typeof Users;
  label: string;
  value: number;
  suffix?: string;
}

const stats: Stat[] = [
  { icon: Users, label: 'Active Members', value: 5000, suffix: '+' },
  { icon: Building2, label: 'Parishes', value: 50, suffix: '+' },
  { icon: Calendar, label: 'Annual Events', value: 100, suffix: '+' },
  { icon: BookOpen, label: 'Teachings', value: 1000, suffix: '+' },
];

export default function StatsSection() {
  const [counts, setCounts] = useState(stats.map(() => 0));

  useEffect(() => {
    const duration = 2000;
    const stepTime = 20;
    
    stats.forEach((stat, index) => {
      const steps = duration / stepTime;
      const increment = stat.value / steps;
      let current = 0;
      
      const timer = setInterval(() => {
        current += increment;
        if (current >= stat.value) {
          setCounts(prev => {
            const newCounts = [...prev];
            newCounts[index] = stat.value;
            return newCounts;
          });
          clearInterval(timer);
        } else {
          setCounts(prev => {
            const newCounts = [...prev];
            newCounts[index] = Math.floor(current);
            return newCounts;
          });
        }
      }, stepTime);
    });
  }, []);

  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white shadow-md mb-4">
                  <Icon className="w-8 h-8 text-[#0EBC5F]" />
                </div>
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {counts[index].toLocaleString()}{stat.suffix}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}