import Head from 'next/head'
import useSWR from 'swr'

const formatPrice = (price) => `${Math.round(price / 10)} öre`;
const fetcher = (...args) => fetch(...args).then(res => res.json())

export default function Home() {
  const { data } = useSWR('/api/prices', fetcher)

  return (
    <div>
      <Head>
        <title>Elpr.is</title>
        <meta name="description" content="Visa nuvarande elpris" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <section className="py-8">
        <div className="container mx-auto flex flex-wrap pt-4 pb-12">
          <h1 className="w-full my-2 text-5xl font-bold leading-tight text-center ">
          Elpr.is
          </h1>

          <div className="w-full flex flex-wrap">
            <div className="w-full md:w-1/3 p-6">
              <div className="bg-gradient-to-b from-green-200 to-green-100 border-b-4 border-green-600 rounded-lg shadow-xl p-5">
                <div className="flex-1 text-center">
                  <h2 className="font-bold uppercase text-gray-600">Just nu</h2>
                  <p className="font-bold text-3xl">{data ? formatPrice(data.now) : '...'}</p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/3 p-6">
              <div className="bg-gradient-to-b from-pink-200 to-pink-100 border-b-4 border-pink-500 rounded-lg shadow-xl p-5">
                <div className="flex-1 text-center">
                  <h2 className="font-bold uppercase text-gray-600">Snittpris idag</h2>
                  <p className="font-bold text-3xl">{data ? formatPrice(data.today) : '...'}</p>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/3 p-6">
              <div className="bg-gradient-to-b from-yellow-200 to-yellow-100 border-b-4 border-yellow-600 rounded-lg shadow-xl p-5">
                <div className="flex-1 text-center">
                  <h2 className="font-bold uppercase text-gray-600">Snittpris imorgon</h2>
                  <p className="font-bold text-3xl">{data ? data.tomorrow ? formatPrice(data.tomorrow) : 'Ej släppt ännu' : '...'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
