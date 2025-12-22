import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { initializeApp, cert, getApps } from "https://esm.sh/firebase-admin@11.11.0/app";
import { getAuth } from "https://esm.sh/firebase-admin@11.11.0/auth";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = 'amr@leadintop.com';

// Initialize Firebase Admin if not already initialized
function getFirebaseAuth() {
  const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT');
  if (!serviceAccountJson) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT not configured');
  }
  
  const serviceAccount = JSON.parse(serviceAccountJson);
  
  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }
  
  return getAuth();
}

// Verify Firebase ID token and check admin status
async function verifyAdminToken(authHeader: string | null): Promise<{ isAdmin: boolean; error?: string }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAdmin: false, error: 'Missing or invalid authorization header' };
  }

  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    const auth = getFirebaseAuth();
    const decodedToken = await auth.verifyIdToken(idToken);
    
    if (decodedToken.email !== ADMIN_EMAIL) {
      console.log(`[Auth] Non-admin user attempted access: ${decodedToken.email}`);
      return { isAdmin: false, error: 'Forbidden: Admin access required' };
    }
    
    console.log(`[Auth] Admin verified: ${decodedToken.email}`);
    return { isAdmin: true };
  } catch (error: any) {
    console.error('[Auth] Token verification failed:', error.message);
    return { isAdmin: false, error: 'Invalid or expired token' };
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Verifying admin authentication...');

    // Verify admin authentication
    const authHeader = req.headers.get('authorization');
    const { isAdmin, error: authError } = await verifyAdminToken(authHeader);
    
    if (!isAdmin) {
      console.log('[Auth] Unauthorized access attempt');
      return new Response(
        JSON.stringify({ error: authError || 'Unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: authError?.includes('Forbidden') ? 403 : 401,
        }
      );
    }

    console.log('Fetching admin notifications...');

    // Create Supabase client with service role key to bypass RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch notifications
    const { data, error } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }

    console.log(`Fetched ${data?.length || 0} notifications`);

    return new Response(
      JSON.stringify({ notifications: data || [] }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error: any) {
    console.error('Error in get-admin-notifications:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
