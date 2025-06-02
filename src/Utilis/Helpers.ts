import * as d3 from "d3-scale-chromatic";

// helper for generate random colrs for bar chart
export const generateColorScale = (count: number) => {
  const colors = [];
  for (let i = 0; i < count; i++) {
    colors.push(d3.interpolateRainbow(i / count));
  }
  return colors;
};

// helper for format currency
export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
  }).format(amount);
};
