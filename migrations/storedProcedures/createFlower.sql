CREATE OR REPLACE PROCEDURE createFlower (
    p_flowerName VARCHAR, 
    p_flowerImage VARCHAR, 
    p_flowerColors INT[]
) AS $$
DECLARE
    temp_flowerid INT;
BEGIN

    INSERT INTO flowers (flowerName, flowerImage)
    VALUES (p_flowerName, p_flowerImage) 
    RETURNING flowerID INTO temp_flowerid;

    INSERT INTO colorsXFlower (flowerID, colorID)
    SELECT temp_flowerid, unnest(p_flowerColors);

END;
$$ LANGUAGE plpgsql;
