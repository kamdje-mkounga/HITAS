import React, { useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Image as ImageIcon,
    MapPin,
    Play,
    X,
    Video
} from 'lucide-react';

import gem1 from '../assets/gem1.png';
import gem2 from '../assets/gem2.png';
import gem3 from '../assets/gem3.png';
import gem4 from '../assets/gem4.webp';
import gem5 from '../assets/gem5.webp';

/*
 * ============================================================
 * HITAS — UNIVERSITIES & STUDENT MEDIA
 * ============================================================
 *
 * Cette page présente :
 *
 * 1. Les universités partenaires HITAS.
 * 2. Les photos prises par les étudiants.
 * 3. Les vidéos prises par les étudiants.
 *
 * Lorsqu'un utilisateur clique sur une université,
 * une galerie s'ouvre avec les différents médias.
 *
 * ------------------------------------------------------------
 * AJOUTER UNE PHOTO
 * ------------------------------------------------------------
 *
 * Exemple :
 *
 * import studentPhoto from '../assets/student-photo.jpg';
 *
 * puis dans "media":
 *
 * {
 *     type: 'image',
 *     src: studentPhoto,
 *     caption: 'Campus vu par les étudiants'
 * }
 *
 * ------------------------------------------------------------
 * AJOUTER UNE VIDÉO
 * ------------------------------------------------------------
 *
 * Exemple :
 *
 * import campusVideo from '../assets/videos/campus.mp4';
 *
 * puis :
 *
 * {
 *     type: 'video',
 *     src: campusVideo,
 *     caption: 'Une journée sur le campus'
 * }
 *
 * ============================================================
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

    /*
     * ============================================================
     * OUVRIR UNE UNIVERSITÉ
     * ============================================================
     */

    const openUniversity = (university) => {

        setSelectedUniversity(university);

        setActiveMedia(0);

        document.body.style.overflow = 'hidden';
    };

    /*
     * ============================================================
     * FERMER LA GALERIE
     * ============================================================
     */

    const closeUniversity = () => {

        setSelectedUniversity(null);

        setActiveMedia(0);

        document.body.style.overflow = '';
    };

    /*
     * ============================================================
     * MÉDIA SUIVANT
     * ============================================================
     */

    const nextMedia = () => {

        if (!selectedUniversity) return;

        const total = selectedUniversity.media.length;

        setActiveMedia((current) => {

            if (current === total - 1) {
                return 0;
            }

            return current + 1;
        });
    };

    /*
     * ============================================================
     * MÉDIA PRÉCÉDENT
     * ============================================================
     */

    const previousMedia = () => {

        if (!selectedUniversity) return;

        const total = selectedUniversity.media.length;

        setActiveMedia((current) => {

            if (current === 0) {
                return total - 1;
            }

            return current - 1;
        });
    };

    /*
     * ============================================================
     * TOUCHE ESC
     * ============================================================
     */

    React.useEffect(() => {

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

        window.addEventListener('keydown', handleKeyDown);

        return () => {

            window.removeEventListener(
                'keydown',
                handleKeyDown
            );

            document.body.style.overflow = '';
        };

    }, [selectedUniversity]);

    /*
     * ============================================================
     * RENDER
     * ============================================================
     */

    return (

        <main className="hitas-page">

            {/* ====================================================
                HERO
            ==================================================== */}

            <section className="hero">

                <div className="hero-orb hero-orb-one" />

                <div className="hero-orb hero-orb-two" />

                <div className="hero-content">

                    <div className="eyebrow">

                        <span className="dot" />

                        COMMUNAUTÉ HITAS

                    </div>

                    <h1>

                        Découvrez les universités

                        <span>
                            de notre réseau.
                        </span>

                    </h1>

                    <p>

                        Explorez les universités partenaires HITAS
                        et découvrez les photos et vidéos prises
                        directement par nos étudiants sur leurs campus.

                    </p>

                </div>

            </section>


            {/* ====================================================
                UNIVERSITIES
            ==================================================== */}

            <section className="universities-section">

                <div className="section-heading">

                    <div className="section-label">

                        <ImageIcon size={14} />

                        UNIVERSITÉS & EXPÉRIENCES ÉTUDIANTES

                    </div>

                    <h2>

                        La vie sur les

                        <span>
                            campus HITAS
                        </span>

                    </h2>

                    <p>

                        Cliquez sur une université pour découvrir
                        les photos et vidéos partagées par les étudiants.

                    </p>

                </div>


                {/* ====================================================
                    GRID
                ==================================================== */}

                <div className="universities-grid">

                    {universities.map((university, index) => (

                        <article
                            key={university.id}
                            className="university-card"
                            style={{
                                '--delay': `${index * 70}ms`
                            }}
                            tabIndex={0}
                            role="button"
                            onClick={() =>
                                openUniversity(university)
                            }
                            onKeyDown={(event) => {

                                if (
                                    event.key === 'Enter' ||
                                    event.key === ' '
                                ) {

                                    event.preventDefault();

                                    openUniversity(university);
                                }

                            }}
                        >

                            {/* ====================================================
                                IMAGE
                            ==================================================== */}

                            <div className="card-image">

                                <img
                                    src={university.image}
                                    alt={university.name}
                                />

                                <div className="image-shade" />


                                {/* LOCATION */}

                                <div className="card-location">

                                    <MapPin size={12} />

                                    <span>
                                        {university.city},
                                        {' '}
                                        {university.country}
                                    </span>

                                </div>


                                {/* MEDIA COUNT */}

                                <div className="media-badge">

                                    <ImageIcon size={12} />

                                    <span>
                                        {university.media.length}
                                        {' '}
                                        médias
                                    </span>

                                </div>


                                {/* HOVER */}

                                <div className="view-overlay">

                                    <div className="view-button">

                                        <ImageIcon size={16} />

                                        Voir les médias

                                    </div>

                                </div>

                            </div>


                            {/* ====================================================
                                CARD CONTENT
                            ==================================================== */}

                            <div className="card-content">

                                <div className="card-index">

                                    0{index + 1}

                                </div>

                                <h3>
                                    {university.name}
                                </h3>

                                <p>
                                    {university.description}
                                </p>

                                <div className="card-action">

                                    <span>
                                        Photos & vidéos des étudiants
                                    </span>

                                    <ChevronRight size={17} />

                                </div>

                            </div>

                        </article>

                    ))}

                </div>

            </section>


            {/* ====================================================
                GALLERY MODAL
            ==================================================== */}

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

                        {/* ====================================================
                            CLOSE
                        ==================================================== */}

                        <button
                            type="button"
                            className="close-button"
                            onClick={closeUniversity}
                            aria-label="Fermer"
                        >

                            <X size={20} />

                        </button>


                        {/* ====================================================
                            MODAL HEADER
                        ==================================================== */}

                        <div className="modal-header">

                            <div>

                                <span className="modal-kicker">

                                    EXPÉRIENCE ÉTUDIANTE

                                </span>

                                <h2>
                                    {selectedUniversity.name}
                                </h2>

                                <p>

                                    <MapPin size={13} />

                                    {selectedUniversity.city},
                                    {' '}
                                    {selectedUniversity.country}

                                </p>

                            </div>

                        </div>


                        {/* ====================================================
                            MEDIA VIEWER
                        ==================================================== */}

                        <div className="media-viewer">

                            {selectedUniversity.media[
                                activeMedia
                            ]?.type === 'video' ? (

                                <video
                                    src={
                                        selectedUniversity.media[
                                            activeMedia
                                        ].src
                                    }
                                    controls
                                    playsInline
                                />

                            ) : (

                                <img
                                    src={
                                        selectedUniversity.media[
                                            activeMedia
                                        ]?.src
                                    }
                                    alt={
                                        selectedUniversity.media[
                                            activeMedia
                                        ]?.caption ||
                                        selectedUniversity.name
                                    }
                                />

                            )}


                            {/* PREVIOUS */}

                            {selectedUniversity.media.length > 1 && (

                                <button
                                    type="button"
                                    className="media-nav media-prev"
                                    onClick={previousMedia}
                                    aria-label="Média précédent"
                                >

                                    <ChevronLeft size={22} />

                                </button>

                            )}


                            {/* NEXT */}

                            {selectedUniversity.media.length > 1 && (

                                <button
                                    type="button"
                                    className="media-nav media-next"
                                    onClick={nextMedia}
                                    aria-label="Média suivant"
                                >

                                    <ChevronRight size={22} />

                                </button>

                            )}


                            {/* COUNTER */}

                            <div className="media-counter">

                                {activeMedia + 1}

                                {' / '}

                                {selectedUniversity.media.length}

                            </div>

                        </div>


                        {/* ====================================================
                            MEDIA INFORMATION
                        ==================================================== */}

                        <div className="media-info">

                            <div className="media-type">

                                {selectedUniversity.media[
                                    activeMedia
                                ]?.type === 'video' ? (

                                    <Video size={13} />

                                ) : (

                                    <ImageIcon size={13} />

                                )}

                                {selectedUniversity.media[
                                    activeMedia
                                ]?.type === 'video'
                                    ? 'VIDÉO'
                                    : 'PHOTO'}

                            </div>

                            <p>

                                {
                                    selectedUniversity.media[
                                        activeMedia
                                    ]?.caption
                                }

                            </p>

                        </div>


                        {/* ====================================================
                            THUMBNAILS
                        ==================================================== */}

                        {selectedUniversity.media.length > 1 && (

                            <div className="media-thumbnails">

                                {selectedUniversity.media.map(
                                    (media, index) => (

                                        <button
                                            type="button"
                                            key={`${media.src}-${index}`}
                                            className={`
                                                thumbnail
                                                ${index === activeMedia
                                                    ? 'thumbnail-active'
                                                    : ''
                                                }
                                            `}
                                            onClick={() =>
                                                setActiveMedia(index)
                                            }
                                            aria-label={`Voir le média ${index + 1}`}
                                        >

                                            {media.type === 'video' ? (

                                                <video
                                                    src={media.src}
                                                    muted
                                                    preload="metadata"
                                                />

                                            ) : (

                                                <img
                                                    src={media.src}
                                                    alt={`Média ${index + 1}`}
                                                />

                                            )}

                                            {media.type === 'video' && (

                                                <span className="thumbnail-play">

                                                    <Play
                                                        size={11}
                                                        fill="currentColor"
                                                    />

                                                </span>

                                            )}

                                        </button>

                                    )
                                )}

                            </div>

                        )}

                    </div>

                </div>

            )}


            {/* ====================================================
                FOOTER
            ==================================================== */}

            <footer className="footer">

                <span>
                    HITAS
                </span>

                <span>
                    •
                </span>

                <span>
                    Universités & expériences étudiantes
                </span>

            </footer>


            {/* ====================================================
                CSS
            ==================================================== */}

            <style>{`

                * {
                    box-sizing: border-box;
                }


                /* ==================================================
                   PAGE
                ================================================== */

                .hitas-page {

                    min-height: 100vh;

                    background:
                        radial-gradient(
                            circle at 50% 0%,
                            rgba(124, 58, 237, 0.15),
                            transparent 35%
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
                   HERO
                ================================================== */

                .hero {

                    position: relative;

                    min-height: 430px;

                    display: flex;

                    align-items: center;

                    justify-content: center;

                    padding: 80px 20px 70px;

                    overflow: hidden;

                    border-bottom:
                        1px solid
                        rgba(167, 139, 250, 0.1);

                }


                .hero-content {

                    position: relative;

                    z-index: 2;

                    width:
                        min(850px, 100%);

                    text-align: center;

                }


                .eyebrow {

                    display: inline-flex;

                    align-items: center;

                    gap: 8px;

                    padding: 8px 13px;

                    margin-bottom: 22px;

                    border:
                        1px solid
                        rgba(255,255,255,.11);

                    border-radius: 999px;

                    background:
                        rgba(255,255,255,.045);

                    color:
                        rgba(255,255,255,.6);

                    font-size: 9px;

                    font-weight: 800;

                    letter-spacing: .15em;

                }


                .dot {

                    width: 6px;

                    height: 6px;

                    border-radius: 50%;

                    background: #a78bfa;

                    box-shadow:
                        0 0 14px
                        rgba(167,139,250,.8);

                }


                .hero h1 {

                    margin: 0;

                    font-size:
                        clamp(42px, 6vw, 72px);

                    line-height: 1;

                    letter-spacing: -.055em;

                    font-weight: 850;

                }


                .hero h1 span {

                    display: block;

                    margin-top: 8px;

                    color: #a78bfa;

                }


                .hero p {

                    max-width: 650px;

                    margin: 24px auto 0;

                    color:
                        rgba(255,255,255,.55);

                    font-size: 14px;

                    line-height: 1.75;

                }


                /* ==================================================
                   HERO ORBS
                ================================================== */

                .hero-orb {

                    position: absolute;

                    border-radius: 50%;

                    filter: blur(80px);

                    pointer-events: none;

                }


                .hero-orb-one {

                    width: 350px;

                    height: 350px;

                    top: -180px;

                    left: 12%;

                    background:
                        rgba(99,102,241,.16);

                }


                .hero-orb-two {

                    width: 300px;

                    height: 300px;

                    right: 8%;

                    bottom: -190px;

                    background:
                        rgba(168,85,247,.13);

                }


                /* ==================================================
                   UNIVERSITIES SECTION
                ================================================== */

                .universities-section {

                    width:
                        min(1180px, calc(100% - 40px));

                    margin: 0 auto;

                    padding: 75px 0 90px;

                }


                .section-heading {

                    max-width: 720px;

                    margin:
                        0 auto 45px;

                    text-align: center;

                }


                .section-label {

                    display: inline-flex;

                    align-items: center;

                    gap: 7px;

                    margin-bottom: 13px;

                    color: #a78bfa;

                    font-size: 9px;

                    font-weight: 800;

                    letter-spacing: .15em;

                }


                .section-heading h2 {

                    margin: 0;

                    font-size:
                        clamp(30px, 4vw, 46px);

                    line-height: 1.05;

                    letter-spacing: -.04em;

                }


                .section-heading h2 span {

                    color: #a78bfa;

                }


                .section-heading p {

                    max-width: 570px;

                    margin: 16px auto 0;

                    color:
                        rgba(255,255,255,.46);

                    font-size: 13px;

                    line-height: 1.7;

                }


                /* ==================================================
                   GRID
                ================================================== */

                .universities-grid {

                    display: grid;

                    grid-template-columns:
                        repeat(3, 1fr);

                    gap: 22px;

                }


                /* ==================================================
                   CARD
                ================================================== */

                .university-card {

                    position: relative;

                    overflow: hidden;

                    border:
                        1px solid
                        rgba(167,139,250,.14);

                    border-radius: 20px;

                    background:
                        rgba(10,11,28,.86);

                    box-shadow:
                        0 20px 60px
                        rgba(0,0,0,.2);

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
                        rgba(167,139,250,.4);

                    box-shadow:
                        0 30px 75px
                        rgba(0,0,0,.35);

                }


                /* ==================================================
                   CARD IMAGE
                ================================================== */

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
                        brightness(1.06);

                }


                .image-shade {

                    position: absolute;

                    inset: 0;

                    background:
                        linear-gradient(
                            to bottom,
                            rgba(0,0,0,.02) 35%,
                            rgba(4,5,16,.88) 100%
                        );

                }


                /* ==================================================
                   LOCATION
                ================================================== */

                .card-location {

                    position: absolute;

                    left: 14px;

                    bottom: 13px;

                    display: flex;

                    align-items: center;

                    gap: 5px;

                    color:
                        rgba(255,255,255,.78);

                    font-size: 9px;

                    font-weight: 650;

                }


                .card-location svg {

                    color: #c4b5fd;

                }


                /* ==================================================
                   MEDIA BADGE
                ================================================== */

                .media-badge {

                    position: absolute;

                    right: 13px;

                    bottom: 12px;

                    display: flex;

                    align-items: center;

                    gap: 5px;

                    padding: 6px 8px;

                    border:
                        1px solid
                        rgba(255,255,255,.13);

                    border-radius: 8px;

                    background:
                        rgba(4,5,16,.45);

                    backdrop-filter:
                        blur(10px);

                    color:
                        rgba(255,255,255,.7);

                    font-size: 8px;

                    font-weight: 750;

                }


                /* ==================================================
                   HOVER OVERLAY
                ================================================== */

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

                    padding: 10px 14px;

                    border:
                        1px solid
                        rgba(255,255,255,.18);

                    border-radius: 10px;

                    background:
                        rgba(124,58,237,.75);

                    color: #fff;

                    font-size: 10px;

                    font-weight: 750;

                }


                /* ==================================================
                   CARD CONTENT
                ================================================== */

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
                        rgba(167,139,250,.55);

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
                        rgba(255,255,255,.45);

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
                        rgba(255,255,255,.5);

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
                   MODAL BACKDROP
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
                        rgba(1,2,8,.82);

                    backdrop-filter:
                        blur(14px);

                    animation:
                        fade-in .25s ease;

                }


                /* ==================================================
                   MODAL
                ================================================== */

                .media-modal {

                    position: relative;

                    width:
                        min(900px, 100%);

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


                /* ==================================================
                   CLOSE
                ================================================== */

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


                /* ==================================================
                   MODAL HEADER
                ================================================== */

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
                        clamp(22px, 4vw, 32px);

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


                /* ==================================================
                   MEDIA VIEWER
                ================================================== */

                .media-viewer {

                    position: relative;

                    height:
                        min(58vh, 520px);

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


                /* ==================================================
                   MEDIA NAVIGATION
                ================================================== */

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

                    transition:
                        background .2s ease,
                        transform .2s ease;

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


                /* ==================================================
                   COUNTER
                ================================================== */

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


                /* ==================================================
                   MEDIA INFO
                ================================================== */

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


                /* ==================================================
                   THUMBNAILS
                ================================================== */

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

                    display: flex;

                    justify-content: center;

                    align-items: center;

                    gap: 8px;

                    padding:
                        18px 20px 28px;

                    color:
                        rgba(255,255,255,.25);

                    font-size: 9px;

                    letter-spacing: .05em;

                }


                .footer span:first-child {

                    color:
                        rgba(255,255,255,.55);

                    font-weight: 800;

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
                            repeat(2, 1fr);

                    }

                }


                /* ==================================================
                   MOBILE
                ================================================== */

                @media (max-width: 640px) {

                    .hero {

                        min-height: 390px;

                        padding:
                            65px 18px 55px;

                    }


                    .hero h1 {

                        font-size:
                            clamp(38px, 12vw, 55px);

                    }


                    .hero p {

                        font-size: 12px;

                    }


                    .universities-section {

                        width:
                            min(100% - 28px, 520px);

                        padding:
                            55px 0 65px;

                    }


                    .universities-grid {

                        grid-template-columns: 1fr;

                        gap: 17px;

                    }


                    .card-image {

                        height: 230px;

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