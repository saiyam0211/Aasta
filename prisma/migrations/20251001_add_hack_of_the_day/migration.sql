-- Add hackOfTheDay column to menu_items if it doesn't exist
-- This migration is safe to run multiple times in Postgres using IF NOT EXISTS

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'menu_items'
      AND column_name = 'hackOfTheDay'
  ) THEN
    ALTER TABLE "menu_items"
      ADD COLUMN "hackOfTheDay" BOOLEAN NOT NULL DEFAULT false;
  END IF;
END
$$;


