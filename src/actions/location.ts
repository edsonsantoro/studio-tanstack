import { createServerFn } from '@tanstack/react-start'

export const getCitySuggestionsFn = createServerFn({ method: 'GET' })
  .inputValidator((query: string) => query)
  .handler(async ({ data: query }) => {
    if (!query || query.length < 3) {
      return []
    }

    const accessToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
    if (!accessToken || accessToken === 'YOUR_MAPBOX_ACCESS_TOKEN_HERE') {
      console.error('Mapbox access token is not configured.')
      return []
    }

    const endpoint = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${accessToken}&types=place&limit=5`

    try {
      const response = await fetch(endpoint)
      const data = await response.json()

      if (data && data.features) {
        return data.features.map((feature: any) => ({
          name: feature.text,
          country:
            feature.context?.find((c: any) => c.id.startsWith('country'))
              ?.text || '',
          lat: feature.center[1],
          lng: feature.center[0],
        }))
      }
      return []
    } catch (error) {
      console.error('Error fetching city suggestions from Mapbox:', error)
      return []
    }
  })

export const getCitySuggestions = getCitySuggestionsFn
