import { SignJWT, jwtVerify } from 'jose'
import { getCookie, setCookie, deleteCookie } from '@tanstack/react-start/server'

export interface SessionPayload {
  userId: string
  role: 'user' | 'admin'
  expiresAt: Date
}

const secretKey = process.env.SESSION_SECRET || 'default-secret-change-me-in-prod'
const encodedKey = new TextEncoder().encode(secretKey)

export async function createSession(userId: string, role: 'user' | 'admin' = 'user') {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  const session = await new SignJWT({ userId, role, expiresAt })
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(encodedKey)

  console.log('DEBUG AUTH: Session created. JWT:', session)

  setCookie('session', session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    expires: expiresAt,
    path: '/',
    sameSite: 'lax',
  })
  console.log('DEBUG AUTH: Set session cookie.')
}

export async function deleteSession() {
  deleteCookie('session')
  console.log('DEBUG AUTH: Session cookie deleted.')
}

export async function getSession(): Promise<SessionPayload | null> {
  const sessionCookieValue = getCookie('session')

  if (!sessionCookieValue) {
    console.log('DEBUG AUTH: getSession failed - No session cookie found.')
    return null
  }

  try {
    const { payload } = await jwtVerify(sessionCookieValue, encodedKey, {
      algorithms: ['HS256'],
    })
    return payload as unknown as SessionPayload
  } catch (error) {
    console.error('DEBUG AUTH: Session verification failed:', error)
    return null
  }
}

export async function getUser(): Promise<{ userId: string; role: 'user' | 'admin' } | null> {
  const session = await getSession()
  if (!session) return null
  return { userId: session.userId, role: session.role }
}
