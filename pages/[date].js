import Head from 'next/head';
import { useRouter } from 'next/router';
import Chart from '../components/Chart';

export default function Date() {
  const router = useRouter();
  const { date } = router.query;

  return (
    <>
      <Head>
        <title>Elpr.is</title>
        <meta name="description" content="Visa nuvarande elpris" />
        <link rel="icon" href="/favicon.ico" />
        <meta property='og:image' content={`https://res.cloudinary.com/grundberg/image/url2png/https://elpr.is/${date}`} />
      </Head>

      <Chart />
    </>
  );
}
