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


/*
============================================================
HITAS — UNIVERSITIES & STUDENT MEDIA
============================================================

Cette page présente :

1. Les universités partenaires HITAS.
2. Les photos prises par les étudiants.
3. Les vidéos prises par les étudiants.
4. Un accès direct vers la plateforme HITAS pour
   les étudiants qui sont déjà membres.

============================================================
*/


const universities = [

    {
        id: 1,

        name: 'HITAS-ISFATES',

        country: 'Madagascar',

        city: 'Antananarivo',

        image: gem1,

        description:
            'Découvrez le campus et l’expérience des étudiants HITAS à ISFATES.',

        media: [
            {
                type: 'image',
                src: gem1,
                caption: 'Campus — ISFATES'
            },

            {
                type: 'image',
                src: gem1,
                caption: 'Vie étudiante — ISFATES'
            }
        ]
    },


    {
        id: 2,

        name: 'HITAS — EAH-JENA',

        country: 'Allemagne',

        city: 'Jena',

        image: gem2,

        description:
            'Découvrez l’environnement universitaire et la vie des étudiants à EAH Jena.',

        media: [
            {
                type: 'image',
                src: gem2,
                caption: 'Campus — EAH Jena'
            },

            {
                type: 'image',
                src: gem2,
                caption: 'Vie étudiante — EAH Jena'
            }
        ]
    },


    {
        id: 3,

        name: 'HITAS — Fachhochschule Dortmund',

        country: 'Allemagne',

        city: 'Dortmund',

        image: gem3,

        description:
            'Explorez le campus et découvrez l’expérience des étudiants à Dortmund.',

        media: [
            {
                type: 'image',
                src: gem3,
                caption: 'Campus — Fachhochschule Dortmund'
            },

            {
                type: 'image',
                src: gem3,
                caption: 'Vie étudiante — Dortmund'
            }
        ]
    },


    {
        id: 4,

        name: 'HITAS — SOA INDIA',

        country: 'Inde',

        city: 'Bhubaneswar',

        image: gem4,

        description:
            'Découvrez le campus SOA et la vie quotidienne des étudiants internationaux.',

        media: [
            {
                type: 'image',
                src: gem4,
                caption: 'Campus — SOA University'
            },

            {
                type: 'image',
                src: gem4,
                caption: 'Vie étudiante — SOA University'
            }
        ]
    },


    {
        id: 5,

        name: 'Oxford International Digital Institute',

        country: 'Royaume-Uni',

        city: 'Oxford',

        image: gem5,

        description:
            'Découvrez l’environnement académique et les expériences partagées par les étudiants.',

        media: [
            {
                type: 'image',
                src: gem5,
                caption: 'Oxford International Digital Institute'
            },

            {
                type: 'image',
                src: gem5,
                caption: 'Expérience étudiante'
            }
        ]
    },


    {
        id: 6,

        name: 'QUALIFI',

        country: 'Royaume-Uni',

        city: 'UK',

        image: gem1,

        description:
            'Découvrez les expériences et contenus partagés par les étudiants de la communauté HITAS.',

        media: [
            {
                type: 'image',
                src: gem1,
                caption: 'QUALIFI — expérience étudiante'
            },

            {
                type: 'image',
                src: gem1,
                caption: 'Communauté HITAS'
            }
        ]
    }

];


