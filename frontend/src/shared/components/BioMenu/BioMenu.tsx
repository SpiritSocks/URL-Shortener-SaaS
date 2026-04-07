import { useState, useEffect, useRef } from "react";
import { FileText, Plus, Trash2, ArrowUp, ArrowDown, Copy, Check, ExternalLink, Palette, Upload, Link, Pencil, X } from "lucide-react";
import { getSocialIcon } from "@/lib/socialIcons";
import { Button } from "@/components/ui/button";
import {
    apiGetMyBioPage, apiCreateBioPage, apiUpdateBioPage,
    apiAddBioLink, apiUpdateBioLink, apiRemoveBioLink, apiReorderBioLinks,
    apiUploadAvatar, getBioPageURL, getShortURL,
    type BioPageData, type BioLinkData
} from "@/lib/api";

type BioMenuProps = {
    isOpen: boolean;
}

const THEMES = [
    { id: 'default', label: 'Классика', bg: 'bg-[#FAFAF5]', accent: 'bg-[#343b1b]' },
    { id: 'dark', label: 'Тёмная', bg: 'bg-[#1a1a2e]', accent: 'bg-[#4c6fb1]' },
    { id: 'ocean', label: 'Океан', bg: 'bg-[#0f3460]', accent: 'bg-[#16c79a]' },
    { id: 'sunset', label: 'Закат', bg: 'bg-[#f8b500]', accent: 'bg-[#e74c3c]' },
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

    // Avatar
    const [avatarMode, setAvatarMode] = useState<'url' | 'upload'>('url');
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Edit link
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editTitle, setEditTitle] = useState('');
    const [editUrl, setEditUrl] = useState('');
    const [editLoading, setEditLoading] = useState(false);

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
                setHandle(data.page.handle);
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
            setError(err.message || 'Не удалось создать био-страницу');
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setError('');
        setLoading(true);
        try {
            await apiUpdateBioPage(handle, displayName, bioText, avatarUrl, theme);
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        } catch (err: any) {
            setError(err.message || 'Не удалось сохранить');
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
            setError(err.message || 'Не удалось добавить ссылку');
        } finally {
            setAddingLink(false);
        }
    };

    const handleRemoveLink = async (id: number) => {
        try {
            await apiRemoveBioLink(id);
            setLinks(links.filter(l => l.id !== id));
        } catch (err: any) {
            setError(err.message || 'Не удалось удалить ссылку');
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

    const handleStartEdit = (link: BioLinkData) => {
        setEditingId(link.id);
        setEditTitle(link.title);
        setEditUrl(link.target_url);
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditTitle('');
        setEditUrl('');
    };

    const handleSaveEdit = async () => {
        if (!editingId || !editTitle.trim() || !editUrl.trim()) return;
        setEditLoading(true);
        setError('');
        try {
            await apiUpdateBioLink(editingId, editTitle.trim(), editUrl.trim());
            setEditingId(null);
            await fetchPage();
        } catch (err: any) {
            setError(err.message || 'Не удалось обновить ссылку');
        } finally {
            setEditLoading(false);
        }
    };

    const handleCopyUrl = () => {
        if (!handle) return;
        navigator.clipboard.writeText(getBioPageURL(handle));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setUploading(true);
        setError('');
        try {
            const url = await apiUploadAvatar(file);
            setAvatarUrl(url);
        } catch (err: any) {
            setError(err.message || 'Не удалось загрузить файл');
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Setup screen — user has no bio page yet
    if (!exists) {
        return (
            <section className="flex justify-center px-4 pb-6 sm:px-6">
                <div className="w-full max-w-2xl bg-white border-2 border-border shadow-md rounded-[15px] mt-6 p-4 sm:p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-primary shrink-0">
                            <FileText color="white" />
                        </div>
                        <h3 className="text-foreground font-semibold text-base sm:text-3xl">Создайте свою био-страницу</h3>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">
                        Создайте страницу «ссылка в био», чтобы собрать все ваши ссылки в одном месте. Выберите уникальный никнейм — ваша страница будет доступна по адресу <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">yourdomain.com/@никнейм</code>
                    </p>

                    <label className="block text-sm font-medium text-foreground mt-3">Никнейм</label>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-gray-500 text-sm">@</span>
                        <input
                            type="text"
                            placeholder="вашеимя"
                            value={handle}
                            onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                            className="flex-1 border-2 border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/30"
                        />
                    </div>

                    <label className="block text-sm font-medium text-foreground mt-3">Отображаемое имя</label>
                    <input
                        type="text"
                        placeholder="Ваше имя"
                        value={displayName}
                        onChange={e => setDisplayName(e.target.value)}
                        className="mt-1 w-full border-2 border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/30"
                    />

                    <label className="block text-sm font-medium text-foreground mt-3">О себе</label>
                    <textarea
                        placeholder="Расскажите о себе..."
                        value={bioText}
                        onChange={e => setBioText(e.target.value)}
                        rows={3}
                        className="mt-1 w-full border-2 border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/30 resize-none"
                    />

                    <label className="block text-sm font-medium text-foreground mt-3">Аватар</label>
                    {avatarMode === 'url' ? (
                        <input
                            type="text"
                            placeholder="https://example.com/avatar.jpg"
                            value={avatarUrl}
                            onChange={e => setAvatarUrl(e.target.value)}
                            className="mt-1 w-full border-2 border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/30"
                        />
                    ) : (
                        <div className="flex flex-col gap-2 mt-1">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/gif,image/webp"
                                onChange={handleFileUpload}
                                className="w-full border-2 border-border rounded-md px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-primary/10 file:text-foreground hover:file:bg-primary/20"
                            />
                            {uploading && <p className="text-xs text-gray-500">Загрузка...</p>}
                        </div>
                    )}
                    {avatarUrl && (
                        <div className="mt-2 flex items-center gap-3">
                            <img src={avatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover border" />
                            <span className="text-xs text-gray-400 truncate flex-1">{avatarUrl}</span>
                        </div>
                    )}
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => setAvatarMode('url')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border-2 transition-all ${
                                avatarMode === 'url' ? 'border-primary bg-primary/10 text-foreground' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                        >
                            <Link size={12} /> По ссылке
                        </button>
                        <button
                            onClick={() => setAvatarMode('upload')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border-2 transition-all ${
                                avatarMode === 'upload' ? 'border-primary bg-primary/10 text-foreground' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                            }`}
                        >
                            <Upload size={12} /> Загрузить
                        </button>
                    </div>

                    <label className="block text-sm font-medium text-foreground mt-3">Тема</label>
                    <div className="flex gap-3 mt-2">
                        {THEMES.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTheme(t.id)}
                                className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                                    theme === t.id ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300'
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
                        className="mt-4 w-full bg-primary text-sm sm:text-lg"
                        disabled={loading || !handle.trim()}
                        onClick={handleCreate}
                    >
                        <Plus size={16} className="mr-1" />
                        {loading ? 'Создание...' : 'Создать био-страницу'}
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
            <div className="w-full max-w-5xl bg-white border-2 border-border shadow-md rounded-[15px] mt-6 p-4 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-lg bg-primary shrink-0">
                            <FileText color="white" />
                        </div>
                        <h3 className="text-foreground font-semibold text-base sm:text-3xl">Био-страница</h3>
                    </div>
                    <a
                        href={`/@${page?.handle}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[var(--color-link)] text-sm hover:underline flex items-center gap-1"
                    >
                        Просмотр <ExternalLink size={12} />
                    </a>
                </div>

                {/* Public URL with editable handle */}
                <div className="flex items-center gap-2 mb-4 bg-background border border-border rounded-lg px-3 py-2">
                    <span className="text-sm text-gray-500 shrink-0">{getBioPageURL('')}</span>
                    <input
                        type="text"
                        value={handle}
                        onChange={e => setHandle(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ''))}
                        className="text-sm text-foreground bg-transparent outline-none min-w-0 flex-1 border-b border-dashed border-gray-300 focus:border-primary"
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyUrl}
                        className="border-primary text-[var(--color-link)] text-xs shrink-0"
                    >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Скопировано' : 'Копировать'}
                    </Button>
                </div>

                {/* Editable fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-foreground">Имя</label>
                        <input
                            type="text"
                            value={displayName}
                            onChange={e => setDisplayName(e.target.value)}
                            className="mt-1 w-full border-2 border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/30"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-foreground">Аватар</label>
                        {avatarMode === 'url' ? (
                            <input
                                type="text"
                                placeholder="https://example.com/avatar.jpg"
                                value={avatarUrl}
                                onChange={e => setAvatarUrl(e.target.value)}
                                className="mt-1 w-full border-2 border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/30"
                            />
                        ) : (
                            <div className="flex flex-col gap-2 mt-1">
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/jpeg,image/png,image/gif,image/webp"
                                    onChange={handleFileUpload}
                                    className="w-full border-2 border-border rounded-md px-3 py-2 text-sm file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-primary/10 file:text-foreground hover:file:bg-primary/20"
                                />
                                {uploading && <p className="text-xs text-gray-500">Загрузка...</p>}
                            </div>
                        )}
                        {avatarUrl && (
                            <div className="mt-2 flex items-center gap-3">
                                <img src={avatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover border" />
                                <span className="text-xs text-gray-400 truncate">{avatarUrl}</span>
                            </div>
                        )}
                        <div className="flex gap-2 mt-2">
                            <button
                                onClick={() => setAvatarMode('url')}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border-2 transition-all ${
                                    avatarMode === 'url' ? 'border-primary bg-primary/10 text-foreground' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                }`}
                            >
                                <Link size={12} /> По ссылке
                            </button>
                            <button
                                onClick={() => setAvatarMode('upload')}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs border-2 transition-all ${
                                    avatarMode === 'upload' ? 'border-primary bg-primary/10 text-foreground' : 'border-gray-200 text-gray-500 hover:border-gray-300'
                                }`}
                            >
                                <Upload size={12} /> Загрузить
                            </button>
                        </div>
                    </div>
                </div>
                <label className="block text-sm font-medium text-foreground mt-3">Bio</label>
                <textarea
                    value={bioText}
                    onChange={e => setBioText(e.target.value)}
                    rows={3}
                    className="mt-1 w-full border-2 border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/30 resize-none"
                />

                {/* Theme picker */}
                <label className="block text-sm font-medium text-foreground mt-3 flex items-center gap-1">
                    <Palette size={14} /> Тема
                </label>
                <div className="flex gap-3 mt-2">
                    {THEMES.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTheme(t.id)}
                            className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all ${
                                theme === t.id ? 'border-primary bg-primary/10' : 'border-gray-200 hover:border-gray-300'
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
                    className="mt-4 w-full bg-[var(--color-navbar)] text-sm"
                    disabled={loading}
                    onClick={handleSave}
                >
                    {saved ? 'Сохранено!' : loading ? 'Сохранение...' : 'Сохранить изменения'}
                </Button>
            </div>
        </section>

        {/* Bio Links */}
        <section className="flex justify-center px-4 pb-6 sm:px-6">
            <div className="w-full max-w-5xl">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-foreground font-bold text-sm sm:text-2xl">Ваши био-ссылки</h2>
                    <span className="text-xs text-gray-400">
                        {links.length} / {maxBioLinks < 0 ? '∞' : maxBioLinks} ссылок
                    </span>
                </div>

                {/* Add link form */}
                <div className="bg-white border-2 border-border shadow-md rounded-[15px] p-4 sm:p-5 mb-4">
                    <div className="flex flex-col sm:flex-row gap-2">
                        <input
                            type="text"
                            placeholder="Название ссылки"
                            value={linkTitle}
                            onChange={e => setLinkTitle(e.target.value)}
                            className="flex-1 border-2 border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/30"
                        />
                        <input
                            type="text"
                            placeholder="https://example.com"
                            value={linkUrl}
                            onChange={e => setLinkUrl(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleAddLink()}
                            className="flex-1 border-2 border-border rounded-md px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-green-600/30"
                        />
                        <Button
                            className="bg-primary text-sm shrink-0"
                            disabled={addingLink || !linkTitle.trim() || !linkUrl.trim()}
                            onClick={handleAddLink}
                        >
                            <Plus size={14} className="mr-1" />
                            {addingLink ? 'Добавление...' : 'Добавить'}
                        </Button>
                    </div>
                </div>

                {/* Links list */}
                {links.length === 0 ? (
                    <div className="flex flex-col justify-center items-center bg-white border-2 border-border shadow-md rounded-[15px] p-6">
                        <FileText size={32} className="text-gray-300 mb-2" />
                        <h2 className="text-foreground font-bold text-sm sm:text-xl">Пока нет био-ссылок</h2>
                        <p className="text-gray-500 text-sm">Добавьте ссылки выше для отображения на вашей био-странице</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {links.map((link, index) => {
                            const Icon = getSocialIcon(editingId === link.id ? editUrl : link.target_url);
                            const isEditing = editingId === link.id;
                            return (
                            <div key={link.id} className="bg-white border-2 border-border shadow-sm rounded-[15px] p-4 flex items-center gap-3">
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
                                <Icon size={20} className="text-gray-500 shrink-0" />
                                {isEditing ? (
                                    <div className="flex-1 min-w-0 flex flex-col gap-1.5">
                                        <input
                                            type="text"
                                            value={editTitle}
                                            onChange={e => setEditTitle(e.target.value)}
                                            className="w-full border-2 border-border rounded-md px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-green-600/30"
                                            placeholder="Название"
                                        />
                                        <input
                                            type="text"
                                            value={editUrl}
                                            onChange={e => setEditUrl(e.target.value)}
                                            onKeyDown={e => e.key === 'Enter' && handleSaveEdit()}
                                            className="w-full border-2 border-border rounded-md px-2 py-1 text-sm outline-none focus:ring-2 focus:ring-green-600/30"
                                            placeholder="https://example.com"
                                        />
                                    </div>
                                ) : (
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-sm text-foreground truncate">{link.title}</p>
                                        <p className="text-xs text-gray-400 truncate">{link.target_url}</p>
                                        <p className="text-xs text-[var(--color-link)] mt-0.5">{getShortURL(link.slug)}</p>
                                    </div>
                                )}
                                <div className="flex gap-1.5 shrink-0">
                                    {isEditing ? (
                                        <>
                                            <Button
                                                variant="outline"
                                                className="border-primary text-primary hover:bg-primary/10 text-xs px-3"
                                                disabled={editLoading || !editTitle.trim() || !editUrl.trim()}
                                                onClick={handleSaveEdit}
                                            >
                                                <Check size={14} />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="border-gray-300 text-gray-500 hover:bg-gray-50 text-xs px-3"
                                                onClick={handleCancelEdit}
                                            >
                                                <X size={14} />
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button
                                                variant="outline"
                                                className="border-gray-300 text-gray-500 hover:bg-gray-50 text-xs px-3"
                                                onClick={() => handleStartEdit(link)}
                                            >
                                                <Pencil size={14} />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                className="border-red-300 text-red-500 hover:bg-red-50 text-xs px-3"
                                                onClick={() => handleRemoveLink(link.id)}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </section>
        </>
    );
};

export default BioMenu;
