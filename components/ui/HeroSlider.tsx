'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  ctaText?: string;
  ctaLink?: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: '/assets/hero1.jpg',
    title: 'Welcome to Digital Church',
    subtitle: 'Oasis of Excellence where lives are transformed through God\'s word',
    ctaText: 'Join Us Today',
    ctaLink: '/about',
  },
  {
    id: 2,
    image: '/assets/hero2.jpg',
    title: 'Experience Divine Presence',
    subtitle: 'Come worship with us and encounter God in a powerful way',
    ctaText: 'Service Times',
    ctaLink: '/about',
  },
  {
    id: 3,
    image: '/assets/hero3.jpg',
    title: 'Growing Together in Faith',
    subtitle: 'Join our fellowship groups and grow spiritually',
    ctaText: 'Explore Groups',
    ctaLink: '/groups',
  },
  {
    id: 4,
    image: '/assets/hero4.jpg',
    title: 'Empowered to Make Impact',
    subtitle: 'Be part of a community making difference in the world',
    ctaText: 'Get Involved',
    ctaLink: '/departments',
  },
];

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      nextSlide();
    }, 6000);
    return () => clearInterval(timer);
  }, [currentSlide]);

  return (
    <div className="relative h-screen w-full overflow-hidden">
      {/* Slides */}
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              priority={index === 0}
              quality={100}
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/50" />
          </div>
          
          {/* Content */}
          <div className="relative z-20 h-full flex items-center justify-center text-center px-4">
            <div className="max-w-4xl mx-auto">
              <h1 
                className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-4 animate-fade-in"
                style={{ animationDelay: '0.2s' }}
              >
                {slide.title}
              </h1>
              <p 
                className="text-lg md:text-xl lg:text-2xl text-white/90 mb-8 max-w-2xl mx-auto animate-fade-in"
                style={{ animationDelay: '0.4s' }}
              >
                {slide.subtitle}
              </p>
              {slide.ctaText && slide.ctaLink && (
                <Link
                  href={slide.ctaLink}
                  className="inline-flex items-center px-8 py-3 bg-white text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105 shadow-lg animate-fade-in"
                  style={{ animationDelay: '0.6s' }}
                >
                  {slide.ctaText}
                </Link>
              )}
            </div>
          </div>
        </div>
      ))}
      
      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 flex items-center justify-center group"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:scale-110 transition-transform" />
      </button>
      
      <button
        onClick={nextSlide}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-30 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-all duration-200 flex items-center justify-center group"
        aria-label="Next slide"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 text-white group-hover:scale-110 transition-transform" />
      </button>
      
      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              if (isTransitioning) return;
              setIsTransitioning(true);
              setCurrentSlide(index);
              setTimeout(() => setIsTransitioning(false), 700);
            }}
            className={`transition-all duration-300 ${
              index === currentSlide
                ? 'w-8 h-2 bg-white rounded-full'
                : 'w-2 h-2 bg-white/50 rounded-full hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}