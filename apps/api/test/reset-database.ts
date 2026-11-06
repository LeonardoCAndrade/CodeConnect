import type { PrismaService } from '../src/prisma/prisma.service.js';

// Limpa todas as tabelas respeitando as chaves estrangeiras (users não propaga
// exclusões para posts, likes e comentários).
export async function resetDatabase(prisma: PrismaService): Promise<void> {
  await prisma.comment.deleteMany();
  await prisma.like.deleteMany();
  await prisma.post.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();
}
