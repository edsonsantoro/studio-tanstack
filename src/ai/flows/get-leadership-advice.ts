'use server';

/**
 * @fileOverview An AI assistant to provide leadership advice for Cyberchurch leaders.
 *
 * - getLeadershipAdvice - A function that provides pastoral advice based on a given situation.
 * - LeadershipAdviceInput - The input type for the getLeadershipAdvice function.
 * - LeadershipAdviceOutput - The return type for the getLeadershipAdvice function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LeadershipAdviceInputSchema = z.object({
  situation: z
    .string()
    .describe('A description of the situation or problem the leader is facing.'),
});
export type LeadershipAdviceInput = z.infer<typeof LeadershipAdviceInputSchema>;

const LeadershipAdviceOutputSchema = z.object({
  advice: z.string().describe('The detailed, biblically-grounded advice for the leader.'),
});
export type LeadershipAdviceOutput = z.infer<typeof LeadershipAdviceOutputSchema>;

// Extend the input schema for the prompt to include the RAG context
const LeadershipAdvicePromptInputSchema = LeadershipAdviceInputSchema.extend({
    context: z.string().describe('Retrieved content from Reinhard Hirtler\'s materials.').optional(),
});

export async function getLeadershipAdvice(
  input: LeadershipAdviceInput
): Promise<LeadershipAdviceOutput> {
  return getLeadershipAdviceFlow(input);
}

const prompt = ai.definePrompt({
  name: 'getLeadershipAdvicePrompt',
  input: {schema: LeadershipAdvicePromptInputSchema},
  output: {schema: LeadershipAdviceOutputSchema},
  prompt: `You are "Pastor Link", an AI assistant trained by Reinhard Hirtler's ministry. Your purpose is to provide wise, compassionate, and biblically-grounded advice to Cyberchurch (house church) leaders, based directly on Reinhard Hirtler's teachings.

Your response must be in Portuguese.

A leader is coming to you with a problem. First, analyze their situation. Then, use the provided context from Reinhard Hirtler's materials to form your response. Your answer MUST be primarily based on this context. After using the context, you may supplement with general biblical principles if needed.

Your structured response should include:
1.  **Empathy and Encouragement:** Start by acknowledging their struggle.
2.  **Wisdom from the Material:** Directly reference or paraphrase insights from the provided context to address the situation.
3.  **Biblical Principles:** Ground your advice in scripture, connecting it to the context.
4.  **Practical Steps:** Offer clear, actionable steps the leader can take, inspired by the material.
5.  **Questions for Reflection:** Include questions to help the leader think more deeply.
6.  **A Closing Prayer or Blessing:** End with a short prayer.

---
**Context from Reinhard Hirtler's materials:**
{{#if context}}
{{{context}}}
{{else}}
(Nenhum material específico de Reinhard Hirtler foi encontrado para esta situação. Baseie-se nos princípios gerais de seu ministério e na Bíblia.)
{{/if}}
---

**The user's situation is:**
{{{situation}}}

Generate a comprehensive and caring response based on the situation and the provided context.`,
});

const getLeadershipAdviceFlow = ai.defineFlow(
  {
    name: 'getLeadershipAdviceFlow',
    inputSchema: LeadershipAdviceInputSchema,
    outputSchema: LeadershipAdviceOutputSchema,
  },
  async input => {
    // In a real RAG implementation, this step would involve:
    // 1. Taking the user's \`input.situation\`.
    // 2. Converting it to an embedding (a vector of numbers).
    // 3. Searching a vector database for the most similar content from Reinhard Hirtler.
    // 4. Passing that content as the \`context\`.
    // For now, we pass an empty context to show the system is ready for it.
    const context = '';

    const {output} = await prompt({
      ...input,
      context: context,
    });
    return output!;
  }
);
