import { Button } from "@/components/ui/button";
import { Sparkles, Trash2, Copy, QrCode, ExternalLink } from "lucide-react";
import { useState, useEffect } from "react";
import { apiCreateLink, apiGetLinks, apiDeleteLink, getQRCodeURL, getShortURL, type LinkData } from "@/lib/api";

type LinksMenuProps = {
  isOpen: boolean;
}

const LinksMenu = ({ isOpen }: LinksMenuProps) => {
  const [url, setUrl] = useState('');
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrSlug, setQrSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) fetchLinks();
  }, [isOpen]);

  const fetchLinks = async () => {
    try {
      const data = await apiGetLinks();
      setLinks(data || []);
    } catch {
      // ignore
    }
  };

  const handleShorten = async () => {
    if (!url.trim()) return;
    setError('');
    setLoading(true);
    try {
      await apiCreateLink(url);
      setUrl('');
      await fetchLinks();
    } catch (err: any) {
      setError(err.message || 'Failed to create link');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await apiDeleteLink(id);
      setLinks(links.filter(l => l.id !== id));
    } catch {
      // ignore
    }
  };

  const handleCopy = (slug: string, id: number) => {
    navigator.clipboard.writeText(getShortURL(slug));
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <>
    <section className="flex justify-center px-4 pb-6 sm:px-6">
      <div className="w-full max-w-5xl bg-white border-2 border-[#c8d69b] shadow-md rounded-[15px] mt-6 p-4 sm:p-6">
        <div className="flex items-center gap-3">
            <div className="sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-[#4c6fb1]">
                <Sparkles color="white"/>
            </div>
          <h3 className="text-[#343b1b] font-semibold text-base sm:text-3xl">Create Short Link</h3>
        </div>
        <label className="block mt-3 text-sm sm:text-lg">Enter your long url</label>
        <input
          type="text"
          placeholder="https://example.com/your-very-long-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
          className="mt-2 w-full border-2 border-[#c8d69b] rounded-md
          px-3 py-2 text-sm sm:text-lg outline-none focus:ring-2 focus:ring-green-600/30"
        />
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <Button
          className="mt-3 w-full bg-[#4c6fb1] text-sm sm:text-lg"
          disabled={loading}
          onClick={handleShorten}
        >
          {loading ? 'Creating...' : 'Shorten URL'}
        </Button>
      </div>
    </section>

    <section className="flex justify-center items-center px-4 pb-6 mt-4">
      <div className="flex flex-col w-full max-w-5xl gap-2">
        <h1 className="text-[#343b1b] font-bold text-sm sm:text-3xl">Your links</h1>

        {links.length === 0 ? (
          <div className="flex flex-col justify-center items-center bg-white border-2 border-[#c8d69b] shadow-md rounded-[15px] p-4 sm:p-6">
            <h2 className="text-[#343b1b] font-bold text-sm sm:text-2xl">No links yet</h2>
            <p>Create your first short link to get started with tracking and analytics</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <div key={link.id} className="bg-white border-2 border-[#c8d69b] shadow-md rounded-[15px] p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <a
                        href={getShortURL(link.slug)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4c6fb1] font-semibold text-sm sm:text-lg hover:underline truncate"
                      >
                        {getShortURL(link.slug)}
                      </a>
                      <ExternalLink size={14} className="text-[#4c6fb1] flex-shrink-0" />
                    </div>
                    <p className="text-gray-500 text-xs sm:text-sm truncate mt-1">{link.target_url}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Created {new Date(link.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      className="border-[#c8d69b] text-xs px-3"
                      onClick={() => handleCopy(link.slug, link.id)}
                    >
                      <Copy size={14} />
                      {copied === link.id ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                      variant="outline"
                      className="border-[#c8d69b] text-xs px-3"
                      onClick={() => setQrSlug(qrSlug === link.slug ? null : link.slug)}
                    >
                      <QrCode size={14} />
                      QR
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-300 text-red-500 hover:bg-red-50 text-xs px-3"
                      onClick={() => handleDelete(link.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>

                {qrSlug === link.slug && (
                  <div className="mt-4 flex flex-col items-center gap-2 border-t border-[#c8d69b] pt-4">
                    <img
                      src={getQRCodeURL(link.slug)}
                      alt={`QR code for ${link.slug}`}
                      className="w-48 h-48 border rounded-lg"
                    />
                    <p className="text-gray-500 text-xs">Scan or download this QR code</p>
                    <a
                      href={getQRCodeURL(link.slug)}
                      download={`qr-${link.slug}.png`}
                      className="text-[#4c6fb1] text-sm hover:underline"
                    >
                      Download QR Code
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
    </>
  );
};

export default LinksMenu;
