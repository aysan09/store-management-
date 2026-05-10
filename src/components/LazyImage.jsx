import React, { useState, useRef, useEffect } from 'react';

const LazyImage = ({ 
  src, 
  alt, 
  className, 
  placeholderSrc, 
  onLoad, 
  onError,
  style,
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef();
  const [imageSrc, setImageSrc] = useState(placeholderSrc || null);

  useEffect(() => {
    let observer;
    let timeoutId;

    const loadImage = () => {
      const img = new Image();
      img.src = src;
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        if (onLoad) onLoad();
      };
      
      img.onerror = () => {
        setHasError(true);
        if (onError) onError();
      };
    };

    const handleIntersection = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Add small delay to prevent layout thrashing
          timeoutId = setTimeout(loadImage, 100);
          observer.disconnect();
        }
      });
    };

    if (window.IntersectionObserver) {
      observer = new IntersectionObserver(handleIntersection, {
        threshold: 0.01,
        rootMargin: '50px'
      });

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }
    } else {
      // Fallback for browsers that don't support IntersectionObserver
      timeoutId = setTimeout(loadImage, 100);
    }

    return () => {
      if (observer) observer.disconnect();
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [src, onLoad, onError]);

  const imageStyle = {
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
    ...style
  };

  return (
    <div ref={imgRef} className={`lazy-image-container ${className || ''}`} {...props}>
      {imageSrc && (
        <img 
          src={imageSrc} 
          alt={alt}
          className="lazy-image"
          style={imageStyle}
          loading="lazy"
        />
      )}
      
      {!isLoaded && !hasError && (
        <div className="image-placeholder">
          <div className="loading-spinner" aria-hidden="true"></div>
          <span className="sr-only">Loading image...</span>
        </div>
      )}
      
      {hasError && (
        <div className="image-error">
          <span>Failed to load image</span>
        </div>
      )}
    </div>
  );
};

export default LazyImage;