import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    MousePointerClick, Link2, TrendingUp, Calendar, Globe, Smartphone,
    ComputerIcon, MonitorCog, Lock, ExternalLink, Clock, Download,
    Trophy, Activity, ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";

import AnalyticsCard_small from "@/shared/widgets/AnalyticsCard/AnalyticsCard_small";
import GraphCard from "@/shared/widgets/GraphCard/GraphCard";

import BarChartGraph from "@/shared/widgets/Graphs/BarChartGraph";
import PieChartGraph from "@/shared/widgets/Graphs/PieChartGraph";
import LineChartGraph from "@/shared/widgets/Graphs/LineChartGraph";
import HeatmapGraph from "@/shared/widgets/Graphs/HeatmapGraph";

import {
    apiGetAnalytics, apiGetAdvancedAnalytics, apiExportCSV,
    type OverviewStats, type AdvancedStats, type OverviewResponse
} from "@/lib/api";

type DashboardMenuProps = {
    isOpen: boolean;
}

const DashboardMenu = ({ isOpen }: DashboardMenuProps) => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<OverviewStats | null>(null);
    const [advanced, setAdvanced] = useState<AdvancedStats | null>(null);
    const [planName, setPlanName] = useState<string>('free');
    const [exporting, setExporting] = useState(false);

    useEffect(() => {
        if (isOpen) {

            apiGetAnalytics()
                .then((res: OverviewResponse) => {
                    setStats(res.stats);
                    setPlanName(res.plan_name);
                })
                .catch(() => {});

            apiGetAdvancedAnalytics()
                .then(setAdvanced)
                .catch(() => {});
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const isPro = planName === 'pro' || planName === 'unlimited';
    const isUnlimited = planName === 'unlimited';

    const clicksData = (stats?.clicks_over_time || []).map(d => ({
        name: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        clicks: d.clicks,
    }));

    const countriesData = (stats?.countries || []).map(c => ({
        name: c.country,
        value: c.clicks,
    }));

    const devicesData = (stats?.devices || []).map(d => ({
        name: d.device,
        value: d.clicks,
    }));

    const browsersData = (stats?.browsers || []).map(b => ({
        name: b.browser,
        value: b.clicks,
    }));

    const osData = (stats?.os_stats || []).map(o => ({
        name: o.os,
        value: o.clicks,
    }));

    // Advanced data
    const referersData = (advanced?.referers || []).map(r => ({
        name: r.referer.length > 30 ? r.referer.substring(0, 30) + '...' : r.referer,
        clicks: r.clicks,
    }));

    const hourlyData = advanced?.hourly_map || [];

    const handleExportCSV = async () => {
        setExporting(true);
        try {
            await apiExportCSV();
        } catch {
            alert('Export failed. Make sure you have an Unlimited plan.');
        } finally {
            setExporting(false);
        }
    };

    return (
        <>
        <section id="analytics-section" className="flex flex-col items-center gap-10 pt-4 px-10">
            <div className="flex items-center gap-4">
                <h1 className="font-bold text-md sm:text-3xl text-[#343b1b]">Your Analytics</h1>
                {isUnlimited && (
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-[#4c6fb1] text-[#4c6fb1] hover:bg-[#4c6fb1] hover:text-white"
                        onClick={handleExportCSV}
                        disabled={exporting}
                    >
                        <Download size={14} className="mr-1" />
                        {exporting ? 'Exporting...' : 'Export CSV'}
                    </Button>
                )}
            </div>
            <div className="flex flex-col flex-wrap sm:flex-row md:flex-row lg:flex-row justify-center gap-10">

                <AnalyticsCard_small
                    icon={Link2}
                    title="Total Links"
                    text={String(stats?.total_links ?? 0)}
                    icon_bgColor="bg-[#c8d69b]"
                    icon_color="" />

                <AnalyticsCard_small
                    icon={MousePointerClick}
                    title="Total Clicks"
                    text={String(stats?.total_clicks ?? 0)}
                    icon_bgColor="bg-[#4c6fb1]"
                    icon_color="text-white" />

                <AnalyticsCard_small
                    icon={TrendingUp}
                    title="Avg. Per Link"
                    text={(stats?.avg_per_link ?? 0).toFixed(1)}
                    icon_bgColor="bg-[#f6e6a5]"
                    icon_color="" />

                <AnalyticsCard_small
                    icon={Calendar}
                    title="Avg. Per Day"
                    text={(stats?.avg_per_day ?? 0).toFixed(1)}
                    icon_bgColor="bg-[#4c6fb1]"
                    icon_color="text-white" />
            </div>
        </section>

        <section id="graph-section" className="min-h-screen mt-10 px-10">
            <div>
                <GraphCard
                    icon={TrendingUp}
                    title="Clicks Over Time">
                    <LineChartGraph data={clicksData} />
                </GraphCard>
            </div>
            {isPro ? (
            <div className="grid grid-cols-1 xl:grid-cols-2 md:grid-cols-2 gap-6 w-full pt-10">
                <GraphCard
                    icon={Globe}
                    title="Top Countries">
                    <BarChartGraph data={countriesData} dataKey="value" />
                </GraphCard>

                <GraphCard
                    icon={Smartphone}
                    title="Device Types">
                    <PieChartGraph data={devicesData} />
                </GraphCard>

                <GraphCard
                    icon={ComputerIcon}
                    title="Browser Distribution">
                    <PieChartGraph data={browsersData} />
                </GraphCard>

                <GraphCard
                    icon={MonitorCog}
                    title="Operating System">
                    <BarChartGraph data={osData} dataKey="value" />
                </GraphCard>
            </div>
            ) : (
            <div className="mt-10">
                <div className="bg-white border-2 border-dashed border-[#c8d69b] rounded-[15px] p-8 flex flex-col items-center">
                    <Lock size={32} className="text-gray-400 mb-3" />
                    <h3 className="text-lg font-bold text-[#343b1b] mb-1">Detailed Breakdowns</h3>
                    <p className="text-gray-400 text-sm text-center mb-4 max-w-md">
                        Upgrade to Pro to unlock country, device, browser, and OS breakdowns, plus per-link analytics.
                    </p>
                    <Button
                        className="bg-[#4c6fb1] text-white"
                        onClick={() => navigate('/profile')}
                    >
                        Upgrade to Pro
                    </Button>
                </div>
            </div>
            )}

            {/* Advanced Analytics Section — Unlimited Only */}
            {!isUnlimited ? (
                <div className="mt-10 mb-10">
                    <div className="bg-white border-3 border-dashed border-[#c8d69b] rounded-[15px] p-8 flex flex-col items-center">
                        <Lock size={32} className="text-gray-400 mb-3" />
                        <h3 className="text-lg font-bold text-[#343b1b] mb-1">Advanced Analytics</h3>
                        <p className="text-gray-400 text-sm text-center mb-4 max-w-md">
                            Unlock referrer tracking, hourly heatmaps, live click feed, and CSV export with the Unlimited plan.
                        </p>
                        <Button
                            className="bg-[#343b1b] text-white"
                            onClick={() => navigate('/profile')}
                        >
                            Upgrade to Unlimited
                        </Button>
                    </div>
                </div>
            ) : (
                <div className="mt-10 mb-10">
                    <div className="flex items-center gap-2 mb-6">
                        <div className="bg-[#343b1b] text-white text-xs px-3 py-1 rounded-full font-medium">
                            Unlimited
                        </div>
                        <h2 className="text-xl font-bold text-[#343b1b]">Advanced Analytics</h2>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-2 md:grid-cols-2 gap-6 w-full">
                        {/* Referrer Sources */}
                        <GraphCard
                            icon={ExternalLink}
                            title="Referrer Sources">
                            <BarChartGraph data={referersData} dataKey="clicks" />
                        </GraphCard>

                        {/* Hourly Heatmap */}
                        <GraphCard
                            icon={Clock}
                            title="Clicks by Hour (Last 30 days)">
                            <HeatmapGraph data={hourlyData} />
                        </GraphCard>
                    </div>

                    {/* Top Performing Links */}
                    <div className="mt-6 bg-white border-3 border-[#c8d69b] shadow-md rounded-[15px] p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-lg bg-[#f6e6a5]">
                                <Trophy size={18} />
                            </div>
                            <h3 className="font-semibold text-[15px]">Top Performing Links</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-gray-500 border-b">
                                        <th className="pb-2 font-medium">#</th>
                                        <th className="pb-2 font-medium">Slug</th>
                                        <th className="pb-2 font-medium">Target URL</th>
                                        <th className="pb-2 font-medium text-right">Clicks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(advanced?.top_links || []).map((link, i) => (
                                        <tr key={link.link_id} className="border-b last:border-0 hover:bg-gray-50">
                                            <td className="py-3 font-semibold text-[#4c6fb1]">{i + 1}</td>
                                            <td className="py-3">
                                                <code className="bg-gray-100 px-2 py-0.5 rounded text-xs">/r/{link.slug}</code>
                                            </td>
                                            <td className="py-3 max-w-xs truncate text-gray-600">
                                                <a href={link.target_url} target="_blank" rel="noreferrer" className="hover:text-[#4c6fb1] flex items-center gap-1">
                                                    {link.target_url.length > 50 ? link.target_url.substring(0, 50) + '...' : link.target_url}
                                                    <ArrowUpRight size={12} />
                                                </a>
                                            </td>
                                            <td className="py-3 text-right font-bold">{link.clicks}</td>
                                        </tr>
                                    ))}
                                    {(!advanced?.top_links || advanced.top_links.length === 0) && (
                                        <tr>
                                            <td colSpan={4} className="py-6 text-center text-gray-400">No links yet</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Clicks Feed */}
                    <div className="mt-6 bg-white border-3 border-[#c8d69b] shadow-md rounded-[15px] p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 rounded-lg bg-[#4c6fb1]">
                                <Activity size={18} className="text-white" />
                            </div>
                            <h3 className="font-semibold text-[15px]">Recent Clicks</h3>
                        </div>
                        <div className="space-y-2 max-h-[400px] overflow-y-auto">
                            {(advanced?.recent_clicks || []).map((click) => (
                                <div key={click.event_id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2 h-2 rounded-full bg-green-500" />
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">/r/{click.slug}</code>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(click.clicked_at).toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <Globe size={10} /> {click.country}
                                                </span>
                                                <span>•</span>
                                                <span>{click.device}</span>
                                                <span>•</span>
                                                <span>{click.browser}</span>
                                                <span>•</span>
                                                <span>{click.os}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400 max-w-[200px] truncate">
                                        {click.referer === 'Direct' ? (
                                            <span className="text-green-600 font-medium">Direct</span>
                                        ) : (
                                            click.referer
                                        )}
                                    </div>
                                </div>
                            ))}
                            {(!advanced?.recent_clicks || advanced.recent_clicks.length === 0) && (
                                <p className="text-gray-400 text-sm text-center py-6">No clicks recorded yet</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
        </>
    )
}

export default DashboardMenu;
