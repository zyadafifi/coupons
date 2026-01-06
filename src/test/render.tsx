import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from '@/contexts/AppContext';
import { AdminAuthProvider } from '@/contexts/AdminAuthContext';

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialEntries?: string[];
  queryClient?: QueryClient;
  // Optional: mock admin auth context values
  mockAdminAuth?: {
    user?: any;
    isAdmin?: boolean;
    isLoading?: boolean;
    error?: string | null;
    login?: (email: string, password: string) => Promise<boolean>;
    logout?: () => Promise<void>;
  };
}

/**
 * Custom render function that wraps components with necessary providers
 * for testing React components in isolation.
 */
export function renderWithProviders(
  ui: ReactElement,
  {
    initialEntries = ['/'],
    queryClient,
    mockAdminAuth,
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  // Create a test QueryClient with sensible defaults for testing
  const testQueryClient =
    queryClient ??
    new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
          refetchOnWindowFocus: false,
        },
        mutations: {
          retry: false,
        },
      },
      logger: {
        log: () => {},
        warn: () => {},
        error: () => {},
      },
    });

  // Create a wrapper component that includes all necessary providers
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={testQueryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          <AppProvider>
            {mockAdminAuth ? (
              // If mockAdminAuth is provided, use a simple context mock
              <AdminAuthProvider>
                {children}
              </AdminAuthProvider>
            ) : (
              <AdminAuthProvider>{children}</AdminAuthProvider>
            )}
          </AppProvider>
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    queryClient: testQueryClient,
  };
}

// Alias renderWithProviders as render for convenience
export const render = renderWithProviders;

// Re-export everything else from React Testing Library (except render to avoid conflicts)
export {
  screen,
  waitFor,
  waitForElementToBeRemoved,
  within,
  fireEvent,
  act,
  findAllByRole,
  findByRole,
  getAllByRole,
  getByRole,
  queryAllByRole,
  queryByRole,
  findAllByLabelText,
  findByLabelText,
  getAllByLabelText,
  getByLabelText,
  queryAllByLabelText,
  queryByLabelText,
  findAllByPlaceholderText,
  findByPlaceholderText,
  getAllByPlaceholderText,
  getByPlaceholderText,
  queryAllByPlaceholderText,
  queryByPlaceholderText,
  findAllByText,
  findByText,
  getAllByText,
  getByText,
  queryAllByText,
  queryByText,
  findAllByDisplayValue,
  findByDisplayValue,
  getAllByDisplayValue,
  getByDisplayValue,
  queryAllByDisplayValue,
  queryByDisplayValue,
  findAllByAltText,
  findByAltText,
  getAllByAltText,
  getByAltText,
  queryAllByAltText,
  queryByAltText,
  findAllByTitle,
  findByTitle,
  getAllByTitle,
  getByTitle,
  queryAllByTitle,
  queryByTitle,
  findAllByTestId,
  findByTestId,
  getAllByTestId,
  getByTestId,
  queryAllByTestId,
  queryByTestId,
} from '@testing-library/react';

