import { Button } from "@/components/ui/button";
import { Sparkles, Trash2, Copy, QrCode, ExternalLink, BarChart3, Globe } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiCreateLink, apiGetLinks, apiDeleteLink, apiGetDomains, getQRCodeURL, getShortURL, type LinkData, type CustomDomainData } from "@/lib/api";

type LinksMenuProps = {
  isOpen: boolean;
}

const LinksMenu = ({ isOpen }: LinksMenuProps) => {
  const navigate = useNavigate();
  const [url, setUrl] = useState('');
  const [links, setLinks] = useState<LinkData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qrSlug, setQrSlug] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [domains, setDomains] = useState<CustomDomainData[]>([]);
  const [selectedDomain, setSelectedDomain] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchLinks();
      apiGetDomains()
        .then(d => setDomains(d.filter(dom => dom.verified)))
        .catch(() => {});
    }
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
      await apiCreateLink(url, selectedDomain || undefined);
      setUrl('');
      setSelectedDomain('');
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

  const getDisplayURL = (link: LinkData) => {
    if (link.custom_domain_id) {
      const dom = domains.find(d => String(d.id) === link.custom_domain_id);
      if (dom) return `https://${dom.domain}/r/${link.slug}`;
    }
    return getShortURL(link.slug);
  };

  const handleCopy = (link: LinkData) => {
    navigator.clipboard.writeText(getDisplayURL(link));
    setCopied(link.id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (!isOpen) return null;

  return (
    <>
    <section className="flex justify-center px-4 pb-6 sm:px-6">
      <div className="w-full max-w-5xl bg-white border-2 border-[#c8d69b] shadow-md rounded-[15px] mt-6 p-4 sm:p-6">
        <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-[#4c6fb1] shrink-0">
                <Sparkles color="white"/>
            </div>
          <h3 className="text-[#343b1b] font-semibold text-base sm:text-3xl">Создать короткую ссылку</h3>
        </div>
        <label className="block mt-3 text-sm sm:text-lg">Введите длинную ссылку</label>
        <input
          type="text"
          placeholder="https://example.com/your-very-long-url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleShorten()}
          className="mt-2 w-full border-2 border-[#c8d69b] rounded-md
          px-3 py-2 text-sm sm:text-lg outline-none focus:ring-2 focus:ring-green-600/30"
        />
        {domains.length > 0 && (
          <div className="mt-3">
            <label className="block text-sm sm:text-lg mb-1">Свой домен <span className="text-gray-400 text-sm">(необязательно)</span></label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="w-full border-2 border-[#c8d69b] rounded-md px-3 py-2 text-sm sm:text-lg outline-none focus:ring-2 focus:ring-green-600/30 bg-white"
            >
              <option value="">По умолчанию (без своего домена)</option>
              {domains.map(d => (
                <option key={d.id} value={d.id}>{d.domain}</option>
              ))}
            </select>
          </div>
        )}
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <Button
          className="mt-3 w-full bg-[#4c6fb1] text-sm sm:text-lg"
          disabled={loading}
          onClick={handleShorten}
        >
          {loading ? 'Создание...' : 'Сократить ссылку'}
        </Button>
      </div>
    </section>

    <section className="flex justify-center items-center px-4 pb-6 mt-4">
      <div className="flex flex-col w-full max-w-5xl gap-2">
        <h1 className="text-[#343b1b] font-bold text-sm sm:text-3xl">Ваши ссылки</h1>

        {links.length === 0 ? (
          <div className="flex flex-col justify-center items-center bg-white border-2 border-[#c8d69b] shadow-md rounded-[15px] p-4 sm:p-6">
            <h2 className="text-[#343b1b] font-bold text-sm sm:text-2xl">Пока нет ссылок</h2>
            <p>Создайте первую короткую ссылку, чтобы начать отслеживание и аналитику</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {links.map((link) => (
              <div key={link.id} className="bg-white border-2 border-[#c8d69b] shadow-md rounded-[15px] p-4 sm:p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      {link.custom_domain_id && <Globe size={14} className="text-green-500 flex-shrink-0" />}
                      <a
                        href={getDisplayURL(link)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[#4c6fb1] font-semibold text-sm sm:text-lg hover:underline truncate"
                      >
                        {getDisplayURL(link)}
                      </a>
                      <ExternalLink size={14} className="text-[#4c6fb1] flex-shrink-0" />
                    </div>
                    <p className="text-gray-500 text-xs sm:text-sm truncate mt-1">{link.target_url}</p>
                    <p className="text-gray-400 text-xs mt-1">
                      Создано {new Date(link.created_at).toLocaleDateString('ru-RU')}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                    <Button
                      variant="outline"
                      className="border-[#c8d69b] text-xs px-3"
                      onClick={() => handleCopy(link)}
                    >
                      <Copy size={14} />
                      {copied === link.id ? 'Скопировано!' : 'Копировать'}
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
                      className="border-[#4c6fb1] text-[#4c6fb1] hover:bg-[#4c6fb1] hover:text-white text-xs px-3"
                      onClick={() => navigate(`/link/${link.id}`)}
                    >
                      <BarChart3 size={14} />
                      Аналитика
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
                    <p className="text-gray-500 text-xs">Отсканируйте или скачайте QR-код</p>
                    <a
                      href={getQRCodeURL(link.slug)}
                      download={`qr-${link.slug}.png`}
                      className="text-[#4c6fb1] text-sm hover:underline"
                    >
                      Скачать QR-код
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
