CREATE OR REPLACE FUNCTION populateArrangements (
    p_arrangementID INT,
    p_flowerdata_arr JSONB[]
) RETURNS VOID AS $$
DECLARE
    flower JSONB;
BEGIN

    DELETE FROM flowerXarrangement WHERE arrangementID = p_arrangementID;
    
    FOREACH flower IN ARRAY p_flowerdata_arr
    LOOP
        INSERT INTO flowerXarrangement (arrangementID, flowerID, amount)
        VALUES (
            p_arrangementID,
            (flower->>'flowerID')::INT,
            (flower->>'quantity')::FLOAT
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;
