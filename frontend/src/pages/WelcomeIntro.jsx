import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    MapPin,
    X,
    GraduationCap,
} from 'lucide-react';

import hitas from '../assets/hitas.png';
const allUniversities = [
    {
        id: 1,
        name: 'HITAS — SOA INDIA',
        country: 'India',
        city: 'Bhubaneswar',
        image: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978037/graduate.png',
        lien: 'https://www.soa.ac.in/',
        description: 'Découvrez le campus SOA et la vie quotidienne des étudiants internationaux.',
        media: [
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978037/graduate.png', caption: 'Graduation Ceremony First Promotion-2026' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978040/family.png', caption: 'HITAS Community in India' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978035/gem4.webp', caption: 'SOA University' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978041/president.png', caption: 'The President Of HITAS with Her Graduated Student' },
            { type: 'image', src: hitas, caption: 'Graduation Day (First Promotion)' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788981262/gem5.webp', caption: 'SOA University' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978045/presie.png', caption: 'Special Gift To Hitas President' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978034/gem6.webp', caption: 'SOA University' }
        ]
    },
    {
        id: 2,
        name: 'QUALIFI',
        country: 'United Kingdom',
        city: 'London',
        image: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978041/qua1.png',
        lien: 'https://qualifi.net/',
        description: 'Découvrez les expériences et contenus partagés par les étudiants de la communauté HITAS.',
        media: [
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978041/qua1.png', caption: 'QUALIFI — expérience étudiante' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978042/qua2.png', caption: 'Communauté HITAS' }
        ]
    },
    {
        id: 3,
        name: 'HITAS-ISFATES',
        country: 'Metz (France)',
        city: 'Saarbrücken (Germany)',
        image: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978038/isfa3.png',
        lien: 'https://www.dfhi-isfates.eu/',
        description: 'Découvrez le campus et l’expérience des étudiants HITAS à ISFATES.',
        media: [
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978038/isfa2.png', caption: 'Campus — ISFATES' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978038/isfa3.png', caption: 'Vie étudiante — ISFATES' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978037/isfa1.webp', caption: 'Campus — ISFATES' }
        ]
    },
    {
        id: 4,
        name: 'HITAS — EAH-JENA',
        country: 'Germany',
        city: 'Jena',
        image: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978045/eha2.png',
        lien: 'https://www.eah-jena.de/',
        description: 'Découvrez l’environnement universitaire et la vie des étudiants à EAH Jena.',
        media: [
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978040/eha3.png', caption: 'Campus — EAH Jena' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978039/eha1.webp', caption: 'Vie étudiante — EAH Jena' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978045/eha2.png', caption: 'Vie étudiante — EAH Jena' }
        ]
    },
    {
        id: 5,
        name: 'HITAS — Fachhochschule Dortmund',
        country: 'Germany',
        city: 'Dortmund',
        image: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978042/fah1.webp',
        lien: 'https://www.fh-dortmund.de/',
        description: 'Explorez le campus et découvrez l’expérience des étudiants à Dortmund.',
        media: [
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978042/fah1.webp', caption: 'Campus — Fachhochschule Dortmund' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978042/fah2.webp', caption: 'Vie étudiante — Dortmund' }
        ]
    },
    {
        id: 6,
        name: 'Oxford International Digital Institute',
        country: 'United Kingdom',
        city: 'Oxford',
        image: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978042/oxford1.png',
        lien: 'https://oidigitalinstitute.com/',
        description: 'Découvrez l’environnement académique.',
        media: [
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978042/oxford1.png', caption: 'Oxford International Digital Institute' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978042/oxford1.png', caption: 'Expérience étudiante' }
        ]
    }
];

