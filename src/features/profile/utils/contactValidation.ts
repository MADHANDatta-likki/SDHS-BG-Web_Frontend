import { z } from "zod";

export const contactSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Please enter a valid email address"),
  phoneNumber: z.string().trim()
    .min(1, "Phone number is required")
    .regex(/^[0-9]+$/, "Phone number must contain digits only")
    .min(7, "Phone number must be at least 7 digits")
    .max(15, "Phone number must not exceed 15 digits"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
