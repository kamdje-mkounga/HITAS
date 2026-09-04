import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    ArrowRight,
    Globe2,
    ShieldCheck,
    GraduationCap,
    MapPin,
    ExternalLink,
    ChevronRight
} from 'lucide-react';

import globalVideo from '../assets/videos/un.mp4';

import gem1 from '../assets/gem1.png';
import gem2 from '../assets/gem2.png';
import gem3 from '../assets/gem3.png';
import gem4 from '../assets/gem4.webp';
import gem5 from '../assets/gem5.webp';

const WelcomeIntro = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);

    const [activeCountry, setActiveCountry] = useState('global');
    const [videoVisible, setVideoVisible] = useState(true);

    const [typedTitle, setTypedTitle] = useState('');
    const [typedSubtitle, setTypedSubtitle] = useState('');

    const fullTitleLine1 = 'Portail officiel de la';
    const fullTitleLine2 = 'communauté HITAS';
    const fullDesc = 'Découvrez les opportunités universitaires, connectez-vous avec la communauté et construisez votre avenir à travers un réseau international.';

    /*
     * ============================================================
     * UNIVERSITIES
     * ============================================================
     * Pour ajouter une nouvelle université plus tard, ajoute
     * simplement un nouvel objet dans ce tableau.
     */
    const universities = [
        {
            id: 1,
            name: 'Université partenaire 01',
            shortName: 'UNIVERSITY 01',
            country: 'Inde',
            city: 'Bhubaneswar',
            image: gem1,
            description: 'Découvrez les programmes académiques et les opportunités offertes aux étudiants internationaux.',
            category: 'Engineering & Technology',
            link: '#'
        },
        {
            id: 2,
            name: 'Université partenaire 02',
            shortName: 'UNIVERSITY 02',
            country: 'Inde',
            city: 'Bhubaneswar',
            image: gem2,
            description: 'Une institution tournée vers l’innovation, la recherche et le développement professionnel.',
            category: 'Technology & Science',
            link: '#'
        },
        {
            id: 3,
            name: 'Université partenaire 03',
            shortName: 'UNIVERSITY 03',
            country: 'Inde',
            city: 'Bhubaneswar',
            image: gem3,
            description: 'Explorez des formations internationales dans un environnement académique dynamique.',
            category: 'Business & Management',
            link: '#'
        },
        {
            id: 4,
            name: 'Université partenaire 04',
            shortName: 'UNIVERSITY 04',
            country: 'Inde',
            city: 'Bhubaneswar',
            image: gem4,
            description: 'Des parcours académiques conçus pour préparer les étudiants aux carrières internationales.',
            category: 'Health & Sciences',
            link: '#'
        },
        {
            id: 5,
            name: 'Université partenaire 05',
            shortName: 'UNIVERSITY 05',
            country: 'Inde',
            city: 'Bhubaneswar',
            image: gem5,
            description: 'Une nouvelle destination académique à découvrir au sein du réseau HITAS.',
            category: 'International Programs',
            link: '#'
        }
    ];

    const countries = [
        { id: 'global', label: 'Global' },
        { id: 'france', label: 'France' },
        { id: 'allemagne', label: 'Allemagne' },
        { id: 'inde', label: 'Inde' },
        { id: 'italie', label: 'Italie' },
        { id: 'cameroun', label: 'Cameroun' },
        { id: 'uk', label: 'UK' },
        { id: 'bresil', label: 'Brésil' }
    ];

    useEffect(() => {
        let i = 0;

        const totalText = `${fullTitleLine1}\n${fullTitleLine2}`;

        const timer = setInterval(() => {
            if (i <= totalText.length) {
                setTypedTitle(totalText.slice(0, i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, 70);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        let j = 0;
        let descTimer;

        const delayTimer = setTimeout(() => {
            descTimer = setInterval(() => {
                if (j <= fullDesc.length) {
                    setTypedSubtitle(fullDesc.slice(0, j));
                    j++;
                } else {
                    clearInterval(descTimer);
                }
            }, 28);
        }, 1600);

        return () => {
            clearTimeout(delayTimer);
            if (descTimer) clearInterval(descTimer);
        };
    }, []);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

        if (mediaQuery.matches && videoRef.current) {
            videoRef.current.pause();
        }
    }, []);

    const handleCountryChange = (country) => {
        if (country.id === activeCountry) return;

        setVideoVisible(false);

        setTimeout(() => {
            setActiveCountry(country.id);

            if (videoRef.current) {
                videoRef.current.currentTime = 0;
                videoRef.current.play().catch(() => { });
            }

            setVideoVisible(true);
        }, 350);
    };

    const handleEnterCommunity = () => {
        navigate('/home');
    };

    const renderTitle = () => {
        const splitIndex = fullTitleLine1.length;

        const part1 = typedTitle.slice(0, splitIndex);
        const part2 = typedTitle.slice(splitIndex).replace('\n', '');

        return (
            <h1 className="hero-title">
                <span>{part1}</span>
                <span className="heading-accent">{part2}</span>
            </h1>
        );
    };

    return (
        <main className="welcome-page">
            <div className="welcome-background">
                <video
                    ref={videoRef}
                    src={globalVideo}
                    className={`welcome-video ${videoVisible ? 'video-visible' : 'video-hidden'}`}
                    autoPlay
                    muted
                    loop
                    playsInline
                />

                <div className="welcome-overlay" />
                <div className="welcome-glow" />
                <div className="welcome-vignette" />
            </div>

            <header className="welcome-header">
                <div className="welcome-brand">
                    <div className="brand-icon">
                        <Globe2 size={17} />
                    </div>

                    <div className="brand-text">
                        <span className="brand-name">HITAS</span>
                        <span className="brand-divider">/</span>
                        <span className="brand-section">COMMUNITY</span>
                    </div>
                </div>

                <div className="secure-badge">
                    <ShieldCheck size={14} />
                    <span>Espace étudiant</span>
                </div>
            </header>

            <section className="hero-section">
                <div className="hero-inner">
                    <div className="eyebrow">
                        <span className="eyebrow-dot" />
                        <span>COMMUNAUTÉ INTERNATIONALE HITAS</span>
                    </div>

                    {renderTitle()}

                    <p className="hero-description">
                        {typedSubtitle}
                    </p>

                    <div className="country-section">
                        <div className="country-heading">
                            <Globe2 size={12} />
                            <span>Explorer les campus</span>
                        </div>

                        <nav className="country-nav">
                            {countries.map((country) => {
                                const isActive = activeCountry === country.id;

                                return (
                                    <button
                                        key={country.id}
                                        type="button"
                                        onClick={() => handleCountryChange(country)}
                                        className={`country-button ${isActive ? 'country-active' : ''}`}
                                    >
                                        {country.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="hero-cta">
                        <button
                            type="button"
                            onClick={handleEnterCommunity}
                            className="main-cta"
                        >
                            <span>Entrer sur la plateforme</span>

                            <span className="cta-arrow">
                                <ArrowRight size={17} />
                            </span>
                        </button>

                        <p className="cta-hint">
                            Votre espace étudiant, au même endroit.
                        </p>
                    </div>
                </div>
            </section>

            <section className="universities-section">
                <div className="section-heading">
                    <div className="section-label">
                        <GraduationCap size={13} />
                        <span>OPPORTUNITÉS ACADÉMIQUES</span>
                    </div>

                    <h2>
                        Découvrez nos
                        <span> universités partenaires</span>
                    </h2>

                    <p>
                        Explorez les établissements qui ouvrent leurs portes
                        aux étudiants de la communauté HITAS.
                    </p>
                </div>

                <div className="universities-grid">
                    {universities.map((university, index) => (
                        <article
                            key={university.id}
                            className="university-card"
                            style={{ '--card-delay': `${index * 90}ms` }}
                        >
                            <div className="university-image-container">
                                <img
                                    src={university.image}
                                    alt={university.name}
                                    className="university-image"
                                />

                                <div className="image-overlay" />

                                <div className="university-number">
                                    0{index + 1}
                                </div>

                                <div className="university-country">
                                    <MapPin size={11} />
                                    <span>
                                        {university.city}, {university.country}
                                    </span>
                                </div>
                            </div>

                            <div className="university-content">
                                <div className="university-category">
                                    {university.category}
                                </div>

                                <h3>
                                    {university.name}
                                </h3>

                                <p>
                                    {university.description}
                                </p>

                                <div className="university-footer">
                                    <span className="discover-text">
                                        Découvrir
                                    </span>

                                    <a
                                        href={university.link}
                                        onClick={(e) => {
                                            if (university.link === '#') {
                                                e.preventDefault();
                                            }
                                        }}
                                        className="discover-button"
                                        aria-label={`Découvrir ${university.name}`}
                                    >
                                        <ChevronRight size={16} />
                                    </a>
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </section>

            <section className="bottom-cta-section">
                <div className="bottom-cta">
                    <div>
                        <span className="bottom-label">
                            HITAS COMMUNITY
                        </span>

                        <h2>
                            Ton avenir commence
                            <span> avec les bonnes opportunités.</span>
                        </h2>

                        <p>
                            Rejoins la plateforme et découvre les opportunités
                            académiques et professionnelles de notre réseau.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleEnterCommunity}
                        className="bottom-button"
                    >
                        Rejoindre HITAS
                        <ArrowRight size={16} />
                    </button>
                </div>
            </section>

            <footer className="welcome-footer">
                <span>HITAS Community</span>
                <span className="footer-separator">•</span>
                <span>Connecter les étudiants. Partout.</span>
            </footer>

            <style>{`
                .welcome-page {
                    position: relative;
                    width: 100%;
                    min-height: 100vh;
                    overflow-x: hidden;
                    color: #ffffff;
                    background: #040510;
                    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                    isolation: isolate;
                }

                .welcome-background {
                    position: fixed;
                    inset: 0;
                    z-index: -10;
                    overflow: hidden;
                    background: #040510;
                }

                .welcome-video {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transform: scale(1.04);
                    transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1);
                }

                .video-visible {
                    opacity: 1;
                }

                .video-hidden {
                    opacity: 0;
                }

                .welcome-overlay {
                    position: absolute;
                    inset: 0;
                    background:
                        linear-gradient(
                            to bottom,
                            rgba(3, 5, 18, 0.82) 0%,
                            rgba(3, 5, 18, 0.38) 30%,
                            rgba(3, 5, 18, 0.72) 65%,
                            rgba(3, 5, 18, 0.97) 100%
                        ),
                        linear-gradient(
                            to right,
                            rgba(3, 5, 18, 0.65),
                            rgba(3, 5, 18, 0.08) 50%,
                            rgba(3, 5, 18, 0.65)
                        );
                }

                .welcome-glow {
                    position: absolute;
                    left: 50%;
                    top: 38%;
                    width: 850px;
                    height: 600px;
                    transform: translate(-50%, -50%);
                    background: radial-gradient(
                        ellipse,
                        rgba(99, 102, 241, 0.16),
                        transparent 68%
                    );
                    pointer-events: none;
                }

                .welcome-vignette {
                    position: absolute;
                    inset: 0;
                    background:
                        radial-gradient(
                            ellipse at center,
                            transparent 25%,
                            rgba(0, 0, 0, 0.28) 70%,
                            rgba(0, 0, 0, 0.62) 100%
                        );
                    pointer-events: none;
                }

                .welcome-header {
                    position: relative;
                    z-index: 20;
                    width: 100%;
                    box-sizing: border-box;
                    padding: 28px clamp(22px, 5vw, 70px);
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    animation: header-enter 0.8s cubic-bezier(0.22, 1, 0.36, 1) both;
                }

                .welcome-brand {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .brand-icon {
                    width: 34px;
                    height: 34px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 10px;
                    background: rgba(255, 255, 255, 0.07);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    backdrop-filter: blur(14px);
                    color: #c4b5fd;
                }

                .brand-text {
                    display: flex;
                    align-items: center;
                }

                .brand-name {
                    color: #ffffff;
                    font-size: 12px;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                }

                .brand-divider {
                    margin: 0 7px;
                    color: rgba(255, 255, 255, 0.25);
                    font-size: 11px;
                }

                .brand-section {
                    color: rgba(255, 255, 255, 0.48);
                    font-size: 10px;
                    font-weight: 650;
                    letter-spacing: 0.1em;
                }

                .secure-badge {
                    display: flex;
                    align-items: center;
                    gap: 7px;
                    padding: 8px 13px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.055);
                    border: 1px solid rgba(255, 255, 255, 0.11);
                    backdrop-filter: blur(15px);
                    color: rgba(255, 255, 255, 0.62);
                    font-size: 10px;
                    font-weight: 650;
                    letter-spacing: 0.02em;
                }

                .secure-badge svg {
                    color: #a78bfa;
                }

                .hero-section {
                    position: relative;
                    z-index: 5;
                    min-height: 720px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    padding: 50px 20px 100px;
                }

                .hero-inner {
                    width: 100%;
                    max-width: 900px;
                    text-align: center;
                    animation: content-enter 1s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both;
                }

                .eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 9px;
                    padding: 7px 13px;
                    margin-bottom: 22px;
                    border-radius: 999px;
                    background: rgba(255, 255, 255, 0.055);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                    backdrop-filter: blur(14px);
                    color: rgba(255, 255, 255, 0.62);
                    font-size: 9px;
                    font-weight: 750;
                    letter-spacing: 0.13em;
                }

                .eyebrow-dot {
                    width: 6px;
                    height: 6px;
                    flex-shrink: 0;
                    border-radius: 50%;
                    background: #a78bfa;
                    box-shadow: 0 0 12px rgba(167, 139, 250, 0.85);
                }

                .hero-title {
                    margin: 0;
                    padding: 0;
                    font-size: clamp(43px, 6.2vw, 78px);
                    line-height: 0.98;
                    letter-spacing: -0.055em;
                    font-weight: 850;
                    color: #ffffff;
                    text-shadow: 0 8px 35px rgba(0, 0, 0, 0.4);
                }

                .hero-title > span:first-child {
                    display: block;
                    min-height: 1em;
                }

                .heading-accent {
                    display: block;
                    margin-top: 8px;
                    color: #c4b5fd;
                    text-shadow: 0 0 45px rgba(139, 92, 246, 0.28);
                    min-height: 1em;
                }

                .hero-description {
                    max-width: 650px;
                    min-height: 52px;
                    margin: 24px auto 0;
                    color: rgba(255, 255, 255, 0.66);
                    font-size: clamp(13px, 1.35vw, 15px);
                    line-height: 1.75;
                    font-weight: 450;
                }

                .country-section {
                    margin-top: 36px;
                }

                .country-heading {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    margin-bottom: 12px;
                    color: rgba(255, 255, 255, 0.38);
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                }

                .country-heading svg {
                    color: rgba(167, 139, 250, 0.75);
                }

                .country-nav {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 7px;
                }

                .country-button {
                    appearance: none;
                    border: 1px solid rgba(255, 255, 255, 0.10);
                    outline: none;
                    padding: 8px 14px;
                    border-radius: 999px;
                    background: rgba(8, 11, 28, 0.40);
                    backdrop-filter: blur(14px);
                    color: rgba(255, 255, 255, 0.57);
                    font-family: inherit;
                    font-size: 10px;
                    font-weight: 700;
                    cursor: pointer;
                    transition:
                        color 0.28s ease,
                        background 0.28s ease,
                        border-color 0.28s ease,
                        transform 0.28s cubic-bezier(0.22, 1, 0.36, 1),
                        box-shadow 0.28s ease;
                }

                .country-button:hover {
                    color: #ffffff;
                    background: rgba(255, 255, 255, 0.08);
                    border-color: rgba(255, 255, 255, 0.18);
                    transform: translateY(-1px);
                }

                .country-button:focus-visible {
                    box-shadow: 0 0 0 2px rgba(167, 139, 250, 0.45);
                }

                .country-active {
                    color: #ffffff;
                    background: rgba(109, 40, 217, 0.72);
                    border-color: rgba(167, 139, 250, 0.68);
                    box-shadow: 0 8px 28px rgba(109, 40, 217, 0.22);
                }

                .country-active:hover {
                    background: rgba(124, 58, 237, 0.78);
                }

                .hero-cta {
                    margin-top: 38px;
                }

                .main-cta {
                    appearance: none;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 15px;
                    min-width: 255px;
                    padding: 13px 14px 13px 21px;
                    border: none;
                    border-radius: 13px;
                    outline: none;
                    background: linear-gradient(
                        135deg,
                        #5b3df5 0%,
                        #7c3aed 55%,
                        #9333ea 100%
                    );
                    color: #ffffff;
                    font-family: inherit;
                    font-size: 12px;
                    font-weight: 750;
                    cursor: pointer;
                    box-shadow: 0 14px 35px rgba(91, 61, 245, 0.28);
                    transition:
                        transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
                        box-shadow 0.3s ease,
                        filter 0.3s ease;
                }

                .main-cta:hover {
                    transform: translateY(-3px);
                    filter: brightness(1.06);
                    box-shadow: 0 20px 48px rgba(91, 61, 245, 0.38);
                }

                .main-cta:active {
                    transform: translateY(-1px);
                }

                .cta-arrow {
                    width: 31px;
                    height: 31px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 9px;
                    background: rgba(255, 255, 255, 0.13);
                    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
                }

                .main-cta:hover .cta-arrow {
                    transform: translateX(3px);
                }

                .cta-hint {
                    margin: 11px 0 0;
                    color: rgba(255, 255, 255, 0.32);
                    font-size: 9px;
                    letter-spacing: 0.02em;
                }

                .universities-section {
                    position: relative;
                    z-index: 10;
                    width: min(1180px, calc(100% - 40px));
                    margin: 0 auto;
                    padding: 70px 0 100px;
                }

                .universities-section::before {
                    content: "";
                    position: absolute;
                    left: 50%;
                    top: 0;
                    width: 80%;
                    height: 1px;
                    transform: translateX(-50%);
                    background: linear-gradient(
                        to right,
                        transparent,
                        rgba(139, 92, 246, 0.45),
                        transparent
                    );
                }

                .section-heading {
                    max-width: 700px;
                    margin: 0 auto 48px;
                    text-align: center;
                }

                .section-label {
                    display: inline-flex;
                    align-items: center;
                    gap: 7px;
                    margin-bottom: 14px;
                    color: #a78bfa;
                    font-size: 9px;
                    font-weight: 800;
                    letter-spacing: 0.16em;
                }

                .section-heading h2 {
                    margin: 0;
                    color: #ffffff;
                    font-size: clamp(30px, 4vw, 48px);
                    line-height: 1.05;
                    letter-spacing: -0.04em;
                    font-weight: 850;
                }

                .section-heading h2 span {
                    color: #a78bfa;
                }

                .section-heading p {
                    max-width: 570px;
                    margin: 17px auto 0;
                    color: rgba(255, 255, 255, 0.48);
                    font-size: 13px;
                    line-height: 1.7;
                }

                .universities-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 22px;
                }

                .university-card {
                    position: relative;
                    overflow: hidden;
                    min-width: 0;
                    border: 1px solid rgba(167, 139, 250, 0.16);
                    border-radius: 22px;
                    background: rgba(8, 9, 25, 0.78);
                    backdrop-filter: blur(18px);
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.22);
                    opacity: 0;
                    animation: card-enter 0.8s cubic-bezier(0.22, 1, 0.36, 1) var(--card-delay) forwards;
                    transition:
                        transform 0.4s cubic-bezier(0.22, 1, 0.36, 1),
                        border-color 0.35s ease,
                        box-shadow 0.35s ease;
                }

                .university-card:hover {
                    transform: translateY(-7px);
                    border-color: rgba(167, 139, 250, 0.42);
                    box-shadow:
                        0 30px 70px rgba(0, 0, 0, 0.34),
                        0 0 35px rgba(99, 102, 241, 0.08);
                }

                .university-image-container {
                    position: relative;
                    height: 220px;
                    overflow: hidden;
                    background: #080918;
                }

                .university-image {
                    width: 100%;
                    height: 100%;
                    display: block;
                    object-fit: cover;
                    transition:
                        transform 0.7s cubic-bezier(0.22, 1, 0.36, 1),
                        filter 0.5s ease;
                }

                .university-card:hover .university-image {
                    transform: scale(1.055);
                    filter: brightness(1.06);
                }

                .image-overlay {
                    position: absolute;
                    inset: 0;
                    background:
                        linear-gradient(
                            to bottom,
                            rgba(3, 5, 18, 0.02) 20%,
                            rgba(3, 5, 18, 0.12) 45%,
                            rgba(3, 5, 18, 0.88) 100%
                        );
                    pointer-events: none;
                }

                .university-number {
                    position: absolute;
                    top: 15px;
                    left: 15px;
                    padding: 6px 9px;
                    border: 1px solid rgba(255, 255, 255, 0.14);
                    border-radius: 8px;
                    background: rgba(3, 5, 18, 0.45);
                    backdrop-filter: blur(10px);
                    color: rgba(255, 255, 255, 0.65);
                    font-size: 9px;
                    font-weight: 800;
                    letter-spacing: 0.08em;
                }

                .university-country {
                    position: absolute;
                    bottom: 14px;
                    left: 15px;
                    display: inline-flex;
                    align-items: center;
                    gap: 5px;
                    color: rgba(255, 255, 255, 0.75);
                    font-size: 9px;
                    font-weight: 650;
                }

                .university-country svg {
                    color: #c4b5fd;
                }

                .university-content {
                    padding: 21px 21px 20px;
                }

                .university-category {
                    margin-bottom: 7px;
                    color: #a78bfa;
                    font-size: 8px;
                    font-weight: 800;
                    letter-spacing: 0.13em;
                    text-transform: uppercase;
                }

                .university-content h3 {
                    margin: 0;
                    color: #ffffff;
                    font-size: 17px;
                    line-height: 1.2;
                    font-weight: 800;
                    letter-spacing: -0.02em;
                }

                .university-content p {
                    min-height: 63px;
                    margin: 10px 0 19px;
                    color: rgba(255, 255, 255, 0.48);
                    font-size: 11px;
                    line-height: 1.7;
                }

                .university-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding-top: 14px;
                    border-top: 1px solid rgba(167, 139, 250, 0.10);
                }

                .discover-text {
                    color: rgba(255, 255, 255, 0.45);
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 0.06em;
                    text-transform: uppercase;
                }

                .discover-button {
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border: 1px solid rgba(167, 139, 250, 0.20);
                    border-radius: 9px;
                    background: rgba(139, 92, 246, 0.08);
                    color: #c4b5fd;
                    transition:
                        background 0.25s ease,
                        border-color 0.25s ease,
                        transform 0.25s ease;
                }

                .discover-button:hover {
                    background: rgba(139, 92, 246, 0.22);
                    border-color: rgba(167, 139, 250, 0.45);
                    transform: translateX(2px);
                }

                .bottom-cta-section {
                    position: relative;
                    z-index: 10;
                    width: min(1180px, calc(100% - 40px));
                    margin: 0 auto;
                    padding: 0 0 90px;
                }

                .bottom-cta {
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    gap: 40px;
                    padding: 42px 45px;
                    border: 1px solid rgba(139, 92, 246, 0.20);
                    border-radius: 25px;
                    background:
                        linear-gradient(
                            120deg,
                            rgba(76, 29, 149, 0.20),
                            rgba(30, 27, 75, 0.42)
                        );
                    backdrop-filter: blur(20px);
                }

                .bottom-cta::before {
                    content: "";
                    position: absolute;
                    width: 400px;
                    height: 300px;
                    right: -120px;
                    top: -160px;
                    border-radius: 50%;
                    background: rgba(139, 92, 246, 0.13);
                    filter: blur(50px);
                    pointer-events: none;
                }

                .bottom-label {
                    color: #a78bfa;
                    font-size: 8px;
                    font-weight: 800;
                    letter-spacing: 0.16em;
                }

                .bottom-cta h2 {
                    max-width: 650px;
                    margin: 9px 0 8px;
                    color: #ffffff;
                    font-size: clamp(24px, 3vw, 37px);
                    line-height: 1.08;
                    letter-spacing: -0.035em;
                }

                .bottom-cta h2 span {
                    color: #a78bfa;
                }

                .bottom-cta p {
                    max-width: 580px;
                    margin: 0;
                    color: rgba(255, 255, 255, 0.45);
                    font-size: 11px;
                    line-height: 1.7;
                }

                .bottom-button {
                    position: relative;
                    z-index: 2;
                    flex-shrink: 0;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    padding: 13px 17px;
                    border: 1px solid rgba(167, 139, 250, 0.25);
                    border-radius: 12px;
                    background: rgba(139, 92, 246, 0.15);
                    color: #ffffff;
                    font-family: inherit;
                    font-size: 10px;
                    font-weight: 750;
                    cursor: pointer;
                    transition:
                        transform 0.3s ease,
                        background 0.3s ease,
                        border-color 0.3s ease;
                }

                .bottom-button:hover {
                    transform: translateY(-2px);
                    background: rgba(139, 92, 246, 0.28);
                    border-color: rgba(167, 139, 250, 0.48);
                }

                .welcome-footer {
                    position: relative;
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 17px 20px 25px;
                    color: rgba(255, 255, 255, 0.25);
                    font-size: 9px;
                    letter-spacing: 0.05em;
                }

                .footer-separator {
                    color: rgba(167, 139, 250, 0.65);
                }

                @keyframes header-enter {
                    from {
                        opacity: 0;
                        transform: translateY(-12px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes content-enter {
                    from {
                        opacity: 0;
                        transform: translateY(28px);
                        filter: blur(5px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                        filter: blur(0);
                    }
                }

                @keyframes card-enter {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                        filter: blur(5px);
                    }

                    to {
                        opacity: 1;
                        transform: translateY(0);
                        filter: blur(0);
                    }
                }

                @media (max-width: 900px) {
                    .universities-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }

                    .bottom-cta {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }

                @media (max-width: 640px) {
                    .welcome-header {
                        padding: 18px 16px;
                    }

                    .brand-section,
                    .brand-divider {
                        display: none;
                    }

                    .secure-badge {
                        padding: 7px 10px;
                        font-size: 9px;
                    }

                    .hero-section {
                        min-height: 670px;
                        padding: 30px 18px 70px;
                    }

                    .hero-title {
                        font-size: clamp(40px, 11.5vw, 58px);
                        letter-spacing: -0.045em;
                    }

                    .hero-description {
                        max-width: 450px;
                        font-size: 12px;
                        line-height: 1.7;
                    }

                    .country-section {
                        margin-top: 29px;
                    }

                    .country-button {
                        padding: 7px 11px;
                        font-size: 9px;
                    }

                    .hero-cta {
                        margin-top: 31px;
                    }

                    .main-cta {
                        width: 100%;
                        max-width: 310px;
                        min-width: 0;
                    }

                    .universities-section {
                        width: min(100% - 28px, 520px);
                        padding: 55px 0 70px;
                    }

                    .section-heading {
                        margin-bottom: 34px;
                    }

                    .section-heading h2 {
                        font-size: 31px;
                    }

                    .universities-grid {
                        grid-template-columns: 1fr;
                        gap: 17px;
                    }

                    .university-image-container {
                        height: 230px;
                    }

                    .university-content p {
                        min-height: auto;
                    }

                    .bottom-cta-section {
                        width: min(100% - 28px, 520px);
                        padding-bottom: 60px;
                    }

                    .bottom-cta {
                        padding: 30px 25px;
                        gap: 25px;
                    }

                    .bottom-button {
                        width: 100%;
                        justify-content: center;
                    }

                    .welcome-footer {
                        padding: 14px 15px 20px;
                        font-size: 8px;
                    }
                }

                @media (max-width: 380px) {
                    .welcome-brand {
                        gap: 7px;
                    }

                    .brand-icon {
                        width: 30px;
                        height: 30px;
                    }

                    .brand-name {
                        font-size: 10px;
                    }

                    .secure-badge span {
                        display: none;
                    }

                    .secure-badge {
                        width: 30px;
                        height: 30px;
                        padding: 0;
                        justify-content: center;
                    }

                    .hero-title {
                        font-size: 38px;
                    }

                    .eyebrow {
                        font-size: 8px;
                        padding: 6px 10px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .welcome-header,
                    .hero-inner,
                    .university-card {
                        animation: none;
                        opacity: 1;
                    }

                    .welcome-video,
                    .country-button,
                    .main-cta,
                    .cta-arrow,
                    .university-card,
                    .university-image,
                    .discover-button,
                    .bottom-button {
                        transition: none;
                    }

                    .main-cta:hover,
                    .country-button:hover,
                    .university-card:hover,
                    .discover-button:hover,
                    .bottom-button:hover {
                        transform: none;
                    }
                }
            `}</style>
        </main>
    );
};

export default WelcomeIntro;