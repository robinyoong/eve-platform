import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="font-mono text-base font-medium tracking-tight text-fg">
          eve
        </Link>

        <nav className="flex items-center gap-6">
          <a
            href="#learn"
            className="hidden text-sm text-fg-muted transition-colors hover:text-fg sm:inline"
          >
            Learn
          </a>
          <a
            href="#chat"
            className="hidden text-sm text-fg-muted transition-colors hover:text-fg sm:inline"
          >
            Ask
          </a>
          <a
            href="https://vercel.com/docs/eve"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-fg-muted transition-colors hover:text-fg"
          >
            Docs
          </a>
          <a
            href="#get-started"
            className="rounded-md bg-btn px-3 py-1.5 text-sm font-medium text-btn-fg transition-opacity hover:opacity-90"
          >
            Get started
          </a>
        </nav>
      </div>
    </header>
  );
}
