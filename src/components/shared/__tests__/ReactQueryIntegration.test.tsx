import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@/test/render';
import { useQuery } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { server } from '@/test/mocks/server';

// Simple test component that uses React Query
interface TestData {
  id: string;
  name: string;
}

function TestComponent() {
  const { data, isLoading, error } = useQuery<TestData>({
    queryKey: ['test-data'],
    queryFn: async () => {
      const response = await fetch('/api/test-data');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!data) return <div>No data</div>;

  return <div>Data: {data.name}</div>;
}

describe('React Query Integration with MSW', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles loading state correctly', async () => {
    // Mock API endpoint with delay
    server.use(
      http.get('/api/test-data', async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return HttpResponse.json({ id: '1', name: 'Test Item' });
      })
    );

    render(<TestComponent />);

    // Should show loading state initially
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('loads and displays data after API call', async () => {
    const mockData = { id: '1', name: 'Test Item' };

    server.use(
      http.get('/api/test-data', () => {
        return HttpResponse.json(mockData);
      })
    );

    render(<TestComponent />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText('Data: Test Item')).toBeInTheDocument();
    });

    expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
  });

  it('handles API errors correctly', async () => {
    server.use(
      http.get('/api/test-data', () => {
        return HttpResponse.json({ error: 'Not found' }, { status: 404 });
      })
    );

    render(<TestComponent />);

    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  it('does not retry infinitely on errors', async () => {
    let callCount = 0;
    server.use(
      http.get('/api/test-data', () => {
        callCount++;
        return HttpResponse.json({ error: 'Server error' }, { status: 500 });
      })
    );

    render(<TestComponent />);

    // Wait for error
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    }, { timeout: 2000 });

    // Should only have been called once (no retries with our QueryClient config)
    expect(callCount).toBe(1);
  });

  it('caches query results', async () => {
    const mockData = { id: '1', name: 'Cached Item' };
    let callCount = 0;

    server.use(
      http.get('/api/test-data', () => {
        callCount++;
        return HttpResponse.json(mockData);
      })
    );

    const { queryClient, rerender } = render(<TestComponent />);

    // Wait for first load
    await waitFor(() => {
      expect(screen.getByText('Data: Cached Item')).toBeInTheDocument();
    });

    expect(callCount).toBe(1);

    // Rerender - should use cache
    rerender(<TestComponent />);

    // Should still show data without making another API call
    await waitFor(() => {
      expect(screen.getByText('Data: Cached Item')).toBeInTheDocument();
    });

    // Should still only be called once due to caching
    expect(callCount).toBe(1);
  });
});

