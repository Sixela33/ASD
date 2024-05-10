CREATE OR REPLACE PROCEDURE editFlower (
    p_flowerName VARCHAR, 
    p_flowerImage VARCHAR, 
    p_flowerColors INT[],
    p_flowerid INT
) AS $$
DECLARE
BEGIN

    UPDATE flowers
    SET
        flowerName = p_flowerName,
        flowerImage = p_flowerImage
    WHERE
        flowerID = p_flowerid;

    DELETE FROM colorsXFlower
    WHERE invoiceID = p_flowerid;

    INSERT INTO colorsXFlower (flowerID, colorID)
    SELECT flowerid, unnest(p_flowerColors);

END;
$$ LANGUAGE plpgsql;