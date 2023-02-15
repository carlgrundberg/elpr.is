import Dexie from 'dexie';

export const db = new Dexie('elpris');

db.version(1).stores({
  prices: '++id, area'
});

export async function updateData() {
  const res = await fetch('https://www.elprisetjustnu.se/api/v1/prices/2023/02-12_SE4.json');

  if(res.status === 200) {
    const prices = await res.json();

    console.log(prices);

    await db.prices.bulkPut(prices.map(item => ({
      area: 'SE4',
      date: item.time_start,
      sek: item.SEK_per_kWh,
      eur: item.EUR_per_kWh,
    })));
  }
}