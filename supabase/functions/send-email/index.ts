import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { Resend } from 'https://esm.sh/resend@3.2.0'

serve(async (req) => {
  // Add CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Check if RESEND_API_KEY is configured
    const apiKey = Deno.env.get('RESEND_API_KEY')
    if (!apiKey) {
      console.error('RESEND_API_KEY is not configured in environment variables')
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: 'Email service is not configured. Please set RESEND_API_KEY in Supabase environment variables.' 
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    // Initialize Resend with the API key
    const resend = new Resend(apiKey)

    const { to, subject, html, text } = await req.json()

    console.log(`Attempting to send email to: ${to}`)
    console.log(`Subject: ${subject}`)
    console.log(`API Key present: ${apiKey ? 'Yes' : 'No'}`)
    console.log(`API Key length: ${apiKey ? apiKey.length : 0}`)

    let data;
    try {
      console.log('Calling Resend API...')
      data = await resend.emails.send({
        from: 'ClassBoom <onboarding@resend.dev>',
        to,
        subject,
        html,
        text,
      })
      console.log('Resend API raw response:', data)
      console.log('Resend API response type:', typeof data)
      console.log('Resend API response stringified:', JSON.stringify(data))
    } catch (resendError) {
      console.error('Resend API error:', resendError)
      console.error('Resend error type:', typeof resendError)
      console.error('Resend error details:', JSON.stringify(resendError))
      throw resendError
    }
    
    // Check if email was sent (Resend returns different formats in different versions)
    if (!data) {
      console.error('No response from Resend API')
      throw new Error('No response from Resend API')
    }

    // Handle different response formats from Resend
    const emailId = data.id || data.data?.id || null;
    const success = data.id || data.data?.id || (data && Object.keys(data).length > 0);

    return new Response(
      JSON.stringify({ 
        success: true, 
        data: data || {},
        emailId: emailId,
        message: emailId ? `Email sent successfully with ID: ${emailId}` : 'Email sent successfully',
        rawResponse: data // Include raw response for debugging
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    console.error('Error sending email:', error)
    console.error('Error details:', JSON.stringify(error))
    
    // Check if it's a Resend API error
    if (error.name === 'ResendError') {
      console.error('Resend API Error:', error.message)
    }
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message,
        details: error.name === 'ResendError' ? error : undefined
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})