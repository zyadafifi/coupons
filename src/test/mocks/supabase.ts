// Mock Supabase client for unit tests
import { vi } from 'vitest';

export const mockSupabaseClient = {
  auth: {
    getSession: vi.fn(),
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
  })),
};

// Mock the Supabase createClient function
vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabaseClient,
}));

