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
const allUniversities = [
    {
        id: 1,
        name: 'HITAS-ISFATES',
        country: 'Metz (France)',
        city: 'Saarbrücken (Germany)',
        image: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978038/isfa3.png',
        description: 'Découvrez le campus et l’expérience des étudiants HITAS à ISFATES.',
        media: [
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978038/isfa2.png', caption: 'Campus — ISFATES' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978038/isfa3.png', caption: 'Vie étudiante — ISFATES' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978037/isfa1.webp', caption: 'Campus — ISFATES' }
        ]
    },
    {
        id: 2,
        name: 'HITAS — EAH-JENA',
        country: 'Germany',
        city: 'Jena',
        image: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978045/eha2.png',
        description: 'Découvrez l’environnement universitaire et la vie des étudiants à EAH Jena.',
        media: [
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978040/eha3.png', caption: 'Campus — EAH Jena' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978039/eha1.webp', caption: 'Vie étudiante — EAH Jena' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978045/eha2.png', caption: 'Vie étudiante — EAH Jena' }
        ]
    },
    {
        id: 3,
        name: 'HITAS — Fachhochschule Dortmund',
        country: 'Germany',
        city: 'Dortmund',
        image: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978042/fah1.webp',
        description: 'Explorez le campus et découvrez l’expérience des étudiants à Dortmund.',
        media: [
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978042/fah1.webp', caption: 'Campus — Fachhochschule Dortmund' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978042/fah2.webp', caption: 'Vie étudiante — Dortmund' }
        ]
    },
    {
        id: 4,
        name: 'HITAS — SOA INDIA',
        country: 'India',
        city: 'Bhubaneswar',
        image: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978037/graduate.png',
        description: 'Découvrez le campus SOA et la vie quotidienne des étudiants internationaux.',
        media: [
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978037/graduate.png', caption: 'Campus — SOA University' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978040/family.png', caption: 'Vie étudiante — SOA University' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978035/gem4.webp', caption: 'Vie étudiante — SOA University' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978041/president.png', caption: 'Vie étudiante — SOA University' },
            { type: 'image', src: hitas, caption: 'Vie étudiante — SOA University' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788981262/gem5.webp', caption: 'Vie étudiante — SOA University' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978045/presie.png', caption: 'Vie étudiante — SOA University' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978034/gem6.webp', caption: 'Vie étudiante — SOA University' }
        ]
    },
    {
        id: 5,
        name: 'Oxford International Digital Institute',
        country: 'United Kingdom',
        city: 'Oxford',
        image: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978042/oxford1.png',
        description: 'Découvrez l’environnement académique.',
        media: [
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978042/oxford1.png', caption: 'Oxford International Digital Institute' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978042/oxford1.png', caption: 'Expérience étudiante' }
        ]
    },
    {
        id: 6,
        name: 'QUALIFI',
        country: 'United Kingdom',
        city: 'London',
        image: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978041/qua1.png',
        description: 'Découvrez les expériences et contenus partagés par les étudiants de la communauté HITAS.',
        media: [
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978041/qua1.png', caption: 'QUALIFI — expérience étudiante' },
            { type: 'image', src: 'https://res.cloudinary.com/dvpqzjpe/image/upload/v1788978042/qua2.png', caption: 'Communauté HITAS' }
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
        <main
            className="hitas-page"
        >
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

            {
                selectedUniversity && (
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
                )
            }

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
                body { margin: 0; color: #1e293b; font-family: 'Inter', sans-serif; 
                }
                
                /* Fond amélioré harmonisé avec le dégradé bleu ciel et blanc */
                .hitas-page { 
                    min-height: 100vh; 
                    overflow-x: hidden; 
                    color: #0f172a; 
                    background: linear-gradient(to top, #0284c7 0%, #38bdf8 50%, #ffffff 100%);
                    background-attachment: fixed;
                }

                /* Glassmorphism effet verre habillé ajusté pour la lisibilité */
                .glass-panel {
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border-bottom: 1px solid rgba(56, 189, 248, 0.2);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.08);
                }

                .glass-card-light {
                    background: rgba(255, 255, 255, 0.75);
                    backdrop-filter: blur(14px);
                    -webkit-backdrop-filter: blur(14px);
                    border: 1px solid rgba(56, 189, 248, 0.3);
                    box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.1);
                }

                .glass-modal {
                    background: rgba(255, 255, 255, 0.95) !important;
                    backdrop-filter: blur(24px) !important;
                    -webkit-backdrop-filter: blur(24px) !important;
                    border: 1px solid rgba(56, 189, 248, 0.4) !important;
                    color: #0f172a;
                }

                .glass-btn {
                    background: rgba(2, 132, 199, 0.1);
                    backdrop-filter: blur(8px);
                    border: 1px solid rgba(2, 132, 199, 0.25);
                    color: #0369a1;
                    transition: all 0.25s ease;
                }
                .glass-btn:hover {
                    background: rgba(2, 132, 199, 0.2);
                    border-color: rgba(2, 132, 199, 0.4);
                }

                /* Header */
                .hitas-header {
                    position: sticky; top: 0; z-index: 80;
                        background:
    radial-gradient(circle at 15% 20%,
      rgba(255, 255, 255, 0.95) 0%,
      rgba(255, 255, 255, 0) 35%),
    radial-gradient(circle at 85% 15%,
      rgba(186, 230, 253, 0.9) 0%,
      rgba(186, 230, 253, 0) 32%),
    radial-gradient(circle at 75% 75%,
      rgba(125, 211, 252, 0.75) 0%,
      rgba(125, 211, 252, 0) 38%),
    radial-gradient(circle at 20% 85%,
      rgba(224, 242, 254, 0.9) 0%,
      rgba(224, 242, 254, 0) 35%),
    linear-gradient(135deg,
      #ffffff 0%,
      #e0f2fe 28%,
      #bae6fd 52%,
      #38bdf8 78%,
      #0284c7 100%);
                }
                .header-inner {
                    width: min(1180px, calc(100% - 40px)); height: 76px; 
                    margin: 0 auto; display: flex; align-items: center; justify-content: space-between;
                }
                .hitas-logo { display: flex; align-items: center; gap: 10px; color: #0f172a; text-decoration: none; }
                .logo-mark {
                    width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
                }
                
                .desktop-nav { display: flex; align-items: center; gap: 24px; }
                .desktop-nav a { color: #334155; text-decoration: none; font-size: 13px; font-weight: 700; }
                .desktop-nav a:hover { color: #0284c7; }
                .student-login {
                    padding: 9px 18px; border-radius: 8px;
                    font-size: 12px; font-weight: 700; cursor: pointer; color: #0369a1;
                }

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
                    filter: brightness(1) contrast(1.15) ;
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
                }
                .hero-subtitle {
                    color: #0369a1;
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: 0.25em;
                }
                .hero-classic h1 {
                    margin: 12px 0 16px;
                    font-size: clamp(38px, 6vw, 60px);
                    font-weight: 900;
                    letter-spacing: -0.02em;
                    color: #0f172a;
                    text-transform: uppercase;
                    text-shadow: 0 2px 10px rgba(255,255,255,0.6);
                }
                .hero-classic p {
                    color: #1e293b;
                    font-size: 14px;
                    line-height: 1.6;
                    margin: 0 auto 28px;
                    max-width: 480px;
                    font-weight: 500;
                }
                .hero-action-btn {
                    background: linear-gradient(135deg, #0284c7 0%, #0369a1 100%);
                    color: #fff;
                    border: 1px solid rgba(255,255,255,0.4);
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
                    opacity: 0.9;
                    margin-bottom: 3px;
                    letter-spacing: normal;
                }

                /* Campuses Container & Grid */
                .campuses-container { width: min(1280px, calc(100% - 40px)); margin: 70px auto 100px; }
                .section-title-wrapper { text-align: center; margin-bottom: 40px; }
                .section-title-wrapper h2 { margin: 0; font-size: 28px; color: #0f172a; font-weight: 800; letter-spacing: -0.02em; }
                .section-title-wrapper p { margin: 8px 0 0; color: #334155; font-size: 14px; font-weight: 500; }

                .universities-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
                .university-card {
                    border-radius: 50px; overflow: hidden; cursor: pointer;
                    transition: transform 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
                }
                .university-card:hover { 
                    transform: translateY(-6px); 
                    border-color: rgba(2, 132, 199, 0.6); 
                    box-shadow: 0 12px 40px rgba(2, 132, 199, 0.2);
                }

                .card-image { position: relative; height: 210px; background: #e2e8f0; }
                .card-image img { width: 100%; height: 100%; object-fit: cover; }
                .image-shade { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 40%, rgba(15, 23, 42, 0.75)); }
                .card-location { position: absolute; left: 14px; bottom: 14px; display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: #fff; }
                .media-badge { position: absolute; right: 14px; bottom: 14px; display: flex; align-items: center; gap: 5px; padding: 5px 9px; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(8px); border-radius: 6px; font-size: 10px; font-weight: 700; color: #0369a1; border: 1px solid rgba(2, 132, 199, 0.2); }

                .card-content { padding: 22px; }
                .card-content h3 { margin: 0 0 8px; font-size: 17px; font-weight: 700; color: #0f172a; }
                .card-content p { margin: 0 0 16px; color: #334155; font-size: 12.5px; line-height: 1.5; min-height: 40px; }
                .card-action { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(203, 213, 225, 0.6); padding-top: 14px; color: #0284c7; font-size: 12px; font-weight: 700; }

                /* Modal */
                .modal-backdrop { position: fixed; inset: 0; z-index: 100; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(12px); display: flex; align-items: center; justify-content: center; padding: 20px; }
                .media-modal { position: relative; width: min(850px, 100%); border-radius: 20px; overflow: hidden; }
                .close-button { position: absolute; top: 16px; right: 16px; z-index: 5; width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #0f172a; }
                .modal-header { padding: 24px 24px 16px; }
                .modal-kicker { color: #0284c7; font-size: 9px; font-weight: 800; letter-spacing: 0.12em; }
                .modal-header h2 { margin: 4px 0 4px; font-size: 22px; color: #0f172a; }
                .modal-header p { margin: 0; display: flex; align-items: center; gap: 5px; color: #475569; font-size: 11px; }

                .media-viewer { position: relative; height: 380px; background: #000; }
                .media-viewer img { width: 100%; height: 100%; object-fit: contain; }
                .media-nav { position: absolute; top: 50%; transform: translateY(-50%); width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; color: #fff; }
                .media-prev { left: 14px; }
                .media-next { right: 14px; }
                .media-counter { position: absolute; bottom: 12px; right: 12px; background: rgba(15, 23, 42, 0.75); padding: 5px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; border: 1px solid rgba(255,255,255,0.1); color: #fff; }

                .media-info { padding: 14px 24px; }
                .media-info p { margin: 0; color: #0f172a; font-size: 12px; font-weight: 600; }
                .media-thumbnails { display: flex; gap: 8px; padding: 0 24px 20px; overflow-x: auto; }
                .thumbnail { width: 64px; height: 46px; border-radius: 6px; border: 1px solid rgba(2, 132, 199, 0.3); overflow: hidden; padding: 0; background: none; cursor: pointer; opacity: 0.6; }
                .thumbnail-active { opacity: 1; border-color: #0284c7; box-shadow: 0 0 10px rgba(2, 132, 199, 0.4); }
                .thumbnail img { width: 100%; height: 100%; object-fit: cover; }

                /* Footer */
                .footer { width: min(1180px, calc(100% - 40px)); margin: 0 auto 40px; padding: 20px 30px; border-radius: 16px; display: flex; justify-content: space-between; align-items: center; color: #334155; font-size: 12px; font-weight: 500; }
                .footer-brand { display: flex; align-items: center; gap: 8px; color: #0284c7; }
                .footer-brand strong { color: #0f172a; }
                .footer-brand a { color: inherit; text-decoration: none; }

                @media (max-width: 900px) {
                    .universities-grid { grid-template-columns: repeat(2, 1fr); }
                    .desktop-nav { display: none; }
                }
                @media (max-width: 600px) {
                    .universities-grid { grid-template-columns: 1fr; }
                }
            `}</style>
        </main >
    );
};

export default WelcomeIntro;