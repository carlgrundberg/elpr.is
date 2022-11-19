import fs from 'fs';
import { addHours, addDays, parseISO } from 'date-fns';
import { getTodaysPrices, getTomorrowsPrices } from "nordpool-utils";
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const data = {
  areas: {},
  timestamp: new Date().getTime(),
};

const areas = await prisma.area.findMany({});

for(const { name: area, id: area_id } of areas) {
  const today = await getTodaysPrices({ area });
  const tomorrow = await getTomorrowsPrices({ area });

  const areaData = {
    prices: [
      ...today,
      ...tomorrow,
      {
        date: addHours(parseISO(tomorrow[tomorrow.length - 1].date), 1),
        value: tomorrow[tomorrow.length - 1].value,
      },
    ].map(({ date, value }) => ({ date, value })),
  };

  await prisma.price.createMany({
    data: tomorrow.map((hour) => ({
      area_id,
      date: hour.date,
      value: hour.value,
    })),
    skipDuplicates: true,
  });


  const prices = await prisma.price.findMany({
    where: {
      area_id,
      date: {
        gte: addDays(new Date(), -30),
      },
    },
    orderBy: {
      date: 'asc',
    },
  });

  areaData.avg = prices.reduce((acc, { value }) => acc + value, 0) / prices.length;
  data.areas[area] = areaData;
}

fs.writeFileSync('./data.json', JSON.stringify(data));
