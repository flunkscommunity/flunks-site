import { type NextPage } from "next";
import Head from "next/head";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { isMobileApp } from "utils/buildMode";

const OrbArenaGame = dynamic(() => import("components/games/orbArena/OrbArenaGame"), {
  ssr: false,
});

const OrbArenaPage: NextPage = () => {
  const router = useRouter();
  const [desktopReady, setDesktopReady] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const update = () => {
      const forced = window.location.search.includes("force=1");
      const hasDesktopWidth = window.innerWidth >= 1024;
      const blockedAsMobileApp = isMobileApp();

      setDesktopReady(forced || (hasDesktopWidth && !blockedAsMobileApp));
      setChecked(true);
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  if (!checked) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-[#030712] text-white">
        <p className="font-mono text-sm uppercase tracking-[0.35em] text-slate-300">Preparing arena...</p>
      </div>
    );
  }

  if (!desktopReady) {
    return (
      <>
        <Head>
          <title>Flunks Orb Arena</title>
        </Head>
        <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,#0f172a_0%,#020617_55%,#000000_100%)] p-6 text-white">
          <div className="max-w-xl rounded-[32px] border border-cyan-400/20 bg-black/40 p-8 backdrop-blur">
            <p className="font-mono text-xs uppercase tracking-[0.4em] text-cyan-300">Desktop Only</p>
            <h1 className="mt-4 text-4xl font-black uppercase tracking-[0.12em] text-white">Orb Arena needs full desktop input.</h1>
            <p className="mt-4 text-sm leading-6 text-slate-200">
              This build uses pointer lock, keyboard movement, and a fullscreen render loop. Open it on desktop and it will run there.
            </p>
            <p className="mt-3 text-xs leading-5 text-slate-400">
              If you are already on desktop and this gate still appears, open <span className="font-mono text-slate-300">/orb-arena?force=1</span>.
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-8 rounded-full border border-white/20 bg-white/10 px-6 py-3 font-mono text-xs uppercase tracking-[0.3em] text-white transition hover:bg-white/20"
            >
              Return to Desktop
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Flunks Orb Arena</title>
        <meta
          name="description"
          content="Desktop-only fullscreen FPS arena prototype for flunks.net."
        />
      </Head>
      <OrbArenaGame onExit={() => router.push("/")} />
    </>
  );
};

export default OrbArenaPage;
