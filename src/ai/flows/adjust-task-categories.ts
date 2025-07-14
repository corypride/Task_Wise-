// adjust-task-categories.ts
'use server';

/**
 * @fileOverview Adjusts task categories using natural language input.
 *
 * This file defines a Genkit flow that allows users to adjust the categorization of tasks within their list
 * by providing natural language instructions. The AI will interpret the instructions and re-categorize the tasks accordingly.
 *
 * @exports adjustTaskCategories - A function that takes task list and natural language instructions and returns re-categorized tasks.
 * @exports AdjustTaskCategoriesInput - The input type for the adjustTaskCategories function.
 * @exports AdjustTaskCategoriesOutput - The output type for the adjustTaskCategories function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const AdjustTaskCategoriesInputSchema = z.object({
  taskList: z.array(
    z.object({
      id: z.string().describe('Unique identifier for the task.'),
      title: z.string().describe('The title of the task.'),
      category: z.string().describe('The current category of the task.'),
    })
  ).describe('The list of tasks to be re-categorized.'),
  instructions: z.string().describe('Natural language instructions for adjusting task categories.'),
});
export type AdjustTaskCategoriesInput = z.infer<typeof AdjustTaskCategoriesInputSchema>;

// Define the output schema
const AdjustTaskCategoriesOutputSchema = z.array(
  z.object({
    id: z.string().describe('Unique identifier for the task.'),
    title: z.string().describe('The title of the task.'),
    category: z.string().describe('The updated category of the task.'),
  })
).describe('The list of tasks with updated categories.');
export type AdjustTaskCategoriesOutput = z.infer<typeof AdjustTaskCategoriesOutputSchema>;

// Exported function to call the flow
export async function adjustTaskCategories(input: AdjustTaskCategoriesInput): Promise<AdjustTaskCategoriesOutput> {
  return adjustTaskCategoriesFlow(input);
}

// Define the prompt
const adjustTaskCategoriesPrompt = ai.definePrompt({
  name: 'adjustTaskCategoriesPrompt',
  input: { schema: AdjustTaskCategoriesInputSchema },
  output: { schema: AdjustTaskCategoriesOutputSchema },
  prompt: `Given the following task list and instructions, re-categorize the tasks according to the instructions.

Task List:
{{#each taskList}}
- ID: {{this.id}}, Title: {{this.title}}, Category: {{this.category}}
{{/each}}

Instructions: {{instructions}}

Re-categorized Task List:
Ensure the output is a valid JSON array of tasks, with each task including the id, title, and updated category.
`,
});

// Define the flow
const adjustTaskCategoriesFlow = ai.defineFlow(
  {
    name: 'adjustTaskCategoriesFlow',
    inputSchema: AdjustTaskCategoriesInputSchema,
    outputSchema: AdjustTaskCategoriesOutputSchema,
  },
  async (input) => {
    const { output } = await adjustTaskCategoriesPrompt(input);
    return output!;
  }
);
