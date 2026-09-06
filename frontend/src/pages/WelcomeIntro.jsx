import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    MapPin,
    X,
    GraduationCap,
    Menu
} from 'lucide-react';

import hitasLogo from '../assets/hitas_logo.svg';
import gem1 from '../assets/gem1.png';
import gem2 from '../assets/gem2.png';
import gem3 from '../assets/gem3.png';
import gem4 from '../assets/gem4.webp';
import gem5 from '../assets/gem5.webp';

const allUniversities = [
    {
        id: 1,
        name: 'HITAS-ISFATES',
        country: 'Madagascar',
        city: 'Antananarivo',
        image: gem1,
        description: 'Découvrez le campus et l’expérience des étudiants HITAS à ISFATES.',
        media: [
            { type: 'image', src: gem1, caption: 'Campus — ISFATES' },
            { type: 'image', src: gem1, caption: 'Vie étudiante — ISFATES' }
        ]
    },
    {
        id: 2,
        name: 'HITAS — EAH-JENA',
        country: 'Allemagne',
        city: 'Jena',
        image: gem2,
        description: 'Découvrez l’environnement universitaire et la vie des étudiants à EAH Jena.',
        media: [
            { type: 'image', src: gem2, caption: 'Campus — EAH Jena' },
            { type: 'image', src: gem2, caption: 'Vie étudiante — EAH Jena' }
        ]
    },
    {
        id: 3,
        name: 'HITAS — Fachhochschule Dortmund',
        country: 'Allemagne',
        city: 'Dortmund',
        image: gem3,
        description: 'Explorez le campus et découvrez l’expérience des étudiants à Dortmund.',
        media: [
            { type: 'image', src: gem3, caption: 'Campus — Fachhochschule Dortmund' },
            { type: 'image', src: gem3, caption: 'Vie étudiante — Dortmund' }
        ]
    },
    {
        id: 4,
        name: 'HITAS — SOA INDIA',
        country: 'Inde',
        city: 'Bhubaneswar',
        image: gem4,
        description: 'Découvrez le campus SOA et la vie quotidienne des étudiants internationaux.',
        media: [
            { type: 'image', src: gem4, caption: 'Campus — SOA University' },
            { type: 'image', src: gem4, caption: 'Vie étudiante — SOA University' }
        ]
    },
    {
        id: 5,
        name: 'Oxford International Digital Institute',
        country: 'Royaume-Uni',
        city: 'Oxford',
        image: gem5,
        description: 'Découvrez l’environnement académique et les expériences partagées par les étudiants.',
        media: [
            { type: 'image', src: gem5, caption: 'Oxford International Digital Institute' },
            { type: 'image', src: gem5, caption: 'Expérience étudiante' }
        ]
    },
    {
        id: 6,
        name: 'QUALIFI',
        country: 'Royaume-Uni',
        city: 'UK',
        image: gem1,
        description: 'Découvrez les expériences et contenus partagés par les étudiants de la communauté HITAS.',
        media: [
            { type: 'image', src: gem1, caption: 'QUALIFI — expérience étudiante' },
            { type: 'image', src: gem1, caption: 'Communauté HITAS' }
        ]
    }
];

