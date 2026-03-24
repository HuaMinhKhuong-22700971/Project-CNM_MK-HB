import { z } from "zod";

import { ROLES } from "../../constants/roles";

export const updateUserRoleSchema = z.object({
  role: z.enum([ROLES.CUSTOMER, ROLES.SALES, ROLES.TECHNICIAN, ROLES.ADMIN])
});
