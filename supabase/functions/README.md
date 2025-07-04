# Supabase Edge Functions for ClassBoom

## Email Sending Function

This Edge Function handles email sending via Resend to avoid CORS issues.

### Setup Instructions

1. **Install Supabase CLI** (if not already installed):
   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase**:
   ```bash
   supabase login
   ```

3. **Link your project**:
   ```bash
   supabase link --project-ref hokgyujgsvdfhpfrorsu
   ```

4. **Set the Resend API key secret**:
   ```bash
   supabase secrets set RESEND_API_KEY=re_gf9oScbs_EaxNpdVffGKZxbNgWYrNUUkx
   ```

5. **Deploy the function**:
   ```bash
   supabase functions deploy send-email
   ```

### Testing Locally

To test the function locally:

```bash
# Start local Supabase
supabase start

# Serve the function locally
supabase functions serve send-email --env-file ./supabase/.env.local

# In another terminal, test it:
curl -i --location --request POST 'http://localhost:54321/functions/v1/send-email' \
  --header 'Authorization: Bearer YOUR_ANON_KEY' \
  --header 'Content-Type: application/json' \
  --data '{"to":"test@example.com","subject":"Test","html":"<p>Test</p>","text":"Test"}'
```

### Production Deployment

After testing locally, deploy to production:

```bash
supabase functions deploy send-email --no-verify-jwt
```

The `--no-verify-jwt` flag allows the function to be called from your frontend with the anon key.

### Updating Your Domain

Once deployed, update the `from` address in the Edge Function to use your verified domain:

1. Add your domain in Resend dashboard
2. Verify DNS records
3. Update the Edge Function's `from` field to use your domain

### Environment Variables

The function uses these environment variables:
- `RESEND_API_KEY`: Your Resend API key (set as a secret)