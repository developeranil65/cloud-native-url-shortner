import { Link } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="border-b border-zinc-800 bg-background/50 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Link className="w-6 h-6 text-primary" />
            </div>
            <span className="text-xl font-bold text-gradient">CloudLink</span>
          </div>
          <div className="flex items-center gap-4">
            <a 
              href="https://github.com" 
              target="_blank" 
              rel="noreferrer"
              className="text-sm font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              Documentation
            </a>
          </div>
        </div>
      </div>
    </nav>
  );
}
