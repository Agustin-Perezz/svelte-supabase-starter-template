import type { RequestEvent } from '@sveltejs/kit';

export type User = {
  id: string;
  email: string;
  name?: string;
};

export async function authenticateUser(
  event: RequestEvent
): Promise<User | null> {
  const {
    data: { user }
  } = await event.locals.supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email!,
    name: user.user_metadata?.full_name ?? user.user_metadata?.name
  };
}
