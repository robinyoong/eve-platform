import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { MentalModel } from "@/components/mental-model";
import { TutorialSteps } from "@/components/tutorial-steps";
import { PrimitivesStrip } from "@/components/primitives-strip";
import { FinalCTA } from "@/components/final-cta";
import { SiteFooter } from "@/components/site-footer";
import { ChatWidget } from "@/components/chat-widget";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <MentalModel />
        <TutorialSteps />
        <PrimitivesStrip />
        <FinalCTA />
      </main>
      <SiteFooter />
      <ChatWidget />
    </>
  );
}
