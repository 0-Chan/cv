import { z } from "zod";

export const contactUrlSchema = z.string().refine((value) => {
  if (/^https?:\/\//i.test(value)) return z.httpUrl().safeParse(value).success;
  if (value.startsWith("mailto:"))
    return z.email().safeParse(value.slice(7)).success;
  return /^tel:\+?[0-9][0-9(). -]*$/.test(value);
}, "HTTP(S), mailto 또는 tel 주소가 필요합니다.");
