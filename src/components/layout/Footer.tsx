export default function Footer() {
  return (
    <footer className="border-t border-neutral-200/60 dark:border-neutral-800 mt-12">
      <div className="max-w-app mx-auto px-4 py-6 text-sm text-neutral-500 flex flex-wrap gap-4 justify-between">
        <div>© {new Date().getFullYear()} Maestro Matteo · IC Foligno 5</div>
        <div className="flex gap-4">
          <a href="https://maestromatteo.it" target="_blank" rel="noreferrer" className="hover:underline">maestromatteo.it</a>
          <a href="https://github.com/" target="_blank" rel="noreferrer" className="hover:underline">GitHub</a>
        </div>
      </div>
    </footer>
  );
}
