CREATE OR REPLACE PROCEDURE createProject(
    p_projectDate DATE, 
    p_projectDescription VARCHAR(255), 
    p_projectContact VARCHAR(255), 
    p_staffBudget FLOAT, 
    p_profitMargin FLOAT, 
    INOUT p_projectClient INT, --this is disgusting
    p_creatorid INT,
    p_arrangements_arr JSONB[]
) AS $$
DECLARE
    arrangement_record JSONB;
BEGIN
    -- INSERT THE PROJECT INTO ITS TABLE AND STORE THE ID
    INSERT INTO projects (projectDate, projectDescription, projectContact, staffBudget, clientID, profitMargin, creatorID)
    VALUES (p_projectDate, p_projectDescription, p_projectContact, p_staffBudget, p_projectClient, p_profitMargin, p_creatorid)
    RETURNING projectID INTO p_projectClient;

    -- STORE ALL THE ARRANGEMENTS
    FOREACH arrangement_record IN ARRAY p_arrangements_arr
    LOOP
        INSERT INTO arrangements (projectID, arrangementType, arrangementDescription, clientCost, arrangementQuantity)
        VALUES (
            p_projectClient, 
            (arrangement_record->>'arrangementType')::INT, 
            arrangement_record->>'arrangementDescription', 
            (arrangement_record->>'clientCost')::FLOAT, 
            (arrangement_record->>'arrangementQuantity')::INT);
    END LOOP;

END;
$$ LANGUAGE plpgsql;
