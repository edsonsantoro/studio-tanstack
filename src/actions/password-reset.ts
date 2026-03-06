import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { randomBytes } from 'crypto';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/nodemailer';
import { addMinutes, isAfter } from 'date-fns';
import { createServerFn } from "@tanstack/react-start";
export const requestPasswordResetFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => data)
  .handler(async ({ data: email }) => {
    try {
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (user.length === 0) {
        // Returns success even if user not found to prevent enumeration
        return { success: true, message: 'If an account exists with this email, a reset link has been sent.' };
    }

    const resetToken = randomBytes(32).toString('hex');
    const resetTokenExpiry = addMinutes(new Date(), 60); // Token valid for 1 hour

    await db.update(users)
        .set({ resetToken, resetTokenExpiry })
        .where(eq(users.email, email));

    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

    const emailHtml = `
            <p>You requested a password reset.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetLink}">${resetLink}</a>
            <p>This link will expire in 1 hour.</p>
        `;

    const emailSent = await sendEmail(email, 'Password Reset Request', emailHtml);

    if (!emailSent) {
        return { success: false, message: 'Failed to send email. Please try again later.' };
    }

    return { success: true, message: 'If an account exists with this email, a reset link has been sent.' };

} catch (error) {
    console.error('Error requesting password reset:', error);
    return { success: false, message: 'An error occurred. Please try again.' };
}
  });

export const requestPasswordReset = requestPasswordResetFn;
export const resetPasswordFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { token: string, password: string }) => data)
  .handler(async ({ data }) => {
    const { token, password } = data;
try {
    const user = await db.select().from(users).where(eq(users.resetToken, token)).limit(1);

    if (user.length === 0) {
        return { success: false, message: 'Invalid or expired token.' };
    }

    const existingUser = user[0];

    if (!existingUser.resetTokenExpiry || isAfter(new Date(), existingUser.resetTokenExpiry)) {
        return { success: false, message: 'Token has expired.' };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.update(users)
        .set({
            passwordHash: hashedPassword,
            resetToken: null,
            resetTokenExpiry: null
        })
        .where(eq(users.id, existingUser.id));

    return { success: true, message: 'Password has been reset successfully.' };

} catch (error) {
    console.error('Error resetting password:', error);
    return { success: false, message: 'An error occurred. Please try again.' };
}
  });

export const resetPassword = resetPasswordFn;
