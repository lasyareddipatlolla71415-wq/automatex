import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, ticketId } = await req.json();
    console.log('Received chat request:', { message, ticketId });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch knowledge base for context
    const { data: problems } = await supabase
      .from('problems')
      .select('*');

    console.log('Fetched problems:', problems?.length || 0);

    // Build context from knowledge base
    const knowledgeContext = problems?.map(p => 
      `Problem: ${p.title}\nCategory: ${p.category}\nDescription: ${p.description}\nSolution: ${p.solution}`
    ).join('\n\n') || '';

    const systemPrompt = `You are AIVA (Artificial Intelligent Virtual Assistant), a helpful and friendly AI assistant specialized in troubleshooting technical issues.

Your personality:
- Friendly and supportive with a touch of emoji 🚀
- Clear and concise in explanations
- Step-by-step guidance for solutions
- Encouraging and positive tone

Knowledge Base:
${knowledgeContext}

Instructions:
1. Analyze the user's problem carefully
2. If you find a matching solution in the knowledge base, provide it with clear steps
3. If the problem is complex or not in the knowledge base, suggest creating a ticket
4. Always be helpful and maintain a friendly tone
5. Use emojis sparingly to keep things engaging
6. Format responses with clear bullet points or numbered steps when providing solutions`;

    const messages: ChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: message }
    ];

    console.log('Calling Lovable AI...');

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ 
            error: 'Rate limit exceeded. Please try again in a moment.',
            shouldCreateTicket: true 
          }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ 
            error: 'AI service credits depleted. Creating a ticket instead.',
            shouldCreateTicket: true 
          }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content || 'I apologize, but I encountered an issue. Let me create a ticket for you.';

    console.log('AI response received');

    // If there's a ticket ID, save the conversation
    if (ticketId) {
      await supabase.from('ticket_messages').insert([
        { ticket_id: ticketId, sender_type: 'user', message },
        { ticket_id: ticketId, sender_type: 'ai', message: aiResponse }
      ]);
      console.log('Messages saved to ticket:', ticketId);
    }

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in aiva-chat function:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        response: "I'm having trouble right now 😅 Let me create a ticket for you so our team can help!"
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});