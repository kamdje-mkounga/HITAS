import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    MapPin,
    X,
    GraduationCap,
    Menu,
    Users,
    BookOpen,
    Award
} from 'lucide-react';

import gem1 from '../assets/gem1.png';
import gem2 from '../assets/gem2.png';
import gem3 from '../assets/gem3.png';
import gem4 from '../assets/gem4.webp';
import gem5 from '../assets/gem5.webp';

const regions = [
    {
        name: 'Asie & Océan Indien',
        universities: [
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
            }
        ]
    },
    {
        name: 'Europe',
        universities: [
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
        ]
    }
];

const WelcomeIntro = () => {
    const [selectedUniversity, setSelectedUniversity] = useState(null);
    const [activeMedia, setActiveMedia] = useState(0);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const goToHitas = () => {
        window.location.href = 'https://' + 'hitas.vercel.app/login/';
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

    // Liste des images pour le slider d'arrière-plan
    const sliderImages = [gem1, gem2, gem3, gem4, gem5];

    return (
        <main className="hitas-page">
            <header className="hitas-header">
                <div className="header-inner">
                    <a href="#top" className="hitas-logo" onClick={() => setMobileMenuOpen(false)}>
                        <div className="logo-mark">
                            <GraduationCap size={22} />
                        </div>
                        <div className="logo-text">
                            <strong>HITAS</strong>
                            <span>GLOBAL NETWORK</span>
                        </div>
                    </a>

                    <nav className="desktop-nav">
                        <a href="#regions">Campuses</a>
                        <button type="button" className="student-login" onClick={goToHitas}>
                            My HITAS
                        </button>
                    </nav>

                    <button
                        type="button"
                        className="mobile-menu-button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Open menu"
                    >
                        {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
                    </button>
                </div>
            </header>

            {/* Hero avec slider d'images en arrière-plan en boucle infinie */}
            <section id="top" className="hero-classic">
                <div className="hero-slider-container">
                    <div className="hero-slider-track">
                        {/* On double la liste pour créer une boucle fluide sans coupure */}
                        {[...sliderImages, ...sliderImages].map((imgSrc, index) => (
                            <div className="hero-slide-item" key={index}>
                                <img src={imgSrc} alt={`Slide ${index}`} />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="hero-overlay">
                    <div className="hero-content">
                        <span className="hero-subtitle">WELCOME TO</span>
                        <h1>OUR UNIVERSITY</h1>
                        <p>Global Education Theme. Choose this network for immersive academic sessions and student life documentation.</p>
                        <button type="button" className="hero-action-btn" onClick={goToHitas}>
                            ACCESS HITAS NOW
                        </button>
                    </div>


                </div>
            </section>

            {/* Grille des universités par région */}
            <div id="regions" className="regions-container">
                {regions.map((region) => (
                    <section key={region.name} className="region-section">
                        <div className="region-header">
                            <h2>{region.name}</h2>
                        </div>
                        <div className="universities-grid">
                            {region.universities.map((university) => (
                                <article
                                    key={university.id}
                                    className="university-card"
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
                    </section>
                ))}
            </div>

            {selectedUniversity && (
                <div className="modal-backdrop" onClick={closeUniversity}>
                    <div className="media-modal" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="close-button" onClick={closeUniversity}>
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
                                    <button type="button" className="media-nav media-prev" onClick={previousMedia}>
                                        <ChevronLeft size={22} />
                                    </button>
                                    <button type="button" className="media-nav media-next" onClick={nextMedia}>
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

            <footer className="footer">
                <div className="footer-brand">
                    <GraduationCap size={16} />
                    <strong>HITAS</strong>
                </div>
                <span>Universities & student experiences</span>
                <span>© {new Date().getFullYear()}</span>
            </footer>

            <style>{`
                * { box-sizing: border-box; }
                html { scroll-behavior: smooth; }
                body { margin: 0; background-color: #111; color: #fff; font-family: 'Inter', sans-serif; }
                .hitas-page { min-height: 100vh; background: #111; }

                /* Header */
                .hitas-header {
                    position: sticky; top: 0; z-index: 80;
                    border-bottom: 1px solid rgba(255,255,255,0.1);
                    background: rgba(17,17,17,0.9); backdrop-filter: blur(10px);
                }
                .header-inner {
                    width: min(1180px, calc(100% - 40px)); height: 76px;
                    margin: 0 auto; display: flex; align-items: center; justify-content: space-between;
                }
                .hitas-logo { display: flex; align-items: center; gap: 10px; color: #fff; text-decoration: none; }
                .logo-mark {
                    width: 38px; height: 38px; display: flex; align-items: center; justify-content: center;
                    border-radius: 8px; background: #3b82f6; color: #fff;
                }
                .logo-text { display: flex; flex-direction: column; }
                .logo-text strong { font-size: 16px; line-height: 1; }
                .logo-text span { color: rgba(255,255,255,0.4); font-size: 7px; letter-spacing: 0.1em; font-weight: 700; }
                
                .desktop-nav { display: flex; align-items: center; gap: 24px; }
                .desktop-nav a { color: rgba(255,255,255,0.7); text-decoration: none; font-size: 13px; font-weight: 600; }
                .desktop-nav a:hover { color: #3b82f6; }
                .student-login {
                    padding: 9px 18px; border: none; border-radius: 6px;
                    background: #3b82f6; color: #fff; font-size: 12px; font-weight: 700; cursor: pointer;
                    transition: background 0.2s ease;
                }
                .student-login:hover { background: #2563eb; }
                .mobile-menu-button { display: none; background: none; border: none; color: #fff; cursor: pointer; }

                /* Hero Slider styles */
                .hero-classic {
                    position: relative;
                    min-height: 520px;
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
                    animation: slideAnimation 30s linear infinite;
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
                }
                @keyframes slideAnimation {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }

                .hero-overlay {
                    position: absolute;
                    inset: 0;
                    background: rgba(0, 0, 0, 0.65);
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    text-align: center;
                    padding: 60px 20px 40px;
                    z-index: 2;
                }
                .hero-content {
                    max-width: 700px;
                }
                .hero-subtitle {
                    color: #fff;
                    font-size: 13px;
                    font-weight: 700;
                    letter-spacing: 0.2em;
                    opacity: 0.9;
                }
                .hero-classic h1 {
                    margin: 10px 0 15px;
                    font-size: clamp(42px, 7vw, 68px);
                    font-weight: 900;
                    letter-spacing: -0.02em;
                    color: #fff;
                    text-transform: uppercase;
                }
                .hero-classic p {
                    color: rgba(255, 255, 255, 0.75);
                    font-size: 13px;
                    line-height: 1.6;
                    margin: 0 auto 25px;
                    max-width: 480px;
                }
                .hero-action-btn {
                    background: #3b82f6;
                    color: #fff;
                    border: none;
                    padding: 12px 28px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 800;
                    letter-spacing: 0.1em;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }
                .hero-action-btn:hover {
                    background: #2563eb;
                }

                .hero-feature-nodes {
                    display: flex;
                    gap: 16px;
                    margin-top: 50px;
                }
                .feature-node {
                    width: 50px;
                    height: 50px;
                    border-radius: 50%;
                    background: rgba(0, 0, 0, 0.7);
                    border: 2px solid rgba(255, 255, 255, 0.15);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #3b82f6;
                    transition: transform 0.2s ease, border-color 0.2s ease;
                }
                .feature-node:hover {
                    transform: translateY(-4px);
                    border-color: #3b82f6;
                }

                /* Region & University Grid layout */
                .regions-container { width: min(1180px, calc(100% - 40px)); margin: 60px auto 100px; }
                .region-section { margin-bottom: 60px; }
                .region-header { border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 12px; margin-bottom: 24px; }
                .region-header h2 { margin: 0; font-size: 22px; color: #3b82f6; font-weight: 700; letter-spacing: 0.03em; }

                .universities-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
                .university-card {
                    background: #181818; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px;
                    overflow: hidden; cursor: pointer; transition: transform 0.3s ease, border-color 0.3s ease;
                }
                .university-card:hover { transform: translateY(-5px); border-color: rgba(59,130,246,0.5); }

                .card-image { position: relative; height: 210px; background: #000; }
                .card-image img { width: 100%; height: 100%; object-fit: cover; }
                .image-shade { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.85)); }
                .card-location { position: absolute; left: 14px; bottom: 14px; display: flex; align-items: center; gap: 5px; font-size: 11px; font-weight: 600; color: #fff; }
                .media-badge { position: absolute; right: 14px; bottom: 14px; display: flex; align-items: center; gap: 5px; padding: 5px 9px; background: rgba(0,0,0,0.7); backdrop-filter: blur(6px); border-radius: 6px; font-size: 10px; font-weight: 700; color: #3b82f6; }

                .card-content { padding: 22px; }
                .card-content h3 { margin: 0 0 8px; font-size: 17px; font-weight: 700; color: #fff; }
                .card-content p { margin: 0 0 16px; color: rgba(255,255,255,0.5); font-size: 12.5px; line-height: 1.5; min-height: 40px; }
                .card-action { display: flex; align-items: center; justify-content: space-between; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 14px; color: #3b82f6; font-size: 12px; font-weight: 700; }

                /* Modal */
                .modal-backdrop { position: fixed; inset: 0; z-index: 100; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; padding: 20px; }
                .media-modal { position: relative; width: min(850px, 100%); background: #181818; border: 1px solid rgba(255,255,255,0.15); border-radius: 16px; overflow: hidden; }
                .close-button { position: absolute; top: 16px; right: 16px; z-index: 5; background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.2); color: #fff; width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
                .modal-header { padding: 24px 24px 16px; }
                .modal-kicker { color: #3b82f6; font-size: 9px; font-weight: 800; letter-spacing: 0.12em; }
                .modal-header h2 { margin: 4px 0 4px; font-size: 22px; }
                .modal-header p { margin: 0; display: flex; align-items: center; gap: 5px; color: rgba(255,255,255,0.5); font-size: 11px; }

                .media-viewer { position: relative; height: 380px; background: #000; }
                .media-viewer img { width: 100%; height: 100%; object-fit: contain; }
                .media-nav { position: absolute; top: 50%; transform: translateY(-50%); background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.2); color: #fff; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; }
                .media-prev { left: 14px; }
                .media-next { right: 14px; }
                .media-counter { position: absolute; bottom: 12px; right: 12px; background: rgba(0,0,0,0.7); padding: 5px 8px; border-radius: 6px; font-size: 10px; font-weight: 700; }

                .media-info { padding: 14px 24px; }
                .media-info p { margin: 0; color: rgba(255,255,255,0.7); font-size: 12px; }
                .media-thumbnails { display: flex; gap: 8px; padding: 0 24px 20px; overflow-x: auto; }
                .thumbnail { width: 64px; height: 46px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; padding: 0; background: none; cursor: pointer; opacity: 0.5; }
                .thumbnail-active { opacity: 1; border-color: #3b82f6; }
                .thumbnail img { width: 100%; height: 100%; object-fit: cover; }

                /* Footer */
                .footer { width: min(1180px, calc(100% - 40px)); margin: 0 auto; padding: 30px 0; border-top: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; color: rgba(255,255,255,0.4); font-size: 12px; }
                .footer-brand { display: flex; align-items: center; gap: 6px; color: #3b82f6; }
                .footer-brand strong { color: #fff; }

                @media (max-width: 900px) {
                    .universities-grid { grid-template-columns: repeat(2, 1fr); }
                    .desktop-nav { display: none; }
                    .mobile-menu-button { display: flex; }
                }
                @media (max-width: 600px) {
                    .universities-grid { grid-template-columns: 1fr; }
                    .hero-feature-nodes { display: none; }
                }
            `}</style>
        </main>
    );
};

export default WelcomeIntro;