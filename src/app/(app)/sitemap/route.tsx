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

  return new Response(data, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
}
