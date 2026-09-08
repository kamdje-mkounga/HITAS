import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    MapPin,
    X,
    GraduationCap,
    Menu
} from 'lucide-react';

import hitas from '../assets/hitas.png';
import presie from '../assets/presie.png';
import president from '../assets/president.png';
import graduate from '../assets/graduate.png';
import family from '../assets/family.png';
import gem4 from '../assets/gem4.webp';
import gem5 from '../assets/gem5.webp';
import gem6 from '../assets/gem6.webp';
import oxford1 from '../assets/oxford1.png';
import isfa1 from '../assets/isfa1.webp';
import isfa2 from '../assets/isfa2.png';
import isfa3 from '../assets/isfa3.png';
import eha1 from '../assets/eha1.webp';
import eha2 from '../assets/eha2.png';
import eha3 from '../assets/eha3.png';
import qua1 from '../assets/qua1.png';
import qua2 from '../assets/qua2.png';

const allUniversities = [
    {
        id: 1,
        name: 'HITAS-ISFATES',
        country: 'Madagascar',
        city: 'Antananarivo',
        image: isfa3,
        description: 'Découvrez le campus et l’expérience des étudiants HITAS à ISFATES.',
        media: [
            { type: 'image', src: isfa2, caption: 'Campus — ISFATES' },
            { type: 'image', src: isfa3, caption: 'Vie étudiante — ISFATES' },
            { type: 'image', src: isfa1, caption: 'Campus — ISFATES' }
        ]
    },
    {
        id: 2,
        name: 'HITAS — EAH-JENA',
        country: 'Allemagne',
        city: 'Jena',
        image: eha2,
        description: 'Découvrez l’environnement universitaire et la vie des étudiants à EAH Jena.',
        media: [
            { type: 'image', src: presie, caption: 'Campus — EAH Jena' },
            { type: 'image', src: eha1, caption: 'Vie étudiante — EAH Jena' },
            { type: 'image', src: eha2, caption: 'Vie étudiante — EAH Jena' },
            { type: 'image', src: eha3, caption: 'Vie étudiante — EAH Jena' }
        ]
    },
    {
        id: 3,
        name: 'HITAS — Fachhochschule Dortmund',
        country: 'Allemagne',
        city: 'Dortmund',
        image: president,
        description: 'Explorez le campus et découvrez l’expérience des étudiants à Dortmund.',
        media: [
            { type: 'image', src: president, caption: 'Campus — Fachhochschule Dortmund' },
            { type: 'image', src: president, caption: 'Vie étudiante — Dortmund' }
        ]
    },
    {
        id: 4,
        name: 'HITAS — SOA INDIA',
        country: 'Inde',
        city: 'Bhubaneswar',
        image: graduate,
        description: 'Découvrez le campus SOA et la vie quotidienne des étudiants internationaux.',
        media: [
            { type: 'image', src: graduate, caption: 'Campus — SOA University' },
            { type: 'image', src: family, caption: 'Vie étudiante — SOA University' },
            { type: 'image', src: gem4, caption: 'Vie étudiante — SOA University' },
            { type: 'image', src: president, caption: 'Vie étudiante — SOA University' },
            { type: 'image', src: hitas, caption: 'Vie étudiante — SOA University' },
            { type: 'image', src: gem5, caption: 'Vie étudiante — SOA University' },
            { type: 'image', src: presie, caption: 'Vie étudiante — SOA University' },
            { type: 'image', src: gem6, caption: 'Vie étudiante — SOA University' }
        ]
    },
    {
        id: 5,
        name: 'Oxford International Digital Institute',
        country: 'Royaume-Uni',
        city: 'Oxford',
        image: oxford1,
        description: 'Découvrez l’environnement académique.',
        media: [
            { type: 'image', src: oxford1, caption: 'Oxford International Digital Institute' },
            { type: 'image', src: oxford1, caption: 'Expérience étudiante' }
        ]
    },
    {
        id: 6,
        name: 'QUALIFI',
        country: 'Royaume-Uni',
        city: 'UK',
        image: qua1,
        description: 'Découvrez les expériences et contenus partagés par les étudiants de la communauté HITAS.',
        media: [
            { type: 'image', src: qua1, caption: 'QUALIFI — expérience étudiante' },
            { type: 'image', src: qua2, caption: 'Communauté HITAS' }
        ]
    }
];

