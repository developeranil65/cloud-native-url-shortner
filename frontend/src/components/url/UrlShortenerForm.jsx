import { useState } from 'react';
import { Link2, Copy, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { urlService } from '../../services/api';

export function UrlShortenerForm({ onUrlCreated }) {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;

    try {
      setIsLoading(true);
      const data = await urlService.shortenUrl(url);
      setResult(data);
      setUrl('');
      toast.success('URL shortened successfully!');
      if (onUrlCreated) onUrlCreated(data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to shorten URL');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    navigator.clipboard.writeText(result.shortUrl);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="max-w-3xl mx-auto w-full relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-primary/5 blur-3xl" />
      
      <div className="relative z-10">
        <h2 className="text-2xl font-semibold mb-2">Shorten your link</h2>
        <p className="text-zinc-400 mb-6">Enter a long URL to generate a short, easily shareable link.</p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Link2 className="h-5 w-5 text-zinc-500" />
            </div>
            <Input
              type="url"
              placeholder="https://example.com/very-long-url"
              className="pl-10 h-12 text-base"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
            />
          </div>
          <Button type="submit" size="lg" isLoading={isLoading} className="sm:w-auto w-full">
            Shorten
          </Button>
        </form>

        {result && (
          <div className="mt-6 p-4 rounded-lg bg-zinc-900/50 border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 animate-slide-up">
            <div className="truncate flex-1 max-w-full">
              <p className="text-sm text-zinc-400 truncate mb-1">{result.originalUrl}</p>
              <a 
                href={result.shortUrl} 
                target="_blank" 
                rel="noreferrer"
                className="text-lg font-medium text-primary hover:text-primary-hover truncate block"
              >
                {result.shortUrl}
              </a>
            </div>
            <Button 
              variant="secondary" 
              onClick={handleCopy}
              className="w-full sm:w-auto shrink-0 flex items-center gap-2"
            >
              {copied ? <CheckCircle2 className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
