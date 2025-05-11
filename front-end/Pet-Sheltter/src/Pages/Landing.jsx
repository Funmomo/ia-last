import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../Styles/landing.css";

const Landing = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const slideContainerRef = useRef(null);

  const originalSlides = [
    {
      url: "https://images.unsplash.com/photo-1511044568932-338cba0ad803?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3",
      alt: "Two adorable cats resting together",
    },
    {
      url: "https://images.unsplash.com/photo-1552053831-71594a27632d?q=80&w=1924&auto=format&fit=crop&ixlib=rb-4.0.3",
      alt: "Cute dog with floppy ears",
    },
    {
      url: "https://images.unsplash.com/photo-1592194996308-7b43878e84a6?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3",
      alt: "Adorable puppy looking at camera",
    },
  ];

  // Create an array with duplicated slides for infinite effect
  const slides = [...originalSlides, ...originalSlides];

  const handleTransitionEnd = () => {
    if (currentSlide >= originalSlides.length) {
      slideContainerRef.current.style.transition = "none";
      setCurrentSlide(0);
      // Force a reflow
      slideContainerRef.current.offsetHeight;
      setTimeout(() => {
        slideContainerRef.current.style.transition =
          "transform 0.8s ease-in-out";
      }, 10);
    }
  };

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => {
      const newIndex = prev - 1;
      return newIndex < 0 ? slides.length - 1 : newIndex;
    });
  }, [slides.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  useEffect(() => {
    let timer;
    if (isAutoPlaying) {
      timer = setInterval(nextSlide, 2000); // Changed to 3 seconds
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isAutoPlaying, nextSlide]);

  // Reset auto-play after 10 seconds of inactivity
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAutoPlaying(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, [currentSlide]);

  return (
    <>
      <nav className="nav-container">
        <div className="nav-content">
          <a href="/" className="nav-logo">
            PetShelter
          </a>

          <ul className="nav-menu">
            <li>
              <a href="/about">About</a>
            </li>
            <li>
              <a href="/pets">Our Pets</a>
            </li>
            <li>
              <a href="/contact">Contact</a>
            </li>
          </ul>

          <div className="nav-icons">
            <button
              className="nav-icon"
              onClick={() => navigate("/search")}
              aria-label="Search"
            >
              🔍
            </button>
            <button
              className="nav-icon"
              onClick={() => navigate("/login")}
              aria-label="Account"
            >
              👤
            </button>
          </div>

          <button className="mobile-menu-button" aria-label="Menu">
            ☰
          </button>
        </div>
      </nav>

      <div className="landing-container">
        <div className="hero-section">
          <h1 className="hero-title">Welcome to PetShelter</h1>
          <h2 className="hero-subtitle">Find your perfect companion</h2>

          <div className="cta-buttons">
            <button
              className="cta-button cta-primary"
              onClick={() => navigate("/register")}
            >
              Register Now
            </button>
            <button
              className="cta-button cta-secondary"
              onClick={() => navigate("/login")}
            >
              Login
            </button>
          </div>

          <div className="hero-image">
            <div className="slideshow">
              <div
                ref={slideContainerRef}
                className="slideshow-container"
                style={{
                  transform: `translateX(calc(-${currentSlide * 530}px))`,
                  width: `${slides.length * 530}px`,
                }}
                onTransitionEnd={handleTransitionEnd}
              >
                {slides.map((slide, index) => (
                  <div
                    key={index}
                    className={`slide-card ${
                      index === currentSlide ? "active" : ""
                    }`}
                  >
                    <img
                      src={slide.url}
                      alt={slide.alt}
                      loading={index < 3 ? "eager" : "lazy"}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="slide-controls">
              <button
                className="slide-arrow"
                onClick={() => {
                  prevSlide();
                  setIsAutoPlaying(false);
                }}
                aria-label="Previous slide"
              >
                ←
              </button>
              <div className="slide-dots">
                {originalSlides.map((_, index) => (
                  <button
                    key={index}
                    className={`slide-dot ${
                      index === currentSlide % originalSlides.length
                        ? "active"
                        : ""
                    }`}
                    onClick={() => goToSlide(index)}
                    aria-label={`Go to slide ${index + 1}`}
                  />
                ))}
              </div>
              <button
                className="slide-arrow"
                onClick={() => {
                  nextSlide();
                  setIsAutoPlaying(false);
                }}
                aria-label="Next slide"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Landing;
