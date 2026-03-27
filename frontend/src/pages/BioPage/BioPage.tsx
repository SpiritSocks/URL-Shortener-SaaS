import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { apiGetPublicBioPage, type PublicBioPageResponse } from "@/lib/api";

const THEME_STYLES: Record<string, { bg: string; text: string; subtext: string; btn: string; btnText: string; footer: string }> = {
    default: {
        bg: 'bg-[#FAFAF5]',
        text: 'text-[#343b1b]',
        subtext: 'text-gray-500',
        btn: 'bg-[#343b1b] hover:bg-[#414927]',
        btnText: 'text-white',
        footer: 'text-gray-400',
    },
    dark: {
        bg: 'bg-[#1a1a2e]',
        text: 'text-white',
        subtext: 'text-gray-400',
        btn: 'bg-[#4c6fb1] hover:bg-[#3d5e9e]',
        btnText: 'text-white',
        footer: 'text-gray-600',
    },
    ocean: {
        bg: 'bg-gradient-to-b from-[#0f3460] to-[#16213e]',
        text: 'text-white',
        subtext: 'text-blue-200',
        btn: 'bg-[#16c79a] hover:bg-[#13b48a]',
        btnText: 'text-white',
        footer: 'text-blue-300/50',
    },
    sunset: {
        bg: 'bg-gradient-to-b from-[#f8b500] to-[#e74c3c]',
        text: 'text-white',
        subtext: 'text-yellow-100',
        btn: 'bg-white/90 hover:bg-white',
        btnText: 'text-[#e74c3c]',
        footer: 'text-white/50',
    },
};

const BioPage = () => {
    const { handle } = useParams<{ handle: string }>();
    const [data, setData] = useState<PublicBioPageResponse | null>(null);
    const [notFound, setNotFound] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!handle) return;
        apiGetPublicBioPage(handle)
            .then(setData)
            .catch(() => setNotFound(true))
            .finally(() => setLoading(false));
    }, [handle]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center">
                <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            </div>
        );
    }

    if (notFound || !data) {
        return (
            <div className="min-h-screen bg-[#FAFAF5] flex flex-col items-center justify-center gap-4">
                <h1 className="text-4xl font-bold text-[#343b1b]">404</h1>
                <p className="text-gray-500">This bio page doesn't exist.</p>
                <a href="/" className="text-[#4c6fb1] hover:underline text-sm">Go to homepage</a>
            </div>
        );
    }

    const { page, links, show_branding } = data;
    const t = THEME_STYLES[page.theme] || THEME_STYLES.default;

    return (
        <div className={`min-h-screen ${t.bg} flex flex-col items-center px-4 py-12`}>
            <div className="w-full max-w-md flex flex-col items-center gap-6">
                {/* Avatar */}
                {page.avatar_url && (
                    <img
                        src={page.avatar_url}
                        alt={page.display_name || page.handle}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white/30 shadow-lg"
                    />
                )}

                {/* Name + Bio */}
                <div className="text-center">
                    <h1 className={`text-2xl font-bold ${t.text}`}>
                        {page.display_name || `@${page.handle}`}
                    </h1>
                    {page.display_name && (
                        <p className={`text-sm ${t.subtext} mt-1`}>@{page.handle}</p>
                    )}
                    {page.bio_text && (
                        <p className={`mt-3 text-sm ${t.subtext} max-w-sm mx-auto whitespace-pre-line`}>
                            {page.bio_text}
                        </p>
                    )}
                </div>

                {/* Links */}
                <div className="w-full flex flex-col gap-3 mt-2">
                    {links.map(link => (
                        <a
                            key={link.id}
                            href={`/r/${link.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className={`block w-full ${t.btn} ${t.btnText} text-center font-medium py-3.5 px-6 rounded-xl shadow-sm transition-all duration-200 hover:scale-[1.02] hover:shadow-md`}
                        >
                            {link.title}
                        </a>
                    ))}
                </div>

                {links.length === 0 && (
                    <p className={`${t.subtext} text-sm`}>No links yet.</p>
                )}

                {/* Branding footer */}
                {show_branding && (
                    <a
                        href="/"
                        className={`mt-8 text-xs ${t.footer} hover:opacity-80 transition-opacity`}
                    >
                        Powered by URL Shortener
                    </a>
                )}
            </div>
        </div>
    );
};

export default BioPage;
