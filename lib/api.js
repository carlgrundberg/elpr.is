import { format } from "date-fns";

export async function getPrices(area, date) {
  const res = await fetch(`https://www.elprisetjustnu.se/api/v1/prices/${format(date, 'yyyy')}/${format(date, 'MM-dd')}_${area}.json`);

  if (!res.ok) {
    throw new Error('Network response was not ok');
  }

  return res.json();
}