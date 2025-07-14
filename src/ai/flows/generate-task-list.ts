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
    const {output} = await prompt(input);
    return output!;
  }
);
