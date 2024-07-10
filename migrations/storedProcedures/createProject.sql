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
    p_isRecurrent BOOLEAN,
    p_projectEndDate DATE
) AS $$
DECLARE
    arrangement_record JSONB;
    extra_service JSONB;
BEGIN
    -- INSERT THE PROJECT INTO ITS TABLE AND STORE THE ID
    INSERT INTO projects (projectDate, projectDescription, projectContact, staffBudget, clientID, profitMargin, creatorID, isRecurrent, projectEndDate)
    VALUES (p_projectDate, p_projectDescription, p_projectContact, p_staffBudget, p_projectClient, p_profitMargin, p_creatorid, p_isRecurrent, p_projectEndDate)
    RETURNING projectID INTO p_projectClient;

    -- STORE ALL THE ARRANGEMENTS
    FOREACH arrangement_record IN ARRAY p_arrangements_arr
    LOOP
        INSERT INTO arrangements (
            projectID, 
            arrangementType, 
            arrangementDescription, 
            clientCost, 
            arrangementQuantity, 
            arrangementLocation, 
            installationTimes, 
            timesBilled)
        VALUES (
            p_projectClient, 
            (arrangement_record->>'arrangementType')::INT, 
            arrangement_record->>'arrangementDescription', 
            (arrangement_record->>'clientCost')::FLOAT, 
            (arrangement_record->>'arrangementQuantity')::INT,
            (arrangement_record->>'arrangementLocation')::VARCHAR, 
            (arrangement_record->>'installationTimes')::INT,
            (arrangement_record->>'timesBilled')::INT
            );
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
