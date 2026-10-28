import type { User } from '@prisma/client';

export type PublicUser = {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
};

export function toPublicUser(user: User, publicUrl: string): PublicUser {
  return {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
    avatarUrl: user.avatarPath
      ? `${publicUrl}/uploads/avatars/${user.avatarPath}`
      : null,
  };
}
