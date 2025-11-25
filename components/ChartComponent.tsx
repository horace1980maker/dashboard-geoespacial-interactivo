
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ChartComponentProps {
    data: { name: string; value: number }[];
    dataKey: string;
    unit: string;
}

const CustomTooltip: React.FC<any> = ({ active, payload, label, unit }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900/80 p-3 border border-gray-600 rounded-lg shadow-lg backdrop-blur-sm">
                <p className="font-bold text-white text-base">{label}</p>
                <p className="text-cyan-400 text-sm">{`${Intl.NumberFormat('en-US').format(payload[0].value)} ${unit}`}</p>
            </div>
        );
    }
    return null;
};

export const ChartComponent: React.FC<ChartComponentProps> = ({ data, dataKey, unit }) => {
    return (
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <defs>
                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#0891b2" stopOpacity={0.2}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#4a5568" strokeOpacity={0.5} />
                <XAxis dataKey="name" stroke="#a0aec0" tick={{ fill: '#a0aec0', fontSize: 12 }} />
                <YAxis 
                    stroke="#a0aec0" 
                    tick={{ fill: '#a0aec0', fontSize: 12 }}
                    tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(Number(value))}
                    width={60}
                />
                <Tooltip 
                    content={<CustomTooltip unit={unit} />} 
                    cursor={{ fill: 'rgba(110, 231, 255, 0.1)' }}
                    wrapperStyle={{ outline: 'none' }}
                />
                <Bar dataKey={dataKey} fill="url(#barGradient)" name={unit} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};