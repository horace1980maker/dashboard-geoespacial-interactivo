
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
            <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-md">
                <p className="font-bold text-slate-900 text-base">{label}</p>
                <p className="text-brand-base text-sm">{`${Intl.NumberFormat('en-US').format(payload[0].value)} ${unit}`}</p>
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
                        <stop offset="5%" stopColor="#009EE2" stopOpacity={0.9}/>
                        <stop offset="95%" stopColor="#4CC6FF" stopOpacity={0.15}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.9} />
                <XAxis dataKey="name" stroke="#4b5563" tick={{ fill: '#4b5563', fontSize: 12 }} />
                <YAxis 
                    stroke="#4b5563" 
                    tick={{ fill: '#4b5563', fontSize: 12 }}
                    tickFormatter={(value) => new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(Number(value))}
                    width={60}
                />
                <Tooltip 
                    content={<CustomTooltip unit={unit} />} 
                    cursor={{ fill: 'rgba(0, 158, 226, 0.12)' }}
                    wrapperStyle={{ outline: 'none' }}
                />
                <Bar dataKey={dataKey} fill="url(#barGradient)" name={unit} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    );
};