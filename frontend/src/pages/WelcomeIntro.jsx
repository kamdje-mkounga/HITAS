import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Globe2, ShieldCheck } from 'lucide-react';

import globalVideo from '../assets/videos/un.mp4';

const WelcomeIntro = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);

    const [activeCountry, setActiveCountry] = useState('global');
    const [videoVisible, setVideoVisible] = useState(true);

    const [typedTitle, setTypedTitle] = useState('');
    const [typedSubtitle, setTypedSubtitle] = useState('');

    const fullTitleLine1 = "Portail officiel de la";
    const fullTitleLine2 = "communauté HITAS";
    const fullDesc = "Accédez à votre espace d’échange, suivez l’actualité des campus à travers le monde et connectez-vous avec vos pairs.";

    useEffect(() => {
        let i = 0;
        const text1 = fullTitleLine1;
        const text2 = fullTitleLine2;
        const totalText = text1 + "\n" + text2;

        // 🐢 Vitesse ralentie ici (passé de 35 à 85ms par lettre)
        const timer = setInterval(() => {
            if (i <= totalText.length) {
                setTypedTitle(totalText.slice(0, i));
                i++;
            } else {
                clearInterval(timer);
            }
        }, 85);

        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        let j = 0;
        const timerDesc = setTimeout(() => {
            // 🐢 Vitesse ralentie ici (passé de 20 à 45ms par lettre)
            const descTimer = setInterval(() => {
                if (j <= fullDesc.length) {
                    setTypedSubtitle(fullDesc.slice(0, j));
                    j++;
                } else {
                    clearInterval(descTimer);
                }
            }, 45);
            return () => clearInterval(descTimer);
        }, 1800); // Léger délai avant que la description ne commence à s'écrire

        return () => clearTimeout(timerDesc);
    }, []);

    const countries = [
        { id: 'global', label: 'Global' },
        { id: 'france', label: 'France' },
        { id: 'allemagne', label: 'Allemagne' },
        { id: 'inde', label: 'Inde' },
        { id: 'italie', label: 'Italie' },
        { id: 'cameroun', label: 'Cameroun' },
        { id: 'uk', label: 'UK' },
        { id: 'bresil', label: 'Brésil' },
    ];

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

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        if (mediaQuery.matches && videoRef.current) {
            videoRef.current.pause();
        }
    }, []);

    const renderTitle = () => {
        const splitIndex = fullTitleLine1.length;
        const part1 = typedTitle.slice(0, splitIndex);
        const part2 = typedTitle.slice(splitIndex).replace('\n', '');

        return (
            <h1>
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

            <section className="welcome-content">
                <div className="content-inner">
                    <div className="eyebrow">
                        <span className="eyebrow-dot" />
                        <span>COMMUNAUTÉ INTERNATIONALE HITAS</span>
                    </div>

                    {renderTitle()}

                    <p className="welcome-description">
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

                    <div className="cta-container">
                        <button
                            type="button"
                            onClick={handleEnterCommunity}
                            className="main-cta"
                        >
                            <span className="cta-text">
                                Entrer sur la plateforme
                            </span>
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
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                    color: #ffffff;
                    background: #060914;
                    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
                    isolation: isolate;
                }

                .welcome-background {
                    position: fixed;
                    inset: 0;
                    z-index: -1;
                    overflow: hidden;
                    background: #060914;
                }

                .welcome-video {
                    position: absolute;
                    inset: 0;
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transform: scale(1.04);
                    opacity: 1;
                    transition: opacity 0.6s cubic-bezier(0.22, 1, 0.36, 1);
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
                    background: linear-gradient(to bottom, rgba(4, 7, 20, 0.82) 0%, rgba(4, 7, 20, 0.28) 38%, rgba(4, 7, 20, 0.40) 60%, rgba(4, 7, 20, 0.88) 100%), linear-gradient(to right, rgba(4, 7, 20, 0.62), rgba(4, 7, 20, 0.08) 50%, rgba(4, 7, 20, 0.62));
                }

                .welcome-glow {
                    position: absolute;
                    left: 50%;
                    top: 50%;
                    width: 760px;
                    height: 500px;
                    transform: translate(-50%, -50%);
                    background: radial-gradient(ellipse, rgba(99, 102, 241, 0.13), transparent 68%);
                    pointer-events: none;
                }

                .welcome-vignette {
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(ellipse at center, transparent 30%, rgba(0, 0, 0, 0.25) 70%, rgba(0, 0, 0, 0.5) 100%);
                    pointer-events: none;
                }

                .welcome-header {
                    position: relative;
                    z-index: 10;
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
                    background: rgba(255,255,255,0.07);
                    border: 1px solid rgba(255,255,255,0.12);
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
                    color: rgba(255,255,255,0.25);
                    font-size: 11px;
                }

                .brand-section {
                    color: rgba(255,255,255,0.48);
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
                    background: rgba(255,255,255,0.055);
                    border: 1px solid rgba(255,255,255,0.11);
                    backdrop-filter: blur(15px);
                    color: rgba(255,255,255,0.62);
                    font-size: 10px;
                    font-weight: 650;
                    letter-spacing: 0.02em;
                }

                .secure-badge svg {
                    color: #a78bfa;
                }

                .welcome-content {
                    position: relative;
                    z-index: 5;
                    flex: 1;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    box-sizing: border-box;
                    padding: 35px 20px 60px;
                }

                .content-inner {
                    width: 100%;
                    max-width: 850px;
                    text-align: center;
                    animation: content-enter 0.95s cubic-bezier(0.22, 1, 0.36, 1) 0.08s both;
                }

                .eyebrow {
                    display: inline-flex;
                    align-items: center;
                    gap: 9px;
                    padding: 7px 13px;
                    margin-bottom: 22px;
                    border-radius: 999px;
                    background: rgba(255,255,255,0.055);
                    border: 1px solid rgba(255,255,255,0.12);
                    backdrop-filter: blur(14px);
                    color: rgba(255,255,255,0.62);
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
                    box-shadow: 0 0 12px rgba(167,139,250,0.85);
                }

                h1 {
                    margin: 0;
                    padding: 0;
                    font-size: clamp(42px, 6.2vw, 78px);
                    line-height: 0.98;
                    letter-spacing: -0.055em;
                    font-weight: 850;
                    color: #ffffff;
                    text-shadow: 0 8px 35px rgba(0,0,0,0.4);
                }

                .heading-accent {
                    display: block;
                    margin-top: 8px;
                    color: #c4b5fd;
                    text-shadow: 0 0 45px rgba(139,92,246,0.28);
                }

                .welcome-description {
                    max-width: 575px;
                    margin: 24px auto 0;
                    color: rgba(255,255,255,0.66);
                    font-size: clamp(13px, 1.35vw, 15px);
                    line-height: 1.75;
                    font-weight: 450;
                    min-height: 50px;
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
                    color: rgba(255,255,255,0.38);
                    font-size: 9px;
                    font-weight: 700;
                    letter-spacing: 0.12em;
                    text-transform: uppercase;
                }

                .country-heading svg {
                    color: rgba(167,139,250,0.75);
                }

                .country-nav {
                    display: flex;
                    flex-wrap: wrap;
                    justify-content: center;
                    gap: 7px;
                }

                .country-button {
                    appearance: none;
                    border: 1px solid rgba(255,255,255,0.10);
                    outline: none;
                    padding: 8px 14px;
                    border-radius: 999px;
                    background: rgba(8,11,28,0.40);
                    backdrop-filter: blur(14px);
                    color: rgba(255,255,255,0.57);
                    font-family: inherit;
                    font-size: 10px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: color 0.28s ease, background 0.28s ease, border-color 0.28s ease, transform 0.28s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.28s ease;
                }

                .country-button:hover {
                    color: #ffffff;
                    background: rgba(255,255,255,0.08);
                    border-color: rgba(255,255,255,0.18);
                    transform: translateY(-1px);
                }

                .country-button:focus-visible {
                    box-shadow: 0 0 0 2px rgba(167,139,250,0.45);
                }

                .country-active {
                    color: #ffffff;
                    background: rgba(109,40,217,0.72);
                    border-color: rgba(167,139,250,0.68);
                    box-shadow: 0 8px 28px rgba(109,40,217,0.22);
                }

                .country-active:hover {
                    background: rgba(124,58,237,0.78);
                }

                .cta-container {
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
                    background: linear-gradient(135deg, #5b3df5 0%, #7c3aed 55%, #9333ea 100%);
                    color: #ffffff;
                    font-family: inherit;
                    font-size: 12px;
                    font-weight: 750;
                    cursor: pointer;
                    box-shadow: 0 14px 35px rgba(91,61,245,0.28);
                    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1), box-shadow 0.3s ease, filter 0.3s ease;
                }

                .main-cta:hover {
                    transform: translateY(-3px);
                    filter: brightness(1.06);
                    box-shadow: 0 20px 48px rgba(91,61,245,0.38);
                }

                .main-cta:active {
                    transform: translateY(-1px);
                }

                .main-cta:focus-visible {
                    box-shadow: 0 0 0 3px rgba(196,181,253,0.35), 0 16px 40px rgba(91,61,245,0.3);
                }

                .cta-text {
                    white-space: nowrap;
                }

                .cta-arrow {
                    width: 31px;
                    height: 31px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 9px;
                    background: rgba(255,255,255,0.13);
                    transition: transform 0.3s cubic-bezier(0.22, 1, 0.36, 1);
                }

                .main-cta:hover .cta-arrow {
                    transform: translateX(3px);
                }

                .cta-hint {
                    margin: 11px 0 0;
                    color: rgba(255,255,255,0.32);
                    font-size: 9px;
                    letter-spacing: 0.02em;
                }

                .welcome-footer {
                    position: relative;
                    z-index: 10;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                    padding: 17px 20px;
                    color: rgba(255,255,255,0.28);
                    font-size: 9px;
                    letter-spacing: 0.05em;
                }

                .footer-separator {
                    color: rgba(167,139,250,0.65);
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
                        transform: translateY(24px);
                        filter: blur(5px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                        filter: blur(0);
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
                    .welcome-content {
                        padding: 25px 18px 45px;
                    }
                    h1 {
                        font-size: clamp(40px, 11.5vw, 58px);
                        letter-spacing: -0.045em;
                    }
                    .welcome-description {
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
                    .cta-container {
                        margin-top: 31px;
                    }
                    .main-cta {
                        width: 100%;
                        max-width: 310px;
                        min-width: 0;
                    }
                    .welcome-footer {
                        padding: 14px 15px;
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
                    h1 {
                        font-size: 38px;
                    }
                    .eyebrow {
                        font-size: 8px;
                        padding: 6px 10px;
                    }
                }

                @media (prefers-reduced-motion: reduce) {
                    .welcome-header,
                    .content-inner {
                        animation: none;
                    }
                    .welcome-video,
                    .country-button,
                    .main-cta,
                    .cta-arrow {
                        transition: none;
                    }
                    .main-cta:hover,
                    .country-button:hover {
                        transform: none;
                    }
                }
            `}</style>
        </main>
    );
};

export default WelcomeIntro;