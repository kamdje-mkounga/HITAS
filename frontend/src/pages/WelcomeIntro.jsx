import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    MapPin,
    X,
    Video,
    ArrowUpRight,
    GraduationCap,
    Menu,
    BookOpen,
    Users,
    Calendar,
    Award
} from 'lucide-react';

import gem1 from '../assets/gem1.png';
import gem2 from '../assets/gem2.png';
import gem3 from '../assets/gem3.png';
import gem4 from '../assets/gem4.webp';
import gem5 from '../assets/gem5.webp';

const universities = [
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

    useEffect(() => {
        const handleScroll = () => {
            if (mobileMenuOpen) setMobileMenuOpen(false);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [mobileMenuOpen]);

    return (
        <main className="hitas-page">
            <header className="hitas-header">
                <div className="header-inner">
                    <a href="#top" className="hitas-logo" onClick={() => setMobileMenuOpen(false)}>
                        <div className="logo-mark">
                            <GraduationCap size={20} />
                        </div>
                        <div className="logo-text">
                            <strong>HITAS</strong>
                            <span>GLOBAL NETWORK</span>
                        </div>
                    </a>

                    <nav className="desktop-nav">
                        <a href="#top">Home</a>
                        <a href="#features">Academics</a>
                        <a href="#universities">Campuses</a>
                        <a href="#features">Admissions</a>
                        <a href="#features">Gallery</a>
                        <a href="#features">News & Events</a>
                        <a href="#features">Contact</a>
                    </nav>

                    <button type="button" className="enquiry-button" onClick={goToHitas}>
                        Enquiry Now
                    </button>

                    <button
                        type="button"
                        className="mobile-menu-button"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        aria-label="Open menu"
                    >
                        {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="mobile-menu">
                        <a href="#top" onClick={() => setMobileMenuOpen(false)}>Home</a>
                        <a href="#features" onClick={() => setMobileMenuOpen(false)}>Academics</a>
                        <a href="#universities" onClick={() => setMobileMenuOpen(false)}>Campuses</a>
                        <a href="#features" onClick={() => setMobileMenuOpen(false)}>Gallery</a>
                        <button type="button" onClick={goToHitas}>
                            <span>Enquiry Now</span> <ArrowUpRight size={14} />
                        </button>
                    </div>
                )}
            </header>

            <section id="top" className="hero">
                <div className="hero-content">
                    <h1>
                        Inspiring Young Minds,<br />
                        <span className="hero-highlight">Building Bright Futures</span>
                    </h1>
                    <p>
                        Providing a safe, supportive and engaging environment for every student to learn and grow.
                    </p>
                    <div className="hero-actions">
                        <a href="#universities" className="explore-button">
                            About Our School
                        </a>
                        <button type="button" className="hero-student-button" onClick={goToHitas}>
                            Admissions
                        </button>
                    </div>
                </div>
            </section>

            {/* Feature Cards Showcase Section (like the school reference) */}
            <section id="features" className="features-section">
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <BookOpen size={22} />
                        </div>
                        <h3>Academics</h3>
                        <p>Quality education with modern teaching methods and global curricula.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <Users size={22} />
                        </div>
                        <h3>Our Teachers</h3>
                        <p>Experienced, caring, and dedicated educators guiding student success.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <Award size={22} />
                        </div>
                        <h3>Admissions</h3>
                        <p>Simple admission process for parents and straightforward enrollment.</p>
                    </div>

                    <div className="feature-card">
                        <div className="feature-icon-wrapper">
                            <Calendar size={22} />
                        </div>
                        <h3>Events</h3>
                        <p>Stay updated with our latest school events, activities and campus life.</p>
                    </div>
                </div>
            </section>

            <section id="universities" className="universities-section">
                <div className="section-heading">
                    <div className="section-label">
                        <ImageIcon size={14} /> CAMPUS GALLERY
                    </div>
                    <h2>Life across <span>HITAS campuses</span></h2>
                    <p>Select a partner university to explore photos and videos captured by students.</p>
                </div>

                <div className="universities-grid">
                    {universities.map((university, index) => (
                        <article
                            key={university.id}
                            className="university-card"
                            style={{ '--delay': `${index * 70}ms` }}
                            tabIndex={0}
                            role="button"
                            onClick={() => openUniversity(university)}
                            onKeyDown={(event) => {
                                if (event.key === 'Enter' || event.key === ' ') {
                                    event.preventDefault();
                                    openUniversity(university);
                                }
                            }}
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
                                    <span>Student photos & videos</span>
                                    <ChevronRight size={17} />
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            {selectedUniversity && (
                <div className="modal-backdrop" onClick={closeUniversity}>
                    <div className="media-modal" onClick={(event) => event.stopPropagation()}>
                        <button type="button" className="close-button" onClick={closeUniversity} aria-label="Close">
                            <X size={20} />
                        </button>

                        <div className="modal-header">
                            <div>
                                <span className="modal-kicker">STUDENT EXPERIENCE</span>
                                <h2>{selectedUniversity.name}</h2>
                                <p><MapPin size={13} /> {selectedUniversity.city}, {selectedUniversity.country}</p>
                            </div>
                        </div>

                        <div className="media-viewer">
                            {selectedUniversity.media[activeMedia]?.type === 'video' ? (
                                <video src={selectedUniversity.media[activeMedia].src} controls playsInline />
                            ) : (
                                <img
                                    src={selectedUniversity.media[activeMedia]?.src}
                                    alt={selectedUniversity.media[activeMedia]?.caption || selectedUniversity.name}
                                />
                            )}
                            {selectedUniversity.media.length > 1 && (
                                <>
                                    <button type="button" className="media-nav media-prev" onClick={previousMedia} aria-label="Previous">
                                        <ChevronLeft size={22} />
                                    </button>
                                    <button type="button" className="media-nav media-next" onClick={nextMedia} aria-label="Next">
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
                                        key={`${media.src}-${index}`}
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
                    <div className="footer-logo">
                        <GraduationCap size={16} />
                    </div>
                    <strong>HITAS</strong>
                </div>
                <span>Universities & student experiences</span>
                <span>© {new Date().getFullYear()}</span>
            </footer>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

                * {
                    box-sizing: border-box;
                }

                html {
                    scroll-behavior: smooth;
                }

                body {
                    margin: 0;
                    background-color: #f8fafc;
                    color: #0f172a;
                    font-family: 'Inter', sans-serif;
                }

                .hitas-page {
                    min-height: 100vh;
                    background: #f8fafc;
                    color: #0f172a;
                    overflow-x: hidden;
                }

                /* Header Styling */
                .hitas-header {
                    position: sticky;
                    top: 0;
                    z-index: 80;
                    width: 100%;
                    border-bottom: 1px solid #e2e8f0;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(12px);
                }

                .header-inner {
                    width: min(1200px, calc(100% - 48px));
                    height: 80px;
                    margin: 0 auto;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .hitas-logo {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    color: #0f172a;
                    text-decoration: none;
                }

                .logo-mark {
                    width: 40px;
                    height: 40px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    background: #166534;
                    color: #ffffff;
                }

                .logo-text {
                    display: flex;
                    flex-direction: column;
                }

                .logo-text strong {
                    font-size: 16px;
                    line-height: 1.1;
                    color: #0f172a;
                }

                .logo-text span {
                    color: #64748b;
                    font-size: 8px;
                    font-weight: 700;
                    letter-spacing: 0.1em;
                }

                .desktop-nav {
                    display: flex;
                    align-items: center;
                    gap: 28px;
                }

                .desktop-nav > a {
                    color: #334155;
                    text-decoration: none;
                    font-size: 13px;
                    font-weight: 500;
                    transition: color 0.2s ease;
                }

                .desktop-nav > a:hover {
                    color: #166534;
                }

                .enquiry-button {
                    background: #166534;
                    color: #fff;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background 0.2s ease;
                }

                .enquiry-button:hover {
                    background: #14532d;
                }

                .mobile-menu-button {
                    display: none;
                    background: none;
                    border: none;
                    color: #0f172a;
                    cursor: pointer;
                }

                /* Hero Section (Clean Bright Style) */
                .hero {
                    position: relative;
                    min-height: 520px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 90px 24px;
                    background: linear-gradient(180deg, #f0fdf4 0%, #f8fafc 100%),
                                url('https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=2000&q=80') no-repeat center center;
                    background-size: cover;
                    border-bottom: 1px solid #e2e8f0;
                    text-align: center;
                }

                .hero::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: rgba(255, 255, 255, 0.85);
                }

                .hero-content {
                    position: relative;
                    z-index: 2;
                    width: min(850px, 100%);
                }

                .hero h1 {
                    margin: 0;
                    font-size: clamp(40px, 6vw, 64px);
                    line-height: 1.1;
                    font-weight: 800;
                    color: #0f172a;
                    letter-spacing: -0.02em;
                }

                .hero-highlight {
                    color: #166534;
                    display: block;
                    margin-top: 6px;
                }

                .hero p {
                    max-width: 600px;
                    margin: 20px auto 0;
                    color: #475569;
                    font-size: 16px;
                    line-height: 1.6;
                }

                .hero-actions {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 14px;
                    margin-top: 32px;
                }

                .explore-button, .hero-student-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 13px 24px;
                    border-radius: 8px;
                    font-size: 13px;
                    font-weight: 600;
                    cursor: pointer;
                    text-decoration: none;
                    transition: all 0.2s ease;
                }

                .explore-button {
                    background: #1e3a8a;
                    color: #fff;
                    border: none;
                }

                .explore-button:hover {
                    background: #1e40af;
                }

                .hero-student-button {
                    background: #166534;
                    color: #fff;
                    border: none;
                }

                .hero-student-button:hover {
                    background: #14532d;
                }

                /* Feature Showcase Cards (Bright School style floating boxes) */
                .features-section {
                    width: min(1200px, calc(100% - 48px));
                    margin: -50px auto 80px;
                    position: relative;
                    z-index: 10;
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 20px;
                }

                .feature-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 14px;
                    padding: 28px 24px;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .feature-card:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 20px 30px -10px rgba(0, 0, 0, 0.08);
                }

                .feature-icon-wrapper {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: #f0fdf4;
                    color: #166534;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 18px;
                }

                .feature-card h3 {
                    margin: 0 0 8px;
                    font-size: 18px;
                    font-weight: 700;
                    color: #0f172a;
                }

                .feature-card p {
                    margin: 0;
                    color: #64748b;
                    font-size: 13px;
                    line-height: 1.5;
                }

                /* Universities Grid Section */
                .universities-section {
                    width: min(1200px, calc(100% - 48px));
                    margin: 0 auto 100px;
                }

                .section-heading {
                    max-width: 650px;
                    margin-bottom: 48px;
                    text-align: center;
                    margin-left: auto;
                    margin-right: auto;
                }

                .section-label {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    color: #166534;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    margin-bottom: 10px;
                }

                .section-heading h2 {
                    margin: 0;
                    font-size: clamp(32px, 4vw, 42px);
                    font-weight: 800;
                    color: #0f172a;
                }

                .section-heading h2 span {
                    color: #166534;
                }

                .section-heading p {
                    margin: 12px 0 0;
                    color: #64748b;
                    font-size: 14px;
                }

                .universities-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 24px;
                }

                .university-card {
                    background: #ffffff;
                    border: 1px solid #e2e8f0;
                    border-radius: 16px;
                    overflow: hidden;
                    cursor: pointer;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                    outline: none;
                }

                .university-card:hover {
                    transform: translateY(-6px);
                    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.08);
                }

                .card-image {
                    position: relative;
                    height: 220px;
                    background: #f1f5f9;
                }

                .card-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .image-shade {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(180deg, transparent 40%, rgba(15, 23, 42, 0.6));
                }

                .card-location {
                    position: absolute;
                    left: 14px;
                    bottom: 14px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    color: #ffffff;
                    font-size: 12px;
                    font-weight: 600;
                }

                .media-badge {
                    position: absolute;
                    right: 14px;
                    bottom: 14px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    padding: 5px 10px;
                    background: rgba(15, 23, 42, 0.7);
                    backdrop-filter: blur(6px);
                    border-radius: 6px;
                    color: #fff;
                    font-size: 11px;
                    font-weight: 600;
                }

                .card-content {
                    padding: 24px;
                }

                .card-content h3 {
                    margin: 0 0 8px;
                    font-size: 18px;
                    font-weight: 700;
                    color: #0f172a;
                }

                .card-content p {
                    margin: 0 0 18px;
                    color: #64748b;
                    font-size: 13px;
                    line-height: 1.5;
                    min-height: 40px;
                }

                .card-action {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-top: 14px;
                    border-top: 1px solid #f1f5f9;
                    color: #166534;
                    font-size: 13px;
                    font-weight: 600;
                }

                /* Modal Styling */
                .modal-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 100;
                    background: rgba(15, 23, 42, 0.75);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                }

                .media-modal {
                    position: relative;
                    width: min(850px, 100%);
                    background: #ffffff;
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
                }

                .close-button {
                    position: absolute;
                    top: 18px;
                    right: 18px;
                    z-index: 10;
                    background: #f1f5f9;
                    border: none;
                    color: #0f172a;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .close-button:hover {
                    background: #e2e8f0;
                }

                .modal-header {
                    padding: 28px 28px 18px;
                }

                .modal-kicker {
                    color: #166534;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                }

                .modal-header h2 {
                    margin: 6px 0 6px;
                    font-size: 24px;
                    color: #0f172a;
                }

                .modal-header p {
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #64748b;
                    font-size: 13px;
                }

                .media-viewer {
                    position: relative;
                    height: 400px;
                    background: #0f172a;
                }

                .media-viewer img, .media-viewer video {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .media-nav {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(255,255,255,0.8);
                    border: none;
                    color: #0f172a;
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .media-prev { left: 16px; }
                .media-next { right: 16px; }

                .media-counter {
                    position: absolute;
                    bottom: 16px;
                    right: 16px;
                    background: rgba(15, 23, 42, 0.75);
                    color: #fff;
                    padding: 6px 10px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 600;
                }

                .media-info {
                    padding: 18px 28px;
                }

                .media-info p {
                    margin: 0;
                    color: #334155;
                    font-size: 13px;
                }

                .media-thumbnails {
                    display: flex;
                    gap: 10px;
                    padding: 0 28px 28px;
                    overflow-x: auto;
                }

                .thumbnail {
                    width: 70px;
                    height: 48px;
                    border-radius: 8px;
                    border: 2px solid transparent;
                    overflow: hidden;
                    padding: 0;
                    background: none;
                    cursor: pointer;
                    opacity: 0.6;
                    transition: opacity 0.2s ease, border-color 0.2s ease;
                }

                .thumbnail-active {
                    opacity: 1;
                    border-color: #166534;
                }

                .thumbnail img, .thumbnail video {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                /* Footer */
                .footer {
                    width: min(1200px, calc(100% - 48px));
                    margin: 0 auto;
                    padding: 40px 0;
                    border-top: 1px solid #e2e8f0;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    color: #64748b;
                    font-size: 13px;
                }

                .footer-brand {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #0f172a;
                }

                .footer-logo {
                    color: #166534;
                }

                .footer-brand strong {
                    color: #0f172a;
                }

                /* Responsive */
                @media (max-width: 1024px) {
                    .features-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 900px) {
                    .universities-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .desktop-nav {
                        display: none;
                    }
                    .mobile-menu-button {
                        display: flex;
                    }
                    .mobile-menu {
                        position: absolute;
                        top: 80px;
                        left: 0;
                        width: 100%;
                        background: #ffffff;
                        border-bottom: 1px solid #e2e8f0;
                        padding: 24px;
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
                    }
                    .mobile-menu a, .mobile-menu button {
                        color: #0f172a;
                        text-decoration: none;
                        font-weight: 500;
                        background: none;
                        border: none;
                        text-align: left;
                        font-size: 15px;
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }
                }

                @media (max-width: 600px) {
                    .features-grid, .universities-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </main>
    );
};

export default WelcomeIntro;