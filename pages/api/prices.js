// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getTodaysPrices, getTomorrowsPrices } from "nordpool-utils"

export default async function handler(req, res) {
  const today = await getTodaysPrices();
  const tomorrow = await getTomorrowsPrices();

  res.status(200).json({
    today,
    tomorrow,
  });
}
