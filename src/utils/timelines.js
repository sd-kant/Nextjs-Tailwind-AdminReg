import { gsap, Power1 } from 'gsap';

const getDefaultTimeline = () => {
  const timeline = gsap.timeline({ paused: true });
  const contentInner = document.getElementsByClassName('content--inner')?.[0];

  timeline.from(contentInner, { duration: 0.15, autoAlpha: 0, delay: 0.15, ease: Power1.easeIn });

  return timeline;
};

export const play = () => {
  let timeline;
  timeline = getDefaultTimeline();

  window.loadPromise.then(() => requestAnimationFrame(() => timeline.play()));
};

export const exit = (node) => {
  const timeline = gsap.timeline({ paused: true });

  timeline.to(node, { duration: 0.15, autoAlpha: 0, ease: Power1.easeOut });
  timeline.play();
};
