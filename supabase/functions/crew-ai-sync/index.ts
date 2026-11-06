import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const CREW_AI_API_URL = Deno.env.get('CREW_AI_API_URL');
    const CREW_AI_BEARER_TOKEN = Deno.env.get('CREW_AI_BEARER_TOKEN');
    const CREW_AI_USER_TOKEN = Deno.env.get('CREW_AI_USER_TOKEN');

    if (!CREW_AI_API_URL || !CREW_AI_BEARER_TOKEN || !CREW_AI_USER_TOKEN) {
      throw new Error('Crew AI credentials not configured');
    }

    const { action, data } = await req.json();
    
    console.log('Crew AI request:', { action, data });
    console.log('Crew AI URL:', CREW_AI_API_URL);

    // Try different API endpoint patterns
    const endpoints = [
      CREW_AI_API_URL,
      `${CREW_AI_API_URL}/api`,
      `${CREW_AI_API_URL}/run`,
      `${CREW_AI_API_URL}/execute`,
    ];

    let lastError = null;
    
    for (const endpoint of endpoints) {
      try {
        console.log('Trying endpoint:', endpoint);
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${CREW_AI_BEARER_TOKEN}`,
            'X-User-Token': CREW_AI_USER_TOKEN,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        console.log('Response status:', response.status);

        if (response.ok) {
          const result = await response.json();
          console.log('Crew AI response:', result);
          return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        const errorText = await response.text();
        console.log('Response error:', errorText);
        lastError = `${response.status} - ${errorText}`;
      } catch (err) {
        console.log('Fetch error:', err);
        lastError = err instanceof Error ? err.message : 'Unknown error';
      }
    }

    // If all endpoints fail, return a mock response for development
    console.log('All endpoints failed, returning mock data');
    return new Response(JSON.stringify({
      status: 'mock',
      message: 'Crew AI connection unavailable, using fallback data',
      mission_id: `MISSION-${Date.now()}`,
      stats: null,
      maintenance: null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in crew-ai-sync function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        status: 'fallback',
        message: 'Using local simulation mode'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
