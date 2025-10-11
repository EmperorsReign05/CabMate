// supabase/functions/whatsapp-parser/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

console.log('whatsapp-parser function initialized!');

// Add the ': Request' type to the req parameter
serve(async (req: Request) => {
  // IFTTT will send a JSON payload, which is easy to work with.
  const { content, sender } = await req.json();

  console.log(`Received ride info from: ${sender}`);
  console.log(`Message content: ${content}`);

  // In the next phase, we will add the logic to parse this content
  // and save it to your database.

  // Send a success response back to IFTTT
  return new Response(
    JSON.stringify({ message: "Data received successfully by Supabase!" }),
    { headers: { 'Content-Type': 'application/json' } },
  )
})