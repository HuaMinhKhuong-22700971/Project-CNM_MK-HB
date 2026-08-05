
import { prisma } from "../services/api/src/config/prisma";

async function main() {
  const user = await prisma.user.findUnique({
    where: { email: "registration_done@example.com" }
  });
  console.log("Found User:", JSON.stringify(user, null, 2));
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
