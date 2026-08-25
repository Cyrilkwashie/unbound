import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { Cormorant_Garamond, Inter_Tight, Unbounded } from "next/font/google";
import { BagProvider } from "@/context/BagContext";
import { FrameSequenceProvider } from "@/context/FrameSequenceContext";
import { SmoothScrollProvider } from "@/context/LenisContext";
import { BagDrawer } from "@/components/BagDrawer";
import { CustomCursor } from "@/components/CustomCursor";
import { GrainOverlay } from "@/components/GrainOverlay";
import { LoadingScreen } from "@/components/LoadingScreen";
import { Navbar } from "@/components/Navbar";
import "@/styles/globals.css";
import "lenis/dist/lenis.css";

const unbounded = Unbounded({
  subsets: ["latin"],
  variable: "--font-unbounded",
  display: "swap",
  weight: ["300", "400", "500"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
});

const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
  weight: ["300", "400", "500"],
});

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter();
  const isHome = router.pathname === "/";
  const isAtelier = router.pathname.startsWith("/atelier");

  return (
    <div
      className={`${unbounded.variable} ${cormorant.variable} ${interTight.variable} font-sans antialiased`}
    >
      <FrameSequenceProvider>
        <BagProvider>
          <SmoothScrollProvider>
            {isAtelier ? null : (
              <a
                href={isHome ? "#house" : "/shop"}
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-ivory focus:px-4 focus:py-2 focus:text-void-0"
              >
                Skip to the house
              </a>
            )}
            {isHome ? <LoadingScreen /> : null}
            <GrainOverlay />
            <CustomCursor />
            {isAtelier ? null : (
              <>
                <Navbar />
                <BagDrawer />
              </>
            )}
            <Component {...pageProps} />
          </SmoothScrollProvider>
        </BagProvider>
      </FrameSequenceProvider>
    </div>
  );
}
