import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    MousePointerClick, Calendar, Globe, Smartphone,
    MonitorCog, ComputerIcon, Lock, Copy, QrCode,
    ExternalLink, Clock, ArrowLeft
} from "lucide-react";

import GraphCard from "@/shared/widgets/GraphCard/GraphCard";
import LineChartGraph from "@/shared/widgets/Graphs/LineChartGraph";
import BarChartGraph from "@/shared/widgets/Graphs/BarChartGraph";
import PieChartGraph from "@/shared/widgets/Graphs/PieChartGraph";
import HeatmapGraph from "@/shared/widgets/Graphs/HeatmapGraph";

import { apiGetLinkDetail, getShortURL, getQRCodeURL, type LinkDetailResponse } from "@/lib/api";
import { toCountryCode } from "@/lib/utils";

const LinkDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<LinkDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [locked, setLocked] = useState(false);
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);

    useEffect(() => {
        if (!id) return;
        apiGetLinkDetail(Number(id))
            .then(setData)
            .catch((err) => {
                if (err.message === 'link_analytics_locked') {
                    setLocked(true);
                } else {
                    navigate('/home');
                }
            })
            .finally(() => setLoading(false));
    }, [id]);

    const handleCopy = () => {
        if (!data) return;
        const shortUrl = data.custom_domain
            ? `https://${data.custom_domain}/r/${data.stats.slug}`
            : getShortURL(data.stats.slug);
        navigator.clipboard.writeText(shortUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <p className="text-gray-400">Загрузка...</p>
            </div>
        );
    }

    if (locked) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="bg-white border-2 border-border shadow-md rounded-[15px] p-10 flex flex-col items-center max-w-lg text-center">
                    <Lock size={48} className="text-[var(--color-link)] mb-4" />
                    <h2 className="text-2xl font-bold text-foreground mb-2">Аналитика по ссылке</h2>
                    <p className="text-gray-500 mb-6">
                        Подробная аналитика по каждой ссылке доступна на тарифах Pro и Unlimited. Обновите тариф, чтобы видеть клики, географию, устройства и многое другое.
                    </p>
                    <div className="flex gap-3">
                        <Button variant="outline" onClick={() => navigate('/home')}>
                            <ArrowLeft size={14} className="mr-1" /> Назад
                        </Button>
                        <Button className="bg-primary text-white" onClick={() => navigate('/profile')}>
                            Обновить тариф
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    if (!data) return null;

    const { stats, plan_name } = data;
    const hasPro = plan_name === 'pro' || plan_name === 'unlimited';
    const hasUnlimited = plan_name === 'unlimited';

    const displayUrl = data.custom_domain
        ? `https://${data.custom_domain}/r/${stats.slug}`
        : getShortURL(stats.slug);

    const clicksData = (stats.clicks_over_time || []).map(d => ({
        name: new Date(d.date).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric' }),
        clicks: d.clicks,
    }));

    const countriesData = (stats.countries || []).map(c => ({ name: toCountryCode(c.country), value: c.clicks }));
    const devicesData = (stats.devices || []).map(d => ({ name: d.device, value: d.clicks }));
    const browsersData = (stats.browsers || []).map(b => ({ name: b.browser, value: b.clicks }));
    const osData = (stats.os_stats || []).map(o => ({ name: o.os, value: o.clicks }));
    const referersData = (stats.referers || []).map(r => ({ name: r.referer, clicks: r.clicks }));

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const created = new Date(stats.created_at);
    created.setHours(0, 0, 0, 0);
    const daysSinceCreated = Math.round((today.getTime() - created.getTime()) / 86400000);

    return (
        <div className="min-h-screen bg-background font-sans">
            <section className="flex flex-col max-w-6xl mx-auto px-4 pt-8 pb-16 gap-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm">
                    <button onClick={() => navigate('/home')} className="text-(--color-link) hover:underline flex items-center gap-1">
                        <ArrowLeft size={14} />
                        Ваши ссылки
                    </button>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-600">{stats.slug}</span>
                </div>

                {/* Link Header Card */}
                <div className="bg-white border-3 border-border shadow-md rounded-[15px] p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <a
                                    href={displayUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-(--color-link) font-bold text-lg sm:text-xl hover:underline truncate"
                                >
                                    {displayUrl}
                                </a>
                                <ExternalLink size={16} className="text-(--color-link) shrink-0" />
                            </div>
                            <p className="text-gray-500 text-sm truncate">{stats.target_url}</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-foreground">{stats.total_clicks.toLocaleString()}</p>
                                <p className="text-xs text-gray-400">всего кликов</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="border-border text-sm"
                                    onClick={handleCopy}
                                >
                                    <Copy size={14} />
                                    {copied ? 'Скопировано!' : 'Копировать'}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-border text-sm"
                                    onClick={() => setShowQR(!showQR)}
                                >
                                    <QrCode size={14} />
                                    QR
                                </Button>
                            </div>
                        </div>
                    </div>

                    {showQR && (
                        <div className="mt-4 flex flex-col items-center gap-2 border-t border-border pt-4">
                            <img
                                src={getQRCodeURL(stats.slug)}
                                alt={`QR code for ${stats.slug}`}
                                className="w-48 h-48 border rounded-lg"
                            />
                            <a
                                href={getQRCodeURL(stats.slug)}
                                download={`qr-${stats.slug}.png`}
                                className="text-(--color-link) text-sm hover:underline"
                            >
                                Скачать QR-код
                            </a>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        label="Клики сегодня"
                        value={stats.clicks_today}
                        icon={<MousePointerClick size={18} />}
                        iconBg="bg-primary"
                    />
                    <StatCard
                        label="За неделю"
                        value={stats.clicks_week}
                        icon={<Calendar size={18} />}
                        iconBg="bg-[var(--color-border)]"
                    />
                    <StatCard
                        label="За месяц"
                        value={stats.clicks_month}
                        icon={<Calendar size={18} />}
                        iconBg="bg-amber-100"
                    />
                    <StatCard
                        label="Создано"
                        value={new Date(stats.created_at).toLocaleDateString('ru-RU', { month: 'short', day: 'numeric', year: 'numeric' })}
                        subtitle={daysSinceCreated === 0 ? 'сегодня' : `${daysSinceCreated} дн. назад`}
                        icon={<Clock size={18} />}
                        iconBg="bg-[var(--color-navbar)]"
                    />
                </div>

                {/* Clicks Over Time - Free tier */}
                <GraphCard icon={MousePointerClick} title="Клики по времени">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-medium border border-green-500 text-green-600 px-2 py-0.5 rounded-full">FREE</span>
                    </div>
                    <LineChartGraph data={clicksData} />
                </GraphCard>

                {/* Pro-locked section */}
                {hasPro ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <GraphCard icon={Globe} title="География кликов">
                            <BarChartGraph data={countriesData} dataKey="value" />
                        </GraphCard>
                        <GraphCard icon={Smartphone} title="Устройства">
                            <PieChartGraph data={devicesData} />
                        </GraphCard>
                        <GraphCard icon={ComputerIcon} title="Браузеры">
                            <PieChartGraph data={browsersData} />
                        </GraphCard>
                        <GraphCard icon={MonitorCog} title="Операционные системы">
                            <BarChartGraph data={osData} dataKey="value" />
                        </GraphCard>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <LockedCard
                            title="География кликов"
                            description="Узнайте, из каких стран приходят клики. Знайте свою аудиторию."
                            planLabel="Pro"
                            onUpgrade={() => navigate('/profile')}
                        />
                        <LockedCard
                            title="Устройства"
                            description="Статистика по мобильным и десктопным устройствам с данными о браузерах."
                            planLabel="Pro"
                            onUpgrade={() => navigate('/profile')}
                        />
                        <LockedCard
                            title="Источники"
                            description="Откуда приходят клики? Соцсети, почта, прямые переходы?"
                            planLabel="Pro"
                            onUpgrade={() => navigate('/profile')}
                        />
                    </div>
                )}

                {/* Unlimited-locked section */}
                {hasUnlimited ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <GraphCard icon={ExternalLink} title="Источники переходов">
                                <BarChartGraph data={referersData} />
                            </GraphCard>
                            <GraphCard icon={Clock} title="Клики по часам">
                                <HeatmapGraph data={stats.hourly_map || []} />
                            </GraphCard>
                        </div>

                        {/* Recent Clicks Feed */}
                        {stats.recent_clicks && stats.recent_clicks.length > 0 && (
                            <div className="bg-white border-3 border-border shadow-md rounded-[15px] p-5">
                                <h3 className="font-semibold text-foreground mb-4">Последние клики</h3>
                                <div className="max-h-[400px] overflow-y-auto space-y-2">
                                    {stats.recent_clicks.map((click) => (
                                        <div
                                            key={click.event_id}
                                            className="flex flex-wrap items-center gap-3 text-sm px-3 py-2 bg-background rounded-lg border border-border"
                                        >
                                            <span className="text-gray-400 text-xs">
                                                {new Date(click.clicked_at).toLocaleString()}
                                            </span>
                                            <span className="bg-(--color-border) text-foreground px-2 py-0.5 rounded text-xs font-medium">
                                                {toCountryCode(click.country)}
                                            </span>
                                            <span className="text-gray-600 text-xs">{click.device}</span>
                                            <span className="text-gray-600 text-xs">{click.browser}</span>
                                            <span className="text-gray-600 text-xs">{click.os}</span>
                                            <span className="text-(--color-link) text-xs">{click.referer}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : hasPro ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <LockedCard
                            title="Источники переходов"
                            description="Отслеживайте, откуда приходит трафик — соцсети, почта или прямые переходы."
                            planLabel="Unlimited"
                            onUpgrade={() => navigate('/profile')}
                        />
                        <LockedCard
                            title="Почасовая тепловая карта"
                            description="Узнайте, когда ваша аудитория наиболее активна в течение дня."
                            planLabel="Unlimited"
                            onUpgrade={() => navigate('/profile')}
                        />
                    </div>
                ) : null}
            </section>
        </div>
    );
};

// Stat card component
const StatCard = ({ label, value, subtitle, icon, iconBg }: {
    label: string;
    value: string | number;
    subtitle?: string;
    icon: React.ReactNode;
    iconBg: string;
}) => (
    <div className="bg-white border-3 border-border shadow-md rounded-[15px] p-5">
        <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center text-white`}>
                {icon}
            </div>
        </div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-foreground">
            {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtitle && <p className="text-xs text-(--color-link) mt-1">{subtitle}</p>}
    </div>
);

// Locked feature card
const LockedCard = ({ title, description, planLabel, onUpgrade }: {
    title: string;
    description: string;
    planLabel: string;
    onUpgrade: () => void;
}) => (
    <div className="bg-(--color-navbar) text-white rounded-[15px] p-6 flex flex-col items-center text-center">
        <Lock size={28} className="text-amber-200 mb-3" />
        <h3 className="font-bold text-lg mb-1">
            {title}
            <span className="ml-2 text-[10px] font-medium border border-primary text-(--color-link) bg-white px-2 py-0.5 rounded-full">
                {planLabel}
            </span>
        </h3>
        <p className="text-gray-300 text-sm mb-4">{description}</p>
        <Button
            variant="outline"
            className="border-white text-(--color-text-muted) hover:bg-white hover:text-foreground mt-auto"
            onClick={onUpgrade}
        >
            Перейти на {planLabel}
        </Button>
    </div>
);

export default LinkDetailPage;