const WelcomeIntro = () => {
    const navigate = useNavigate();
    const [selectedUniversity, setSelectedUniversity] = useState(null);
    const [activeMedia, setActiveMedia] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const goToHitas = () => {
        // Redirige vers la page de connexion interne de ton application
        navigate('/login');
    };

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

    const presi = () => {
        if (!selectedUniversity) return;
        const total = selectedUniversity.media.length;
        setActiveMedia((current) => (current === 0 ? total - 1 : current - 1));
    };

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (!selectedUniversity) return;
            if (event.key === 'Escape') closeUniversity();
            if (event.key === 'ArrowRight') nextMedia();
            if (event.key === 'ArrowLeft') presi();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [selectedUniversity]);

    const sliderImages = [hitas, gem4, presie, gem5, president, gem6, graduate, family];

    return (
        <main className="hitas-page">
            <header className="hitas-header glass-panel">
                <div className="header-inner">
                    <a href="https://hitas.org/" target='_blank' rel="noreferrer" onClick={() => setMobileMenuOpen(false)} className="hitas-logo">
                        <div className="logo-mark">
                            <GraduationCap size={22} />
                        </div>
                    </a>

                    <nav className="desktop-nav">
                        <a href="#campuses">Campuses</a>
                        <button type="button" className="student-login glass-btn" onClick={goToHitas}>
                            My HITAS
                        </button>
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
                    <h1>OUR UNIVERSITY</h1>
                    <p>Choose this network for immersive academic sessions and student life documentation.</p>
                    <button type="button" className="hero-action-btn" onClick={goToHitas}>
                        <div className="btn-sub">Already a student?</div>
                        ACCESS THE COMMUNITY HITAS NOW
                    </button>
                </div>
            </section>

            {/* Grille unifiée de toutes les universités sans section par région */}
            <div id="campuses" className="campuses-container">
                <div className="section-title-wrapper">
                    <h2>Nos Campus Partenaires</h2>
                    <p>Explorez l'ensemble de nos établissements à travers le monde.</p>
                </div>

                <div className="universities-grid">
                    {allUniversities.map((university) => (
                        <article
                            key={university.id}
                            className="university-card glass-card-light"
                            onClick={() => openUniversity(university)}
                        >
                            <div className="card-image">
                                <img src={university.image} alt={university.name} />
                                <div className="image-shade" />
                                <div className="card-location">
                                    <MapPin size={12} />
                                    <span>{university.city}, {university.country}</span>
                                </div>
                                <div className="media-badge">
                                    <ImageIcon size={12} />
                                    <span>{university.media.length} media</span>
                                </div>
                            </div>
                            <div className="card-content">
                                <h3>{university.name}</h3>
                                <p>{university.description}</p>
                                <div className="card-action">
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
                                    <button type="button" className="media-nav media-prev glass-btn" onClick={presi}>
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
                body { margin: 0; background-color: black; color: #1e293b; font-family: 'Inter', sans-serif; }
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
                .hitas-logo { display: flex; align-items: center; gap: 10px; color: #fff; text-decoration: none; }
                .logo-mark {
                    width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
                    border-radius: 10px; background: rgba(56, 189, 248, 0.8); color: #0f172a;
                    box-shadow: 0 0 15px rgba(56, 189, 248, 0.4);
                }
                
                .desktop-nav { display: flex; align-items: center; gap: 24px; }
                .desktop-nav a { color: rgba(241, 245, 249, 0.8); text-decoration: none; font-size: 13px; font-weight: 600; }
                .desktop-nav a:hover { color: #38bdf8; }
                .student-login {
                    padding: 9px 18px; border-radius: 8px;
                    font-size: 12px; font-weight: 700; cursor: pointer; color: #fff;
                }
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
                    animation: slideAnimation 40s linear infinite;
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
                    filter: brightness(1.0) contrast(1.3) ;
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
                    margin: 0 auto 28px;
                    max-width: 480px;
                }
                .hero-action-btn {
                    background: linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%);
                    color: #fff;
                    border: 1px solid rgba(255,255,255,0.3);
                    padding: 14px 28px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                    cursor: pointer;
                    box-shadow: 0 10px 25px rgba(14, 165, 233, 0.35);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .hero-action-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 30px rgba(14, 165, 233, 0.5);
                }
                .btn-sub {
                    font-size: 9px;
                    font-weight: 500;
                    opacity: 0.85;
                    margin-bottom: 3px;
                    letter-spacing: normal;
                }

                /* Campuses Container & Grid */
                .campuses-container { width: min(1180px, calc(100% - 40px)); margin: 70px auto 100px; }
                .section-title-wrapper { text-align: center; margin-bottom: 40px; }
                .section-title-wrapper h2 { margin: 0; font-size: 28px; color: #fff; font-weight: 800; letter-spacing: -0.02em; }
                .section-title-wrapper p { margin: 8px 0 0; color: rgba(241, 245, 249, 0.6); font-size: 14px; }

                .universities-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
                .university-card {
                    border-radius: 16px; overflow: hidden; cursor: pointer;
                    transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
                }
                .university-card:hover { 
                    transform: translateY(-6px); 
                    border-color: rgba(56, 189, 248, 0.5); 
                    box-shadow: 0 12px 40px rgba(56, 189, 248, 0.15);
                }

                .card-image { position: relative; height: 210px; background: #000; }
                .card-image img { width: 100%; height: 100%; object-fit: cover; }
                .image-shade { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 40%, rgba(15, 23, 42, 0.85)); }
                .card-location { position: absolute; left: 14px; bottom: 14px; display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: #fff; }
                .media-badge { position: absolute; right: 14px; bottom: 14px; display: flex; align-items: center; gap: 5px; padding: 5px 9px; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); border-radius: 6px; font-size: 10px; font-weight: 700; color: #38bdf8; border: 1px solid rgba(255,255,255,0.08); }

                .card-content { padding: 22px; }
                .card-content h3 { margin: 0 0 8px; font-size: 17px; font-weight: 700; color: #fff; }
                .card-content p { margin: 0 0 16px; color: rgba(241, 245, 249, 0.65); font-size: 12.5px; line-height: 1.5; min-height: 40px; }
                .card-action { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(148, 163, 184, 0.15); padding-top: 14px; color: #38bdf8; font-size: 12px; font-weight: 700; }

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