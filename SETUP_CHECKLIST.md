# Supabase Integration Setup Checklist

## Environment Variables (REQUIRED)

You must set these environment variables in your Vercel project settings before the app will work:

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
  - Find it in Supabase Dashboard > Settings > API > Project URL
  
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous key  
  - Find it in Supabase Dashboard > Settings > API > anon (public) key

### How to Set Environment Variables

1. Go to your Vercel project settings (top right, settings button)
2. Click "Vars" section
3. Add each environment variable:
   - Key: `NEXT_PUBLIC_SUPABASE_URL`
   - Value: Your Supabase project URL
4. Click "Add Variable"
5. Repeat for `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Redeploy your project

## Code Optimization

The large files have been split into smaller modules to optimize webpack caching:

- **Auth utilities** split into:
  - `src/lib/auth/client.ts` - Client-side auth functions
  - `src/lib/auth/server.ts` - Server-side auth functions
  - `src/lib/auth/validation.ts` - Validation utilities
  - `src/lib/auth/index.ts` - Re-exports all above

- **Data queries** split into:
  - `src/lib/data/profile-queries.ts` - Profile and public profile queries
  - `src/lib/data/message-queries.ts` - Messaging queries
  - `src/lib/data/intro-queries.ts` - Intro request queries
  - `src/lib/data/notification-queries.ts` - Notification queries
  - `src/lib/data/event-queries.ts` - Event queries
  - `src/lib/data/queries.ts` - Re-exports all above

## Features Ready to Use

After setting environment variables:

1. **Authentication**
   - Email/password signup and login
   - OAuth (Google, LinkedIn)
   - Password reset
   - Session management

2. **Real-time Features**
   - Message subscriptions (`useMessageSubscription`)
   - Notification subscriptions (`useNotificationSubscription`)
   - Thread updates

3. **Data Queries**
   - Profile management
   - Message and threading
   - Intro requests
   - Notifications
   - Events
   - Founder/Investor profiles

4. **API Utilities**
   - Request/response builders
   - Authentication middleware
   - Error handling
   - Validation

## Verification Steps

1. ✅ Environment variables are set in Vercel
2. ✅ Project is deployed/redeployed
3. ✅ Can visit `/auth/login` without errors
4. ✅ Supabase client initializes correctly
5. ✅ Webpack cache warning should be reduced

## Troubleshooting

**"Your project's URL and Key are required to create a Supabase client!"**
- Solution: Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel settings

**"Webpack cache warning about large strings"**
- This is now resolved by splitting large files into smaller modules
- Webpack cache will rebuild on next deployment

**"Cannot append headers after they are sent"**
- Ensure middleware is not sending headers twice
- Check that auth routes are correctly handling responses

## Next Steps

1. Set the required environment variables
2. Redeploy your project
3. Test authentication flow at `/auth/login`
4. Review implementation examples in `IMPLEMENTATION_EXAMPLES.md`
5. Deploy to production when ready
