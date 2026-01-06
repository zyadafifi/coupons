import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@/test/render';
import { AdminProtectedRoute } from './AdminProtectedRoute';
import * as AdminAuthContext from '@/contexts/AdminAuthContext';

// Mock the AdminAuthContext
vi.mock('@/contexts/AdminAuthContext', async () => {
  const actual = await vi.importActual('@/contexts/AdminAuthContext');
  return {
    ...actual,
    useAdminAuth: vi.fn(),
  };
});

describe('AdminProtectedRoute', () => {
  const mockUseAdminAuth = vi.mocked(AdminAuthContext.useAdminAuth);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading UI when isLoading=true', () => {
    mockUseAdminAuth.mockReturnValue({
      user: null,
      isAdmin: false,
      isLoading: true,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <AdminProtectedRoute>
        <div>Protected Content</div>
      </AdminProtectedRoute>
    );

    // Check for loading spinner (Loader2 icon)
    const loader = document.querySelector('[class*="animate-spin"]');
    expect(loader).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('redirects when user is not admin', () => {
    mockUseAdminAuth.mockReturnValue({
      user: null,
      isAdmin: false,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <AdminProtectedRoute>
        <div>Protected Content</div>
      </AdminProtectedRoute>,
      { initialEntries: ['/admin/dashboard'] }
    );

    // Should not show protected content
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();

    // Check if Navigate component is rendered (redirects to /admin/login)
    // Note: In testing, Navigate doesn't actually navigate, but we can check the route state
    // The actual redirect happens via React Router
  });

  it('renders children when user is admin', () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'admin@test.com',
    } as any;

    mockUseAdminAuth.mockReturnValue({
      user: mockUser,
      isAdmin: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <AdminProtectedRoute>
        <div>Protected Content</div>
      </AdminProtectedRoute>
    );

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('renders children when user exists and isAdmin is true', () => {
    const mockUser = {
      uid: 'test-uid',
      email: 'admin@test.com',
    } as any;

    mockUseAdminAuth.mockReturnValue({
      user: mockUser,
      isAdmin: true,
      isLoading: false,
      error: null,
      login: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <AdminProtectedRoute>
        <div>Admin Dashboard</div>
      </AdminProtectedRoute>
    );

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
  });
});

