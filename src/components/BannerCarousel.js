'use client';

import { useState, useEffect } from 'react';
import { getSettings } from '@/app/actions/settings';
import Link from 'next/link';

export default function BannerCarousel() {
    const [slides, setSlides] = useState([]);
    const [currentSlide, setCurrentSlide] = useState(0);

    useEffect(() => {
        getSettings().then(settings => {
            let loadedSlides = [];

            // 1. Try to parse 'banners' JSON array (New System)
            if (settings.banners) {
                try {
                    loadedSlides = JSON.parse(settings.banners);
                } catch (e) { console.error('Error parsing banners:', e); }
            }

            // 2. Fallback/Migration: If no banners array, check for old single banner
            if (loadedSlides.length === 0 && settings.banner_image_url) {
                loadedSlides.push({
                    id: 'legacy',
                    desktop: settings.banner_image_url,
                    mobile: settings.banner_image_mobile_url || null,
                    title: settings.banner_title || '',
                    subtitle: settings.banner_subtitle || '',
                    link: settings.banner_link || '/product/ignite-v50'
                });
            }

            setSlides(loadedSlides);
        });
    }, []);

    // Auto-play
    useEffect(() => {
        if (slides.length <= 1) return;
        const timer = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 5000); // 5 seconds
        return () => clearInterval(timer);
    }, [slides]);

    // Validation
    const hasSlides = slides.length > 0;

    if (!hasSlides) {
        // Fallback Default Hero (Ignite V50)
        return (
            <div style={{ width: '100%', height: 'auto', minHeight: '350px', background: 'linear-gradient(45deg, #111, #333)', position: 'relative', overflow: 'hidden', marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* Default content kept for safety/fallback */}
                <div className="container flex items-center justify-between h-full relative px-6">
                    <div style={{ zIndex: 2, maxWidth: '100%' }}>
                        <h2 className="text-white text-4xl font-bold">Vapor Fumê</h2>
                        <p className="text-gray-300 mt-2">Os melhores produtos do mercado.</p>
                    </div>
                </div>
            </div>
        );
    }

    const banner = slides[currentSlide];

    return (
        <div className="w-full relative overflow-hidden mb-8 group" style={{ height: '450px' }}> {/* Fixed height container */}
            {/* Slides */}
            {slides.map((slide, index) => (
                <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <Link href={slide.link || '#'}>
                        <picture>
                            {slide.mobile && (
                                <source media="(max-width: 768px)" srcSet={slide.mobile} />
                            )}
                            <img
                                src={slide.desktop}
                                alt={slide.title || 'Banner'}
                                className="w-full h-full object-cover"
                            />
                        </picture>
                        {/* Overlay */}
                        {(slide.title || slide.subtitle) && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <div className="text-center text-white p-4 max-w-2xl px-6">
                                    {slide.title && <h2 className="text-3xl md:text-5xl font-extrabold mb-2 drop-shadow-md">{slide.title}</h2>}
                                    {slide.subtitle && <p className="text-lg md:text-xl drop-shadow-sm">{slide.subtitle}</p>}
                                </div>
                            </div>
                        )}
                    </Link>
                </div>
            ))}

            {/* Navigation Dots */}
            {slides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                    {slides.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            className={`w-3 h-3 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'}`}
                        />
                    ))}
                </div>
            )}

            {/* Arrows (Optional, only show on hover) */}
            {slides.length > 1 && (
                <>
                    <button
                        onClick={() => setCurrentSlide(prev => (prev - 1 + slides.length) % slides.length)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
                    >
                        ❮
                    </button>
                    <button
                        onClick={() => setCurrentSlide(prev => (prev + 1) % slides.length)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/30 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/50"
                    >
                        ❯
                    </button>
                </>
            )}
        </div>
    );
}