const WelcomeIntro = () => {
    const navigate = useNavigate();
    const [selectedUniversity, setSelectedUniversity] = useState(null);
    const [activeMedia, setActiveMedia] = useState(0);

    const goToHitas = () => {
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

    const sliderImages = ['https://res.cloudinary.com/dvpqzjpe/image/upload/v1788981262/gem5.webp', 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978041/president.png', 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978042/oxford1.png', 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978040/family.png', 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978038/isfa3.png'];

    return (
        <main className="hitas-page">
            <header className="hitas-header glass-panel">
                <div className="header-inner">
                    <a href="https://hitas.org/" target='_blank' rel="noreferrer" className="hitas-logo">
                        <div className="logo-mark">
                            <GraduationCap size={22} />
                        </div>
                    </a>

                    <nav className="desktop-nav">
                        <a href="#campuses">Campuses</a>
                    </nav>
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
                            className="university-card glass-panel"
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

            {
                selectedUniversity && (
                    <div className="modal-backdrop" onClick={closeUniversity}>
                        <div className="media-modal glass-panel" onClick={(e) => e.stopPropagation()}>
                            <button type="button" className="close-button glass-btn" onClick={closeUniversity}>
                                <X size={20} />
                            </button>

                            <div className="modal-header">
                                <span className="modal-kicker">STUDENT EXPERIENCE</span>
                                <h2><a href={selectedUniversity.lien} target="_blank" rel="noreferrer">{selectedUniversity.name}</a></h2>
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
                                    {selectedUniversity.media.media?.map ? null : selectedUniversity.media.map((media, index) => (
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
                )
            }

            {/* Floating WhatsApp Button */}
            <a
                href="https://whatsapp.com/channel/0029Vaz3MjK8KMqeUyqak146"
                target="_blank"
                rel="noreferrer"
                className="whatsapp-float-btn"
                title="Join our WhatsApp Channel"
            >
                <svg viewBox="0 0 500 500" className="whatsapp-svg-icon" xmlns="http://www.w3.org/2000/svg">
                    <path fill="#25D366" d="M0 250C0 111.929 111.929 0 250 0s250 111.929 250 250-111.929 250-250 250S0 388.071 0 250Z" />
                    <path fill="#FFF" d="M356.541 319.467c-5.596-2.798-33.092-16.322-38.221-18.196-5.129-1.874-8.859-2.798-12.589 2.798-3.729 5.596-14.423 18.196-17.683 21.925-3.26 3.73-6.52 4.192-12.115 1.394-35.795-17.892-59.227-32.11-82.659-71.554-6.223-10.518 6.223-9.76 17.892-32.482 1.874-3.73.937-6.99-.468-9.788-1.405-2.798-12.589-30.344-17.221-41.564-4.524-10.932-9.135-9.444-12.589-9.615-3.26-.164-6.99-.164-10.72-.164s-9.788 1.394-14.893 6.99c-5.105 5.596-19.508 19.061-19.508 46.507 0 27.447 19.977 53.957 22.775 57.687 2.798 3.73 39.317 60.038 95.27 84.148 13.336 5.759 23.738 9.208 31.848 11.789 13.35 4.242 25.495 3.642 35.105 2.206 10.706-1.597 33.092-13.528 37.755-26.586 4.664-13.057 4.664-24.277 3.26-26.586-1.404-2.309-5.129-3.729-10.724-6.526z" />
                </svg>
            </a>

            <footer className="footer glass-panel">
                <div className="footer-brand">
                    <GraduationCap size={16} />
                    <strong><a href='https://hitas.org/' target='_blank' rel="noreferrer">HITAS</a></strong>
                </div>
                <span>Universities & student experiences</span>
                <span>© {new Date().getFullYear()}</span>
            </footer>

            <style>{`
                @import "tailwindcss";

                @layer base {
                  :root {
                    --bg-base: #030712;
                    --surface-glass: rgba(15, 23, 42, 0.65);
                    --border-glass: rgba(255, 255, 255, 0.08);
                    --accent-glow: rgba(56, 189, 248, 0.15);
                  }

                  html,
                  body {
                    overflow-x: hidden;
                    width: 100%;
                    margin: 0;
                    padding: 0;
                    color: #f1f5f9;
                    background-color: var(--bg-base);
                    font-feature-settings: "cv02", "cv03", "cv04", "cv11";
                    -webkit-font-smoothing: antialiased;
                    -moz-osx-font-smoothing: grayscale;
                  }
                }

                /* Modern atmospheric background with organic lighting instead of rigid grids */
                body {
                  background-image:
                    radial-gradient(circle at 80% 10%, rgba(14, 165, 233, 0.12) 0%, transparent 40%),
                    radial-gradient(circle at 10% 90%, rgba(3, 105, 161, 0.18) 0%, transparent 50%),
                    linear-gradient(180deg, #020617 0%, #090d16 50%, #030712 100%);
                  background-attachment: fixed;
                  background-size: cover;
                  background-position: center;
                  position: relative;
                  font-family: 'Inter', sans-serif;
                }

                /* Ambient light leak effect that feels alive and organic */
                body::after {
                  content: "";
                  position: fixed;
                  top: -20vh;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 70vw;
                  height: 50vh;
                  background: radial-gradient(ellipse at center, rgba(56, 189, 248, 0.08) 0%, rgba(14, 165, 233, 0.03) 40%, transparent 70%);
                  pointer-events: none;
                  z-index: 0;
                  filter: blur(60px);
                }

                #root {
                  width: 100%;
                  min-height: 100dvh;
                  overflow-x: hidden;
                  background: transparent;
                  position: relative;
                  z-index: 1;
                }

                /* Custom utility helpers for modern UI cards */
                .glass-panel {
                  background: rgba(15, 23, 42, 0.7);
                  backdrop-filter: blur(16px);
                  -webkit-backdrop-filter: blur(16px);
                  border: 1px solid rgba(255, 255, 255, 0.06);
                  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
                }

                * { box-sizing: border-box; }
                html { scroll-behavior: smooth; }

                .hitas-page { 
                    min-height: 100vh; 
                    overflow-x: hidden; 
                    color: #f1f5f9; 
                    background: transparent;
                }

                .glass-btn {
                    background: rgba(56, 189, 248, 0.1);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(56, 189, 248, 0.25);
                    color: #38bdf8;
                    transition: all 0.25s ease;
                }
                .glass-btn:hover {
                    background: rgba(56, 189, 248, 0.2);
                    border-color: rgba(56, 189, 248, 0.4);
                }

                /* Header */
                .hitas-header {
                    position: sticky; top: 0; z-index: 80;
                }
                .header-inner {
                    width: min(1180px, calc(100% - 40px)); height: 76px; 
                    margin: 0 auto; display: flex; align-items: center; justify-content: space-between;
                }
                .hitas-logo { display: flex; align-items: center; gap: 10px; color: #f1f5f9; text-decoration: none; }
                .logo-mark {
                    width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
                    background: rgba(56, 189, 248, 0.1); border-radius: 10px; border: 1px solid rgba(56, 189, 248, 0.2);
                }
                
                .desktop-nav { display: flex; align-items: center; gap: 24px; }
                .desktop-nav a { color: #94a3b8; text-decoration: none; font-size: 13px; font-weight: 700; transition: color 0.2s; }
                .desktop-nav a:hover { color: #38bdf8; }

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
                    filter: brightness(1.1) contrast(1.05);
                }
                @keyframes slideAnimation {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }

                .hero-overlay-light {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    padding: 60px 20px 40px;
                    z-index: 2;
                    background: linear-gradient(180deg, rgba(3, 7, 18, 0.6) 0%, rgba(3, 7, 18, 0.85) 100%);
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
                    color: #f8fafc;
                    text-transform: uppercase;
                }
                .hero-classic p {
                    color: #94a3b8;
                    font-size: 14px;
                    line-height: 1.6;
                    margin: 0 auto 28px;
                    max-width: 480px;
                    font-weight: 500;
                }
                .hero-action-btn {
                    background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
                    color: #fff;
                    border: 1px solid rgba(255,255,255,0.2);
                    padding: 14px 28px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                    cursor: pointer;
                    box-shadow: 0 10px 25px rgba(2, 132, 199, 0.3);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }
                .hero-action-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 15px 30px rgba(2, 132, 199, 0.45);
                }
                .btn-sub {
                    font-size: 9px;
                    font-weight: 600;
                    opacity: 0.8;
                    margin-bottom: 3px;
                    letter-spacing: normal;
                }

                /* Campuses Container & Grid */
                .campuses-container { width: min(1280px, calc(100% - 40px)); margin: 70px auto 100px; }
                .section-title-wrapper { text-align: center; margin-bottom: 40px; }
                .section-title-wrapper h2 { margin: 0; font-size: 28px; color: #f8fafc; font-weight: 800; letter-spacing: -0.02em; }
                .section-title-wrapper p { margin: 8px 0 0; color: #94a3b8; font-size: 14px; font-weight: 500; }

                .universities-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
                .university-card {
                    border-radius: 24px; overflow: hidden; cursor: pointer;
                    transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
                }
                .university-card:hover { 
                    transform: translateY(-6px); 
                    border-color: rgba(56, 189, 248, 0.4); 
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(56, 189, 248, 0.15);
                }

                .card-image { position: relative; height: 210px; background: #0f172a; }
                .card-image img { width: 100%; height: 100%; object-fit: cover; }
                .image-shade { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 40%, rgba(3, 7, 18, 0.85)); }
                .card-location { position: absolute; left: 14px; bottom: 14px; display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: #e2e8f0; }
                .media-badge { position: absolute; right: 14px; bottom: 14px; display: flex; align-items: center; gap: 5px; padding: 5px 9px; background: rgba(15, 23, 42, 0.75); backdrop-filter: blur(8px); border-radius: 6px; font-size: 10px; font-weight: 700; color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.2); }

                .card-content { padding: 22px; }
                .card-content h3 { margin: 0 0 8px; font-size: 17px; font-weight: 700; color: #f8fafc; }
                .card-content p { margin: 0 0 16px; color: #94a3b8; font-size: 12.5px; line-height: 1.5; min-height: 40px; }
                .card-action { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255, 255, 255, 0.06); padding-top: 14px; color: #38bdf8; font-size: 12px; font-weight: 700; }

                /* Modal */
                .modal-backdrop { position: fixed; inset: 0; z-index: 100; background: rgba(3, 7, 18, 0.8); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; padding: 20px; }
                .media-modal { position: relative; width: min(850px, 100%); border-radius: 24px; overflow: hidden; background: rgba(15, 23, 42, 0.95) !important; border: 1px solid rgba(255, 255, 255, 0.1) !important; }
                .close-button { position: absolute; top: 16px; right: 16px; z-index: 5; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #f8fafc; }
                .modal-header { padding: 24px 24px 16px; }
                .modal-kicker { color: #38bdf8; font-size: 9px; font-weight: 800; letter-spacing: 0.12em; }
                .modal-header h2 { margin: 4px 0 4px; font-size: 22px; }
                .modal-header h2 a { color: #f8fafc; text-decoration: none; }
                .modal-header h2 a:hover { color: #38bdf8; }
                .modal-header p { margin: 0; display: flex; align-items: center; gap: 5px; color: #94a3b8; font-size: 11px; }

                .media-viewer { position: relative; height: 380px; background: #000; }
                .media-viewer img { width: 100%; height: 100%; object-fit: contain; }
                .media-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; z-index: 10; }
                .media-prev { left: 14px; }
                .media-next { right: 14px; }
                .media-counter { position: absolute; bottom: 12px; right: 12px; background: rgba(15, 23, 42, 0.75); padding: 5px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; border: 1px solid rgba(255,255,255,0.1); color: #fff; z-index: 10; }

                .media-info { padding: 14px 24px; }
                .media-info p { margin: 0; color: #e2e8f0; font-size: 12px; font-weight: 600; }
                .media-thumbnails { display: flex; gap: 8px; padding: 0 24px 20px; overflow-x: auto; }
                .thumbnail { width: 64px; height: 46px; border-radius: 6px; border: 1px solid rgba(255, 255, 255, 0.1); overflow: hidden; padding: 0; background: none; cursor: pointer; opacity: 0.5; transition: opacity 0.2s, border-color 0.2s; }
                .thumbnail-active { opacity: 1; border-color: #38bdf8; box-shadow: 0 0 10px rgba(56, 189, 248, 0.4); }
                .thumbnail img { width: 100%; height: 100%; object-fit: cover; }

                /* Floating WhatsApp Button (Bottom Left) */
                .whatsapp-float-btn {
                    position: fixed;
                    bottom: 24px;
                    left: 24px;
                    z-index: 90;
                    width: 52px;
                    height: 52px;
                    background: rgba(15, 23, 42, 0.85);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border: 1px solid rgba(37, 211, 102, 0.3);
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5), 0 0 15px rgba(37, 211, 102, 0.2);
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .whatsapp-float-btn:hover {
                    transform: scale(1.1) translateY(-3px);
                    border-color: rgba(37, 211, 102, 0.7);
                    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.6), 0 0 25px rgba(37, 211, 102, 0.4);
                }
                .whatsapp-svg-icon {
                    width: 30px;
                    height: 30px;
                }

                /* Footer */
                .footer { width: min(1180px, calc(100% - 40px)); margin: 0 auto 40px; padding: 20px 30px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; color: #94a3b8; font-size: 12px; font-weight: 500; }
                .footer-brand { display: flex; align-items: center; gap: 8px; color: #38bdf8; }
                .footer-brand strong { color: #f8fafc; }
                .footer-brand a { color: inherit; text-decoration: none; }

                @media (max-width: 900px) {
                    .universities-grid { grid-template-columns: repeat(2, 1fr); }
                }
                @media (max-width: 600px) {
                    .universities-grid { grid-template-columns: 1fr; }
                    .whatsapp-float-btn { bottom: 16px; left: 16px; width: 46px; height: 46px; }
                    .whatsapp-svg-icon { width: 26px; height: 26px; }
                }
            `}</style>
        </main >
    );
};

export default WelcomeIntro;