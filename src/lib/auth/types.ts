export interface AccountProfile {
  id: string;
  username: string | null;
  created_at?: string;
  updated_at?: string;
}

export const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;
