import { gsap } from "gsap";
import {
  useCallback,
  useEffect,
  useEffectEvent,
  useRef,
  useState,
} from "react";
import "./Gallery.css";

const bundledPhotos = [
  { src: "/images/pic1.jpeg", alt: "Memory 1" },
  { src: "/images/pic2.jpeg", alt: "Memory 2" },
  { src: "/images/pic3.jpeg", alt: "Memory 3" },
  { src: "/images/pic4.jpeg", alt: "Memory 4" },
  { src: "/images/pic5.jpeg", alt: "Memory 5" },
];

function Gallery({ isActive }) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [photosRevealed, setPhotosRevealed] = useState(false);

  const photosRef = useRef([]);
  const lightboxImgRef = useRef(null);
  const currentIndexRef = useRef(0);
  const photoCountRef = useRef(bundledPhotos.length);

  const photos = bundledPhotos;
  const photoCount = photos.length;

  useEffect(() => {
    currentIndexRef.current = currentIndex;
    photoCountRef.current = photoCount;
  }, [currentIndex, photoCount]);

  // Reveal photos with GSAP when page becomes active
  useEffect(() => {
    if (isActive && !photosRevealed) {
      setTimeout(() => setPhotosRevealed(true), 10);

      // Stagger animation for photos
      gsap.fromTo(
        photosRef.current,
        {
          opacity: 0,
          y: 50,
          scale: 0.8,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.6,
          stagger: 0.12,
          ease: "back.out(1.4)",
          delay: 0.2,
        },
      );
    }
  }, [isActive, photosRevealed]);

  const openLightbox = (index) => {
    setCurrentIndex(index);
    setLightboxOpen(true);

    // Animate lightbox appearance
    if (lightboxImgRef.current) {
      gsap.fromTo(
        lightboxImgRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.4, ease: "back.out(1.4)" },
      );
    }
  };

  const closeLightbox = useCallback(() => {
    setLightboxOpen(false);
  }, []);

  // Handle body overflow in effect
  useEffect(() => {
    if (lightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxOpen]);

  const showNext = () => {
    const newIndex = (currentIndexRef.current + 1) % photoCountRef.current;

    // Animate transition
    if (lightboxImgRef.current) {
      gsap.to(lightboxImgRef.current, {
        x: -100,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setCurrentIndex(newIndex);
          gsap.fromTo(
            lightboxImgRef.current,
            { x: 100, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
          );
        },
      });
    }
  };

  const showPrev = () => {
    const newIndex =
      (currentIndexRef.current - 1 + photoCountRef.current) %
      photoCountRef.current;

    // Animate transition
    if (lightboxImgRef.current) {
      gsap.to(lightboxImgRef.current, {
        x: 100,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => {
          setCurrentIndex(newIndex);
          gsap.fromTo(
            lightboxImgRef.current,
            { x: -100, opacity: 0 },
            { x: 0, opacity: 1, duration: 0.3, ease: "power2.out" },
          );
        },
      });
    }
  };

  const handleKeyDown = useEffectEvent((e) => {
    if (!lightboxOpen) return;

    if (e.key === "Escape") {
      closeLightbox();
    } else if (e.key === "ArrowLeft") {
      showPrev();
    } else if (e.key === "ArrowRight") {
      showNext();
    }
  });

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <section className="gallery">
      <h2>📸 Your Beautiful Memories</h2>
      <div className="photos">
        {photos.map((photo, index) => (
          <img
            key={index}
            ref={(el) => (photosRef.current[index] = el)}
            src={photo.src}
            alt={photo.alt}
            onClick={() => openLightbox(index)}
            loading="lazy"
          />
        ))}
      </div>

      {lightboxOpen && (
        <div className="lightbox" onClick={closeLightbox}>
          <img
            ref={lightboxImgRef}
            src={photos[currentIndex].src}
            alt={photos[currentIndex].alt}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            className="lightbox-close"
            onClick={closeLightbox}
            aria-label="Close lightbox"
          >
            ✖
          </button>
          <button
            className="nav-btn nav-prev"
            onClick={(e) => {
              e.stopPropagation();
              showPrev();
            }}
            aria-label="Previous photo"
          >
            ‹
          </button>
          <button
            className="nav-btn nav-next"
            onClick={(e) => {
              e.stopPropagation();
              showNext();
            }}
            aria-label="Next photo"
          >
            ›
          </button>
        </div>
      )}
    </section>
  );
}

export default Gallery;
