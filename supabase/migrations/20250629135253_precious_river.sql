/*
  # Enhanced Roles System and Donations Support

  1. Enhanced User Roles
    - Update role constraint to include moderator
    - Add role-specific permissions

  2. Donations Table
    - Track donation intents and records
    - Support multiple payment methods

  3. Enhanced Security
    - Additional RLS policies for moderators
    - Audit logging for admin actions
*/

-- Update user roles to include moderator
DO $$
BEGIN
  -- Drop existing constraint if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'users_role_check_updated' 
    AND table_name = 'users'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_role_check_updated;
  END IF;
  
  -- Add new constraint with moderator role
  ALTER TABLE users ADD CONSTRAINT users_role_check_enhanced 
    CHECK (role = ANY (ARRAY['seeker'::text, 'supporter'::text, 'moderator'::text, 'admin'::text]));
END $$;

-- Create donations table
CREATE TABLE IF NOT EXISTS donations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  recipient_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount numeric(10,2) NOT NULL CHECK (amount > 0),
  currency text NOT NULL DEFAULT 'USD',
  payment_method text NOT NULL CHECK (payment_method IN ('upi', 'paypal', 'bank', 'stripe')),
  payment_reference text,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on donations
ALTER TABLE donations ENABLE ROW LEVEL SECURITY;

-- Create indexes for donations
CREATE INDEX IF NOT EXISTS donations_donor_id_idx ON donations(donor_id);
CREATE INDEX IF NOT EXISTS donations_recipient_id_idx ON donations(recipient_id);
CREATE INDEX IF NOT EXISTS donations_status_idx ON donations(status);
CREATE INDEX IF NOT EXISTS donations_created_at_idx ON donations(created_at DESC);

-- RLS Policies for donations
CREATE POLICY "Users can view their own donations"
  ON donations
  FOR SELECT
  TO authenticated
  USING (
    donor_id IN (SELECT id FROM users WHERE auth_id = auth.uid()) OR
    recipient_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Users can create donations"
  ON donations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    donor_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  );

CREATE POLICY "Admins can view all donations"
  ON donations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role = 'admin'
    )
  );

-- Create audit log table for admin actions
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  target_type text NOT NULL, -- 'user', 'post', 'comment', 'report'
  target_id uuid,
  details jsonb,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;

-- Create indexes for audit log
CREATE INDEX IF NOT EXISTS admin_audit_log_admin_id_idx ON admin_audit_log(admin_id);
CREATE INDEX IF NOT EXISTS admin_audit_log_action_idx ON admin_audit_log(action);
CREATE INDEX IF NOT EXISTS admin_audit_log_created_at_idx ON admin_audit_log(created_at DESC);

-- RLS Policy for audit log (only admins can view)
CREATE POLICY "Only admins can view audit log"
  ON admin_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

CREATE POLICY "Only admins can insert audit log"
  ON admin_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    admin_id IN (
      SELECT id FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
  action_type text,
  target_type text,
  target_id uuid DEFAULT NULL,
  action_details jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  admin_user_id uuid;
BEGIN
  -- Get the admin user ID
  SELECT id INTO admin_user_id
  FROM users
  WHERE auth_id = auth.uid()
  AND role IN ('admin', 'moderator');
  
  -- Only log if user is admin/moderator
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO admin_audit_log (admin_id, action, target_type, target_id, details)
    VALUES (admin_user_id, action_type, target_type, target_id, action_details);
  END IF;
END;
$$;

-- Enhanced RLS policies for moderators

-- Allow moderators to view all reports
CREATE POLICY "Moderators can view all reports"
  ON reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Allow moderators to update report status
CREATE POLICY "Moderators can update reports"
  ON reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Allow moderators to delete posts (with logging)
CREATE POLICY "Moderators can delete posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Allow moderators to delete comments
CREATE POLICY "Moderators can delete comments"
  ON comments
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'moderator')
    )
  );

-- Function to get donation statistics
CREATE OR REPLACE FUNCTION get_donation_stats(user_id uuid)
RETURNS TABLE (
  total_donated numeric,
  total_received numeric,
  donation_count bigint,
  received_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN d.donor_id = user_id AND d.status = 'completed' THEN d.amount ELSE 0 END), 0) as total_donated,
    COALESCE(SUM(CASE WHEN d.recipient_id = user_id AND d.status = 'completed' THEN d.amount ELSE 0 END), 0) as total_received,
    COUNT(CASE WHEN d.donor_id = user_id AND d.status = 'completed' THEN 1 END) as donation_count,
    COUNT(CASE WHEN d.recipient_id = user_id AND d.status = 'completed' THEN 1 END) as received_count
  FROM donations d;
END;
$$;

-- Update trigger for donations
CREATE OR REPLACE FUNCTION update_donation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_donations_updated_at
  BEFORE UPDATE ON donations
  FOR EACH ROW
  EXECUTE FUNCTION update_donation_updated_at();