import type { Metadata } from "next";
import { ChatbotPanel } from "@/components/chatbot-panel";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Chatbot — Learn eve",
  description:
    "Ask an interactive assistant about eve, Vercel's agent framework. Switch between Grok, Claude, and ChatGPT while answers stream live.",
};

export default function ChatbotPage() {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(255,255,255,0.05),_transparent_55%)]"
          />
          <div className="relative mx-auto max-w-6xl px-6 py-12 md:py-16">
            <p className="animate-fade-up font-mono text-sm text-fg-muted">
              eve / chatbot
            </p>
            <h1 className="animate-fade-up-delay-1 mt-3 text-3xl font-semibold tracking-tight text-fg sm:text-4xl">
              Chat about eve
            </h1>
            <p className="animate-fade-up-delay-2 mt-3 max-w-2xl text-base leading-7 text-fg-muted">
              An interactive guide to Vercel&apos;s agent framework. Switch
              models, stream answers, and learn instructions, skills, tools,
              sandboxes, and channels.
            </p>
            <div className="animate-fade-up-delay-3 mt-8">
              <ChatbotPanel />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
