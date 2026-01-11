
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";

const data = [
    { name: 'Jan', clicks: 2 },
    { name: 'Feb', clicks: 5 },
    { name: 'Mar', clicks: 10 },
    { name: 'Apr', clicks: 7 },
    { name: 'May', clicks: 20 },
    { name: 'Jun', clicks: 17 },
    { name: 'Jul', clicks: 100},
    { name: 'Aug', clicks: 80 },
    { name: 'Sep', clicks: 150 },
    { name: 'Oct', clicks: 170 },
    { name: 'Nov', clicks: 200 },
    { name: 'Dec', clicks: 250 },
];


const LineChartGraph = () => {
    return (
        <ResponsiveContainer width="100%" height={300}>
            <LineChart
                width={500}
                height={300}
                data={data}
                margin={{
                    top: 5,
                    right: 30,
                    left: 20,
                    bottom: 5,
                }}
            >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="clicks" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
        </ResponsiveContainer>
    )
}

export default LineChartGraph;