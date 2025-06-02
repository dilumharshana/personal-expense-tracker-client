import React, { memo } from "react";
import { Pie } from "react-chartjs-2";
import { type ChartData } from "chart.js";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { ArcElement, Tooltip, Legend, Chart as ChartJS } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface IPieChartComponent {
    expensePatterns: ChartData<"pie", number[], unknown>;
}

const PieChartComponent: React.FC<IPieChartComponent> = ({ expensePatterns }) => {
    return (
        <Pie
            data={expensePatterns}
            options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: "bottom",
                    },
                    datalabels: {
                        color: '#fff',
                        formatter: (_value: number, ctx) => {
                            // calculate the percentage 
                            const dataArr = ctx.chart.data.datasets[0].data as number[];
                            const total: number = dataArr.reduce((acc: number, val: number) => acc + val, 0);
                            const percentage = ((_value / total) * 100).toFixed(1);
                            return `${percentage} %`;
                        },
                        font: {
                            weight: 'bold',
                            size: 14,
                        },
                        // Position label in the center of the slice
                        anchor: 'center',
                        align: 'center',
                    },
                },
            }}
        />
    );
};

export default memo(PieChartComponent);
