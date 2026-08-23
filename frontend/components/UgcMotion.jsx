import { useEffect } from "react";

// גלילה חלקה + חשיפה בגלילה. נטען רק בדף UGC.
export default function UgcMotion() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    let ctx;
    let lenis;
    let tick;
    let gsapApi;
    let killed = false;

    (async () => {
      try {
        const [gsapMod, stMod, lenisMod] = await Promise.all([
          import("gsap"),
          import("gsap/ScrollTrigger"),
          import("lenis"),
        ]);
        if (killed) return;

        const gsap = gsapMod.gsap || gsapMod.default;
        gsapApi = gsap;
        const { ScrollTrigger } = stMod;
        const Lenis = lenisMod.default;
        gsap.registerPlugin(ScrollTrigger);

        lenis = new Lenis({
          duration: 1.2,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          smoothWheel: true,
          touchMultiplier: 1.15,
        });
        lenis.on("scroll", ScrollTrigger.update);
        tick = (time) => {
          lenis?.raf(time * 1000);
        };
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);

        ctx = gsap.context(() => {
          gsap.utils.toArray(".ugc-reveal").forEach((el) => {
            gsap.fromTo(
              el,
              { y: 42, opacity: 0, clipPath: "inset(16% 0 0 0)" },
              {
                y: 0,
                opacity: 1,
                clipPath: "inset(0% 0 0 0)",
                duration: 1.05,
                ease: "power3.out",
                scrollTrigger: { trigger: el, start: "top 86%" },
              }
            );
          });

          gsap.utils.toArray(".ugc-phone-card").forEach((el, i) => {
            gsap.fromTo(
              el,
              { y: 64, opacity: 0, rotate: i % 2 ? 2.4 : -2.4 },
              {
                y: 0,
                opacity: 1,
                rotate: 0,
                duration: 0.9,
                ease: "power3.out",
                scrollTrigger: { trigger: el, start: "top 92%" },
              }
            );
          });
        });
      } catch {
        /* גלילה רגילה אם GSAP/Lenis נכשלים */
      }
    })();

    return () => {
      killed = true;
      ctx?.revert();
      if (tick && gsapApi) gsapApi.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
  }, []);

  return null;
}
