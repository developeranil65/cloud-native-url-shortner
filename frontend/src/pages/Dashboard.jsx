import { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { UrlShortenerForm } from '../components/url/UrlShortenerForm';
import { UrlTable } from '../components/url/UrlTable';
import { urlService } from '../services/api';
import { toast } from 'react-hot-toast';

export function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUrls = async () => {
    try {
      setIsLoading(true);
      const data = await urlService.getUrls();
      setUrls(data);
    } catch (error) {
      toast.error('Failed to load URLs');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleUrlCreated = (newUrlData) => {
    // Refresh the list to include the new URL
    fetchUrls();
  };

  return (
    <DashboardLayout>
      <div className="space-y-12">
        <section className="text-center space-y-4 pt-8 pb-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            Shorten your <span className="text-gradient">links</span>, <br className="hidden sm:block" />
            expand your reach.
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            A lightning-fast, secure, and modern URL shortener built for the cloud.
            Track clicks and manage your links effortlessly.
          </p>
        </section>

        <section>
          <UrlShortenerForm onUrlCreated={handleUrlCreated} />
        </section>

        <section className="pt-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold">Recent Links</h3>
            <span className="bg-primary/10 text-primary text-sm font-medium px-3 py-1 rounded-full">
              {urls.length} Total
            </span>
          </div>
          <UrlTable urls={urls} isLoading={isLoading} />
        </section>
      </div>
    </DashboardLayout>
  );
}
