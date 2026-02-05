/*
  # Update Mentor PIN to 8 Digits

  1. Changes
    - Update the default PIN code for mentors from 4 digits to 8 digits
    - Change default value from '1234' to '12345678'
  
  2. Notes
    - This migration only updates the default value for new mentors
    - Existing mentors will keep their current PIN codes
    - Admins can update existing PINs through the People management page
*/

-- Update the default PIN code length to 8 digits
ALTER TABLE mentors 
ALTER COLUMN pin_code SET DEFAULT '12345678';