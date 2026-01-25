// GSAP Animation Timeline

// translating curves to interpret GSAP eases
const ruhigeAnimation = "power2.inOut";  // cubic-bezier(0.65, 0, 0.35, 1)
const schnellesErscheinen = "expo.out";  // cubic-bezier(0.16, 1, 0.3, 1)
const sanftesErscheinen = "circ.in";     // cubic-bezier(0.55, 0, 1, 0.45)

// Create timeline with delay and hold for export
const tl = gsap.timeline();

// Add 2 second delay at start
tl.to({}, { duration: 2 });

// Animate #first: slide from right + fade in
tl.from(".container .card:first-child", {
  x: "100%",            // translateX(100%) - from right
  opacity: 0,           // fade in
  duration: 2,          // 2s duration
  ease: ruhigeAnimation // ruhigeAnimation
});

// Animate #second: slide from bottom + fade in (starts after #first)
tl.from(".container .card:nth-child(2)", {
  y: "20%",                  // translateY(20%) - from bottom
  opacity: 0,                  // fade in
  duration: 1,                 // 1s duration
  ease: schnellesErscheinen    // schnellesErscheinen
}, "+=0");                     // no gap between animations (starts when #first ends)

// // Optional: Bounce effect after animations complete
tl.to(".container .card:first-child", {
  x: "-1em",
  duration: 0.5,
  ease: ruhigeAnimation
}, "+=1.2");  // start 0.8s after previous animation ends

tl.to(".container .card:nth-child(2)", {
  x: "1em",
  duration: 0.5,
  ease: ruhigeAnimation
}, "-=0.5");  // start 0.5s before previous animation ends (overlap)

// Add 5 second hold at end
tl.to({}, { duration: 5 });

// Expose timeline globally for video export
window.tl = tl;