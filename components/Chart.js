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
import { addDays, format } from 'date-fns';
import { Line } from 'react-chartjs-2';
import { useLocalStorageState } from 'ahooks';
import persister from '../lib/persister';

ChartJS.register(
  TimeScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  annotationPlugin,
);

import { useTime } from '../lib/useTime';
import { QueryClient, useQueries } from '@tanstack/react-query';
import { getPrices } from '../lib/api';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import Loading from './Loading';

const formatPrice = (price) => price != null ? `${Math.round(price)} öre/kWh` : 'Unknown';

const sum = (values) => values.reduce((acc, value) => acc + (value || 0), 0);
const avg = (values) => sum(values) / (values?.length || 1);

const areaColors = {
  SE1: '#4e73df',
  SE2: '#1cc88a',
  SE3: '#36b9cc',
  SE4: '#f6c23e',
};

const availableAreas = [
  'SE1',
  'SE2',
  'SE3',
  'SE4'
];

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

function getPriceNow(area, now, areaPrices) {
  let current;
  if(areaPrices?.[area]) {
    for (const item of areaPrices[area]) {
      if (!current || new Date(item.date) < now) {
        current = item;
      }
    }
  }
  return current?.sek;
}

function getAreaPrices(results) {
  return results.reduce((acc, r) => {
    if(r.data) {
      if(!acc[r.data.area]) {
        acc[r.data.area] = [];
      }
      acc[r.data.area].push(...r.data.prices);
    }
    return acc;
  }, {});
}

function getAveragePrice(selectedAreas, areaPrices, count) {
  const values = selectedAreas.flatMap(area => areaPrices?.[area]?.slice(-count).map((item) => item.sek));
  return avg(values);
}

function getDates(now) {
  const dates = [];
  for (let i = -28; i < 2; i++) {
    dates.push(addDays(now, i));
  }  
  return dates;
}

function Chart() {
  const [selectedAreas, setSelectedAreas] = useLocalStorageState('selectedAreas', { defaultValue: ['SE4'] });
  const [showNow, setShowNow] = useLocalStorageState('showNow', { defaultValue: true });
  const [showAverage, setShowAverage] = useLocalStorageState('showAverage', { defaultValue: false });
  const [showAverage30d, setShowAverage30d] = useLocalStorageState('showAverage30d', { defaultValue: true });
  const now = useTime(1000 * 60);

  const results = useQueries({ 
    queries: selectedAreas.flatMap(area => getDates(now).map(date => ({ queryKey: [area, format(date, 'yyyy-MM-dd')], queryFn: () => getPrices(area, date) }) )) 
  });

  const areaPrices = getAreaPrices(results);

  const avg = getAveragePrice(selectedAreas, areaPrices, 48);
  const avg30d = getAveragePrice(selectedAreas, areaPrices);

  const loading = results.some(r => r.isLoading);

  const toggleAreas = (area) => {
    const newAreas = [...selectedAreas];
    const index = newAreas.indexOf(area);
    if (index === -1) {
      newAreas.push(area);
    } else {
      newAreas.splice(index, 1);
    }
    setSelectedAreas(newAreas);
  };

  const chart = {
    data: {
      datasets: selectedAreas.map(area => ({
        data: areaPrices?.[area]?.slice(-48).map(({ date, sek }) => ({ x: date, y: sek, value: sek })),
        borderColor: selectedAreas.length === 1 ? function(context) {
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
          ticks: {
            color: 'rgb(243,244,246)',
            callback: function(val, index, data) {
              return val === '00:00' ? format(data[index].value, 'dd MMM') : val;
            },
          },
        },
        y: {
          ticks: {
            color: 'rgb(243,244,246)',
          },
          // beginAtZero: true,
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
                content: selectedAreas.map(area => `${area}: ${formatPrice(getPriceNow(area, now, areaPrices))}`),
                enabled: true,
                position: 'start'
              },
              type: 'line',
              borderColor: 'rgb(243,244,246)',
              borderWidth: 1,
              scaleID: 'x',
              value: new Date(now)
            },
            averageToday: {
              display: showAverage && avg,
              type: 'line',
              borderDash: [6, 6],
              borderColor: 'rgb(243,244,246)',
              borderWidth: 1,
              label: {
                enabled: true,
                content: `Snitt: ${formatPrice(avg)}`,
                position: 'end'
              },
              scaleID: 'y',
              value: avg,
            },
            average30d: {
              display: showAverage30d,
              type: 'line',
              borderDash: [6, 6],
              borderColor: 'rgb(243,244,246)',
              borderWidth: 1,
              label: {
                enabled: true,
                content: `Snitt 30d: ${formatPrice(avg30d)}`,
                position: 'end'
              },
              scaleID: 'y',
              value: avg30d,
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
            <input type="checkbox" className="rounded" checked={selectedAreas.includes(area)} onChange={() => toggleAreas(area)} />
            <span className="ml-2">{area}</span>
          </label>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 place-content-center">
        <label className="inline-flex items-center">
          <input type="checkbox" className="rounded" checked={showNow} onChange={() => setShowNow(!showNow)} />
          <span className="ml-2">Just nu</span>
        </label>
        <label className="inline-flex items-center">
          <input type="checkbox" className="rounded" checked={showAverage} onChange={() => setShowAverage(!showAverage)} />
          <span className="ml-2">Snitt graf</span>
        </label>
        <label className="inline-flex items-center">
          <input type="checkbox" className="rounded" checked={showAverage30d} onChange={() => setShowAverage30d(!showAverage30d)} />
          <span className="ml-2">Snitt 30 dagar</span>
        </label>
      </div>
      <div className="w-screen p-1" style={{ height: '70vh', maxHeight: 800, maxWidth: 1200 }}>
        <Line {...chart} />
      </div>
      <div className="text-center text-sm mb-2">
        Elpriser tillhandahålls av <a className="text-blue-600" href="https://www.elprisetjustnu.se" target="_blank" rel='noreferrer'>Elpriset just nu.se</a>
      </div>
      <div className="text-center text-sm">
        <a className="text-blue-600" href="https://github.com/carlgrundberg/elpr.is" target="_blank" rel="noreferrer">Källkod och rapportera problem</a>
      </div>
      {loading && <Loading />}
    </section>
  );
}


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      cacheTime: Infinity,
      staleTime: Infinity,
    },
  },
});

export default function ChartWrapper() {
  return <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}><Chart /></PersistQueryClientProvider>;
}