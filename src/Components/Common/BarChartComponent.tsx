import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
  type ChartData,
} from "chart.js";
import React, { memo } from "react";
import { Bar } from "react-chartjs-2";

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
);

interface IBarChartComponent {
  dailyExpenses: ChartData<"bar", number[], unknown>;
}

const BarChartComponent: React.FC<IBarChartComponent> = ({ dailyExpenses }) => {
  return (
    <Bar
      data={dailyExpenses}
      options={{
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: (value) => `LKR ${value}`,
            },
          },
        },
      }}
    />
  );
};

export default memo(BarChartComponent);
