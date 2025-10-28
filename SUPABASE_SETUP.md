# Supabase Authentication Setup Guide

## 1. Create Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Enter project name: "slaid-auth"
5. Enter database password (save this!)
6. Choose region closest to your users
7. Click "Create new project"

## 2. Get Environment Variables

Once your project is created:

1. Go to Settings > API
2. Copy the following values:

```bash
# Add these to your .env.local file:
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_public_key_here
```

## 3. Configure Google OAuth

1. Go to Authentication > Providers in your Supabase dashboard
2. Enable Google provider
3. Get Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to Credentials > Create Credentials > OAuth 2.0 Client ID
   - Set application type to "Web application"
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for development)
   - Copy Client ID and Client Secret
4. Add Google credentials to Supabase:
   - Paste Client ID and Client Secret in Supabase Google provider settings
   - Save configuration

## 4. Configure Site URL

1. Go to Authentication > URL Configuration
2. Set Site URL to: `http://localhost:3000` (for development)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `http://localhost:3000/editor`
   - `http://localhost:3000/pricing`

## 5. Database Schema

The authentication will automatically create user tables. For user profiles, we'll create:

```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  plan_type TEXT DEFAULT 'free',
  credits INTEGER DEFAULT 200,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

## 6. Environment Variables Template

Create a `.env.local` file with:

```bash
# Polar Configuration (existing)
NEXT_PUBLIC_POLAR_SH_PUBLIC_ACCESS_TOKEN=polar_oat_mhju5dmZmx0qJ8JMhIMeSwFBhz8dL6QOOGv3A1kT5ys
NEXT_PUBLIC_POLAR_PRO_MONTHLY_PRODUCT_ID=5a954dc6-891d-428a-a948-05409fe765e2
NEXT_PUBLIC_POLAR_PRO_YEARLY_PRODUCT_ID=8739ccac-36f9-4e28-8437-8b36bb1e7d71
NEXT_PUBLIC_BASE_URL=http://localhost:3000

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

## 7. Testing

After setup:
1. Restart your development server
2. Go to `/signup` to test registration
3. Go to `/login` to test login
4. Test Google OAuth flow
5. Check Supabase dashboard for new users

## Troubleshooting

- **"supabaseUrl is required"**: Check your environment variables are set correctly
- **Google OAuth not working**: Verify redirect URLs match exactly
- **Users not being created**: Check the database trigger is working
- **CORS errors**: Ensure your domain is added to Supabase allowed origins
