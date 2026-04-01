import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from "recharts";

type LineChartGraphProps = {
    data: { name: string; clicks: number }[];
};

const LineChartGraph = ({ data }: LineChartGraphProps) => {
    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
                No click data yet
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart
                data={data}
                margin={{ top: 10, right: 16, left: 0, bottom: 24 }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tickMargin={8} interval="preserveStartEnd" tick={{ fontSize: 12 }} />
                <YAxis tickMargin={6} width={32} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => [value, "Клики"]} />
                <Line type="monotone" dataKey="clicks" name="Клики" stroke="#5c7a2a" activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    )
}

export default LineChartGraph;
