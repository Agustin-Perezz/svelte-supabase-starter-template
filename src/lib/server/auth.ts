import type { RequestEvent } from '@sveltejs/kit';

export type User = {
  id: string;
  email: string;
  name: string;
};

export function authenticateUser(event: RequestEvent): User | null {
  const token = event.cookies.get('auth_token');

  if (!token) {
    return null;
  }

  return {
    id: '1',
    email: 'user@example.com',
    name: 'Mock User'
  };
}
