import { LucideIcon } from 'lucide-react';
import Link from 'next/link';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  link: string;
  color?: string;
}

export default function FeatureCard({ icon: Icon, title, description, link, color = '#0EBC5F' }: FeatureCardProps) {
  return (
    <Link href={link} className="group block">
      <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-300 group-hover:scale-110" style={{ backgroundColor: `${color}10` }}>
          <Icon className="w-7 h-7" style={{ color }} />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#0EBC5F] transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 leading-relaxed">
          {description}
        </p>
        <div className="mt-4 flex items-center text-sm font-medium" style={{ color }}>
          Learn more →
        </div>
      </div>
    </Link>
  );
}