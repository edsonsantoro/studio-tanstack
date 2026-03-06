
import { pgTable, text, timestamp, boolean, jsonb, uuid, pgEnum, integer, primaryKey } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const roleEnum = pgEnum('role', ['user', 'admin']);

export const users = pgTable('users', {
    id: text('id').primaryKey(), // We will use UUIDs for new users, but keep text for compatibility
    name: text('name'),
    firstName: text('first_name'),
    lastName: text('last_name'),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash'),
    googleId: text('google_id').unique(),
    facebookId: text('facebook_id').unique(),
    twitterId: text('twitter_id').unique(),
    resetToken: text('reset_token'),
    resetTokenExpiry: timestamp('reset_token_expiry'),
    role: roleEnum('role').default('user'),
    city: text('city'),
    country: text('country'),
    profilePictureUrl: text('profile_picture_url'),
    googleProfilePictureUrl: text('google_profile_picture_url'),
    facebookProfilePictureUrl: text('facebook_profile_picture_url'),
    twitterProfilePictureUrl: text('twitter_profile_picture_url'),
    bio: text('bio'),
    tags: jsonb('tags').$type<string[]>(),
    languages: jsonb('languages').$type<string[]>(),
    coords: jsonb('coords').$type<{ lat: number; lng: number }>(), // { lat: number, lng: number }
    isLocationPublic: boolean('is_location_public').default(false),
    isTraveler: boolean('is_traveler').default(false),
    whatsAppLink: text('whatsapp_link'),
    instagramLink: text('instagram_link'),
    facebookLink: text('facebook_link'),
    twitterLink: text('twitter_link'),
    telegramUsername: text('telegram_username'),
    blogLink: text('blog_link'),
    websiteLink: text('website_link'),
    isApproved: boolean('is_approved').default(false),
    status: text('status').default('pending'),
    createdAt: timestamp('created_at').defaultNow(),
    visibilitySettings: jsonb('visibility_settings').$type<any>(), // { showBio, etc. }
    languagePreference: text('language_preference'),
    visitedCountries: jsonb('visited_countries').$type<string[]>(),
    // Invite System
    inviteCode: text('invite_code').unique(), // For generating links
    invitedBy: text('invited_by'), // ID of the user who invited
});

export const verificationRequests = pgTable('verification_requests', {
    id: uuid('id').defaultRandom().primaryKey(),
    requesterId: text('requester_id').references(() => users.id).notNull(), // User waiting for approval
    verifierId: text('verifier_id').references(() => users.id).notNull(), // User who can approve
    status: text('status').default('pending'), // 'pending', 'approved', 'rejected'
    createdAt: timestamp('created_at').defaultNow(),
});

export const testimonies = pgTable('testimonies', {
    id: uuid('id').defaultRandom().primaryKey(),
    authorId: text('author_id').references(() => users.id).notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    videoUrl: text('video_url'),
    isPublic: boolean('is_public').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});

export const testimonyRecommendations = pgTable('testimony_recommendations', {
    id: uuid('id').defaultRandom().primaryKey(),
    testimonyId: uuid('testimony_id').references(() => testimonies.id, { onDelete: 'cascade' }).notNull(),
    materialName: text('material_name').notNull(),
    productData: jsonb('product_data').$type<{
        id?: string;
        name?: string;
        url?: string;
        imageUrl?: string;
        price?: string;
    }>(),
    adminStatus: text('admin_status').default('pending'), // 'pending', 'approved', 'rejected'
    userStatus: text('user_status').default('pending'), // 'pending', 'approved', 'rejected'
    createdAt: timestamp('created_at').defaultNow(),
});

export const events = pgTable('events', {
    id: uuid('id').defaultRandom().primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    location: text('location'),
    isOnline: boolean('is_online').default(false),
    isPublic: boolean('is_public').default(true),
    dates: jsonb('dates').$type<(string | Date)[]>(), // Storing dates as JSON array for flexibility
    imageUrl: text('image_url'),
    attendeeIds: jsonb('attendee_ids').$type<string[]>(), // Array of User IDs
    organizerId: text('organizer_id').references(() => users.id),
    coords: jsonb('coords').$type<{ lat: number; lng: number }>(), // { lat: number, lng: number }
    createdAt: timestamp('created_at').defaultNow(),
    // New fields to be added
    startTime: text('start_time'),
    durationHours: text('duration_hours'),
    recurrenceDescription: text('recurrence_description'),
    onlineUrl: text('online_url'),
    requiresRSVP: boolean('requires_rsvp').default(false),
    postEventDescription: text('post_event_description'),
    postEventImageUrls: jsonb('post_event_image_urls').$type<string[]>(),
});

