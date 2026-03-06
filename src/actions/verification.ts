import { db } from '@/db';
import { users, verificationRequests } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getUser } from '@/lib/auth';
import { createServerFn } from "@tanstack/react-start";
export const getVerificationRequestsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: void) => data)
  .handler(async () => {
    const session = await getUser();
if (!session) return [];

// session from lib/auth returns a payload which usually contains userId or id. 
// Let's safe check properly. 
// Assuming getUser() returns { userId: string, role: string, ... } based on auth.ts
const userId = (session as any).userId || (session as any).id;

if (!userId) return [];

try {
    const requests = await db.select({
        id: verificationRequests.id,
        requesterId: verificationRequests.requesterId,
        status: verificationRequests.status,
        createdAt: verificationRequests.createdAt,
        requesterName: users.name,
        requesterEmail: users.email,
        requesterAvatar: users.profilePictureUrl,
    })
        .from(verificationRequests)
        .leftJoin(users, eq(verificationRequests.requesterId, users.id))
        .where(and(
            eq(verificationRequests.verifierId, userId),
            eq(verificationRequests.status, 'pending')
        ));

    return requests;
} catch (error) {
    console.error("Failed to fetch verification requests", error);
    return [];
}
  });

export const getVerificationRequests = getVerificationRequestsFn;
export const approveRequestFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { requestId: string, requesterId: string }) => data)
  .handler(async ({ data }) => {
    const { requestId, requesterId } = data;
const session = await getUser();
if (!session) return { success: false, error: "Unauthorized" };
const userId = (session as any).userId || (session as any).id;

try {
    // Note: neon-http driver doesn't support transactions, so we do sequential updates
    // Update request status
    await db.update(verificationRequests)
        .set({ status: 'approved' })
        .where(and(
            eq(verificationRequests.id, requestId),
            eq(verificationRequests.verifierId, userId)
        ));

    // Approve user
    await db.update(users)
        .set({
            isApproved: true,
            status: 'approved',
            isLocationPublic: true,
            invitedBy: userId
        })
        .where(eq(users.id, requesterId));

    
    return { success: true };
} catch (error) {
    console.error("Failed to approve request", error);
    return { success: false, error: "Failed to approve" };
}
  });

export const approveRequest = approveRequestFn;
export const rejectRequestFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: requestId }) => {
    const session = await getUser();
if (!session) return { success: false, error: "Unauthorized" };
const userId = (session as any).userId || (session as any).id;

try {
    await db.update(verificationRequests)
        .set({ status: 'rejected' })
        .where(and(
            eq(verificationRequests.id, requestId),
            eq(verificationRequests.verifierId, userId)
        ));

    
    return { success: true };
} catch (error) {
    console.error("Failed to reject request", error);
    return { success: false, error: "Failed to reject" };
}
  });

export const rejectRequest = rejectRequestFn;
