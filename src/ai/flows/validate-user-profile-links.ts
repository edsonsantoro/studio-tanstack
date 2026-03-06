'use server';

/**
 * @fileOverview Validates user profile links using GenAI to identify potentially malicious or inappropriate content.
 *
 * - validateUserProfileLinks - A function that validates user profile links.
 * - ValidateUserProfileLinksInput - The input type for the validateUserProfileLinks function.
 * - ValidateUserProfileLinksOutput - The return type for the validateUserProfileLinks function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ValidateUserProfileLinksInputSchema = z.object({
  whatsAppLink: z.string().optional().describe('The user\'s WhatsApp link.'),
  instagramLink: z.string().optional().describe('The user\'s Instagram link.'),
  blogLink: z.string().optional().describe('The user\'s blog link.'),
  websiteLink: z.string().optional().describe('The user\'s website link.'),
});
export type ValidateUserProfileLinksInput = z.infer<
  typeof ValidateUserProfileLinksInputSchema
>;

const ValidateUserProfileLinksOutputSchema = z.object({
  whatsAppLinkSafe: z.boolean().describe('Whether the WhatsApp link is safe.'),
  instagramLinkSafe: z
    .boolean()
    .describe('Whether the Instagram link is safe.'),
  blogLinkSafe: z.boolean().describe('Whether the blog link is safe.'),
  websiteLinkSafe: z.boolean().describe('Whether the website link is safe.'),
});
export type ValidateUserProfileLinksOutput = z.infer<
  typeof ValidateUserProfileLinksOutputSchema
>;

export async function validateUserProfileLinks(
  input: ValidateUserProfileLinksInput
): Promise<ValidateUserProfileLinksOutput> {
  return validateUserProfileLinksFlow(input);
}

const prompt = ai.definePrompt({
  name: 'validateUserProfileLinksPrompt',
  input: {schema: ValidateUserProfileLinksInputSchema},
  output: {schema: ValidateUserProfileLinksOutputSchema},
  prompt: `You are a security expert tasked with validating user profile links for malicious or inappropriate content. Analyze the provided links and determine if they are safe.

Considerations:
- Check for phishing attempts, malware distribution, or other malicious activities.
- Identify links leading to explicit, offensive, or illegal content.
- Assess the overall reputation and trustworthiness of the linked domains.

WhatsApp Link: {{whatsAppLink}}
Instagram Link: {{instagramLink}}
Blog Link: {{blogLink}}
Website Link: {{websiteLink}}

Provide a boolean value for each link indicating whether it is safe or not. Return in JSON format:
{
  "whatsAppLinkSafe": true/false,
  "instagramLinkSafe": true/false,
  "blogLinkSafe": true/false,
  "websiteLinkSafe": true/false
}`,
});

const validateUserProfileLinksFlow = ai.defineFlow(
  {
    name: 'validateUserProfileLinksFlow',
    inputSchema: ValidateUserProfileLinksInputSchema,
    outputSchema: ValidateUserProfileLinksOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
