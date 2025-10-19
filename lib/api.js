import { format } from "date-fns";

export async function getPrices(area, date) {
  const res = await fetch(
    `https://www.elprisetjustnu.se/api/v1/prices/${format(
      date,
      "yyyy"
    )}/${format(date, "MM-dd")}_${area}.json`
  );

  const prices = await res.json();

  return {
    area,
    date,
    prices: prices.map((p) => ({
      sek: p.SEK_per_kWh * 100,
      eur: p.EUR_per_kWh * 100,
      date: new Date(p.time_start),
    })),
  };
}
