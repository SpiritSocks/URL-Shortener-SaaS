import { useState, useEffect } from "react";
import { FileText, Plus, Trash2, ArrowUp, ArrowDown, Copy, Check, ExternalLink, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    apiGetMyBioPage, apiCreateBioPage, apiUpdateBioPage,
    apiAddBioLink, apiRemoveBioLink, apiReorderBioLinks,
    getBioPageURL, getShortURL,
    type BioPageData, type BioLinkData
} from "@/lib/api";

type BioMenuProps = {
    isOpen: boolean;
}

const THEMES = [
    { id: 'default', label: 'Classic', bg: 'bg-[#FAFAF5]', accent: 'bg-[#343b1b]' },
    { id: 'dark', label: 'Dark', bg: 'bg-[#1a1a2e]', accent: 'bg-[#4c6fb1]' },
    { id: 'ocean', label: 'Ocean', bg: 'bg-[#0f3460]', accent: 'bg-[#16c79a]' },
    { id: 'sunset', label: 'Sunset', bg: 'bg-[#f8b500]', accent: 'bg-[#e74c3c]' },
];

const BioMenu = ({ isOpen }: BioMenuProps) => {
    const [page, setPage] = useState<BioPageData | null>(null);
    const [links, setLinks] = useState<BioLinkData[]>([]);
    const [exists, setExists] = useState(false);
    const [maxBioLinks, setMaxBioLinks] = useState(5);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);

    // Setup form
    const [handle, setHandle] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [bioText, setBioText] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [theme, setTheme] = useState('default');

    // Add link form
    const [linkTitle, setLinkTitle] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [addingLink, setAddingLink] = useState(false);

    const fetchPage = async () => {
        try {
            const data = await apiGetMyBioPage();
            setExists(data.exists);
            if (data.exists && data.page) {
                setPage(data.page);
                setLinks(data.links || []);
                setMaxBioLinks(data.max_bio_links ?? 5);
                setDisplayName(data.page.display_name);
                setBioText(data.page.bio_text);
                setAvatarUrl(data.page.avatar_url);
                setTheme(data.page.theme);
            }
        } catch {
            // ignore
        }
    };

    useEffect(() => {
        if (isOpen) {
            setError('');
            fetchPage();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleCreate = async () => {
        if (!handle.trim()) return;
        setError('');
        setLoading(true);
        try {
            await apiCreateBioPage(handle.trim().toLowerCase(), displayName, bioText, avatarUrl, theme);
            await fetchPage();
        } catch (err: any) {
            setError(err.message || 'Failed to create bio page');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setError('');
        setLoading(true);
        try {
            await apiUpdateBioPage(displayName, bioText, avatarUrl, theme);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to save');
        } finally {
            setLoading(false);
        }
    };

    const handleAddLink = async () => {
        if (!linkTitle.trim() || !linkUrl.trim()) return;
        setError('');
        setAddingLink(true);
        try {
            let url = linkUrl.trim();
            if (!url.startsWith('http://') && !url.startsWith('https://')) {
                url = 'https://' + url;
            }
            await apiAddBioLink(linkTitle.trim(), url);
            setLinkTitle('');
            setLinkUrl('');
            await fetchPage();
        } catch (err: any) {
            setError(err.message || 'Failed to add link');
        } finally {
            setAddingLink(false);
        }
    };

    const handleRemoveLink = async (id: number) => {
        try {
            await apiRemoveBioLink(id);
            setLinks(links.filter(l => l.id !== id));
        } catch (err: any) {
            setError(err.message || 'Failed to remove link');
        }
    };

    const handleMoveLink = async (index: number, direction: 'up' | 'down') => {
        const newLinks = [...links];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        if (swapIndex < 0 || swapIndex >= newLinks.length) return;
        [newLinks[index], newLinks[swapIndex]] = [newLinks[swapIndex], newLinks[index]];
        setLinks(newLinks);
        try {
            await apiReorderBioLinks(newLinks.map(l => l.id));
        } catch {
            await fetchPage();
        }
    };

    const handleCopyUrl = () => {
        if (!page) return;
        navigator.clipboard.writeText(getBioPageURL(page.handle));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    // Setup screen — user has no bio page yet
    if (!exists) {
        return (
            <section className="flex justify-center px-4 pb-6 sm:px-6">
                <div className="w-full max-w-2xl bg-white border-2 border-[#c8d69b] shadow-md rounded-[15px] mt-6 p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-[#4c6fb1]">
                            <FileText color="white" />
                        </div>
                        <h3 className="text-[#343b1b] font-semibold text-base sm:text-3xl">Create Your Bio Page</h3>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">
                        Create a link-in-bio page to share all your links in one place. Choose a unique handle — your page will be available at <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">yourdomain.com/@handle</code>
                    </p>

                    <label className="block text-sm font-medium text-[#343b1b] mt-3">Handle</label>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-500 text-sm">@</span>
                        <input
                            type="text"
                            placeholder="yourname"
                            value={handle}
                            onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                            className="flex-1 border-2 border-[#c8d69b] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/30"
                        />
                    </div>

                    <label className="block text-sm font-medium text-[#343b1b] mt-3">Display Name</label>
                    <input
                        type="text"
                        placeholder="Your Name"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        className="mt-1 w-full border-2 border-[#c8d69b] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/30"
                    />

                    <label className="block text-sm font-medium text-[#343b1b] mt-3">Bio</label>
                    <textarea
                        placeholder="Tell visitors about yourself..."
                        value={bioText}
                        onChange={e => setBioText(e.target.value)}
                        rows={3}
                        className="mt-1 w-full border-2 border-[#c8d69b] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/30 resize-none"
                    />

                    <label className="block text-sm font-medium text-[#343b1b] mt-3">Avatar URL</label>
                    <input
                        type="text"
                        placeholder="https://example.com/avatar.jpg"
                        value={avatarUrl}
                        onChange={e => setAvatarUrl(e.target.value)}
                        className="mt-1 w-full border-2 border-[#c8d69b] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/30"
                    />

                    <label className="block text-sm font-medium text-[#343b1b] mt-3">Theme</label>
                    <div className="flex gap-3 mt-2">
                        {THEMES.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                                    theme === t.id ? 'border-[#4c6fb1] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-md ${t.bg} border`}>
                                    <div className={`w-4 h-2 ${t.accent} rounded-sm mt-2 mx-auto`} />
                                </div>
                                <span className="text-xs text-gray-600">{t.label}</span>
                            </button>
                        ))}
                    </div>

                    {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    <Button
                        className="mt-4 w-full bg-[#4c6fb1] text-sm sm:text-lg"
                        disabled={loading || !handle.trim()}
                        onClick={handleCreate}
                    >
                        <Plus size={16} className="mr-1" />
                        {loading ? 'Creating...' : 'Create Bio Page'}
                    </Button>
                </div>
            </section>
        );
    }

    // Editor screen — user has a bio page
    return (
        <>
        {/* Page settings */}
        <section className="flex justify-center px-4 pb-4 sm:px-6">
            <div className="w-full max-w-5xl bg-white border-2 border-[#c8d69b] shadow-md rounded-[15px] mt-6 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-[#4c6fb1]">
                            <FileText color="white" />
                        </div>
                        <h3 className="text-[#343b1b] font-semibold text-base sm:text-3xl">Bio Page</h3>
                    </div>
                    <a
                        href={`/@${page?.handle}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#4c6fb1] text-sm hover:underline flex items-center gap-1"
                    >
                        Preview <ExternalLink size={12} />
                    </a>
                </div>

                {/* Public URL */}
                <div className="flex items-center gap-2 mb-4 bg-[#fbfcef] border border-[#c8d69b] rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-500 truncate flex-1">
                        {page ? getBioPageURL(page.handle) : ''}
                    </span>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyUrl}
                        className="border-[#4c6fb1] text-[#4c6fb1] text-xs shrink-0"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied' : 'Copy'}
                    </Button>
                </div>

                {/* Editable fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-[#343b1b]">Display Name</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            className="mt-1 w-full border-2 border-[#c8d69b] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/30"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-[#343b1b]">Avatar URL</label>
                        <input
                            type="text"
                            value={avatarUrl}
                            onChange={e => setAvatarUrl(e.target.value)}
                            className="mt-1 w-full border-2 border-[#c8d69b] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/30"
                        />
                    </div>
                </div>
                <label className="block text-sm font-medium text-[#343b1b] mt-3">Bio</label>
                <textarea
                    value={bioText}
                    onChange={e => setBioText(e.target.value)}
                    rows={3}
                    className="mt-1 w-full border-2 border-[#c8d69b] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/30 resize-none"
                />

                {/* Theme picker */}
                <label className="block text-sm font-medium text-[#343b1b] mt-3 flex items-center gap-1">
                    <Palette size={14} /> Theme
                </label>
                <div className="flex gap-3 mt-2">
                    {THEMES.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                                theme === t.id ? 'border-[#4c6fb1] bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                            }`}
                        >
                            <div className={`w-8 h-8 rounded-md ${t.bg} border`}>
                                <div className={`w-4 h-2 ${t.accent} rounded-sm mt-2 mx-auto`} />
                            </div>
                            <span className="text-xs text-gray-600">{t.label}</span>
                        </button>
                    ))}
                </div>

                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

                <Button
                    className="mt-4 w-full bg-[#343b1b] text-sm"
                    disabled={loading}
                    onClick={handleSave}
                >
                    {saved ? 'Saved!' : loading ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>
        </section>

        {/* Bio Links */}
        <section className="flex justify-center px-4 pb-6 sm:px-6">
            <div className="w-full max-w-5xl">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-[#343b1b] font-bold text-sm sm:text-2xl">Your Bio Links</h2>
                    <span className="text-xs text-gray-400">
                        {links.length} / {maxBioLinks < 0 ? '∞' : maxBioLinks} links
                    </span>
                </div>

                {/* Add link form */}
                <div className="bg-white border-2 border-[#c8d69b] shadow-md rounded-[15px] p-4 sm:p-5 mb-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            placeholder="Link title"
                            value={linkTitle}
                            onChange={e => setLinkTitle(e.target.value)}
                            className="flex-1 border-2 border-[#c8d69b] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/30"
                        />
                        <input
                            type="text"
                            placeholder="https://example.com"
                            value={linkUrl}
                            onChange={e => setLinkUrl(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddLink()}
                            className="flex-1 border-2 border-[#c8d69b] rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/30"
                        />
                        <Button
                            className="bg-[#4c6fb1] text-sm shrink-0"
                            disabled={addingLink || !linkTitle.trim() || !linkUrl.trim()}
                            onClick={handleAddLink}
                        >
                            <Plus size={14} className="mr-1" />
                            {addingLink ? 'Adding...' : 'Add'}
                        </Button>
                    </div>
                </div>

                {/* Links list */}
                {links.length === 0 ? (
                    <div className="flex flex-col justify-center items-center bg-white border-2 border-[#c8d69b] shadow-md rounded-[15px] p-6">
                        <FileText size={32} className="text-gray-300 mb-2" />
                        <h2 className="text-[#343b1b] font-bold text-sm sm:text-xl">No bio links yet</h2>
                        <p className="text-gray-500 text-sm">Add links above to display on your bio page</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {links.map((link, index) => (
                            <div key={link.id} className="bg-white border-2 border-[#c8d69b] shadow-sm rounded-[15px] p-4 flex items-center gap-3">
                                <div className="flex flex-col gap-1">
                                    <button
                                        onClick={() => handleMoveLink(index, 'up')}
                                        disabled={index === 0}
                                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    >
                                        <ArrowUp size={14} />
                                    </button>
                                    <button
                                        onClick={() => handleMoveLink(index, 'down')}
                                        disabled={index === links.length - 1}
                                        className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                                    >
                                        <ArrowDown size={14} />
                                    </button>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm text-[#343b1b] truncate">{link.title}</p>
                                    <p className="text-xs text-gray-400 truncate">{link.target_url}</p>
                                    <p className="text-xs text-[#4c6fb1] mt-0.5">{getShortURL(link.slug)}</p>
                                </div>
                                <Button
                                    variant="outline"
                                    className="border-red-300 text-red-500 hover:bg-red-50 text-xs px-3 shrink-0"
                                    onClick={() => handleRemoveLink(link.id)}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </section>
        </>
    );
};

export default BioMenu;
