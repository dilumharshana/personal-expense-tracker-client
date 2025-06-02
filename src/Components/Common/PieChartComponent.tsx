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
                        color: '#fff',               // white text for contrast
                        formatter: (_value: number, ctx) => {
                            const label = ctx.chart.data.labels?.[ctx.dataIndex];
                            return label;               // Show label inside slice
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
