import { Toaster } from 'react-hot-toast';
import { Navbar } from './Navbar';

export function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        {children}
      </main>
      <Toaster 
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#171717',
            color: '#ededed',
            border: '1px solid #262626',
          },
        }} 
      />
    </div>
  );
}
