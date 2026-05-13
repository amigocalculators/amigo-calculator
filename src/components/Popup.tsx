'use client';

import React, { useState, useEffect } from 'react';

const OfferPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 700);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsAnimatingOut(true);
    setTimeout(() => {
      setShowPopup(false);
      setIsAnimatingOut(false);
    }, 400);
  };

  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [showPopup]);

  if (!showPopup && !isAnimatingOut) return null;

  return (
    <div
      className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        isAnimatingOut ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={handleClose}
      aria-modal="true"
      role="dialog"
      aria-labelledby="offer-popup-title"
    >
      <div
        className={`bg-white p-8 rounded-3xl shadow-3xl max-w-md w-full text-center relative transform transition-all duration-400 ${
          isAnimatingOut ? 'scale-75 opacity-0' : 'scale-100 opacity-100 animate-popup-bounce'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-700 text-4xl font-light leading-none transition-transform duration-200 hover:rotate-90"
          onClick={handleClose}
          aria-label="Close offer popup"
        >
          &times;
        </button>

        <div className="mb-5 text-red-500 animate-pulse-fade">
          <span className="text-7xl">✨</span>
        </div>

        <h2 id="offer-popup-title" className="text-4xl font-extrabold text-red-700 mb-3 leading-tight tracking-tight">
          Limited Time Offer!
        </h2>

        <p className="text-xl text-gray-800 mb-7 px-4">
          Unwrap an amazing deal: <span className="font-bold text-red-600">Buy 2, Get 1 FREE!</span>
          <br />Don&apos;t miss this exclusive opportunity.
        </p>

        <button
          onClick={handleClose}
          className="mt-4 px-10 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 active:scale-95 animate-button-pop"
        >
          Grab Your Free Item Now!
        </button>

        <p className="mt-6 text-sm text-gray-500">
          Offer valid while supplies last. Terms and conditions apply.
        </p>
      </div>
    </div>
  );
};

export default OfferPopup;