const WelcomeIntro = () => {
    const [selectedUniversity, setSelectedUniversity] = useState(null);
    const [activeMedia, setActiveMedia] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const openUniversity = (university) => {
        setSelectedUniversity(university);
        setActiveMedia(0);
        document.body.style.overflow = 'hidden';
    };

    const closeUniversity = () => {
        setSelectedUniversity(null);
        setActiveMedia(0);
        document.body.style.overflow = '';
    };

    const nextMedia = () => {
        if (!selectedUniversity) return;
        const total = selectedUniversity.media.length;
        setActiveMedia((current) => (current === total - 1 ? 0 : current + 1));
    };

    const previousMedia = () => {
        if (!selectedUniversity) return;
        const total = selectedUniversity.media.length;
        setActiveMedia((current) => (current === 0 ? total - 1 : current - 1));
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!selectedUniversity) return;
            if (event.key === 'Escape') closeUniversity();
            if (event.key === 'ArrowRight') nextMedia();
            if (event.key === 'ArrowLeft') previousMedia();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [selectedUniversity]);

    const sliderImages = [gem1, gem2, gem3, gem4, gem5];

    return (
        <main className="hitas-page">
            <header className="hitas-header glass-panel">
                <div className="header-inner">
                    <a href="https://hitas.org/" target='_blank' rel="noreferrer" onClick={() => setMobileMenuOpen(false)} className="hitas-logo-container">
                        <img src={hitasLogo} alt="Hitas Logo" className="hitas-logo-img" />
                        <div className="logo-text-group">
                            <span className="logo-title">Hanseatic Institute</span>
                            <span className="logo-subtitle">of Technology and Applied Sciences</span>
                        </div>
                    </a>

                    <nav className="desktop-nav">
                        <a href="#campuses">Campuses</a>
                    </nav>

                    <button
                        type="button"
                        className="mobile-menu-button glass-btn"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Open menu"
                    >
                        {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
                    </button>
                </div>
            </header>

            {/* Hero lumineux, effet verre et slider infini */}
            <section id="top" className="hero-classic">
                <div className="hero-slider-container">
                    <div className="hero-slider-track">
                        {[...sliderImages, ...sliderImages].map((imgSrc, index) => (
                            <div className="hero-slide-item" key={index}>
                                <img src={imgSrc} alt={`Slide ${index}`} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="hero-overlay-light">

                    <span className="hero-subtitle">WELCOME TO</span>
                    <h1>OUR UNIVERSITIES</h1>
                    <p>Choose this network for immersive academic sessions and student life documentation.</p>

                </div>
            </section>

            {/* Grille unifiée de toutes les universités au style des cartes de l'image de référence */}
            <div id="campuses" className="campuses-container">
                <div className="section-title-wrapper">
                    <h2>Nos Campus Partenaires</h2>
                    <p>Explorez l'ensemble de nos établissements à travers le monde.</p>
                </div>

                <div className="universities-grid">
                    {allUniversities.map((university) => (
                        <article
                            key={university.id}
                            className="university-card"
                            onClick={() => openUniversity(university)}
                        >
                            <div className="card-image-box">
                                <img src={university.image} alt={university.name} />
                                <div className="card-location-badge">
                                    <MapPin size={12} />
                                    <span>{university.city}, {university.country}</span>
                                </div>
                                <div className="card-media-count">
                                    <ImageIcon size={12} />
                                    <span>{university.media.length} media</span>
                                </div>
                            </div>
                            <div className="card-content-box">
                                <h3>{university.name}</h3>
                                <p>{university.description}</p>
                                <div className="card-action-link">
                                    <span>View Student Photos & Videos</span>
                                    <ChevronRight size={16} />
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </div>

            {selectedUniversity && (
                <div className="modal-backdrop" onClick={closeUniversity}>
                    <div className="media-modal glass-modal" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="close-button glass-btn" onClick={closeUniversity}>
                            <X size={20} />
                        </button>

                        <div className="modal-header">
                            <span className="modal-kicker">STUDENT EXPERIENCE</span>
                            <h2>{selectedUniversity.name}</h2>
                            <p><MapPin size={13} /> {selectedUniversity.city}, {selectedUniversity.country}</p>
                        </div>

                        <div className="media-viewer">
                            <img
                                src={selectedUniversity.media[activeMedia]?.src}
                                alt={selectedUniversity.media[activeMedia]?.caption}
                            />
                            {selectedUniversity.media.length > 1 && (
                                <>
                                    <button type="button" className="media-nav media-prev glass-btn" onClick={previousMedia}>
                                        <ChevronLeft size={22} />
                                    </button>
                                    <button type="button" className="media-nav media-next glass-btn" onClick={nextMedia}>
                                        <ChevronRight size={22} />
                                    </button>
                                </>
                            )}
                            <div className="media-counter">
                                {activeMedia + 1} / {selectedUniversity.media.length}
                            </div>
                        </div>

                        <div className="media-info">
                            <p>{selectedUniversity.media[activeMedia]?.caption}</p>
                        </div>

                        {selectedUniversity.media.length > 1 && (
                            <div className="media-thumbnails">
                                {selectedUniversity.media.map((media, index) => (
                                    <button
                                        type="button"
                                        key={index}
                                        className={`thumbnail ${index === activeMedia ? 'thumbnail-active' : ''}`}
                                        onClick={() => setActiveMedia(index)}
                                    >
                                        <img src={media.src} alt="" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <footer className="footer glass-panel">
                <div className="footer-brand">
                    <GraduationCap size={16} />
                    <strong><a href='https://hitas.org/' target='_blank' rel="noreferrer">HITAS</a></strong>
                </div>
                <span>Universities & student experiences</span>
                <span>© {new Date().getFullYear()}</span>
            </footer>

            <style>{`
                * { box-sizing: border-box; }
                html { scroll-behavior: smooth; }
                body { margin: 0; background-color: #0c14677; color: #1e293b; font-family: 'Inter', sans-serif; }
                .hitas-page { min-height: 100vh; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); overflow-x: hidden; color: #f8fafc; }

                /* Glassmorphism effet verre habillé */
                .glass-panel {
                    background: rgba(15, 23, 42, 0.65);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border-bottom: 1px solid rgba(148, 163, 184, 0.15);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.2);
                }

                .glass-card-light {
                    background: rgba(30, 41, 59, 0.45);
                    backdrop-filter: blur(14px);
                    -webkit-backdrop-filter: blur(14px);
                    border: 1px solid rgba(148, 163, 184, 0.2);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25);
                }

                .glass-modal {
                    background: rgba(15, 23, 42, 0.88) !important;
                    backdrop-filter: blur(24px) !important;
                    -webkit-backdrop-filter: blur(24px) !important;
                    border: 1px solid rgba(148, 163, 184, 0.25) !important;
                    color: #fff;
                }

                .glass-btn {
                    background: rgba(56, 189, 248, 0.15);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(56, 189, 248, 0.3);
                    color: #f0fdf4;
                    transition: all 0.25s ease;
                }
                .glass-btn:hover {
                    background: rgba(56, 189, 248, 0.3);
                    border-color: rgba(56, 189, 248, 0.5);
                }

                /* Header */
                .hitas-header {
                    position: sticky; top: 0; z-index: 80;
                }
                .header-inner {
                    width: min(1180px, calc(100% - 40px)); height: 76px;
                    margin: 0 auto; display: flex; align-items: center; justify-content: space-between;
                }
                
                /* Logo + Institution name styling from reference */
                .hitas-logo-container {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    text-decoration: none;
                }
                .hitas-logo-img {
                    height: 42px;
                    width: auto;
                    object-fit: contain;
                }
                .logo-text-group {
                    display: flex;
                    flex-direction: column;
                }
                .logo-title {
                    font-size: 14px;
                    font-weight: 800;
                    color: #fff;
                    letter-spacing: 0.03em;
                    line-height: 1.1;
                    text-transform: uppercase;
                }
                .logo-subtitle {
                    font-size: 8.5px;
                    font-weight: 600;
                    color: #38bdf8;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                }
                
                .desktop-nav { display: flex; align-items: center; gap: 24px; }
                .desktop-nav a { color: rgba(241, 245, 249, 0.8); text-decoration: none; font-size: 13px; font-weight: 600; }
                .desktop-nav a:hover { color: #38bdf8; }
                
                .mobile-menu-button { display: none; width: 38px; height: 38px; border-radius: 8px; align-items: center; justify-content: center; cursor: pointer; color: #fff; }

                /* Hero Slider */
                .hero-classic {
                    position: relative;
                    min-height: 580px;
                    overflow: hidden;
                }
                .hero-slider-container {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    overflow: hidden;
                }
                .hero-slider-track {
                    display: flex;
                    width: max-content;
                    height: 100%;
                    animation: slideAnimation 35s linear infinite;
                }
                .hero-slide-item {
                    width: 100vw;
                    min-width: 100vw;
                    height: 100%;
                }
                .hero-slide-item img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    filter: brightness(0.9) contrast(1.05);
                }
                @keyframes slideAnimation {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }

                .hero-overlay-light {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(135deg, rgba(14, 116, 144, 0.35) 0%, rgba(15, 23, 42, 0.6) 100%);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    padding: 60px 20px 40px;
                    z-index: 2;
                }
                .hero-content {
                    max-width: 680px;
                    padding: 45px 35px;
                    border-radius: 24px;
                }
                .hero-subtitle {
                    color: #38bdf8;
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: 0.25em;
                }
                .hero-classic h1 {
                    margin: 12px 0 16px;
                    font-size: clamp(38px, 6vw, 60px);
                    font-weight: 900;
                    letter-spacing: -0.02em;
                    color: #ffffff;
                    text-transform: uppercase;
                    text-shadow: 0 2px 10px rgba(0,0,0,0.3);
                }
                .hero-classic p {
                    color: rgba(241, 245, 249, 0.9);
                    font-size: 14px;
                    line-height: 1.6;
                    margin: 0 auto;
                    max-width: 480px;
                }

                /* Campuses Container & Grid styled matching the reference cards */
                .campuses-container { width: min(1180px, calc(100% - 40px)); margin: 70px auto 100px; }
                .section-title-wrapper { text-align: center; margin-bottom: 40px; }
                .section-title-wrapper h2 { margin: 0; font-size: 28px; color: #fff; font-weight: 800; letter-spacing: -0.02em; }
                .section-title-wrapper p { margin: 8px 0 0; color: rgba(241, 245, 249, 0.6); font-size: 14px; }

                .universities-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
                
                /* Refined card style matching image layout */
                .university-card {
                    background: #ffffff;
                    border-radius: 8px;
                    overflow: hidden;
                    cursor: pointer;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                }
                .university-card:hover { 
                    transform: translateY(-5px); 
                    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
                }

                .card-image-box { 
                    position: relative; 
                    height: 220px; 
                    background: #f1f5f9; 
                }
                .card-image-box img { 
                    width: 100%; 
                    height: 100%; 
                    object-fit: cover; 
                }
                .card-location-badge { 
                    position: absolute; 
                    left: 12px; 
                    bottom: 12px; 
                    display: flex; 
                    align-items: center; 
                    gap: 5px; 
                    font-size: 11px; 
                    font-weight: 600; 
                    color: #fff; 
                    background: rgba(15, 23, 42, 0.75);
                    padding: 4px 8px;
                    border-radius: 4px;
                    backdrop-filter: blur(4px);
                }
                .card-media-count { 
                    position: absolute; 
                    right: 12px; 
                    bottom: 12px; 
                    display: flex; 
                    align-items: center; 
                    gap: 4px; 
                    padding: 4px 8px; 
                    background: rgba(15, 23, 42, 0.75); 
                    backdrop-filter: blur(4px); 
                    border-radius: 4px; 
                    font-size: 10px; 
                    font-weight: 700; 
                    color: #38bdf8; 
                }

                .card-content-box { padding: 22px; background: #ffffff; color: #0f172a; }
                .card-content-box h3 { margin: 0 0 6px; font-size: 17px; font-weight: 800; color: #0f172a; }
                .card-content-box p { margin: 0 0 16px; color: #475569; font-size: 12.5px; line-height: 1.5; min-height: 40px; }
                .card-action-link { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 12px; color: #1e40af; font-size: 12px; font-weight: 700; }

                /* Modal */
                .modal-backdrop { position: fixed; inset: 0; z-index: 100; background: rgba(3, 7, 18, 0.75); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; padding: 20px; }
                .media-modal { position: relative; width: min(850px, 100%); border-radius: 20px; overflow: hidden; }
                .close-button { position: absolute; top: 16px; right: 16px; z-index: 5; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; }
                .modal-header { padding: 24px 24px 16px; }
                .modal-kicker { color: #38bdf8; font-size: 9px; font-weight: 800; letter-spacing: 0.12em; }
                .modal-header h2 { margin: 4px 0 4px; font-size: 22px; }
                .modal-header p { margin: 0; display: flex; align-items: center; gap: 5px; color: rgba(255,255,255,0.6); font-size: 11px; }

                .media-viewer { position: relative; height: 380px; background: #000; }
                .media-viewer img { width: 100%; height: 100%; object-fit: contain; }
                .media-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; }
                .media-prev { left: 14px; }
                .media-next { right: 14px; }
                .media-counter { position: absolute; bottom: 12px; right: 12px; background: rgba(15, 23, 42, 0.75); padding: 5px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; border: 1px solid rgba(255,255,255,0.1); }

                .media-info { padding: 14px 24px; }
                .media-info p { margin: 0; color: rgba(255,255,255,0.8); font-size: 12px; }
                .media-thumbnails { display: flex; gap: 8px; padding: 0 24px 20px; overflow-x: auto; }
                .thumbnail { width: 64px; height: 46px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; padding: 0; background: none; cursor: pointer; opacity: 0.5; }
                .thumbnail-active { opacity: 1; border-color: #38bdf8; box-shadow: 0 0 10px rgba(56,189,248,0.4); }
                .thumbnail img { width: 100%; height: 100%; object-fit: cover; }

                /* Footer */
                .footer { width: min(1180px, calc(100% - 40px)); margin: 0 auto 40px; padding: 20px 30px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; color: rgba(241, 245, 249, 0.5); font-size: 12px; }
                .footer-brand { display: flex; align-items: center; gap: 8px; color: #38bdf8; }
                .footer-brand strong { color: #fff; }
                .footer-brand a { color: inherit; text-decoration: none; }

                @media (max-width: 900px) {
                    .universities-grid { grid-template-columns: repeat(2, 1fr); }
                    .desktop-nav { display: none; }
                    .mobile-menu-button { display: flex; }
                }
                @media (max-width: 600px) {
                    .universities-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </main>
    );
};

export default WelcomeIntro;