import fs from 'fs';
import { addHours, parseISO } from 'date-fns';
import { getTodaysPrices, getTomorrowsPrices } from "nordpool-utils";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

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

  await prisma.price.createMany({
    data: tomorrow.map((hour) => ({
      area_id: areas.indexOf(hour.area) + 1,
      date: hour.date,
      value: hour.value,
    })),
    skipDuplicates: true,
  });
}

fs.writeFileSync('./data.json', JSON.stringify({
  data,
  timestamp: new Date().getTime(),
}));
