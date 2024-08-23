CREATE OR REPLACE PROCEDURE createFlowerWithInitial (
    p_flowerName VARCHAR, 
    p_flowerImage VARCHAR, 
    p_flowerColors INT[],
    p_initialPrice FLOAT,
    p_clientName VARCHAR, 
    p_seasons INT[]
) AS $$
DECLARE
    temp_flowerid INT;
BEGIN

    INSERT INTO flowers (flowerName, flowerImage, initialPrice, flowerNameClient)
    VALUES (p_flowerName, p_flowerImage, p_initialPrice, p_clientName) 
    RETURNING flowerID INTO temp_flowerid;

    INSERT INTO colorsXFlower (flowerID, colorID)
    SELECT temp_flowerid, unnest(p_flowerColors);

    INSERT INTO seasonsXFlower (flowerID, seasonsID)
    SELECT temp_flowerid, unnest(p_seasons);

END;
$$ LANGUAGE plpgsql;