export const eventRsvps = pgTable('event_rsvps', {
    id: uuid('id').defaultRandom().primaryKey(),
    eventId: uuid('event_id').references(() => events.id, { onDelete: 'cascade' }).notNull(),
    userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    status: text('status').notNull().default('confirmed'), // 'confirmed', 'declined', 'maybe'
    confirmedAt: timestamp('confirmed_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
    // Tracking de lembretes enviados
    remindersSent: jsonb('reminders_sent').$type<{
        email1Day?: boolean;
        email1Hour?: boolean;
        whatsapp1Day?: boolean;
        telegram1Day?: boolean;
    }>(),
});

export const i18nTranslations = pgTable('i18n_translations', {
    id: uuid('id').defaultRandom().primaryKey(),
    locale: text('locale').notNull(),
    key: text('key').notNull(),
    value: text('value'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});


export const hotmartCourseLinks = pgTable('hotmart_course_links', {
    hotmartId: text('hotmart_id').primaryKey(),
    manualUrl: text('manual_url').notNull(),
    manualImageUrl: text('manual_image_url'),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});





export const feedbacks = pgTable('feedbacks', {
    id: uuid('id').defaultRandom().primaryKey(),
    content: text('content').notNull(),
    pageUrl: text('page_url'),
    userAgent: text('user_agent'),
    userId: text('user_id').references(() => users.id),
    isRead: boolean('is_read').default(false),
    isArchived: boolean('is_archived').default(false),
    createdAt: timestamp('created_at').defaultNow(),
});

export const feedbackSettings = pgTable('feedback_settings', {
    id: uuid('id').defaultRandom().primaryKey(),
    notifyEmail: text('notify_email').default('edsonsantoro@gmail.com'),
    sendEmailNotifications: boolean('send_email_notifications').default(true),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const roadmapItems = pgTable('roadmap_items', {
    id: uuid('id').defaultRandom().primaryKey(),
    title: text('title').notNull(),
    description: text('description'),
    status: text('status').default('suggestion').notNull(), // 'suggestion', 'planned', 'in_progress', 'completed', 'declined'
    authorId: text('author_id').references(() => users.id),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});

export const roadmapVotes = pgTable('roadmap_votes', {
    userId: text('user_id').references(() => users.id).notNull(),
    roadmapItemId: uuid('roadmap_item_id').references(() => roadmapItems.id, { onDelete: 'cascade' }).notNull(),
    voteType: integer('vote_type').notNull(), // 1 for upvote, -1 for downvote
    createdAt: timestamp('created_at').defaultNow(),
}, (table) => ({
    pk: primaryKey({ columns: [table.userId, table.roadmapItemId] }),
}));

export const roadmapComments = pgTable('roadmap_comments', {
    id: uuid('id').defaultRandom().primaryKey(),
    roadmapItemId: uuid('roadmap_item_id').references(() => roadmapItems.id, { onDelete: 'cascade' }).notNull(),
    userId: text('user_id').references(() => users.id).notNull(),
    content: text('content').notNull(),
    createdAt: timestamp('created_at').defaultNow(),
    updatedAt: timestamp('updated_at').defaultNow(),
});


export const roadmapItemsRelations = relations(roadmapItems, ({ one, many }) => ({
    author: one(users, {
        fields: [roadmapItems.authorId],
        references: [users.id],
    }),
    votes: many(roadmapVotes),
    comments: many(roadmapComments),
}));

export const roadmapVotesRelations = relations(roadmapVotes, ({ one }) => ({
    user: one(users, {
        fields: [roadmapVotes.userId],
        references: [users.id],
    }),
    item: one(roadmapItems, {
        fields: [roadmapVotes.roadmapItemId],
        references: [roadmapItems.id],
    }),
}));

export const roadmapCommentsRelations = relations(roadmapComments, ({ one }) => ({
    user: one(users, {
        fields: [roadmapComments.userId],
        references: [users.id],
    }),
    item: one(roadmapItems, {
        fields: [roadmapComments.roadmapItemId],
        references: [roadmapItems.id],
    }),
}));



