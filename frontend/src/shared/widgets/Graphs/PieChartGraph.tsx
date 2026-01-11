
import {
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';


const data = [
  { name: 'Group A', value: 400 },
  { name: 'Group B', value: 300 },
  { name: 'Group C', value: 300 },
  { name: 'Group D', value: 200 },
];

const PieChartGraph = () => {
    return (
        <div style={{ height: '300px', width: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie data={data} fill="#8884d8" dataKey={"value"} isAnimationActive={true}>
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
};

export default PieChartGraph;