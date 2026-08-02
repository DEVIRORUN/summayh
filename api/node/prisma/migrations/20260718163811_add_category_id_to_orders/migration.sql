-- Step 1: Add the column as NULL initially so the 3 existing rows don't cause a failure
ALTER TABLE "Order" ADD COLUMN "categoryId" TEXT;

-- Step 2: Update your existing 3 test rows with a category ID that already exists in your Category table
UPDATE "Order" SET "categoryId" = '07302ab8-dd2c-452b-87f4-b4418ddb59e1' WHERE "categoryId" IS NULL;

-- Step 3: Now that all rows have a value, safely enforce NOT NULL
ALTER TABLE "Order" ALTER COLUMN "categoryId" SET NOT NULL;

-- Step 4: Add the foreign key constraint back safely
ALTER TABLE "Order" ADD CONSTRAINT "Order_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;