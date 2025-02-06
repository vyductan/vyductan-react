import { z } from "zod";

// TODO: https://next-safe-action.dev/docs/getting-started
export const sendMailSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  subject: z.string(),
  message: z.string().min(1),
});
export type SendMailParams = z.infer<typeof sendMailSchema>;
