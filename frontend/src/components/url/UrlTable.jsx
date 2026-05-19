import { CopyButton } from './CopyButton';
import { formatDate } from '../../utils/formatDate';
import { MousePointerClick, ExternalLink } from 'lucide-react';
import env from '../../config/env';

export function UrlTable({ urls, isLoading }) {
  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!urls || urls.length === 0) {
    return (
      <div className="text-center py-12 px-4 rounded-lg border border-dashed border-zinc-800 bg-zinc-900/20">
        <p className="text-zinc-500">No short URLs generated yet.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-800 bg-card">
      <table className="w-full text-sm text-left">
        <thead className="text-xs uppercase bg-zinc-900/50 text-zinc-400 border-b border-zinc-800">
          <tr>
            <th scope="col" className="px-6 py-4 font-medium">Original URL</th>
            <th scope="col" className="px-6 py-4 font-medium">Short URL</th>
            <th scope="col" className="px-6 py-4 font-medium text-center">Clicks</th>
            <th scope="col" className="px-6 py-4 font-medium">Created Date</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {urls.map((url) => {
            // Use runtime BASE_URL if configured, otherwise use current browser origin
            const baseUrl = env.BASE_URL || window.location.origin;
            const shortUrl = `${baseUrl}/${url.shortCode}`;
            
            return (
              <tr key={url._id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="px-6 py-4 max-w-xs truncate text-zinc-300" title={url.originalUrl}>
                  {url.originalUrl}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <a 
                      href={shortUrl} 
                      target="_blank" 
                      rel="noreferrer"
                      className="text-primary hover:text-primary-hover flex items-center gap-1.5"
                    >
                      {shortUrl.replace(/^https?:\/\//, '')}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                    <CopyButton text={shortUrl} />
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <div className="flex items-center justify-center gap-1.5 text-zinc-300 bg-zinc-800/50 rounded-full px-2.5 py-1 w-fit mx-auto">
                    <MousePointerClick className="w-3.5 h-3.5 text-primary" />
                    <span>{url.clickCount}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-zinc-400">
                  {formatDate(url.createdAt)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