const WelcomeIntro = () => {

    const [selectedUniversity, setSelectedUniversity] = useState(null);

    const [activeMedia, setActiveMedia] = useState(0);

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);


    /*
    ============================================================
    REDIRECTION VERS LA PLATEFORME HITAS
    ============================================================
    */

    const goToHitas = () => {

        window.location.href =
            'https://' + 'hitas.vercel.app/login/';

    };


    /*
    ============================================================
    OUVRIR UNE UNIVERSITÉ
    ============================================================
    */

    const openUniversity = (university) => {

        setSelectedUniversity(university);

        setActiveMedia(0);

        document.body.style.overflow = 'hidden';

    };


    /*
    ============================================================
    FERMER LA GALERIE
    ============================================================
    */

    const closeUniversity = () => {

        setSelectedUniversity(null);

        setActiveMedia(0);

        document.body.style.overflow = '';

    };


    /*
    ============================================================
    MÉDIA SUIVANT
    ============================================================
    */

    const nextMedia = () => {

        if (!selectedUniversity) return;

        const total =
            selectedUniversity.media.length;

        setActiveMedia((current) => {

            if (current === total - 1) {

                return 0;

            }

            return current + 1;

        });

    };


    /*
    ============================================================
    MÉDIA PRÉCÉDENT
    ============================================================
    */

    const previousMedia = () => {

        if (!selectedUniversity) return;

        const total =
            selectedUniversity.media.length;

        setActiveMedia((current) => {

            if (current === 0) {

                return total - 1;

            }

            return current - 1;

        });

    };


    /*
    ============================================================
    KEYBOARD NAVIGATION
    ============================================================
    */

    useEffect(() => {

        const handleKeyDown = (event) => {

            if (!selectedUniversity) return;


            if (event.key === 'Escape') {

                closeUniversity();

            }


            if (event.key === 'ArrowRight') {

                nextMedia();

            }


            if (event.key === 'ArrowLeft') {

                previousMedia();

            }

        };


        window.addEventListener(
            'keydown',
            handleKeyDown
        );


        return () => {

            window.removeEventListener(
                'keydown',
                handleKeyDown
            );

            document.body.style.overflow = '';

        };

    }, [selectedUniversity]);


    /*
    ============================================================
    CLOSE MOBILE MENU WHEN SCROLLING
    ============================================================
    */

    useEffect(() => {

        const handleScroll = () => {

            if (mobileMenuOpen) {

                setMobileMenuOpen(false);

            }

        };


        window.addEventListener(
            'scroll',
            handleScroll
        );


        return () => {

            window.removeEventListener(
                'scroll',
                handleScroll
            );

        };

    }, [mobileMenuOpen]);


    /*
    ============================================================
    RENDER
    ============================================================
    */

    return (

        <main className="hitas-page">


            {/* ==================================================
                HEADER
            ================================================== */}

            <header className="hitas-header">

                <div className="header-inner">


                    {/* LOGO */}

                    <a
                        href="#top"
                        className="hitas-logo"
                        onClick={() =>
                            setMobileMenuOpen(false)
                        }
                    >

                        <div className="logo-mark">

                            <GraduationCap
                                size={20}
                            />

                        </div>

                        <div className="logo-text">

                            <strong>
                                HITAS
                            </strong>

                            <span>
                                GLOBAL NETWORK
                            </span>

                        </div>

                    </a>


                    {/* DESKTOP NAV */}

                    <nav className="desktop-nav">

                        <a href="#universities">

                            Universities

                        </a>

                        <button
                            type="button"
                            className="student-login"
                            onClick={goToHitas}
                        >

                            <span>
                                Already a HITAS student?
                            </span>

                            <strong>
                                My HITAS
                            </strong>

                            <ArrowUpRight
                                size={14}
                            />

                        </button>

                    </nav>


                    {/* MOBILE BUTTON */}

                    <button
                        type="button"
                        className="mobile-menu-button"
                        onClick={() =>
                            setMobileMenuOpen(
                                !mobileMenuOpen
                            )
                        }
                        aria-label="Open menu"
                    >

                        {mobileMenuOpen ? (

                            <X size={21} />

                        ) : (

                            <Menu size={21} />

                        )}

                    </button>

                </div>


                {/* MOBILE MENU */}

                {mobileMenuOpen && (

                    <div className="mobile-menu">

                        <a
                            href="#universities"
                            onClick={() =>
                                setMobileMenuOpen(false)
                            }
                        >

                            <ImageIcon size={15} />

                            Universities

                        </a>


                        <button
                            type="button"
                            onClick={goToHitas}
                        >

                            <GraduationCap
                                size={15}
                            />

                            <span>
                                Already a HITAS student?
                            </span>

                            <ArrowUpRight
                                size={14}
                            />

                        </button>

                    </div>

                )}

            </header>


            {/* ==================================================
                HERO
            ================================================== */}

            <section
                id="top"
                className="hero"
            >

                <div className="hero-grid" />

                <div className="hero-orb hero-orb-one" />

                <div className="hero-orb hero-orb-two" />


                <div className="hero-content">


                    <div className="eyebrow">

                        <span className="dot" />

                        HITAS GLOBAL NETWORK

                    </div>


                    <h1>

                        Discover the universities

                        <span>
                            in our network.
                        </span>

                    </h1>


                    <p>

                        Explore our partner universities and
                        discover photos and videos captured
                        by students from their campuses.

                    </p>


                    <div className="hero-actions">

                        <a
                            href="#universities"
                            className="explore-button"
                        >

                            Explore universities

                            <ChevronRight
                                size={16}
                            />

                        </a>


                        <button
                            type="button"
                            className="hero-student-button"
                            onClick={goToHitas}
                        >

                            <GraduationCap
                                size={16}
                            />

                            I'm already a student

                        </button>

                    </div>

                </div>

            </section>


            {/* ==================================================
                UNIVERSITIES
            ================================================== */}

            <section
                id="universities"
                className="universities-section"
            >


                <div className="section-heading">


                    <div className="section-label">

                        <ImageIcon size={14} />

                        UNIVERSITIES & STUDENT EXPERIENCES

                    </div>


                    <h2>

                        Life across

                        <span>
                            HITAS campuses
                        </span>

                    </h2>


                    <p>

                        Select a university to explore photos
                        and videos shared by students.

                    </p>

                </div>


                {/* GRID */}

                <div className="universities-grid">


                    {universities.map(
                        (university, index) => (

                            <article
                                key={university.id}
                                className="university-card"
                                style={{
                                    '--delay':
                                        `${index * 70}ms`
                                }}
                                tabIndex={0}
                                role="button"
                                onClick={() =>
                                    openUniversity(
                                        university
                                    )
                                }
                                onKeyDown={(event) => {

                                    if (
                                        event.key ===
                                        'Enter' ||
                                        event.key ===
                                        ' '
                                    ) {

                                        event.preventDefault();

                                        openUniversity(
                                            university
                                        );

                                    }

                                }}
                            >


                                {/* IMAGE */}

                                <div className="card-image">


                                    <img
                                        src={
                                            university.image
                                        }
                                        alt={
                                            university.name
                                        }
                                    />


                                    <div
                                        className="image-shade"
                                    />


                                    {/* LOCATION */}

                                    <div className="card-location">

                                        <MapPin size={12} />

                                        <span>

                                            {
                                                university.city
                                            }

                                            ,

                                            {' '}

                                            {
                                                university.country
                                            }

                                        </span>

                                    </div>


                                    {/* MEDIA COUNT */}

                                    <div className="media-badge">

                                        <ImageIcon
                                            size={12}
                                        />

                                        <span>

                                            {
                                                university.media
                                                    .length
                                            }

                                            {' '}

                                            media

                                        </span>

                                    </div>


                                    {/* HOVER */}

                                    <div className="view-overlay">

                                        <div className="view-button">

                                            <ImageIcon
                                                size={16}
                                            />

                                            View student media

                                        </div>

                                    </div>

                                </div>


                                {/* CARD CONTENT */}

                                <div className="card-content">


                                    <div className="card-index">

                                        {String(
                                            index + 1
                                        ).padStart(
                                            2,
                                            '0'
                                        )}

                                    </div>


                                    <h3>

                                        {
                                            university.name
                                        }

                                    </h3>


                                    <p>

                                        {
                                            university.description
                                        }

                                    </p>


                                    <div className="card-action">

                                        <span>

                                            Student photos
                                            & videos

                                        </span>


                                        <ChevronRight
                                            size={17}
                                        />

                                    </div>

                                </div>

                            </article>

                        )
                    )}

                </div>

            </section>


            {/* ==================================================
                STUDENT CTA
            ================================================== */}

            <section className="student-cta">

                <div className="cta-glow" />

                <div className="cta-content">

                    <div className="cta-icon">

                        <GraduationCap
                            size={24}
                        />

                    </div>


                    <div>

                        <span className="cta-label">

                            ALREADY PART OF HITAS?

                        </span>


                        <h2>

                            Access your HITAS space.

                        </h2>


                        <p>

                            Already studying through HITAS?
                            Continue to your student platform.

                        </p>

                    </div>


                    <button
                        type="button"
                        className="cta-button"
                        onClick={goToHitas}
                    >

                        Go to HITAS

                        <ArrowUpRight
                            size={17}
                        />

                    </button>

                </div>

            </section>


            {/* ==================================================
                GALLERY MODAL
            ================================================== */}

            {selectedUniversity && (

                <div
                    className="modal-backdrop"
                    onClick={closeUniversity}
                >

                    <div
                        className="media-modal"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >


                        {/* CLOSE */}

                        <button
                            type="button"
                            className="close-button"
                            onClick={closeUniversity}
                            aria-label="Close"
                        >

                            <X size={20} />

                        </button>


                        {/* HEADER */}

                        <div className="modal-header">

                            <div>

                                <span className="modal-kicker">

                                    STUDENT EXPERIENCE

                                </span>


                                <h2>

                                    {
                                        selectedUniversity.name
                                    }

                                </h2>


                                <p>

                                    <MapPin
                                        size={13}
                                    />

                                    {
                                        selectedUniversity.city
                                    }

                                    ,

                                    {' '}

                                    {
                                        selectedUniversity.country
                                    }

                                </p>

                            </div>

                        </div>


                        {/* MEDIA */}

                        <div className="media-viewer">


                            {selectedUniversity
                                .media[
                                activeMedia
                            ]
                                ?.type ===
                                'video' ? (

                                <video
                                    src={
                                        selectedUniversity
                                            .media[
                                            activeMedia
                                        ].src
                                    }
                                    controls
                                    playsInline
                                />

                            ) : (

                                <img
                                    src={
                                        selectedUniversity
                                            .media[
                                            activeMedia
                                        ]?.src
                                    }
                                    alt={
                                        selectedUniversity
                                            .media[
                                            activeMedia
                                        ]?.caption ||
                                        selectedUniversity.name
                                    }
                                />

                            )}


                            {/* PREVIOUS */}

                            {selectedUniversity
                                .media.length > 1 && (

                                    <button
                                        type="button"
                                        className="media-nav media-prev"
                                        onClick={
                                            previousMedia
                                        }
                                        aria-label="Previous"
                                    >

                                        <ChevronLeft
                                            size={22}
                                        />

                                    </button>

                                )}


                            {/* NEXT */}

                            {selectedUniversity
                                .media.length > 1 && (

                                    <button
                                        type="button"
                                        className="media-nav media-next"
                                        onClick={
                                            nextMedia
                                        }
                                        aria-label="Next"
                                    >

                                        <ChevronRight
                                            size={22}
                                        />

                                    </button>

                                )}


                            {/* COUNTER */}

                            <div className="media-counter">

                                {activeMedia + 1}

                                {' / '}

                                {
                                    selectedUniversity
                                        .media.length
                                }

                            </div>

                        </div>


                        {/* MEDIA INFO */}

                        <div className="media-info">


                            <div className="media-type">

                                {
                                    selectedUniversity
                                        .media[
                                        activeMedia
                                    ]?.type ===
                                        'video' ? (

                                        <Video
                                            size={13}
                                        />

                                    ) : (

                                        <ImageIcon
                                            size={13}
                                        />

                                    )
                                }


                                {
                                    selectedUniversity
                                        .media[
                                        activeMedia
                                    ]?.type ===
                                        'video'
                                        ? 'VIDEO'
                                        : 'PHOTO'
                                }

                            </div>


                            <p>

                                {
                                    selectedUniversity
                                        .media[
                                        activeMedia
                                    ]?.caption
                                }

                            </p>

                        </div>


                        {/* THUMBNAILS */}

                        {selectedUniversity
                            .media.length > 1 && (

                                <div className="media-thumbnails">

                                    {
                                        selectedUniversity
                                            .media.map(
                                                (
                                                    media,
                                                    index
                                                ) => (

                                                    <button
                                                        type="button"
                                                        key={`${media.src}-${index}`}
                                                        className={`
                                                        thumbnail
                                                        ${index ===
                                                                activeMedia
                                                                ? 'thumbnail-active'
                                                                : ''
                                                            }
                                                    `}
                                                        onClick={() =>
                                                            setActiveMedia(
                                                                index
                                                            )
                                                        }
                                                    >

                                                        {media.type ===
                                                            'video' ? (

                                                            <video
                                                                src={
                                                                    media.src
                                                                }
                                                                muted
                                                                preload="metadata"
                                                            />

                                                        ) : (

                                                            <img
                                                                src={
                                                                    media.src
                                                                }
                                                                alt={`Media ${index +
                                                                    1
                                                                    }`}
                                                            />

                                                        )}


                                                        {media.type ===
                                                            'video' && (

                                                                <span className="thumbnail-play">

                                                                    <Play
                                                                        size={
                                                                            11
                                                                        }
                                                                        fill="currentColor"
                                                                    />

                                                                </span>

                                                            )}

                                                    </button>

                                                )
                                            )
                                    }

                                </div>

                            )}

                    </div>

                </div>

            )}


            {/* ==================================================
                FOOTER
            ================================================== */}

            <footer className="footer">

                <div className="footer-brand">

                    <div className="footer-logo">

                        <GraduationCap
                            size={16}
                        />

                    </div>

                    <strong>
                        HITAS
                    </strong>

                </div>


                <span>
                    Universities & student experiences
                </span>


                <span>
                    © {new Date().getFullYear()}
                </span>

            </footer>


            {/* ==================================================
                CSS
            ================================================== */}

            <style>{`

                * {
                    box-sizing: border-box;
                }


                html {
                    scroll-behavior: smooth;
                }


                body {
                    margin: 0;
                }


                .hitas-page {

                    min-height: 100vh;

                    background:
                        radial-gradient(
                            circle at 50% 0%,
                            rgba(124,58,237,.13),
                            transparent 32%
                        ),
                        #050611;

                    color: #ffffff;

                    font-family:
                        Inter,
                        ui-sans-serif,
                        system-ui,
                        -apple-system,
                        BlinkMacSystemFont,
                        "Segoe UI",
                        sans-serif;

                    overflow-x: hidden;

                }


                /* ==================================================
                   HEADER
                ================================================== */

                .hitas-header {

                    position: sticky;

                    top: 0;

                    z-index: 80;

                    width: 100%;

                    border-bottom:
                        1px solid
                        rgba(255,255,255,.07);

                    background:
                        rgba(5,6,17,.78);

                    backdrop-filter:
                        blur(18px);

                    -webkit-backdrop-filter:
                        blur(18px);

                }


                .header-inner {

                    width:
                        min(1180px, calc(100% - 40px));

                    height: 72px;

                    margin: 0 auto;

                    display: flex;

                    align-items: center;

                    justify-content: space-between;

                }


                /* LOGO */

                .hitas-logo {

                    display: flex;

                    align-items: center;

                    gap: 10px;

                    color: #fff;

                    text-decoration: none;

                }


                .logo-mark {

                    width: 38px;

                    height: 38px;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    border:
                        1px solid
                        rgba(167,139,250,.3);

                    border-radius: 11px;

                    background:
                        linear-gradient(
                            135deg,
                            rgba(124,58,237,.3),
                            rgba(167,139,250,.1)
                        );

                    color: #c4b5fd;

                    box-shadow:
                        0 8px 30px
                        rgba(124,58,237,.15);

                }


                .logo-text {

                    display: flex;

                    flex-direction: column;

                    gap: 1px;

                }


                .logo-text strong {

                    font-size: 17px;

                    line-height: 1;

                    letter-spacing: .05em;

                }


                .logo-text span {

                    color:
                        rgba(255,255,255,.35);

                    font-size: 6.5px;

                    font-weight: 800;

                    letter-spacing: .15em;

                }


                /* DESKTOP NAV */

                .desktop-nav {

                    display: flex;

                    align-items: center;

                    gap: 30px;

                }


                .desktop-nav > a {

                    color:
                        rgba(255,255,255,.55);

                    text-decoration: none;

                    font-size: 11px;

                    font-weight: 650;

                    transition:
                        color .2s ease;

                }


                .desktop-nav > a:hover {

                    color: #fff;

                }


                .student-login {

                    display: flex;

                    align-items: center;

                    gap: 8px;

                    padding:
                        9px 13px;

                    border:
                        1px solid
                        rgba(167,139,250,.2);

                    border-radius: 10px;

                    background:
                        rgba(124,58,237,.11);

                    color: #c4b5fd;

                    cursor: pointer;

                    transition:
                        background .25s ease,
                        border-color .25s ease,
                        transform .25s ease;

                }


                .student-login:hover {

                    background:
                        rgba(124,58,237,.2);

                    border-color:
                        rgba(167,139,250,.4);

                    transform:
                        translateY(-1px);

                }


                .student-login span {

                    color:
                        rgba(255,255,255,.52);

                    font-size: 9px;

                }


                .student-login strong {

                    font-size: 9px;

                }


                /* MOBILE MENU BUTTON */

                .mobile-menu-button {

                    display: none;

                    width: 38px;

                    height: 38px;

                    align-items: center;

                    justify-content: center;

                    border:
                        1px solid
                        rgba(255,255,255,.1);

                    border-radius: 10px;

                    background:
                        rgba(255,255,255,.04);

                    color: #fff;

                    cursor: pointer;

                }


                .mobile-menu {

                    display: none;

                }


                /* ==================================================
                   HERO
                ================================================== */

                .hero {

                    position: relative;

                    min-height: 520px;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    padding:
                        90px 20px 85px;

                    overflow: hidden;

                    border-bottom:
                        1px solid
                        rgba(167,139,250,.08);

                }


                .hero-grid {

                    position: absolute;

                    inset: 0;

                    opacity: .22;

                    background-image:
                        linear-gradient(
                            rgba(167,139,250,.06) 1px,
                            transparent 1px
                        ),
                        linear-gradient(
                            90deg,
                            rgba(167,139,250,.06) 1px,
                            transparent 1px
                        );

                    background-size:
                        55px 55px;

                    mask-image:
                        linear-gradient(
                            to bottom,
                            black,
                            transparent
                        );

                }


                .hero-content {

                    position: relative;

                    z-index: 2;

                    width:
                        min(900px,100%);

                    text-align: center;

                }


                .eyebrow {

                    display: inline-flex;

                    align-items: center;

                    gap: 8px;

                    padding:
                        8px 13px;

                    margin-bottom: 23px;

                    border:
                        1px solid
                        rgba(255,255,255,.1);

                    border-radius: 999px;

                    background:
                        rgba(255,255,255,.04);

                    color:
                        rgba(255,255,255,.58);

                    font-size: 8px;

                    font-weight: 800;

                    letter-spacing: .16em;

                }


                .dot {

                    width: 6px;

                    height: 6px;

                    border-radius: 50%;

                    background: #a78bfa;

                    box-shadow:
                        0 0 15px
                        rgba(167,139,250,.9);

                }


                .hero h1 {

                    margin: 0;

                    font-size:
                        clamp(45px,6.5vw,76px);

                    line-height: .98;

                    letter-spacing:
                        -.06em;

                    font-weight: 850;

                }


                .hero h1 span {

                    display: block;

                    margin-top: 9px;

                    color: #a78bfa;

                }


                .hero p {

                    max-width: 650px;

                    margin:
                        25px auto 0;

                    color:
                        rgba(255,255,255,.5);

                    font-size: 14px;

                    line-height: 1.8;

                }


                /* HERO BUTTONS */

                .hero-actions {

                    display: flex;

                    justify-content: center;

                    align-items: center;

                    gap: 11px;

                    margin-top: 30px;

                }


                .explore-button,
                .hero-student-button {

                    display: inline-flex;

                    align-items: center;

                    justify-content: center;

                    gap: 8px;

                    padding:
                        12px 16px;

                    border-radius: 10px;

                    font-size: 10px;

                    font-weight: 750;

                    cursor: pointer;

                    text-decoration: none;

                    transition:
                        transform .25s ease,
                        background .25s ease,
                        border-color .25s ease;

                }


                .explore-button {

                    border:
                        1px solid
                        rgba(167,139,250,.35);

                    background:
                        #7c3aed;

                    color: #fff;

                    box-shadow:
                        0 10px 35px
                        rgba(124,58,237,.25);

                }


                .explore-button:hover {

                    transform:
                        translateY(-2px);

                    background:
                        #8b5cf6;

                }


                .hero-student-button {

                    border:
                        1px solid
                        rgba(255,255,255,.1);

                    background:
                        rgba(255,255,255,.045);

                    color:
                        rgba(255,255,255,.7);

                }


                .hero-student-button:hover {

                    transform:
                        translateY(-2px);

                    border-color:
                        rgba(167,139,250,.3);

                    background:
                        rgba(167,139,250,.08);

                    color: #fff;

                }


                /* ORBS */

                .hero-orb {

                    position: absolute;

                    border-radius: 50%;

                    filter: blur(90px);

                    pointer-events: none;

                }


                .hero-orb-one {

                    width: 400px;

                    height: 400px;

                    top: -240px;

                    left: 10%;

                    background:
                        rgba(99,102,241,.16);

                }


                .hero-orb-two {

                    width: 350px;

                    height: 350px;

                    right: 5%;

                    bottom: -230px;

                    background:
                        rgba(168,85,247,.12);

                }


                /* ==================================================
                   UNIVERSITIES
                ================================================== */

                .universities-section {

                    width:
                        min(1180px, calc(100% - 40px));

                    margin: 0 auto;

                    padding:
                        85px 0 100px;

                }


                .section-heading {

                    max-width: 720px;

                    margin:
                        0 auto 48px;

                    text-align: center;

                }


                .section-label {

                    display: inline-flex;

                    align-items: center;

                    gap: 7px;

                    margin-bottom: 13px;

                    color: #a78bfa;

                    font-size: 8px;

                    font-weight: 800;

                    letter-spacing: .15em;

                }


                .section-heading h2 {

                    margin: 0;

                    font-size:
                        clamp(32px,4vw,48px);

                    line-height: 1.05;

                    letter-spacing: -.045em;

                }


                .section-heading h2 span {

                    display: block;

                    color: #a78bfa;

                }


                .section-heading p {

                    max-width: 580px;

                    margin:
                        16px auto 0;

                    color:
                        rgba(255,255,255,.44);

                    font-size: 12px;

                    line-height: 1.75;

                }


                /* GRID */

                .universities-grid {

                    display: grid;

                    grid-template-columns:
                        repeat(3,1fr);

                    gap: 22px;

                }


                /* CARD */

                .university-card {

                    position: relative;

                    overflow: hidden;

                    border:
                        1px solid
                        rgba(167,139,250,.13);

                    border-radius: 20px;

                    background:
                        rgba(10,11,28,.82);

                    box-shadow:
                        0 20px 60px
                        rgba(0,0,0,.18);

                    cursor: pointer;

                    opacity: 0;

                    animation:
                        card-in
                        .7s
                        cubic-bezier(.22,1,.36,1)
                        var(--delay)
                        forwards;

                    transition:
                        transform .35s ease,
                        border-color .35s ease,
                        box-shadow .35s ease;

                    outline: none;

                }


                .university-card:hover,
                .university-card:focus-visible {

                    transform:
                        translateY(-7px);

                    border-color:
                        rgba(167,139,250,.38);

                    box-shadow:
                        0 30px 75px
                        rgba(0,0,0,.32);

                }


                .card-image {

                    position: relative;

                    height: 220px;

                    overflow: hidden;

                    background: #0a0b1c;

                }


                .card-image img {

                    width: 100%;

                    height: 100%;

                    display: block;

                    object-fit: cover;

                    transition:
                        transform .55s ease,
                        filter .4s ease;

                }


                .university-card:hover
                .card-image img {

                    transform:
                        scale(1.06);

                    filter:
                        brightness(1.07);

                }


                .image-shade {

                    position: absolute;

                    inset: 0;

                    background:
                        linear-gradient(
                            to bottom,
                            transparent 30%,
                            rgba(4,5,16,.9)
                        );

                }


                .card-location {

                    position: absolute;

                    left: 14px;

                    bottom: 13px;

                    display: flex;

                    align-items: center;

                    gap: 5px;

                    color:
                        rgba(255,255,255,.75);

                    font-size: 9px;

                    font-weight: 650;

                }


                .card-location svg {

                    color: #c4b5fd;

                }


                .media-badge {

                    position: absolute;

                    right: 13px;

                    bottom: 12px;

                    display: flex;

                    align-items: center;

                    gap: 5px;

                    padding:
                        6px 8px;

                    border:
                        1px solid
                        rgba(255,255,255,.12);

                    border-radius: 8px;

                    background:
                        rgba(4,5,16,.45);

                    backdrop-filter:
                        blur(10px);

                    color:
                        rgba(255,255,255,.68);

                    font-size: 8px;

                    font-weight: 750;

                }


                .view-overlay {

                    position: absolute;

                    inset: 0;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    opacity: 0;

                    background:
                        rgba(4,5,16,.38);

                    backdrop-filter:
                        blur(2px);

                    transition:
                        opacity .3s ease;

                }


                .university-card:hover
                .view-overlay,

                .university-card:focus-visible
                .view-overlay {

                    opacity: 1;

                }


                .view-button {

                    display: inline-flex;

                    align-items: center;

                    gap: 8px;

                    padding:
                        10px 14px;

                    border:
                        1px solid
                        rgba(255,255,255,.18);

                    border-radius: 10px;

                    background:
                        rgba(124,58,237,.78);

                    color: #fff;

                    font-size: 10px;

                    font-weight: 750;

                }


                /* CONTENT */

                .card-content {

                    position: relative;

                    padding:
                        20px 20px 18px;

                }


                .card-index {

                    position: absolute;

                    top: 20px;

                    right: 20px;

                    color:
                        rgba(167,139,250,.5);

                    font-size: 9px;

                    font-weight: 800;

                }


                .card-content h3 {

                    max-width:
                        calc(100% - 35px);

                    margin: 0;

                    font-size: 17px;

                    line-height: 1.25;

                    letter-spacing: -.02em;

                }


                .card-content p {

                    min-height: 42px;

                    margin:
                        10px 0 17px;

                    color:
                        rgba(255,255,255,.42);

                    font-size: 10.5px;

                    line-height: 1.65;

                }


                .card-action {

                    display: flex;

                    align-items: center;

                    justify-content: space-between;

                    padding-top: 13px;

                    border-top:
                        1px solid
                        rgba(167,139,250,.1);

                    color:
                        rgba(255,255,255,.48);

                    font-size: 9px;

                    font-weight: 700;

                }


                .card-action svg {

                    color: #a78bfa;

                    transition:
                        transform .25s ease;

                }


                .university-card:hover
                .card-action svg {

                    transform:
                        translateX(3px);

                }


                /* ==================================================
                   STUDENT CTA
                ================================================== */

                .student-cta {

                    position: relative;

                    width:
                        min(1100px, calc(100% - 40px));

                    margin:
                        0 auto 80px;

                    overflow: hidden;

                    border:
                        1px solid
                        rgba(167,139,250,.17);

                    border-radius: 22px;

                    background:
                        linear-gradient(
                            120deg,
                            rgba(124,58,237,.13),
                            rgba(255,255,255,.025)
                        );

                }


                .cta-glow {

                    position: absolute;

                    width: 250px;

                    height: 250px;

                    right: -100px;

                    top: -150px;

                    border-radius: 50%;

                    background:
                        rgba(124,58,237,.2);

                    filter: blur(70px);

                }


                .cta-content {

                    position: relative;

                    z-index: 2;

                    min-height: 150px;

                    display: flex;

                    align-items: center;

                    gap: 20px;

                    padding:
                        28px 32px;

                }


                .cta-icon {

                    flex:
                        0 0 50px;

                    width: 50px;

                    height: 50px;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    border:
                        1px solid
                        rgba(167,139,250,.25);

                    border-radius: 14px;

                    background:
                        rgba(124,58,237,.15);

                    color: #c4b5fd;

                }


                .cta-content > div:nth-child(2) {

                    flex: 1;

                }


                .cta-label {

                    color: #a78bfa;

                    font-size: 8px;

                    font-weight: 800;

                    letter-spacing: .15em;

                }


                .cta-content h2 {

                    margin:
                        6px 0 5px;

                    font-size: 22px;

                    letter-spacing: -.03em;

                }


                .cta-content p {

                    margin: 0;

                    color:
                        rgba(255,255,255,.42);

                    font-size: 10px;

                }


                .cta-button {

                    display: flex;

                    align-items: center;

                    gap: 8px;

                    padding:
                        11px 15px;

                    border:
                        1px solid
                        rgba(167,139,250,.3);

                    border-radius: 10px;

                    background:
                        #7c3aed;

                    color: #fff;

                    font-size: 10px;

                    font-weight: 750;

                    cursor: pointer;

                    white-space: nowrap;

                    transition:
                        transform .25s ease,
                        background .25s ease;

                }


                .cta-button:hover {

                    transform:
                        translateY(-2px);

                    background:
                        #8b5cf6;

                }


                /* ==================================================
                   MODAL
                ================================================== */

                .modal-backdrop {

                    position: fixed;

                    inset: 0;

                    z-index: 100;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    padding: 25px;

                    background:
                        rgba(1,2,8,.84);

                    backdrop-filter:
                        blur(14px);

                    animation:
                        fade-in .25s ease;

                }


                .media-modal {

                    position: relative;

                    width:
                        min(900px,100%);

                    max-height:
                        calc(100vh - 50px);

                    overflow: auto;

                    border:
                        1px solid
                        rgba(167,139,250,.2);

                    border-radius: 24px;

                    background: #090a1c;

                    box-shadow:
                        0 35px 100px
                        rgba(0,0,0,.55);

                    animation:
                        modal-in
                        .35s
                        cubic-bezier(.22,1,.36,1);

                }


                .close-button {

                    position: absolute;

                    z-index: 3;

                    top: 16px;

                    right: 16px;

                    width: 36px;

                    height: 36px;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    border:
                        1px solid
                        rgba(255,255,255,.14);

                    border-radius: 10px;

                    background:
                        rgba(4,5,16,.65);

                    color: #fff;

                    cursor: pointer;

                    backdrop-filter:
                        blur(10px);

                }


                .close-button:hover {

                    background:
                        rgba(124,58,237,.75);

                }


                .modal-header {

                    padding:
                        28px 30px 22px;

                }


                .modal-kicker {

                    color: #a78bfa;

                    font-size: 8px;

                    font-weight: 800;

                    letter-spacing: .15em;

                }


                .modal-header h2 {

                    margin:
                        7px 0 6px;

                    padding-right: 45px;

                    font-size:
                        clamp(22px,4vw,32px);

                    line-height: 1.1;

                    letter-spacing: -.035em;

                }


                .modal-header p {

                    display: flex;

                    align-items: center;

                    gap: 5px;

                    margin: 0;

                    color:
                        rgba(255,255,255,.42);

                    font-size: 10px;

                }


                /* MEDIA */

                .media-viewer {

                    position: relative;

                    height:
                        min(58vh,520px);

                    min-height: 300px;

                    overflow: hidden;

                    background: #02030a;

                }


                .media-viewer img,

                .media-viewer video {

                    width: 100%;

                    height: 100%;

                    display: block;

                    object-fit: contain;

                }


                .media-nav {

                    position: absolute;

                    top: 50%;

                    transform:
                        translateY(-50%);

                    width: 40px;

                    height: 40px;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    border:
                        1px solid
                        rgba(255,255,255,.14);

                    border-radius: 50%;

                    background:
                        rgba(4,5,16,.6);

                    color: #fff;

                    cursor: pointer;

                    backdrop-filter:
                        blur(10px);

                }


                .media-nav:hover {

                    background:
                        rgba(124,58,237,.75);

                }


                .media-prev {

                    left: 15px;

                }


                .media-next {

                    right: 15px;

                }


                .media-counter {

                    position: absolute;

                    right: 15px;

                    bottom: 14px;

                    padding:
                        6px 9px;

                    border-radius: 7px;

                    background:
                        rgba(4,5,16,.65);

                    color:
                        rgba(255,255,255,.7);

                    font-size: 9px;

                    font-weight: 700;

                }


                /* MEDIA INFO */

                .media-info {

                    padding:
                        17px 25px 15px;

                }


                .media-type {

                    display: inline-flex;

                    align-items: center;

                    gap: 5px;

                    margin-bottom: 5px;

                    color: #a78bfa;

                    font-size: 8px;

                    font-weight: 800;

                    letter-spacing: .12em;

                }


                .media-info p {

                    margin: 0;

                    color:
                        rgba(255,255,255,.65);

                    font-size: 11px;

                }


                /* THUMBNAILS */

                .media-thumbnails {

                    display: flex;

                    gap: 9px;

                    overflow-x: auto;

                    padding:
                        0 25px 22px;

                }


                .thumbnail {

                    position: relative;

                    flex:
                        0 0 72px;

                    width: 72px;

                    height: 52px;

                    overflow: hidden;

                    padding: 0;

                    border:
                        1px solid
                        rgba(255,255,255,.08);

                    border-radius: 8px;

                    background: #050611;

                    cursor: pointer;

                    opacity: .55;

                    transition:
                        opacity .2s ease,
                        border-color .2s ease;

                }


                .thumbnail:hover {

                    opacity: .85;

                }


                .thumbnail-active {

                    opacity: 1;

                    border-color:
                        #a78bfa;

                    box-shadow:
                        0 0 0 1px
                        rgba(167,139,250,.25);

                }


                .thumbnail img,

                .thumbnail video {

                    width: 100%;

                    height: 100%;

                    display: block;

                    object-fit: cover;

                }


                .thumbnail-play {

                    position: absolute;

                    inset: 0;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    color: #fff;

                    background:
                        rgba(0,0,0,.3);

                }


                /* ==================================================
                   FOOTER
                ================================================== */

                .footer {

                    width:
                        min(1180px, calc(100% - 40px));

                    margin: 0 auto;

                    padding:
                        20px 0 30px;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    gap: 10px;

                    color:
                        rgba(255,255,255,.23);

                    font-size: 8px;

                }


                .footer-brand {

                    display: flex;

                    align-items: center;

                    gap: 6px;

                    color:
                        rgba(255,255,255,.55);

                }


                .footer-logo {

                    display: flex;

                    color: #a78bfa;

                }


                .footer-brand strong {

                    letter-spacing: .08em;

                }


                /* ==================================================
                   ANIMATIONS
                ================================================== */

                @keyframes card-in {

                    from {

                        opacity: 0;

                        transform:
                            translateY(25px);

                    }

                    to {

                        opacity: 1;

                        transform:
                            translateY(0);

                    }

                }


                @keyframes fade-in {

                    from {
                        opacity: 0;
                    }

                    to {
                        opacity: 1;
                    }

                }


                @keyframes modal-in {

                    from {

                        opacity: 0;

                        transform:
                            translateY(18px)
                            scale(.98);

                    }

                    to {

                        opacity: 1;

                        transform:
                            translateY(0)
                            scale(1);

                    }

                }


                /* ==================================================
                   TABLET
                ================================================== */

                @media (max-width: 900px) {

                    .universities-grid {

                        grid-template-columns:
                            repeat(2,1fr);

                    }


                    .desktop-nav {

                        gap: 18px;

                    }


                    .student-login span {

                        display: none;

                    }

                }


                /* ==================================================
                   MOBILE
                ================================================== */

                @media (max-width: 640px) {


                    .header-inner {

                        width:
                            calc(100% - 28px);

                        height: 65px;

                    }


                    .desktop-nav {

                        display: none;

                    }


                    .mobile-menu-button {

                        display: flex;

                    }


                    .mobile-menu {

                        display: flex;

                        flex-direction: column;

                        gap: 6px;

                        padding:
                            8px 14px 14px;

                        border-top:
                            1px solid
                            rgba(255,255,255,.05);

                        background:
                            rgba(5,6,17,.96);

                    }


                    .mobile-menu a,

                    .mobile-menu button {

                        display: flex;

                        align-items: center;

                        gap: 9px;

                        width: 100%;

                        padding:
                            12px;

                        border:
                            1px solid
                            rgba(255,255,255,.07);

                        border-radius: 10px;

                        background:
                            rgba(255,255,255,.03);

                        color:
                            rgba(255,255,255,.7);

                        font-family: inherit;

                        font-size: 10px;

                        text-decoration: none;

                        text-align: left;

                        cursor: pointer;

                    }


                    .mobile-menu button {

                        color: #c4b5fd;

                    }


                    .mobile-menu button span {

                        flex: 1;

                    }


                    .hero {

                        min-height: 500px;

                        padding:
                            70px 18px 65px;

                    }


                    .hero h1 {

                        font-size:
                            clamp(40px,12vw,56px);

                    }


                    .hero p {

                        font-size: 12px;

                    }


                    .hero-actions {

                        flex-direction: column;

                        width: 100%;

                    }


                    .explore-button,

                    .hero-student-button {

                        width: 100%;

                        max-width: 300px;

                    }


                    .universities-section {

                        width:
                            calc(100% - 28px);

                        padding:
                            60px 0 70px;

                    }


                    .universities-grid {

                        grid-template-columns: 1fr;

                        gap: 17px;

                    }


                    .card-image {

                        height: 230px;

                    }


                    .student-cta {

                        width:
                            calc(100% - 28px);

                        margin-bottom: 55px;

                    }


                    .cta-content {

                        flex-direction: column;

                        align-items: flex-start;

                        padding: 25px;

                    }


                    .cta-button {

                        width: 100%;

                        justify-content: center;

                    }


                    .footer {

                        width:
                            calc(100% - 28px);

                        flex-wrap: wrap;

                    }


                    .modal-backdrop {

                        padding: 12px;

                    }


                    .media-modal {

                        max-height:
                            calc(100vh - 24px);

                        border-radius: 18px;

                    }


                    .modal-header {

                        padding:
                            22px 20px 17px;

                    }


                    .media-viewer {

                        min-height: 240px;

                        height: 48vh;

                    }


                    .media-info {

                        padding:
                            15px 18px 13px;

                    }


                    .media-thumbnails {

                        padding:
                            0 18px 18px;

                    }

                }


                /* ==================================================
                   REDUCED MOTION
                ================================================== */

                @media (prefers-reduced-motion: reduce) {

                    html {

                        scroll-behavior: auto;

                    }


                    .university-card,

                    .modal-backdrop,

                    .media-modal {

                        animation: none;

                        opacity: 1;

                    }


                    .university-card,

                    .university-card:hover {

                        transform: none;

                    }


                    .card-image img {

                        transition: none;

                    }

                }

            `}</style>

        </main>

    );

};


export default WelcomeIntro;