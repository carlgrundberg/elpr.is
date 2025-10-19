import Head from "next/head";
import { format } from "date-fns";
import dynamic from "next/dynamic";

const Chart = dynamic(() => import("../components/Chart"), { ssr: false });

export default function Home() {
  return (
    <>
      <Head>
        <title>Elpr.is</title>
        <meta name="description" content="Aktuellt spotpris på Nordpool" />
        <link rel="icon" href="/favicon.ico" />
        <meta
          property="og:image"
          content={`https://res.cloudinary.com/grundberg/image/url2png/https://elpr.is/${format(
            new Date(),
            "yyyyMMdd"
          )}`}
        />
      </Head>

      <Chart />
    </>
  );
}
