-- Function to increment user value
CREATE OR REPLACE FUNCTION increment_user_value(p_user_id UUID, p_amount INTEGER)
RETURNS void AS $$
BEGIN
  -- Update the user's value in the profiles table
  UPDATE profiles
  SET value_created = COALESCE(value_created, 0) + p_amount
  WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql;
