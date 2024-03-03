CREATE OR REPLACE FUNCTION deleteArrangement(
    p_deleteArrangementID INT
) RETURNS VOID AS $$
BEGIN
    DELETE FROM flowerXarrangement WHERE arrangementID = p_deleteArrangementID;
    DELETE FROM arrangements WHERE arrangementID = p_deleteArrangementID;
EXCEPTION
    WHEN OTHERS THEN
        RAISE;
END;
$$ LANGUAGE plpgsql;
