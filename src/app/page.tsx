import { SiteHeader } from "@/components/site-header";
import { Hero } from "@/components/hero";
import { MentalModel } from "@/components/mental-model";
import { TutorialSteps } from "@/components/tutorial-steps";
import { PrimitivesStrip } from "@/components/primitives-strip";
import { EveChatbot } from "@/components/eve-chatbot";
import { FinalCTA } from "@/components/final-cta";
import { SiteFooter } from "@/components/site-footer";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Hero />
        <MentalModel />
        <TutorialSteps />
        <PrimitivesStrip />
        <EveChatbot />
        <FinalCTA />
      </main>
      <SiteFooter />
    </>
  );
}
