CREATE OR REPLACE PROCEDURE deleteArrangement(
    p_deleteArrangementID INT
) AS $$
BEGIN
    DELETE FROM flowerXarrangement WHERE arrangementID = p_deleteArrangementID;
    DELETE FROM arrangements WHERE arrangementID = p_deleteArrangementID;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$ LANGUAGE plpgsql;
