import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { createSession, validateSession } from './session.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simple hash function for access code validation
async function hashCode(code: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !supabaseServiceKey) throw new Error('Server configuration unavailable');
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { action, accessCode, sessionId, data } = await req.json();

    if (action === 'validate') {
      // Hash the provided code and check against stored codes
      if (typeof accessCode !== 'string' || accessCode.length > 256) {
        return new Response(JSON.stringify({ error: 'Invalid access code' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      const hashedCode = await hashCode(accessCode);
      
      const { data: codes, error } = await supabase
        .from('access_codes')
        .select('*')
        .eq('code_hash', hashedCode)
        .eq('is_active', true);

      if (error) {
        console.error('Database error:', error);
        throw error;
      }

      const isValid = codes && codes.length > 0;
      
      if (isValid) {
        // Generate session token
        const sessionToken = await createSession(supabaseServiceKey);
        
        // Log successful authentication
        await supabase.from('user_activity_audit').insert({
          session_id: crypto.randomUUID(),
          action: 'LOGIN',
          details: { method: 'access_code', success: true },
          ip_address: req.headers.get('x-forwarded-for') || 'unknown'
        });

        return new Response(JSON.stringify({ 
          success: true, 
          sessionToken,
          message: 'ACCESS GRANTED, COMMANDER' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        // Log failed attempt
        await supabase.from('user_activity_audit').insert({
          session_id: 'anonymous',
          action: 'LOGIN_FAILED',
          details: { method: 'access_code', success: false },
          ip_address: req.headers.get('x-forwarded-for') || 'unknown'
        });

        return new Response(JSON.stringify({ 
          success: false, 
          message: 'ACCESS DENIED - INVALID CODE' 
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    if (!await validateSession(sessionId, supabaseServiceKey)) {
      return new Response(JSON.stringify({ error: 'Please sign in again' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Store a digest rather than the bearer token in log records.
    const auditSessionId = await hashCode(sessionId);

    if (action === 'log_deployment') {
      const { mode, droneType, count, targetLat, targetLon } = data;
      
      await supabase.from('deployment_logs').insert({
        session_id: auditSessionId,
        deployment_mode: mode,
        drone_type: droneType,
        drone_count: count,
        target_lat: targetLat,
        target_lon: targetLon
      });

      await supabase.from('user_activity_audit').insert({
        session_id: auditSessionId,
        action: 'DEPLOYMENT',
        details: { mode, droneType, count, targetLat, targetLon },
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'log_drone_status') {
      const { droneId, droneType, previousStatus, newStatus, lat, lon, battery } = data;
      
      await supabase.from('drone_status_history').insert({
        drone_id: droneId,
        drone_type: droneType,
        previous_status: previousStatus,
        new_status: newStatus,
        lat,
        lon,
        battery
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (action === 'log_activity') {
      const { activityAction, details } = data;
      
      await supabase.from('user_activity_audit').insert({
        session_id: auditSessionId,
        action: activityAction,
        details,
        ip_address: req.headers.get('x-forwarded-for') || 'unknown'
      });

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ error: 'Unknown action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
