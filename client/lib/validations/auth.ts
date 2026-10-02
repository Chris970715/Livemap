import { z } from "zod";

/**
 * 로그인 폼 스키마
 */
export const signInSchema = z.object({
  email: z.string().min(1, "Please enter your email").email("Please enter a valid email"),
  password: z.string().min(1, "Please enter your password"),
});

export type SignInFormValues = z.infer<typeof signInSchema>;

/**
 * 회원가입 폼 스키마
 */
export const registerSchema = z
  .object({
    name: z
      .string()
      .min(1, "Please enter your name")
      .max(50, "Name must be 50 characters or fewer"),
    email: z.string().min(1, "Please enter your email").email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;
