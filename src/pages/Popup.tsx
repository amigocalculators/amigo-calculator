import React, { useState, useEffect } from "react";

const OfferPopup = () => {
  const [showPopup, setShowPopup] = useState(false);
  const [isAnimatingOut, setIsAnimatingOut] = useState(false);

  useEffect(() => {
    // Show popup after a slight delay to allow page content to load
    const timer = setTimeout(() => {
      setShowPopup(true);
    }, 700); // Increased delay for better UX

    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsAnimatingOut(true);
    // Wait for the exit animation to complete before unmounting
    const animationDuration = 400; // Match this with your CSS animation duration
    setTimeout(() => {
      setShowPopup(false);
      setIsAnimatingOut(false);
    }, animationDuration);
  };

  // Prevent scrolling when the popup is open
  useEffect(() => {
    if (showPopup) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset'; // Clean up on component unmount
    };
  }, [showPopup]);

  if (!showPopup && !isAnimatingOut) {
    return null; // Don't render anything if not showing and not animating out
  }

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ${
        isAnimatingOut ? "opacity-0" : "opacity-100"
      }`}
      onClick={handleClose} // Close when clicking outside the popup
      aria-modal="true"
      role="dialog"
      aria-labelledby="offer-popup-title"
      aria-describedby="offer-popup-description"
    >
      <div
        className={`bg-white p-8 rounded-3xl shadow-3xl max-w-md w-full text-center relative
                    transform transition-all duration-400 ease-in-out-back
                    ${isAnimatingOut ? "scale-75 opacity-0" : "scale-100 opacity-100 animate-popup-bounce"}`}
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the popup
      >
        {/* Close Button */}
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-red-700 text-4xl font-light leading-none
                     transition-transform duration-200 ease-in-out hover:rotate-90"
          onClick={handleClose}
          aria-label="Close offer popup"
        >
          &times;
        </button>

        {/* Dynamic Icon */}
        <div className="mb-5 text-red-500 animate-pulse-fade">
          <span className="text-7xl">✨</span> {/* A more dynamic icon */}
        </div>

        {/* Main Offer Title */}
        <h2 id="offer-popup-title" className="text-4xl font-extrabold text-red-700 mb-3 leading-tight tracking-tight">
          Limited Time Offer!
        </h2>

        {/* Offer Details */}
        <p id="offer-popup-description" className="text-xl text-gray-800 mb-7 px-4">
          Unwrap an amazing deal: <span className="font-bold text-red-600">Buy 2, Get 1 FREE!</span>
          <br />Don't miss this exclusive opportunity.
        </p>

        {/* Call to Action Button */}
        <button
          onClick={handleClose}
          className="mt-4 px-10 py-4 bg-gradient-to-r from-red-600 to-red-800 text-white font-bold text-lg
                     rounded-full shadow-lg hover:shadow-xl transition-all duration-300
                     transform hover:scale-105 active:scale-95 animate-button-pop"
        >
          Grab Your Free Item Now!
        </button>

        {/* Subtle Footer Text */}
        <p className="mt-6 text-sm text-gray-500">
          Offer valid while supplies last. Terms and conditions apply.
        </p>
      </div>
    </div>
  );
};

export default OfferPopup;