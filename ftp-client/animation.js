/**
 * =============================================================================
 * GSAP Animation Timeline
 * =============================================================================
 * 
 * This file defines the GSAP animation timeline for the slide animation.
 * The timeline is exposed globally as `window.tl` for video export.
 * 
 * =============================================================================
 */

// -----------------------------------------------------------------------------
// Easing Functions (Named for clarity)
// -----------------------------------------------------------------------------

const EASING = {
  ruhigeAnimation: "power2.inOut",     // Smooth acceleration and deceleration, cubic-bezier(0.65, 0, 0.35, 1)
  schnellesErscheinen: "expo.out",    // Fast start, gradual slowdown, cubic-bezier(0.16, 1, 0.3, 1)
  sanftesErscheinen: "circ.in"       // Gradual start, faster finish, cubic-bezier(0.55, 0, 1, 0.45)
};

// -----------------------------------------------------------------------------
// Animation Timeline
// -----------------------------------------------------------------------------

// Create the main timeline
const tl = gsap.timeline();

// --- START DELAY ---
// Hold on empty frame for 2 seconds before animation begins
tl.to({}, { duration: 2 });

// --- FIRST ELEMENT: Slide in from right ---
tl.from(".animation-container .animated-element:first-child", {
  x: "100%",              // Start off-screen to the right
  opacity: 0,             // Fade in
  duration: 2,
  ease: EASING.ruhigeAnimation
});

// --- SECOND ELEMENT: Slide in from below ---
// Starts immediately after first animation completes
tl.from(".animation-container .animated-element:nth-child(2)", {
  y: "20%",               // Start slightly below final position
  opacity: 0,             // Fade in
  duration: 1,
  ease: EASING.schnellesErscheinen
}, "+=0");                // No gap between animations

// --- SUBTLE BOUNCE: Both elements shift slightly ---
// First element moves left
tl.to(".animation-container .animated-element:first-child", {
  x: "-1em",
  duration: 0.5,
  ease: EASING.ruhigeAnimation
}, "+=1.2");              // Wait 1.2 seconds after previous animation

// Second element moves right (overlaps with first element's movement)
tl.to(".animation-container .animated-element:nth-child(2)", {
  x: "1em",
  duration: 0.5,
  ease: EASING.ruhigeAnimation
}, "-=0.5");              // Start 0.5 seconds before previous animation ends

// --- END HOLD ---
// Hold final frame for 5 seconds before video ends
tl.to({}, { duration: 5 });

// -----------------------------------------------------------------------------
// Export Timeline for Video Capture
// -----------------------------------------------------------------------------

// The video export server needs access to this timeline
window.tl = tl;