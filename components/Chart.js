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
import { formatRelative } from 'date-fns';
import { sv } from 'date-fns/locale';
import { Line } from 'react-chartjs-2';
import { useLocalStorageState } from 'ahooks';

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  annotationPlugin,
);

import staticDate from '../data.json';
import { useTime } from '../lib/useTime';

const formatPrice = (price) => `${Math.round(price / 10)} öre/kWh`;

const sum = (values) => values.reduce((acc, value) => acc + value, 0);
const avg = (values) => sum(values) / values.length;

const availableAreas = [
  'SE1',
  'SE2',
  'SE3',
  'SE4'
];

const areaColors = {
  SE1: '#4e73df',
  SE2: '#1cc88a',
  SE3: '#36b9cc',
  SE4: '#f6c23e',
};

const { data, timestamp } = staticDate;

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

function getPriceNow(area, now) {
  let current;
  for (const item of data[area]) {
    if (!current || new Date(item.date) < now) {
      current = item;
    }
  }
  return current?.value;
}

function getAveragePrice(areas) {
  const values = areas.flatMap(area => data[area].map((item) => item.value));
  return avg(values);
}

export default function Chart() {
  const [areas, setAreas] = useLocalStorageState('areas', { defaultValue: ['SE4'] });
  const [showNow, setShowNow] = useLocalStorageState('showNow', { defaultValue: true });
  const [showAverage, setShowAverage] = useLocalStorageState('showAverage', { defaultValue: true });
  const now = useTime(1000 * 60);
  const avg = getAveragePrice(areas);

  const toggleAreas = (area) => {
    const newAreas = [...areas];
    const index = newAreas.indexOf(area);
    if (index === -1) {
      newAreas.push(area);
    } else {
      newAreas.splice(index, 1);
    }
    setAreas(newAreas);
  };

  const chart = {
    data: {
      datasets: areas.map(area => ({
        data: data[area]?.map(({ date, value }) => ({ x: date, y: value / 10, value })),
        borderColor: areas.length === 1 ? function(context) {
          const chart = context.chart;
          const {ctx, chartArea} = chart;

          if (chartArea) {
            return getGradient(ctx, chartArea);
          }
        }: areaColors[area],
        stepped: true,
      })),
    },
    options: {
      maintainAspectRatio: false,
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
              display: showNow,
              label: {
                content: areas.map(area => `${area}: ${formatPrice(getPriceNow(area, now))}`),
                enabled: true,
                position: 'start'
              },
              type: 'line',
              borderColor: 'black',
              borderWidth: 1,
              scaleID: 'x',
              value: new Date(now)
            },
            averageToday: {
              display: showAverage,
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
    <section>
      <div className="flex flex-wrap gap-2 place-content-center">
        {availableAreas.map((area) => (
          <label key={area} className="inline-flex items-center">
            <input type="checkbox" className="rounded" checked={areas.includes(area)} onChange={() => toggleAreas(area)} />
            <span className="ml-2">{area}</span>
          </label>
        ))}
        <label className="inline-flex items-center">
          <input type="checkbox" className="rounded" checked={showNow} onChange={() => setShowNow(!showNow)} />
          <span className="ml-2">Just nu</span>
        </label>
        <label className="inline-flex items-center">
          <input type="checkbox" className="rounded" checked={showAverage} onChange={() => setShowAverage(!showAverage)} />
          <span className="ml-2">Snitt</span>
        </label>
      </div>
      <div className="w-screen p-1" style={{ height: '80vh', maxHeight: 800, maxWidth: 1200 }}>
        <Line {...chart} />
      </div>
      <div className="text-center text-sm">Senast uppdaterad {formatRelative(timestamp, now, { locale: sv })}</div>
    </section>
  );
}
