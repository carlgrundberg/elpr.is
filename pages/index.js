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
  const avgToday = getAveragePrice(data.today);
  const avgTomorrow = getAveragePrice(data.tomorrow);

  const chartData = data?.today || [];

  if(data?.tomorrow) {
    chartData.push(...data.tomorrow);
    const lastHour = data.tomorrow[data.tomorrow.length - 1];
    chartData.push({
      ...lastHour,
      date: addHours(parseISO(lastHour.date), 1),
    });
  }

  const chart = {
    data: {
      datasets: [{
        data: chartData.map(({ date, value }) => ({ x: date, y: value / 10 })),
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
        annotation: {
          annotations: {
            priceNow: {
              label: {
                content: `Just nu: ${formatPrice(getPriceNow(data.today))}`,
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
                content: `Snitt idag: ${formatPrice(avgToday)}`,
                position: 'end'
              },
              scaleID: 'y',
              value: avgToday / 10,
            },
            averageTomorrow: {
              type: 'line',
              borderDash: [6, 6],
              borderWidth: 1,
              label: {
                enabled: true,
                content: `Snitt imorgon: ${formatPrice(avgTomorrow)}`,
                position: 'end'
              },
              scaleID: 'y',
              value: avgTomorrow / 10,
            }
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

      {/* <section className="py-8">
        <div className="container mx-auto flex flex-wrap">
          <div className="w-full flex flex-wrap">
            <div className="w-full md:w-1/3 p-6">
              <div className="bg-gradient-to-b from-green-200 to-green-100 border-b-4 border-green-600 rounded-lg shadow-xl p-5">
                <div className="flex-1 text-center">
                  <h2 className="font-bold uppercase text-gray-600">Just nu</h2>
                  <p className="font-bold text-3xl">{data ? formatPrice(getPriceNow(data.today)) : '...'}</p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/3 p-6">
              <div className="bg-gradient-to-b from-pink-200 to-pink-100 border-b-4 border-pink-500 rounded-lg shadow-xl p-5">
                <div className="flex-1 text-center">
                  <h2 className="font-bold uppercase text-gray-600">Snittpris idag</h2>
                  <p className="font-bold text-3xl">{data ? formatPrice(getAveragePrice(data.today)) : '...'}</p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/3 p-6">
              <div className="bg-gradient-to-b from-yellow-200 to-yellow-100 border-b-4 border-yellow-600 rounded-lg shadow-xl p-5">
                <div className="flex-1 text-center">
                  <h2 className="font-bold uppercase text-gray-600">Snittpris imorgon</h2>
                  <p className="font-bold text-3xl">{data ? data.tomorrow ? formatPrice(getAveragePrice(data.tomorrow)) : 'Ej släppt ännu' : '...'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section> */}

      <section className="container mx-auto p-8 min-h-screen grid place-content-center">
        <Line {...chart} />
      </section>
    </>
  );
}
