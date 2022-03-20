import fs from 'fs';
import { addHours, parseISO } from 'date-fns';
import { getTodaysPrices, getTomorrowsPrices } from "nordpool-utils";

const areas = ['SE1', 'SE2', 'SE3', 'SE4'];
const data = {};

for(const area of areas) {
  const today = await getTodaysPrices({ area });
  const tomorrow = await getTomorrowsPrices({ area });
  data[area] = [...today, ...tomorrow, ];

  if(data[area]) {
    const lastHour = data[area][data[area].length - 1];
    data[area].push({
      ...lastHour,
      date: addHours(parseISO(lastHour.date), 1),
    });
  }
}

fs.writeFileSync('./data.json', JSON.stringify({
  data,
  timestamp: new Date().getTime(),
}));
