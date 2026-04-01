import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';

type BarChartGraphProps = {
  data: { name: string; [key: string]: string | number }[];
  dataKey?: string;
};

const BarChartGraph = ({ data, dataKey = "clicks" }: BarChartGraphProps) => {
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
        <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 24 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" tickMargin={8} interval="preserveStartEnd" tick={{ fontSize: 12 }} />
          <YAxis tickMargin={6} width={32} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(value) => [value, "Клики"]} />
          <Bar dataKey={dataKey} name="Клики" fill="#5c7a2a" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BarChartGraph;
