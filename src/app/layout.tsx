import '../styles/index.css'

import { Analytics } from '@vercel/analytics/react'
import type { PropsWithChildren } from 'react'

import { init } from './init'
import { InitInClient } from './InitInClient'

init()
export default async function RootLayout({ children }: PropsWithChildren) {
  return (
    <>
      {children}
      <InitInClient />
      {/* <BrowserSupport /> */}
      <Analytics />
    </>
  )
}
