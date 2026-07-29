export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-sm text-fg-muted">eve</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-fg-muted">
          <a
            href="https://vercel.com/eve"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-fg"
          >
            Product
          </a>
          <a
            href="https://vercel.com/docs/eve"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-fg"
          >
            Docs
          </a>
          <a
            href="https://github.com/vercel/eve"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-fg"
          >
            GitHub
          </a>
          <a
            href="https://vercel.com"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-fg"
          >
            Vercel
          </a>
        </div>
      </div>
    </footer>
  );
}
