import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
} from 'recharts';

const COLORS = ['#5c7a2a', '#d8e4b8', '#d97706', '#1e3a2f', '#8884d8', '#82ca9d'];
const RADIAN = Math.PI / 180;

type PieChartGraphProps = {
    data: { name: string; value: number }[];
};

const renderPieLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;
    if ((percent ?? 0) < 0.08) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
        <text x={x} y={y} fill="#1e3a2f" textAnchor="middle" dominantBaseline="central" fontSize={12}>
            {`${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
        </text>
    );
};

const PieChartGraph = ({ data }: PieChartGraphProps) => {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
                No data yet
            </div>
        );
    }

    const total = data.reduce((sum, d) => sum + d.value, 0);

    return (
        <div className="flex flex-col gap-3">
            <div style={{ height: '260px', width: '100%' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart style={{ outline: 'none' }}>
                        <Pie
                            data={data}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius="80%"
                            labelLine={false}
                            label={renderPieLabel}
                            style={{ outline: 'none' }}
                        >
                            {data.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => [value, "Клики"]} />
                    </PieChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
                {data.map((entry, index) => {
                    const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : '0';
                    return (
                        <div key={entry.name} className="flex items-center gap-1.5 text-xs text-gray-600">
                            <span
                                className="inline-block w-2.5 h-2.5 rounded-full shrink-0"
                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                            />
                            <span>{entry.name}</span>
                            <span className="text-gray-400">{pct}%</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default PieChartGraph;
