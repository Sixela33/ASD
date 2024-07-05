CREATE OR REPLACE PROCEDURE createFlowerWithInitial (
    p_flowerName VARCHAR, 
    p_flowerImage VARCHAR, 
    p_flowerColors INT[],
    p_initialPrice FLOAT
) AS $$
DECLARE
    temp_flowerid INT;
BEGIN

    INSERT INTO flowers (flowerName, flowerImage, initialPrice)
    VALUES (p_flowerName, p_flowerImage, p_initialPrice) 
    RETURNING flowerID INTO temp_flowerid;

    INSERT INTO colorsXFlower (flowerID, colorID)
    SELECT temp_flowerid, unnest(p_flowerColors);

END;
$$ LANGUAGE plpgsql;
