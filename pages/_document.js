import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html className='h-full'>
        <Head>
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
          <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700&display=swap" rel="stylesheet" />
          <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css"></link>
          {/* <script async defer data-website-id="ad73cb9d-1c16-402a-ab84-fb3124da762e" src="https://u.elpr.is/umami.js"></script> */}
          <meta name="theme-color" content="#1e293b" />
        </Head>
        <body className='h-full grid place-content-center leading-normal tracking-normal text-gray-100 bg-slate-800'>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;