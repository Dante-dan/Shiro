import { XMLParser } from 'fast-xml-parser'
import type { MarkdownToJSX } from 'markdown-to-jsx'

import { AlertsRule as __AlertsRule } from '~/components/ui/markdown/parsers/alert'
import { ContainerRule as __ContainerRule } from '~/components/ui/markdown/parsers/container'
import {
  KateXBlockRule as __KateXBlockRule,
  KateXRule as __KateXRule,
} from '~/components/ui/markdown/parsers/katex'
import { apiClient } from '~/lib/request'

import { fetchAggregationData } from '../(app)/api'

export const dynamic = 'force-dynamic'
export const revalidate = 86400 // 1 day

interface RSSProps {
  title: string
  url: string
  author: string
  description: string
  data: {
    created: Date | null
    modified: Date | null
    link: string
    title: string
    text: string
    id: string
  }[]
}
const parser = new XMLParser()

export async function GET() {
  const ReactDOM = (await import('react-dom/server')).default

  const [rssText, agg] = await Promise.all([
    fetch(apiClient.aggregate.proxy.feed.toString(true), {
      next: {
        revalidate: 86400,
      },
    }).then((res) => res.text()),
    fetchAggregationData(),
  ])

  const { title, description } = agg.seo

  return new Response(rssText, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'max-age=60, s-maxage=86400',
      'CDN-Cache-Control': 'max-age=86400',
      'Cloudflare-CDN-Cache-Control': 'max-age=86400',
      'Vercel-CDN-Cache-Control': 'max-age=86400',
    },
  })
}

const NotSupportRender = () => {
  throw new Error('Not support render in RSS')
}

const KateXRule: MarkdownToJSX.Rule = {
  ...__KateXRule,
  react(node, _, state?) {
    return <NotSupportRender key={state?.key} />
  },
}
const KateXBlockRule: MarkdownToJSX.Rule = {
  ...__KateXBlockRule,
  react(node, _, state?) {
    return <NotSupportRender key={state?.key} />
  },
}

const AlertsRule: MarkdownToJSX.Rule = {
  ...__AlertsRule,
  react(node, output, state) {
    return <NotSupportRender key={state?.key} />
  },
}

const ContainerRule: MarkdownToJSX.Rule = {
  ...__ContainerRule,
  // @ts-ignore
  react(node, _, state) {
    return <NotSupportRender key={state?.key} />
  },
}
