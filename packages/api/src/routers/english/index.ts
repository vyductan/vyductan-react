import type { z } from "zod";

import type { EnglishAddSchema } from "./validators";

export type EnglishAdd = z.infer<typeof EnglishAddSchema>;
