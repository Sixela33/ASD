CREATE OR REPLACE PROCEDURE createProject(
    p_projectDate DATE, 
    p_projectDescription VARCHAR(255), 
    p_projectContact VARCHAR(255), 
    p_staffBudget FLOAT, 
    p_profitMargin FLOAT, 
    INOUT p_projectClient INT, --this is disgusting
    p_creatorid INT,
    p_arrangements_arr JSONB[],
    p_extras_arr JSONB[],
    p_isRecurrent BOOLEAN
) AS $$
DECLARE
    arrangement_record JSONB;
    extra_service JSONB;
BEGIN
    -- INSERT THE PROJECT INTO ITS TABLE AND STORE THE ID
    INSERT INTO projects (projectDate, projectDescription, projectContact, staffBudget, clientID, profitMargin, creatorID, isRecurrent)
    VALUES (p_projectDate, p_projectDescription, p_projectContact, p_staffBudget, p_projectClient, p_profitMargin, p_creatorid, p_isRecurrent)
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

    --store extra services
    FOREACH extra_service IN ARRAY p_extras_arr
    LOOP
        INSERT INTO additionalsXproejct (additionalDescription, projectID, clientCost, ammount)
        VALUES (
            (extra_service->>'description')::VARCHAR, 
            p_projectClient, 
            (extra_service->>'clientcost')::FLOAT,
            (extra_service->>'ammount')::FLOAT);
    END LOOP;



END;
$$ LANGUAGE plpgsql;
