import { z } from "zod";

export const paperSchema = z.strictObject({
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "색상은 #RRGGBB 형식이어야 합니다."),
  freq: z.number().min(0.008).max(1.4),
  oct: z.number().int().min(1).max(6),
  ss: z.number().min(0).max(6),
  k: z.number().min(0).max(1),
  fib: z.number().min(0).max(1),
  sp: z.number().min(0).max(1),
  seed: z.number().int().nonnegative(),
  tile: z.number().min(160).max(640).multipleOf(20),
});
