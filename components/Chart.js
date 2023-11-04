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
import { addDays, format, addHours } from 'date-fns';
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

import { useTime } from '../lib/useTime';
import { QueryClient, QueryClientProvider, useQueries } from '@tanstack/react-query';
import { getPrices } from '../lib/api';
import Loading from './Loading';

const formatPrice = (price) => price != null ? `${Math.round(price)} öre/kWh` : 'Unknown';

const sum = (values) => values?.reduce((acc, value) => acc + (value || 0), 0) || 0;
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

function getDates(date) {
  const dates = [];
  for (let i = -28; i <= 1; i++) {
    dates.push(i === 0 ? date : addDays(date, i));
  }  
  return dates;
}

const queryClient = new QueryClient();

function Chart() {
  const [selectedAreas, setSelectedAreas] = useLocalStorageState('selectedAreas', { defaultValue: ['SE4'] });
  const [showNow, setShowNow] = useLocalStorageState('showNow', { defaultValue: true });
  const [showAverage, setShowAverage] = useLocalStorageState('showAverage', { defaultValue: false });
  const [showAverage30d, setShowAverage30d] = useLocalStorageState('showAverage30d', { defaultValue: true });
  const now = useTime(1000 * 60);  
  const chartStart = addHours(now, -12);

  const results = useQueries({ 
    queries: selectedAreas.flatMap(area => getDates(now).map(date => ({ queryKey: [area, format(date, 'yyyy-MM-dd')], queryFn: () => getPrices(area, date), retry: false }))),    
  });    
  
  const isFetching = results.some(r => r.isFetching);

  function toggleAreas(area) {
    const newAreas = [...selectedAreas];
    const index = newAreas.indexOf(area);
    if (index === -1) {
      newAreas.push(area);
    } else {
      newAreas.splice(index, 1);
    }
    setSelectedAreas(newAreas);
  }

  const areaResults = results.reduce((acc, result) => {
    if (result.data) {
      if(!acc[result.data.area]) {
        acc[result.data.area] = [];
      }      
      acc[result.data.area].push(...result.data.prices);
    }
    return acc;
  }, {});

  const chartResults = selectedAreas.reduce((acc, area) => {
    const data = areaResults[area]?.filter(r => r.date >= chartStart);
    acc[area] = data?.map(({ date, sek }) => ({ x: date, y: sek, value: sek }));
    return acc;
  }, {});

  function getAveragePrice(date) {
    const values = selectedAreas.reduce((acc, area) => {
      const prices = date ? areaResults[area]?.filter(r => r.date >= date) : areaResults[area];
      if (prices) {
        acc.push(...prices.map(p => p.sek));
      }
      return acc;
    }, []);
    return avg(values);
  }
  
  function getPriceNow(area) {
    const nextPrice = areaResults[area]?.findIndex(r => r.date > now);    
    return areaResults[area]?.[nextPrice - 1]?.sek;
  }

  const avgChart = getAveragePrice(chartStart);
  const avg30d = getAveragePrice();

  const chart = {
    data: {
      datasets: selectedAreas.map(area => {
        return {
          data: chartResults[area],
          borderColor: selectedAreas.length === 1 ? function(context) {
            const chart = context.chart;
            const {ctx, chartArea} = chart;

            if (chartArea) {
              return getGradient(ctx, chartArea);
            }
          }: areaColors[area],
          stepped: true,
        };
      }),
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
                content: selectedAreas.map(area => `${area}: ${formatPrice(getPriceNow(area))}`),
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
              display: showAverage && avgChart,
              type: 'line',
              borderDash: [6, 6],
              borderColor: 'rgb(243,244,246)',
              borderWidth: 1,
              label: {
                enabled: true,
                content: `Snitt: ${formatPrice(avgChart)}`,
                position: 'end'
              },
              scaleID: 'y',
              value: avgChart,
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
      {isFetching && <Loading />}
    </section>
  );
}

export default function ChartWrapper() {
  return <QueryClientProvider client={queryClient}><Chart /></QueryClientProvider>;
}