import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { initializeApp, cert, getApps } from "https://esm.sh/firebase-admin@11.11.0/app";
import { getAuth } from "https://esm.sh/firebase-admin@11.11.0/auth";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ADMIN_EMAIL = 'amr@leadintop.com';

// Initialize Firebase Admin and get auth instance
function getFirebaseAuth(serviceAccount: any) {
  if (getApps().length === 0) {
    initializeApp({
      credential: cert(serviceAccount),
    });
  }
  
  return getAuth();
}

// Verify Firebase ID token and check admin status
async function verifyAdminToken(authHeader: string | null, serviceAccount: any): Promise<{ isAdmin: boolean; error?: string }> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return { isAdmin: false, error: 'Missing or invalid authorization header' };
  }

  const idToken = authHeader.split('Bearer ')[1];
  
  try {
    const auth = getFirebaseAuth(serviceAccount);
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

// Get Firebase access token using service account for FCM
async function getAccessToken(serviceAccount: any): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceAccount.client_email,
    sub: serviceAccount.client_email,
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
  };

  // Encode header and payload
  const encoder = new TextEncoder();
  const base64url = (data: string) => btoa(data).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  
  const headerB64 = base64url(JSON.stringify(header));
  const payloadB64 = base64url(JSON.stringify(payload));
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import private key and sign
  const pemContents = serviceAccount.private_key
    .replace('-----BEGIN PRIVATE KEY-----', '')
    .replace('-----END PRIVATE KEY-----', '')
    .replace(/\s/g, '');
  
  const binaryKey = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(unsignedToken)
  );

  const signatureB64 = base64url(String.fromCharCode(...new Uint8Array(signature)));
  const jwt = `${unsignedToken}.${signatureB64}`;

  // Exchange JWT for access token
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });

  const tokenData = await tokenResponse.json();
  if (!tokenData.access_token) {
    throw new Error(`Failed to get access token: ${JSON.stringify(tokenData)}`);
  }

  return tokenData.access_token;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse service account from secret first (needed for auth verification)
    const serviceAccountJson = Deno.env.get('FIREBASE_SERVICE_ACCOUNT');
    if (!serviceAccountJson) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT not configured');
    }
    const serviceAccount = JSON.parse(serviceAccountJson);

    // Verify admin authentication
    console.log('[Push] Verifying admin authentication...');
    const authHeader = req.headers.get('authorization');
    const { isAdmin, error: authError } = await verifyAdminToken(authHeader, serviceAccount);
    
    if (!isAdmin) {
      console.log('[Push] Unauthorized access attempt');
      return new Response(
        JSON.stringify({ error: authError || 'Unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: authError?.includes('Forbidden') ? 403 : 401,
        }
      );
    }

    const { title, body, topic, countryCode } = await req.json();

    console.log('[Push] Sending notification:', { title, topic, countryCode });

    if (!title || !body || !topic) {
      throw new Error('Missing required fields: title, body, topic');
    }

    const projectId = serviceAccount.project_id;

    // Get access token for FCM
    const accessToken = await getAccessToken(serviceAccount);
    console.log('[Push] Got access token');

    // Send notification via FCM HTTP v1 API
    const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
    
    const message = {
      message: {
        topic: topic,
        notification: {
          title: title,
          body: body,
        },
        android: {
          notification: {
            click_action: 'FLUTTER_NOTIFICATION_CLICK',
          },
        },
        apns: {
          payload: {
            aps: {
              sound: 'default',
            },
          },
        },
      },
    };

    console.log('[Push] Sending to FCM:', JSON.stringify(message));

    const fcmResponse = await fetch(fcmUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    });

    const fcmResult = await fcmResponse.json();
    console.log('[Push] FCM response:', JSON.stringify(fcmResult));

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save notification to database
    const status = fcmResponse.ok ? 'sent' : 'failed';
    const { error: dbError } = await supabase
      .from('admin_notifications')
      .insert({
        title,
        body,
        target_topic: topic,
        country_code: countryCode,
        status,
        sent_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('[Push] Database error:', dbError);
    }

    if (!fcmResponse.ok) {
      throw new Error(`FCM error: ${JSON.stringify(fcmResult)}`);
    }

    return new Response(
      JSON.stringify({ success: true, messageId: fcmResult.name }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: any) {
    console.error('[Push] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
