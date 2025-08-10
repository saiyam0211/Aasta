-- Update restaurants that have NULL values for percentage fields
UPDATE "Restaurant" 
SET 
  "restaurantPercentage" = 40.0,
  "aastaPercentage" = 10.0
WHERE 
  "restaurantPercentage" IS NULL 
  OR "aastaPercentage" IS NULL;
