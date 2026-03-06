import { db } from '@/db';
import { roadmapItems, roadmapVotes, roadmapComments } from '@/db/schema';
import { eq, and, sql, desc } from 'drizzle-orm';
import { getUser } from '@/lib/auth';
import { createServerFn } from "@tanstack/react-start";

export type RoadmapItemWithVotes = typeof roadmapItems.$inferSelect & {
    voteCount: number;
    userVote: number; // 0, 1, or -1
    commentCount: number;
    authorName?: string | null;
    authorAvatar?: string | null;
};

export type RoadmapCommentWithUser = typeof roadmapComments.$inferSelect & {
    userName?: string | null;
    userAvatar?: string | null;
};
export const getRoadmapItemsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: void) => data)
  .handler(async () => {
    const user = await getUser();
const currentUserId = user?.userId;

const items = await db.query.roadmapItems.findMany({
    with: {
        author: true,
        votes: true,
        comments: {
            columns: {
                id: true,
            }
        },
    },
    orderBy: [desc(roadmapItems.createdAt)],
});

return items.map(item => {
    const upvotes = item.votes.filter(v => v.voteType === 1).length;
    const downvotes = item.votes.filter(v => v.voteType === -1).length;
    const userVoteObj = currentUserId ? item.votes.find(v => v.userId === currentUserId) : null;

    return {
        ...item,
        voteCount: upvotes - downvotes,
        userVote: userVoteObj?.voteType || 0,
        commentCount: item.comments.length,
        authorName: item.author?.name || 'Anonymous',
        authorAvatar: item.author?.profilePictureUrl || item.author?.googleProfilePictureUrl || null,
    };
}).sort((a, b) => b.voteCount - a.voteCount);
  });

export const getRoadmapItems = getRoadmapItemsFn;
export const getRoadmapCommentsFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: itemId }) => {
    const comments = await db.query.roadmapComments.findMany({
    where: eq(roadmapComments.roadmapItemId, itemId),
    with: {
        user: true,
    },
    orderBy: [desc(roadmapComments.createdAt)],
});

return comments.map(comment => ({
    ...comment,
    userName: comment.user?.name || 'Anonymous',
    userAvatar: comment.user?.profilePictureUrl || comment.user?.googleProfilePictureUrl || null,
}));
  });

export const getRoadmapComments = getRoadmapCommentsFn;
export const createRoadmapCommentFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { itemId: string, content: string }) => data)
  .handler(async ({ data }) => {
    const { itemId, content } = data;
const user = await getUser();
if (!user) throw new Error('Must be logged in to comment');

await db.insert(roadmapComments).values({
    roadmapItemId: itemId,
    userId: user.userId,
    content,
});



  });

export const createRoadmapComment = createRoadmapCommentFn;
export const createRoadmapItemFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { title: string; description: string }) => data)
  .handler(async ({ data: data }) => {
    const user = await getUser();

await db.insert(roadmapItems).values({
    title: data.title,
    description: data.description,
    authorId: user?.userId,
});



  });

export const createRoadmapItem = createRoadmapItemFn;
export const updateRoadmapItemStatusFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { itemId: string, status: string }) => data)
  .handler(async ({ data }) => {
    const { itemId, status } = data;
const user = await getUser();
if (user?.role !== 'admin') {
    throw new Error('Unauthorized');
}

await db.update(roadmapItems)
    .set({ status })
    .where(eq(roadmapItems.id, itemId));



  });

export const updateRoadmapItemStatus = updateRoadmapItemStatusFn;
export const voteOnItemFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { itemId: string, voteType: 1 | -1 }) => data)
  .handler(async ({ data }) => {
    const { itemId, voteType } = data;
const user = await getUser();
if (!user) {
    throw new Error('Must be logged in to vote');
}

const existingVote = await db.query.roadmapVotes.findFirst({
    where: and(
        eq(roadmapVotes.roadmapItemId, itemId),
        eq(roadmapVotes.userId, user.userId)
    ),
});

if (existingVote) {
    if (existingVote.voteType === voteType) {
        await db.delete(roadmapVotes)
            .where(and(
                eq(roadmapVotes.roadmapItemId, itemId),
                eq(roadmapVotes.userId, user.userId)
            ));
    } else {
        await db.update(roadmapVotes)
            .set({ voteType })
            .where(and(
                eq(roadmapVotes.roadmapItemId, itemId),
                eq(roadmapVotes.userId, user.userId)
            ));
    }
} else {
    await db.insert(roadmapVotes).values({
        roadmapItemId: itemId,
        userId: user.userId,
        voteType,
    });
}



  });

export const voteOnItem = voteOnItemFn;
