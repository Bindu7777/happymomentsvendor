-- Fix RLS policies for user_profiles table

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;
DROP POLICY IF EXISTS "Service role can insert profiles" ON user_profiles;

-- Create new policies that work better
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to insert their own profile (this will work after email verification)
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow the trigger function to insert profiles (bypasses RLS)
CREATE POLICY "Enable insert for authenticated users" ON user_profiles
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Update the trigger function to be more robust
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only create profile if user is confirmed
  IF NEW.email_confirmed_at IS NOT NULL THEN
    INSERT INTO public.user_profiles (
      user_id, 
      email, 
      first_name, 
      last_name, 
      full_name, 
      agreed_to_terms,
      email_verified,
      created_at,
      updated_at
    )
    VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      COALESCE((NEW.raw_user_meta_data->>'agreed_to_terms')::boolean, false),
      true,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO NOTHING; -- Prevent duplicate inserts
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also create a function to manually create profile for existing users
CREATE OR REPLACE FUNCTION public.create_user_profile(user_uuid UUID)
RETURNS void AS $$
BEGIN
  INSERT INTO public.user_profiles (
    user_id, 
    email, 
    first_name, 
    last_name, 
    full_name, 
    agreed_to_terms,
    email_verified,
    created_at,
    updated_at
  )
  SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'first_name', ''),
    COALESCE(au.raw_user_meta_data->>'last_name', ''),
    COALESCE(au.raw_user_meta_data->>'full_name', au.email),
    COALESCE((au.raw_user_meta_data->>'agreed_to_terms')::boolean, false),
    au.email_confirmed_at IS NOT NULL,
    NOW(),
    NOW()
  FROM auth.users au
  WHERE au.id = user_uuid
  ON CONFLICT (user_id) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
