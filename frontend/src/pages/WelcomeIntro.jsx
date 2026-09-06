import React, { useState, useEffect } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    MapPin,
    Play,
    X,
    Video,
    ArrowUpRight,
    GraduationCap,
    Menu
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
                        <span className="logo-text">HITAS</span>
                    </a>

                    <nav className="desktop-nav">
                        <a href="#home">Home</a>
                        <a href="#universities">Universities</a>
                        <a href="#about">About</a>
                        <button type="button" className="student-login" onClick={goToHitas}>
                            My HITAS <ArrowUpRight size={14} />
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

                {mobileMenuOpen && (
                    <div className="mobile-menu">
                        <a href="#home" onClick={() => setMobileMenuOpen(false)}>Home</a>
                        <a href="#universities" onClick={() => setMobileMenuOpen(false)}>Universities</a>
                        <button type="button" onClick={goToHitas}>
                            <span>My HITAS</span> <ArrowUpRight size={14} />
                        </button>
                    </div>
                )}
            </header>

            <section id="home" className="hero">
                <div className="hero-content">
                    <h1>
                        Global Networks & <br />
                        <span>Student Media</span>
                    </h1>
                    <p>
                        Web Design is a specialisation of the design stream. Explore our partner universities
                        and discover immersive photos and videos captured directly by students from their campuses.
                    </p>
                    <div className="hero-actions">
                        <a href="#universities" className="explore-button">
                            EXPLORE <ChevronRight size={16} />
                        </a>
                        <button type="button" className="hero-student-button" onClick={goToHitas}>
                            STUDENT PORTAL
                        </button>
                    </div>
                </div>
            </section>

            <section id="universities" className="universities-section">
                <div className="section-heading">
                    <div className="section-label">CAMPUS DIRECTORY</div>
                    <h2>Life across <span>HITAS campuses</span></h2>
                    <p>Select an institution below to browse curated media portfolios.</p>
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
                            </div>

                            <div className="card-content">
                                <h3>{university.name}</h3>
                                <p>{university.description}</p>
                                <div className="card-action">
                                    <span>View Media ({university.media.length})</span>
                                    <ChevronRight size={15} />
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="student-cta">
                <div className="cta-content">
                    <div>
                        <span className="cta-label">ALREADY ENROLLED?</span>
                        <h2>Access your student platform.</h2>
                        <p>Continue to your workspace and engage with your global cohort.</p>
                    </div>
                    <button type="button" className="cta-button" onClick={goToHitas}>
                        JOIN US <ArrowUpRight size={16} />
                    </button>
                </div>
            </section>

            {selectedUniversity && (
                <div className="modal-backdrop" onClick={closeUniversity}>
                    <div className="media-modal" onClick={(event) => event.stopPropagation()}>
                        <button type="button" className="close-button" onClick={closeUniversity} aria-label="Close">
                            <X size={20} />
                        </button>

                        <div className="modal-header">
                            <span className="modal-kicker">{selectedUniversity.country}</span>
                            <h2>{selectedUniversity.name}</h2>
                            <p><MapPin size={13} /> {selectedUniversity.city}, {selectedUniversity.country}</p>
                        </div>

                        <div className="media-viewer">
                            <img
                                src={selectedUniversity.media[activeMedia]?.src}
                                alt={selectedUniversity.media[activeMedia]?.caption || selectedUniversity.name}
                            />
                            {selectedUniversity.media.length > 1 && (
                                <>
                                    <button type="button" className="media-nav media-prev" onClick={previousMedia} aria-label="Previous">
                                        <ChevronLeft size={20} />
                                    </button>
                                    <button type="button" className="media-nav media-next" onClick={nextMedia} aria-label="Next">
                                        <ChevronRight size={20} />
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
                    <strong>HITAS</strong>
                </div>
                <span>Universities & student experiences</span>
                <span>© {new Date().getFullYear()}</span>
            </footer>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

                * {
                    box-sizing: border-box;
                }

                html {
                    scroll-behavior: smooth;
                }

                body {
                    margin: 0;
                    background-color: #0c0f17;
                    color: #f3f4f6;
                    font-family: 'Plus Jakarta Sans', sans-serif;
                }

                .hitas-page {
                    min-height: 100vh;
                    background: linear-gradient(180deg, #0c0f17 0%, #07090e 100%);
                    overflow-x: hidden;
                }

                /* Header */
                .hitas-header {
                    position: sticky;
                    top: 0;
                    z-index: 80;
                    width: 100%;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                    background: rgba(12, 15, 23, 0.85);
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
                    text-decoration: none;
                }

                .logo-text {
                    font-family: 'Instrument Serif', serif;
                    font-size: 28px;
                    letter-spacing: 0.05em;
                    color: #fff;
                }

                .desktop-nav {
                    display: flex;
                    align-items: center;
                    gap: 32px;
                }

                .desktop-nav > a {
                    color: rgba(255, 255, 255, 0.6);
                    text-decoration: none;
                    font-size: 13px;
                    font-weight: 500;
                    transition: color 0.2s ease;
                }

                .desktop-nav > a:hover {
                    color: #f97316;
                }

                .student-login {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 10px 18px;
                    border: 1px solid rgba(249, 115, 22, 0.3);
                    border-radius: 6px;
                    background: transparent;
                    color: #f97316;
                    font-size: 12px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }

                .student-login:hover {
                    background: #f97316;
                    color: #fff;
                }

                .mobile-menu-button {
                    display: none;
                    background: none;
                    border: none;
                    color: #fff;
                    cursor: pointer;
                }

                /* Hero Section */
                .hero {
                    position: relative;
                    min-height: 580px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 100px 24px;
                    background: radial-gradient(circle at 70% 20%, rgba(249, 115, 22, 0.08) 0%, transparent 50%),
                                url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80') no-repeat center center;
                    background-size: cover;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
                }

                .hero::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: rgba(7, 9, 14, 0.88);
                }

                .hero-content {
                    position: relative;
                    z-index: 2;
                    width: min(850px, 100%);
                    text-align: center;
                }

                .hero h1 {
                    margin: 0;
                    font-family: 'Instrument Serif', serif;
                    font-size: clamp(52px, 7vw, 84px);
                    line-height: 0.95;
                    font-weight: 400;
                    letter-spacing: -0.02em;
                }

                .hero h1 span {
                    color: #f97316;
                    font-style: italic;
                }

                .hero p {
                    max-width: 580px;
                    margin: 24px auto 0;
                    color: rgba(255, 255, 255, 0.65);
                    font-size: 15px;
                    line-height: 1.6;
                }

                .hero-actions {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    gap: 16px;
                    margin-top: 36px;
                }

                .explore-button, .hero-student-button, .cta-button {
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 14px 24px;
                    border-radius: 6px;
                    font-size: 12px;
                    font-weight: 700;
                    letter-spacing: 0.05em;
                    cursor: pointer;
                    text-decoration: none;
                    transition: transform 0.2s ease, background 0.2s ease;
                }

                .explore-button {
                    background: #f97316;
                    color: #fff;
                    border: none;
                }

                .explore-button:hover {
                    background: #ea580c;
                }

                .hero-student-button {
                    background: transparent;
                    color: #fff;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                }

                .hero-student-button:hover {
                    border-color: #fff;
                }

                /* Universities Section */
                .universities-section {
                    width: min(1200px, calc(100% - 48px));
                    margin: 0 auto;
                    padding: 100px 0;
                }

                .section-heading {
                    max-width: 600px;
                    margin-bottom: 60px;
                }

                .section-label {
                    color: #f97316;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.15em;
                    margin-bottom: 12px;
                }

                .section-heading h2 {
                    margin: 0;
                    font-family: 'Instrument Serif', serif;
                    font-size: clamp(38px, 5vw, 54px);
                    font-weight: 400;
                    line-height: 1.1;
                }

                .section-heading h2 span {
                    color: #f97316;
                    font-style: italic;
                }

                .section-heading p {
                    margin: 16px 0 0;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 14px;
                }

                .universities-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 28px;
                }

                .university-card {
                    background: #121622;
                    border: 1px solid rgba(255, 255, 255, 0.06);
                    border-radius: 12px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: transform 0.3s ease, border-color 0.3s ease;
                    outline: none;
                }

                .university-card:hover {
                    transform: translateY(-6px);
                    border-color: rgba(249, 115, 22, 0.4);
                }

                .card-image {
                    position: relative;
                    height: 220px;
                }

                .card-image img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .image-shade {
                    position: absolute;
                    inset: 0;
                    background: linear-gradient(180deg, transparent 40%, rgba(18, 22, 34, 0.9));
                }

                .card-location {
                    position: absolute;
                    left: 16px;
                    bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: rgba(255, 255, 255, 0.8);
                    font-size: 12px;
                    font-weight: 500;
                }

                .card-content {
                    padding: 24px;
                }

                .card-content h3 {
                    margin: 0 0 10px;
                    font-size: 18px;
                    font-weight: 600;
                }

                .card-content p {
                    margin: 0 0 20px;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 13px;
                    line-height: 1.5;
                    min-height: 40px;
                }

                .card-action {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-top: 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.06);
                    color: #f97316;
                    font-size: 12px;
                    font-weight: 600;
                }

                /* CTA Banner */
                .student-cta {
                    width: min(1200px, calc(100% - 48px));
                    margin: 0 auto 100px;
                    background: linear-gradient(135deg, #161b2c 0%, #111522 100%);
                    border: 1px solid rgba(249, 115, 22, 0.2);
                    border-radius: 16px;
                    padding: 48px;
                }

                .cta-content {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 32px;
                }

                .cta-label {
                    color: #f97316;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.15em;
                }

                .cta-content h2 {
                    margin: 8px 0 6px;
                    font-family: 'Instrument Serif', serif;
                    font-size: 36px;
                    font-weight: 400;
                }

                .cta-content p {
                    margin: 0;
                    color: rgba(255, 255, 255, 0.5);
                    font-size: 14px;
                }

                .cta-button {
                    background: #f97316;
                    color: #fff;
                    border: none;
                    white-space: nowrap;
                }

                .cta-button:hover {
                    background: #ea580c;
                }

                /* Modal */
                .modal-backdrop {
                    position: fixed;
                    inset: 0;
                    z-index: 100;
                    background: rgba(5, 7, 11, 0.9);
                    backdrop-filter: blur(8px);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 24px;
                }

                .media-modal {
                    position: relative;
                    width: min(850px, 100%);
                    background: #121622;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 16px;
                    overflow: hidden;
                }

                .close-button {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    z-index: 10;
                    background: rgba(0,0,0,0.5);
                    border: 1px solid rgba(255,255,255,0.1);
                    color: #fff;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                }

                .modal-header {
                    padding: 32px 32px 20px;
                }

                .modal-kicker {
                    color: #f97316;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 0.15em;
                }

                .modal-header h2 {
                    margin: 6px 0 6px;
                    font-size: 26px;
                }

                .modal-header p {
                    margin: 0;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: rgba(255,255,255,0.5);
                    font-size: 13px;
                }

                .media-viewer {
                    position: relative;
                    height: 420px;
                    background: #000;
                }

                .media-viewer img {
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                }

                .media-nav {
                    position: absolute;
                    top: 50%;
                    transform: translateY(-50%);
                    background: rgba(0,0,0,0.6);
                    border: 1px solid rgba(255,255,255,0.15);
                    color: #fff;
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
                    background: rgba(0,0,0,0.7);
                    padding: 6px 10px;
                    border-radius: 4px;
                    font-size: 11px;
                    font-weight: 600;
                }

                .media-info {
                    padding: 20px 32px;
                }

                .media-info p {
                    margin: 0;
                    color: rgba(255,255,255,0.7);
                    font-size: 13px;
                }

                .media-thumbnails {
                    display: flex;
                    gap: 10px;
                    padding: 0 32px 32px;
                    overflow-x: auto;
                }

                .thumbnail {
                    width: 70px;
                    height: 48px;
                    border-radius: 6px;
                    border: 1px solid rgba(255,255,255,0.1);
                    overflow: hidden;
                    padding: 0;
                    background: none;
                    cursor: pointer;
                    opacity: 0.5;
                    transition: opacity 0.2s ease, border-color 0.2s ease;
                }

                .thumbnail-active {
                    opacity: 1;
                    border-color: #f97316;
                }

                .thumbnail img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                /* Footer */
                .footer {
                    width: min(1200px, calc(100% - 48px));
                    margin: 0 auto;
                    padding: 40px 0;
                    border-top: 1px solid rgba(255, 255, 255, 0.08);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 12px;
                }

                .footer-brand strong {
                    color: #fff;
                    letter-spacing: 0.05em;
                }

                /* Responsive */
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
                        background: #0c0f17;
                        border-bottom: 1px solid rgba(255,255,255,0.08);
                        padding: 24px;
                        display: flex;
                        flex-direction: column;
                        gap: 16px;
                    }
                    .mobile-menu a, .mobile-menu button {
                        color: #fff;
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
                    .cta-content {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }

                @media (max-width: 600px) {
                    .universities-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </main>
    );
};

export default WelcomeIntro;