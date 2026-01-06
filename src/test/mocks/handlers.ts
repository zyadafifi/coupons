import { http, HttpResponse } from 'msw';

// Define default handlers for MSW
// Tests can override these by calling server.use() in individual tests
export const handlers = [
  // Example: Mock Supabase REST API calls
  // Add more handlers as needed for your API endpoints
  http.get('*/rest/v1/*', () => {
    return HttpResponse.json({ data: [], error: null });
  }),

  // Example: Mock Firebase Auth endpoints (if needed)
  // http.post('*/identitytoolkit/v3/relyingparty/*', () => {
  //   return HttpResponse.json({});
  // }),
];

