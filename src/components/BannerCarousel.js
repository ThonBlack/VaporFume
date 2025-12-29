'use client';

import { useState, useEffect } from 'react';
import { getSettings } from '@/app/actions/settings';
import Link from 'next/link';

export default function BannerCarousel() {
    const [banner, setBanner] = useState(null);

    useEffect(() => {
        getSettings().then(settings => {
            if (settings.banner_image_url) {
                setBanner({
                    image: settings.banner_image_url,
                    title: settings.banner_title || '',
                    subtitle: settings.banner_subtitle || '',
                    link: settings.banner_link || '/product/ignite-v50'
                });
            }
        });
    }, []);

    // Custom Banner
    if (banner) {
        return (
            <div style={{
                width: '100%',
                height: '400px', // Increased height for image
                position: 'relative',
                overflow: 'hidden',
                marginBottom: '32px'
            }}>
                <img
                    src={banner.image}
                    alt="Banner"
                    className="w-full h-full object-cover"
                    style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }}
                />

                {/* Overlay Text */}
                {(banner.title || banner.subtitle) && (
                    <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                        <div className="text-center text-white p-4">
                            {banner.title && (
                                <h2 style={{
                                    fontSize: '3rem',
                                    fontWeight: '800',
                                    lineHeight: 1.1,
                                    textShadow: '0 2px 4px rgba(0,0,0,0.5)'
                                }}>
                                    {banner.title}
                                </h2>
                            )}
                            {banner.subtitle && (
                                <p style={{ fontSize: '1.2rem', marginTop: '10px', textShadow: '0 1px 2px rgba(0,0,0,0.5)' }}>
                                    {banner.subtitle}
                                </p>
                            )}
                            <div className="mt-6">
                                <Link href={banner.link || '#'}>
                                    <button className="btn btn-primary">
                                        Comprar Agora
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // Default Fallback
    return (
        <div style={{
            width: '100%',
            height: 'auto',
            minHeight: '300px',
            background: '#000',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '32px'
        }}>
            {/* Slide 1 - Promo */}
            <div style={{
                width: '100%',
                height: '100%',
                minHeight: '300px',
                background: 'linear-gradient(45deg, #111 0%, #333 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                padding: '20px 0'
            }}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%', position: 'relative' }}>
                    <div style={{ zIndex: 2, maxWidth: '100%' }}>
                        <span style={{
                            background: 'var(--primary)',
                            color: '#000',
                            fontWeight: 'bold',
                            padding: '4px 12px',
                            borderRadius: '4px',
                            fontSize: '0.8rem'
                        }}>
                            NOVIDADE
                        </span>
                        <h2 style={{
                            color: '#fff',
                            fontSize: 'clamp(2rem, 5vw, 3rem)', /* Responsive Font */
                            fontWeight: '800',
                            marginTop: '12px',
                            lineHeight: 1.1
                        }}>
                            IGNITE V50<br />
                            <span style={{ color: 'var(--primary)' }}>JÁ DISPONÍVEL</span>
                        </h2>
                        <p style={{ color: '#ccc', margin: '12px 0', fontSize: '1rem', maxWidth: '300px' }}>
                            A tecnologia mais avançada em Pods Descartáveis.
                        </p>
                        <Link href="/product/ignite-v50">
                            <button className="btn btn-primary">
                                Comprar Agora
                            </button>
                        </Link>
                    </div>

                    {/* Decorative Circle - Hidden on mobile via display: none in media or simple width check logic */}
                    {/* Simplified: Reduced size and opacity */}
                    <div style={{
                        width: '300px',
                        height: '300px',
                        borderRadius: '50%',
                        background: 'var(--primary)',
                        filter: 'blur(80px)',
                        opacity: 0.15,
                        position: 'absolute',
                        right: '-50px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        pointerEvents: 'none'
                    }} />
                </div>
            </div>
        </div>
    );
}
