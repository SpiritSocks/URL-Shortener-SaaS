type HeatmapProps = {
    data: { hour: number; clicks: number }[];
}

const HeatmapGraph = ({ data }: HeatmapProps) => {
    if (!data || data.length === 0) {
        return <p className="text-gray-400 text-sm text-center py-8">No data yet</p>;
    }

    const maxClicks = Math.max(...data.map(d => d.clicks), 1);

    // Fill all 24 hours
    const hours = Array.from({ length: 24 }, (_, i) => {
        const found = data.find(d => d.hour === i);
        return { hour: i, clicks: found?.clicks ?? 0 };
    });

    const getIntensity = (clicks: number) => {
        if (clicks === 0) return 'bg-gray-100';
        const ratio = clicks / maxClicks;
        if (ratio < 0.2) return 'bg-[#e8edc8]';
        if (ratio < 0.4) return 'bg-[#c8d69b]';
        if (ratio < 0.6) return 'bg-[#a3b86c]';
        if (ratio < 0.8) return 'bg-[#7a9a44]';
        return 'bg-[#4c6fb1]';
    };

    return (
        <div className="flex flex-col gap-2">
            <div className="grid grid-cols-12 gap-1">
                {hours.map(h => (
                    <div
                        key={h.hour}
                        className={`${getIntensity(h.clicks)} rounded-md aspect-square flex items-center justify-center text-[10px] font-medium transition-all hover:scale-110 cursor-default relative group`}
                        title={`${h.hour}:00 — ${h.clicks} clicks`}
                    >
                        <span className={h.clicks > 0 ? 'text-white' : 'text-gray-400'}>{h.hour}</span>
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none z-10">
                            {h.clicks} clicks at {h.hour}:00
                        </div>
                    </div>
                ))}
            </div>
            <div className="flex items-center gap-2 justify-end mt-1">
                <span className="text-[10px] text-gray-400">Less</span>
                <div className="w-3 h-3 rounded-sm bg-gray-100" />
                <div className="w-3 h-3 rounded-sm bg-[#e8edc8]" />
                <div className="w-3 h-3 rounded-sm bg-[#c8d69b]" />
                <div className="w-3 h-3 rounded-sm bg-[#a3b86c]" />
                <div className="w-3 h-3 rounded-sm bg-[#4c6fb1]" />
                <span className="text-[10px] text-gray-400">More</span>
            </div>
        </div>
    );
};

export default HeatmapGraph;
