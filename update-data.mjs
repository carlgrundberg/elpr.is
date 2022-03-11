import fs from 'fs';
import { getTodaysPrices, getTomorrowsPrices } from "nordpool-utils";

const today = await getTodaysPrices();
const tomorrow = await getTomorrowsPrices();


fs.writeFileSync('./data.json', JSON.stringify({
  today,
  tomorrow,
}));
