CREATE OR REPLACE PROCEDURE editFlowerWithInitial (
    p_flowerName VARCHAR, 
    p_flowerImage VARCHAR, 
    p_flowerColors INT[],
    p_flowerid INT,
    P_initialPrice FLOAT,
    p_clientName VARCHAR, 
    p_seasons INT[]
) AS $$
DECLARE
BEGIN

    UPDATE flowers
    SET
        flowerName = p_flowerName,
        flowerImage = p_flowerImage,
        initialPrice = P_initialPrice,
        clientName = p_clientName
    WHERE
        flowerID = p_flowerid;

    DELETE FROM colorsXFlower
    WHERE flowerID = p_flowerid;

    INSERT INTO colorsXFlower (flowerID, colorID)
    SELECT p_flowerid, unnest(p_flowerColors);

    DELETE FROM seasonsXFlower
    WHERE flowerID = p_flowerid;

    INSERT INTO seasonsXFlower (flowerID, seasonsID)
    SELECT p_flowerid, unnest(p_seasons);

END;
$$ LANGUAGE plpgsql;