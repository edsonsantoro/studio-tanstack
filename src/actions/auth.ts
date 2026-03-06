import { db } from '@/db'
import { users, verificationRequests } from '@/db/schema'
import { eq } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { createSession, deleteSession } from '@/lib/auth'
import { z } from 'zod'
import { createServerFn } from '@tanstack/react-start'
import { setCookie } from '@tanstack/react-start/server'
import { redirect } from '@tanstack/react-router'

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  city: z.string().optional(),
  country: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  languages: z.string().optional(),
  sponsorId: z.string().optional(),
  inviteCode: z.string().optional(),
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
})

export const registerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => signupSchema.parse(data))
  .handler(async ({ data }) => {
    const {
      name,
      email,
      password,
      city,
      country,
      latitude,
      longitude,
      languages,
      sponsorId,
      inviteCode,
    } = data

    // Check if user exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1)
    if (existingUser.length > 0) {
      throw new Error('User already exists with this email.')
    }

    let isApproved = false
    let status = 'pending'
    let invitedById = null

    if (inviteCode) {
      const inviter = await db
        .select()
        .from(users)
        .where(eq(users.inviteCode, inviteCode))
        .limit(1)
      if (inviter.length > 0) {
        isApproved = true
        status = 'approved'
        invitedById = inviter[0].id
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userId = crypto.randomUUID()
    const [firstName, ...lastNameParts] = name.split(' ')
    const lastName = lastNameParts.join(' ')
    const profilePictureUrl = `https://avatar.vercel.sh/${userId}.png`

    const languageArray = languages
      ? languages
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      : []
    const coords = latitude && longitude ? { lat: latitude, lng: longitude } : null

    try {
      await db.insert(users).values({
        id: userId,
        name,
        firstName: firstName || '',
        lastName: lastName || '',
        email,
        passwordHash: hashedPassword,
        role: 'user',
        city,
        country,
        coords,
        isLocationPublic: isApproved,
        languages: languageArray,
        profilePictureUrl,
        createdAt: new Date(),
        isApproved,
        status,
        invitedBy: invitedById,
        inviteCode: crypto.randomUUID().substring(0, 8),
      })

      if (!isApproved && sponsorId) {
        await db.insert(verificationRequests).values({
          requesterId: userId,
          verifierId: sponsorId,
        })
      }
    } catch (e) {
      console.error('Failed to register user', e)
      throw new Error('Failed to register user. Please try again.')
    }

    await createSession(userId, 'user')
    throw redirect({ to: '/dashboard' as any })
  })

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((data: unknown) => loginSchema.parse(data))
  .handler(async ({ data }) => {
    const { email, password } = data
    try {
      const userList = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1)

      if (userList.length === 0 || !userList[0].passwordHash) {
        throw new Error('Invalid credentials')
      }

      const user = userList[0]
      const passwordsMatch = await bcrypt.compare(password, user.passwordHash!)

      if (!passwordsMatch) {
        throw new Error('Invalid credentials')
      }

      // Set language preference cookie
      if (user.languagePreference) {
        setCookie('locale', user.languagePreference, { path: '/' })
      }

      await createSession(user.id, (user.role as 'user' | 'admin') || 'user')
      throw redirect({ to: '/dashboard' as any })
    } catch (error: any) {
      if (error instanceof Error && error.message === 'Invalid credentials') {
        throw error
      }
      console.error('CRITICAL: Login action failed:', error)
      throw new Error('Internal server error during login.')
    }
  })

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  await deleteSession()
  throw redirect({ to: '/login' as any })
})

// Mantemos as exportações originais para compatibilidade temporária se necessário,
// mas o ideal é usar as *Fn daqui para frente.
export const login = loginFn
export const logout = logoutFn
export const register = registerFn

export const getSessionFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { getSession } = await import('@/lib/auth')
  return await getSession()
})

export const getUserFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { getUser } = await import('@/lib/auth')
  return await getUser()
})

export const getCurrentUserFn = createServerFn({ method: 'GET' }).handler(async () => {
  const { getUser } = await import('@/lib/auth')
  const session = await getUser()
  if (!session) return null

  const dbUsers = await db
    .select({
      id: users.id,
      name: users.name,
      profilePictureUrl: users.profilePictureUrl,
      role: users.role,
      isApproved: users.isApproved,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1)
  
  if (dbUsers.length > 0) {
    return dbUsers[0]
  }
  
  return null
})
