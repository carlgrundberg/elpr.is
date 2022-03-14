import Head from 'next/head';
import {
  Chart as ChartJS,
  LinearScale,
  TimeScale,
  PointElement,
  LineElement,
  Tooltip,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import annotationPlugin from 'chartjs-plugin-annotation';
import { addHours, parseISO } from 'date-fns';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  annotationPlugin,
);

import data from '../data.json';

const formatPrice = (price) => `${Math.round(price / 10)} öre/kWh`;

const sum = (values) => values.reduce((acc, value) => acc + value, 0);
const avg = (values) => sum(values) / values.length;

let width, height, gradient;
function getGradient(ctx, chartArea) {
  const chartWidth = chartArea.right - chartArea.left;
  const chartHeight = chartArea.bottom - chartArea.top;
  if (!gradient || width !== chartWidth || height !== chartHeight) {
    // Create the gradient because this is either the first render
    // or the size of the chart has changed
    width = chartWidth;
    height = chartHeight;
    gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, 'rgb(75, 192, 192)');
    gradient.addColorStop(0.5, 'rgb(255, 205, 86)');
    gradient.addColorStop(1, 'rgb(255, 99, 132)');
  }

  return gradient;
}

function getPriceNow(prices) {
  const now = new Date();
  let current;
  for (const item of prices) {
    if (!current || new Date(item.date) < now) {
      current = item;
    }
  }
  return current?.value;
}

function getAveragePrice(prices) {
  const values = prices.map((item) => item.value);
  return avg(values);
}

export default function Home() {
  const avg = getAveragePrice(data);
  let chartData = [];

  if(data) {
    chartData = [...data];
    const lastHour = data[data.length - 1];
    chartData.push({
      ...lastHour,
      date: addHours(parseISO(lastHour.date), 1),
    });
  }

  const chart = {
    data: {
      datasets: [{
        data: chartData.map(({ date, value }) => ({ x: date, y: value / 10, value })),
        borderColor: function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;

          if (chartArea) {
            return getGradient(ctx, chartArea);
          }
        },
        stepped: true,
      }]
    },
    options: {
      interaction: {
        mode: 'index',
        intersect: false,
      },
      scales: {
        x: {
          type: 'time',
          time: {
            unit: 'hour',
            tooltipFormat:'yyyy-MM-dd HH:mm',
            displayFormats: {
              hour: 'HH:mm'
            }
          },
        },
        y: {
          beginAtZero: true,
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (item) =>formatPrice(item.raw.value),
          },
          displayColors: false,
        },
        annotation: {
          annotations: {
            priceNow: {
              label: {
                content: `Just nu: ${formatPrice(getPriceNow(data))}`,
                enabled: true,
                position: 'start'
              },
              type: 'line',
              borderColor: 'black',
              borderWidth: 1,
              scaleID: 'x',
              value: new Date()
            },
            averageToday: {
              type: 'line',
              borderDash: [6, 6],
              borderWidth: 1,
              label: {
                enabled: true,
                content: `Snitt: ${formatPrice(avg)}`,
                position: 'end'
              },
              scaleID: 'y',
              value: avg / 10,
            },
          }
        }
      }
    },
  };

  return (
    <>
      <Head>
        <title>Elpr.is</title>
        <meta name="description" content="Visa nuvarande elpris" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className="max-w-screen-2xl min-h-screen mx-auto p-1 md:p-2 lg:p-4 xl:p-8 grid place-content-center">
        <Line {...chart} />
      </section>
    </>
  );
}
