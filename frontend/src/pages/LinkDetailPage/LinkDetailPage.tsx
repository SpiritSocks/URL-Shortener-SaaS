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

const LinkDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [data, setData] = useState<LinkDetailResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);
    const [showQR, setShowQR] = useState(false);

    useEffect(() => {
        if (!id) return;
        apiGetLinkDetail(Number(id))
            .then(setData)
            .catch(() => navigate('/home'))
            .finally(() => setLoading(false));
    }, [id]);

    const handleCopy = () => {
        if (!data) return;
        navigator.clipboard.writeText(getShortURL(data.stats.slug));
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#FAFAF5] flex items-center justify-center">
                <p className="text-gray-400">Loading...</p>
            </div>
        );
    }

    if (!data) return null;

    const { stats, plan_name } = data;
    const hasPro = plan_name === 'pro' || plan_name === 'unlimited';
    const hasUnlimited = plan_name === 'unlimited';

    const clicksData = (stats.clicks_over_time || []).map(d => ({
        name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        clicks: d.clicks,
    }));

    const countriesData = (stats.countries || []).map(c => ({ name: c.country, value: c.clicks }));
    const devicesData = (stats.devices || []).map(d => ({ name: d.device, value: d.clicks }));
    const browsersData = (stats.browsers || []).map(b => ({ name: b.browser, value: b.clicks }));
    const osData = (stats.os_stats || []).map(o => ({ name: o.os, value: o.clicks }));
    const referersData = (stats.referers || []).map(r => ({ name: r.referer, clicks: r.clicks }));

    const daysSinceCreated = Math.max(1, Math.floor((Date.now() - new Date(stats.created_at).getTime()) / 86400000));

    return (
        <div className="min-h-screen bg-[#FAFAF5] font-sans">
            <section className="flex flex-col max-w-6xl mx-auto px-4 pt-8 pb-16 gap-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm">
                    <button onClick={() => navigate('/home')} className="text-[#4c6fb1] hover:underline flex items-center gap-1">
                        <ArrowLeft size={14} />
                        Your links
                    </button>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-600">{stats.slug}</span>
                </div>

                {/* Link Header Card */}
                <div className="bg-white border-3 border-[#c8d69b] shadow-md rounded-[15px] p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <a
                                    href={getShortURL(stats.slug)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#4c6fb1] font-bold text-lg sm:text-xl hover:underline truncate"
                                >
                                    {getShortURL(stats.slug)}
                                </a>
                                <ExternalLink size={16} className="text-[#4c6fb1] flex-shrink-0" />
                            </div>
                            <p className="text-gray-500 text-sm truncate">{stats.target_url}</p>
                        </div>
                        <div className="flex items-center gap-6">
                            <div className="text-center">
                                <p className="text-3xl font-bold text-[#343b1b]">{stats.total_clicks.toLocaleString()}</p>
                                <p className="text-xs text-gray-400">total clicks</p>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    className="border-[#c8d69b] text-sm"
                                    onClick={handleCopy}
                                >
                                    <Copy size={14} />
                                    {copied ? 'Copied!' : 'Copy'}
                                </Button>
                                <Button
                                    variant="outline"
                                    className="border-[#c8d69b] text-sm"
                                    onClick={() => setShowQR(!showQR)}
                                >
                                    <QrCode size={14} />
                                    QR
                                </Button>
                            </div>
                        </div>
                    </div>

                    {showQR && (
                        <div className="mt-4 flex flex-col items-center gap-2 border-t border-[#c8d69b] pt-4">
                            <img
                                src={getQRCodeURL(stats.slug)}
                                alt={`QR code for ${stats.slug}`}
                                className="w-48 h-48 border rounded-lg"
                            />
                            <a
                                href={getQRCodeURL(stats.slug)}
                                download={`qr-${stats.slug}.png`}
                                className="text-[#4c6fb1] text-sm hover:underline"
                            >
                                Download QR Code
                            </a>
                        </div>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard
                        label="Clicks today"
                        value={stats.clicks_today}
                        icon={<MousePointerClick size={18} />}
                        iconBg="bg-[#4c6fb1]"
                    />
                    <StatCard
                        label="This week"
                        value={stats.clicks_week}
                        icon={<Calendar size={18} />}
                        iconBg="bg-[#c8d69b]"
                    />
                    <StatCard
                        label="This month"
                        value={stats.clicks_month}
                        icon={<Calendar size={18} />}
                        iconBg="bg-[#f6e6a5]"
                    />
                    <StatCard
                        label="Created"
                        value={new Date(stats.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        subtitle={`${daysSinceCreated} days ago`}
                        icon={<Clock size={18} />}
                        iconBg="bg-[#343b1b]"
                    />
                </div>

                {/* Clicks Over Time - Free tier */}
                <GraphCard icon={MousePointerClick} title="Clicks Over Time">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[10px] font-medium border border-green-500 text-green-600 px-2 py-0.5 rounded-full">FREE</span>
                    </div>
                    <LineChartGraph data={clicksData} />
                </GraphCard>

                {/* Pro-locked section */}
                {hasPro ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <GraphCard icon={Globe} title="Country Breakdown">
                            <BarChartGraph data={countriesData} dataKey="value" />
                        </GraphCard>
                        <GraphCard icon={Smartphone} title="Devices">
                            <PieChartGraph data={devicesData} />
                        </GraphCard>
                        <GraphCard icon={ComputerIcon} title="Browsers">
                            <PieChartGraph data={browsersData} />
                        </GraphCard>
                        <GraphCard icon={MonitorCog} title="Operating Systems">
                            <BarChartGraph data={osData} dataKey="value" />
                        </GraphCard>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <LockedCard
                            title="Country breakdown"
                            description="See which countries your clicks come from. Know your audience."
                            planLabel="Pro"
                            onUpgrade={() => navigate('/profile')}
                        />
                        <LockedCard
                            title="Devices"
                            description="Mobile vs desktop breakdown with browser stats."
                            planLabel="Pro"
                            onUpgrade={() => navigate('/profile')}
                        />
                        <LockedCard
                            title="Referrers"
                            description="Where are your clicks coming from? Social, email, direct?"
                            planLabel="Pro"
                            onUpgrade={() => navigate('/profile')}
                        />
                    </div>
                )}

                {/* Unlimited-locked section */}
                {hasUnlimited ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <GraphCard icon={ExternalLink} title="Referrer Sources">
                                <BarChartGraph data={referersData} />
                            </GraphCard>
                            <GraphCard icon={Clock} title="Clicks by Hour">
                                <HeatmapGraph data={stats.hourly_map || []} />
                            </GraphCard>
                        </div>

                        {/* Recent Clicks Feed */}
                        {stats.recent_clicks && stats.recent_clicks.length > 0 && (
                            <div className="bg-white border-3 border-[#c8d69b] shadow-md rounded-[15px] p-5">
                                <h3 className="font-semibold text-[#343b1b] mb-4">Recent Clicks</h3>
                                <div className="max-h-[400px] overflow-y-auto space-y-2">
                                    {stats.recent_clicks.map((click) => (
                                        <div
                                            key={click.event_id}
                                            className="flex flex-wrap items-center gap-3 text-sm px-3 py-2 bg-[#fbfcef] rounded-lg border border-[#e8edc8]"
                                        >
                                            <span className="text-gray-400 text-xs">
                                                {new Date(click.clicked_at).toLocaleString()}
                                            </span>
                                            <span className="bg-[#c8d69b] text-[#343b1b] px-2 py-0.5 rounded text-xs font-medium">
                                                {click.country}
                                            </span>
                                            <span className="text-gray-600 text-xs">{click.device}</span>
                                            <span className="text-gray-600 text-xs">{click.browser}</span>
                                            <span className="text-gray-600 text-xs">{click.os}</span>
                                            <span className="text-[#4c6fb1] text-xs">{click.referer}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : hasPro ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <LockedCard
                            title="Referrer Sources"
                            description="Track where your traffic comes from — social, email, or direct."
                            planLabel="Unlimited"
                            onUpgrade={() => navigate('/profile')}
                        />
                        <LockedCard
                            title="Hourly Heatmap"
                            description="See when your audience is most active throughout the day."
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
    <div className="bg-white border-3 border-[#c8d69b] shadow-md rounded-[15px] p-5">
        <div className="flex items-center gap-2 mb-3">
            <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center text-white`}>
                {icon}
            </div>
        </div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-2xl font-bold text-[#343b1b]">
            {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
        {subtitle && <p className="text-xs text-[#4c6fb1] mt-1">{subtitle}</p>}
    </div>
);

// Locked feature card
const LockedCard = ({ title, description, planLabel, onUpgrade }: {
    title: string;
    description: string;
    planLabel: string;
    onUpgrade: () => void;
}) => (
    <div className="bg-[#343b1b] text-white rounded-[15px] p-6 flex flex-col items-center text-center">
        <Lock size={28} className="text-[#f6e6a5] mb-3" />
        <h3 className="font-bold text-lg mb-1">
            {title}
            <span className="ml-2 text-[10px] font-medium border border-[#4c6fb1] text-[#4c6fb1] bg-white px-2 py-0.5 rounded-full">
                {planLabel}
            </span>
        </h3>
        <p className="text-gray-300 text-sm mb-4">{description}</p>
        <Button
            variant="outline"
            className="border-white text-white hover:bg-white hover:text-[#343b1b]"
            onClick={onUpgrade}
        >
            Upgrade to {planLabel}
        </Button>
    </div>
);

export default LinkDetailPage;
