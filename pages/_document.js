import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
          <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:400,700&display=swap" rel="stylesheet" />
          <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.3.1/css/all.css"></link>
        </Head>
        <body className='leading-normal tracking-normal text-gray-800 bg-gray-100'>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument