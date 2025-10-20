import React from 'react';

interface BarConfig {
    key: string;
    name: string;
    color: string;
}

interface ChartComponentProps {
    data: any[];
    bars?: BarConfig[];
}

const defaultBars: BarConfig[] = [
    { key: 'income', name: 'درآمد', color: '#22c55e' },
    { key: 'expense', name: 'هزینه', color: '#ef4444' }
];

const ChartComponent: React.FC<ChartComponentProps> = ({ data, bars = defaultBars }) => {
    // Assuming Recharts is available on the window object from the CDN
    const Recharts = (window as any).Recharts;

    if (!Recharts) {
        return (
            <div style={{ width: '100%', height: 300 }} className="flex items-center justify-center text-gray-500 dark:text-gray-400">
                <p>در حال بارگذاری نمودار...</p>
            </div>
        );
    }

    const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts;

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart
                    data={data}
                    margin={{
                        top: 20,
                        right: 30,
                        left: 20,
                        bottom: 5,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={60} />
                    <YAxis tickFormatter={(value: any) => new Intl.NumberFormat('fa-IR').format(value)} />
                    <Tooltip 
                      formatter={(value: number) => [new Intl.NumberFormat('fa-IR').format(value), '']} 
                      labelStyle={{ direction: 'rtl' }}
                      wrapperClassName="dark:!bg-gray-700 !border-gray-500 rounded-md"
                    />
                    <Legend wrapperStyle={{ direction: 'rtl' }} />
                    {bars.map(bar => (
                        <Bar 
                            key={bar.key} 
                            dataKey={bar.key} 
                            name={bar.name} 
                            fill={bar.color} 
                            isAnimationActive={true} 
                            animationDuration={800} 
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ChartComponent;