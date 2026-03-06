import { createFileRoute } from '@tanstack/react-router'
import * as React from 'react'
import { HomePageClient } from '@/components/home/home-page-client'
import { PlaceHolderImages } from '@/lib/placeholder-images'
import { getHomepageData } from '@/actions/users'

// Fictitious data pool - separated by gender for consistency
const femaleFirstNames = ["Ana", "Carla", "Elena", "Gisele", "Inês", "Lia"]
const maleFirstNames = ["Bruno", "Daniel", "Fábio", "Hugo", "João", "Marcos"]
const lastNames = ["Silva", "Souza", "Costa", "Santos", "Oliveira", "Pereira", "Rodrigues", "Almeida", "Ferreira", "Lima", "Gomes", "Ribeiro"]

export const Route = createFileRoute('/$locale/')({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      debug: (search.debug as string) || undefined,
    }
  },
  loaderDeps: ({ search: { debug } }) => ({ debug }),
  loader: async ({ context, deps: { debug } }) => {
    const { user: session } = context
    
    let debugInfo = null
    let actualPins: any[] = []
    let statsData = { totalUsers: 0, totalCountries: 0 }
    let dbStatus = "Checking..."

    try {
        const homeData = await getHomepageData()
        actualPins = homeData.pins || []
        statsData = {
            totalUsers: homeData.totalUsers || 0,
            totalCountries: homeData.totalCountries || 0
        }
        dbStatus = "Success"
    } catch (e: any) {
        dbStatus = `Error: ${e.message}`
        console.error("HOME_PAGE_ERROR:", e)
    }

    if (debug === 'true') {
        debugInfo = {
            dbStatus,
            pinsFound: actualPins.length,
            stats: statsData,
            envDetected: true // In TanStack Start we assume it's true if we got here
        }
    }

    // Separate images by gender
    const femaleImages = PlaceHolderImages.filter(p => p.id.startsWith('user') && p.gender === 'female')
    const maleImages = PlaceHolderImages.filter(p => p.id.startsWith('user') && p.gender === 'male')
    const allUserImages = PlaceHolderImages.filter(p => p.id.startsWith('user'))

    // Create fictitious profiles from anonymous pins
    const mappedUsers = actualPins.map((pin: any, index: number) => {
        const isFemale = index % 2 === 0
        const firstNameArray = isFemale ? femaleFirstNames : maleFirstNames
        const imageArray = isFemale
            ? (femaleImages.length > 0 ? femaleImages : allUserImages)
            : (maleImages.length > 0 ? maleImages : allUserImages)

        const nameIndex = Math.floor(index / 2) % firstNameArray.length
        const imageIndex = Math.floor(index / 2) % imageArray.length
        const lastNameIndex = (index * 7) % lastNames.length

        const selectedImage = imageArray[imageIndex]

        return {
            id: pin.id || `user-${index}`,
            name: `${firstNameArray[nameIndex]} ${lastNames[lastNameIndex].charAt(0)}.`,
            city: 'Membro Ativo',
            country: pin.country || 'Comunidade',
            coords: pin.coords as { lat: number, lng: number },
            isTraveler: false,
            avatarUrl: selectedImage?.imageUrl || `https://avatar.vercel.sh/${pin.id}.png`,
            imageHint: selectedImage?.imageHint || 'avatar portrait',
            bio: 'Faz parte da nossa rede global.',
            tags: [],
            languages: [],
        }
    })

    return {
      users: mappedUsers,
      stats: statsData,
      debugInfo,
      currentUser: session
    }
  },
  component: HomePage,
})

function HomePage() {
  const { users, stats, debugInfo, currentUser } = Route.useLoaderData()

  return (
    <>
      {debugInfo && (
        <div className="bg-black text-green-400 p-4 font-mono text-xs fixed top-0 left-0 z-[9999] max-w-md border-2 border-green-500 rounded-br-lg opacity-90">
          <h3 className="font-bold border-b border-green-500 mb-2">DEBUG MODE</h3>
          <p>DB Status: {debugInfo.dbStatus}</p>
          <p>Pins: {debugInfo.pinsFound}</p>
          <p>Total Users (Stats): {debugInfo.stats.totalUsers}</p>
          <p>Time: {new Date().toISOString()}</p>
        </div>
      )}
      <HomePageClient users={users} stats={stats} isLoading={false} currentUser={currentUser} />
    </>
  )
}
