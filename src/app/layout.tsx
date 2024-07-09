import '../styles/index.css'

import { Analytics } from '@vercel/analytics/react'
import type { PropsWithChildren } from 'react'

import { SpeedInsights } from '@vercel/speed-insights/next'

import { init } from './init'
import { InitInClient } from './InitInClient'

const GoogleAdSense = () => {
  return (
    <script
      async
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7207000995546794"
      crossOrigin="anonymous"
    ></script>
  )
}

init()
export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <InitInClient />
      {/* <BrowserSupport /> */}
      <Analytics />
      <GoogleAdSense />
      <SpeedInsights />
    </>
  )
}
