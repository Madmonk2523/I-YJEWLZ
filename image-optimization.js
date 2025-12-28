/**
 * Image Loading Optimization
 * Improves perceived performance and handles lazy loading
 */

document.addEventListener('DOMContentLoaded', function() {
  // Preload images that are visible above the fold
  preloadCriticalImages();
  
  // Optimize lazy loaded images
  optimizeLazyImages();
  
  // Handle image load errors
  handleImageErrors();
});

/**
 * Preload critical images (logo, hero image)
 */
function preloadCriticalImages() {
  const criticalImages = document.querySelectorAll('img[src*="logo"], img[src*="backround"]');
  
  criticalImages.forEach(img => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = img.src;
    document.head.appendChild(link);
  });
}

/**
 * Optimize lazy loaded images with blur-up effect
 */
function optimizeLazyImages() {
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          
          // Add loaded class when image loads
          img.addEventListener('load', function() {
            this.classList.add('loaded');
            this.style.backgroundColor = 'transparent';
          });
          
          // Start loading the image
          if (img.dataset.src) {
            img.src = img.dataset.src;
          }
          
          // Stop observing this image
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px'
    });
    
    // Observe all lazy images
    document.querySelectorAll('img[loading="lazy"]').forEach(img => {
      imageObserver.observe(img);
    });
  }
}

/**
 * Handle image load errors gracefully
 */
function handleImageErrors() {
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', function() {
      console.error('Image failed to load:', this.src);
      this.style.backgroundColor = '#f0f0f0';
      this.alt = 'Image not available';
    });
  });
}

/**
 * Responsive image loading based on device pixel ratio
 */
function loadResponsiveImages() {
  const dpr = window.devicePixelRatio || 1;
  
  if (dpr > 1) {
    document.querySelectorAll('img[data-src-2x]').forEach(img => {
      img.src = img.dataset.src2x;
    });
  }
}

// Run on load and when network status changes
window.addEventListener('load', loadResponsiveImages);
