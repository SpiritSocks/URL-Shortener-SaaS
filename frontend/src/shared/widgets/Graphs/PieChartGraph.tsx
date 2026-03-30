import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Tooltip,
} from 'recharts';

const COLORS = ['#4c6fb1', '#c8d69b', '#f6e6a5', '#343b1b', '#8884d8', '#82ca9d'];
const RADIAN = Math.PI / 180;

type PieChartGraphProps = {
    data: { name: string; value: number }[];
};

const truncateLabel = (label: string, max = 10) => (label.length > max ? `${label.slice(0, max - 3)}...` : label);

const renderPieLabel = (props: any) => {
    const { cx, cy, midAngle, innerRadius, outerRadius, percent, name } = props;
    if ((percent ?? 0) < 0.06) return null;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const label = `${truncateLabel(String(name))} ${((percent ?? 0) * 100).toFixed(0)}%`;
    return (
        <text x={x} y={y} fill="#1f2937" textAnchor="middle" dominantBaseline="central" fontSize={12}>
            {label}
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

    return (
        <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                        data={data}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius="80%"
                        labelLine={false}
                        label={renderPieLabel}
                    >
                        {data.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip formatter={(value) => [value, "Клики"]} />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
};

export default PieChartGraph;
