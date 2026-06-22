-- Store ratings as tenths (10 = 1.0/5, 50 = 5.0/5) while keeping the existing integer column.
-- This supports ratings such as 4.4 and 4.5 without a breaking schema change.
UPDATE "Testimonial"
SET "rating" = LEAST(50, GREATEST(10, "rating" * 10))
WHERE "rating" BETWEEN 1 AND 5;
