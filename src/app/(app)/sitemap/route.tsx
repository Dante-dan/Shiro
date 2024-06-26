import { getQueryClient } from '~/lib/query-client.server'
import { apiClient } from '~/lib/request'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // 1 hour
export const GET = async () => {
  const queryClient = getQueryClient()

  const data = await queryClient.fetchQuery({
    queryKey: ['sitemap'],
    queryFn: async () => {
      const path = apiClient.aggregate.proxy.sitemap.toString(true)
      return fetch(path).then((res) => res.text())
    },
  })
  data.replace(
    '<url>',
    `
  <url>
    <loc>https://blog.dhpie.com/</loc>
    <lastmod>2024-06-26T11:22:30+00:00</lastmod>
    <priority>1.00</priority>
    <changefreq>daily</changefreq>
  </url>
  <url>
  <loc>https://blog.dhpie.com/timeline?type=note</loc>
  <lastmod>2024-06-26T11:22:30+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://blog.dhpie.com/posts</loc>
  <lastmod>2024-06-26T11:22:30+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://blog.dhpie.com/notes</loc>
  <lastmod>2024-06-26T11:22:30+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://blog.dhpie.com/timeline</loc>
  <lastmod>2024-06-26T11:22:30+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://blog.dhpie.com/friends</loc>
  <lastmod>2024-06-26T11:22:30+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://blog.dhpie.com/thinking</loc>
  <lastmod>2024-06-26T11:22:30+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://blog.dhpie.com/projects</loc>
  <lastmod>2024-06-26T11:22:30+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  <loc>https://blog.dhpie.com/says</loc>
  <lastmod>2024-06-26T11:22:30+00:00</lastmod>
  <priority>0.80</priority>
</url>
<url>
  `,
  )

  return new Response(data, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
