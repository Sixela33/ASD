CREATE OR REPLACE PROCEDURE editFlowerWithInitial (
    p_flowerName VARCHAR, 
    p_flowerImage VARCHAR, 
    p_flowerColors INT[],
    p_flowerid INT,
    P_initialPrice FLOAT
) AS $$
DECLARE
BEGIN

    UPDATE flowers
    SET
        flowerName = p_flowerName,
        flowerImage = p_flowerImage,
        initialPrice = P_initialPrice
    WHERE
        flowerID = p_flowerid;

    DELETE FROM colorsXFlower
    WHERE flowerID = p_flowerid;

    INSERT INTO colorsXFlower (flowerID, colorID)
    SELECT p_flowerid, unnest(p_flowerColors);

END;
$$ LANGUAGE plpgsql;