'use server';

/**
 * @fileOverview A task list generation AI agent.
 *
 * - generateTaskList - A function that handles the task list generation process.
 * - GenerateTaskListInput - The input type for the generateTaskList function.
 * - GenerateTaskListOutput - The return type for the generateTaskList function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateTaskListInputSchema = z.object({
  description: z.string().describe('The description of the project or goal.'),
});
export type GenerateTaskListInput = z.infer<typeof GenerateTaskListInputSchema>;

const GenerateTaskListOutputSchema = z.object({
  taskList: z.array(
    z.object({
      task: z.string().describe('A single task to be completed.'),
      category: z.string().describe('The category of the task.'),
      priority: z.number().describe('The priority of the task (1 being highest).'),
    })
  ).describe('A list of tasks, each with a category and priority.'),
});
export type GenerateTaskListOutput = z.infer<typeof GenerateTaskListOutputSchema>;

export async function generateTaskList(input: GenerateTaskListInput): Promise<GenerateTaskListOutput> {
  return generateTaskListFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateTaskListPrompt',
  input: {schema: GenerateTaskListInputSchema},
  output: {schema: GenerateTaskListOutputSchema},
  prompt: `You are a task management expert.  You will generate a task list for the user, categorized and prioritized, based on their description of a project or goal.

Description: {{{description}}}

Consider different categories of tasks such as planning, research, execution, review, and deployment.
Prioritize tasks such that priority 1 is the most important and should be done first.
`,
});

const generateTaskListFlow = ai.defineFlow(
  {
    name: 'generateTaskListFlow',
    inputSchema: GenerateTaskListInputSchema,
    outputSchema: GenerateTaskListOutputSchema,
  },
  async input => {
    const maxRetries = 3;
    const baseDelay = 1000; // milliseconds

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const { output } = await prompt(input);
        return output!;
      } catch (err: any) {
        const is503 = err?.message?.includes('503') || err?.toString().includes('503');
        
        // NOTE: The Gemini API can return 503 Service Unavailable when the model is overloaded or undergoing maintenance.
        // This retry loop adds resilience by attempting the call up to 3 times with exponential backoff (1s, 2s, 4s).
        // Without this, a single 503 error would crash the flow and break server-side rendering.

        // Retry only if it's a 503 and we have retries left
        if (is503 && attempt < maxRetries - 1) {
          const waitTime = baseDelay * Math.pow(2, attempt); // exponential backoff
          console.warn(`[Gemini Retry] Attempt ${attempt + 1} failed due to 503. Retrying in ${waitTime}ms...`);
          await new Promise(res => setTimeout(res, waitTime));
        } else {
          console.error(`[Gemini Error] Failed to generate task list:`, err);
          throw err;
        }
      }
    }

    throw new Error('Max retries exceeded while attempting to call Gemini API.');
  }
);
