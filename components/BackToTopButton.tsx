import React, { useState, useEffect } from 'react';
import { ArrowUpIcon } from './icons';

const BackToTopButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const toggleVisibility = () => {
    if (window.scrollY > 300) {
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-full p-3 shadow-lg transition-opacity duration-300 ease-in-out ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      aria-label="Go to top"
      title="Go to top"
      style={{
        pointerEvents: isVisible ? 'auto' : 'none', // Prevent clicking when invisible
      }}
    >
      <ArrowUpIcon className="h-6 w-6" />
    </button>
  );
};

export default BackToTopButton;
