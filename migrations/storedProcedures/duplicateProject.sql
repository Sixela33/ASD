CREATE OR REPLACE FUNCTION duplicateProject(original_project_id INT) 
RETURNS INT
AS $$
DECLARE
    new_project_id INT;
    new_arrangement_id INT;
    old_arrangement_id INT;
BEGIN
    -- Duplicate the project
    INSERT INTO projects (clientID, projectDate, projectDescription, staffBudget, profitMargin, creatorID, projectEndDate, projectContact)
    SELECT clientID, projectDate, projectDescription, staffBudget, profitMargin, creatorID, projectEndDate, projectContact
    FROM projects
    WHERE projectID = original_project_id
    RETURNING projectid INTO new_project_id;

    -- Duplicate extras related to the project
    INSERT INTO additionalsXproejct (additionalDescription, projectID, ammount, clientCost)
    SELECT additionalDescription, new_project_id, ammount, clientCost
    FROM additionalsXproejct
    WHERE projectid = original_project_id;

    -- Duplicate arrangements related to the project
    FOR old_arrangement_id IN (
        SELECT arrangementID
        FROM arrangements
        WHERE projectID = original_project_id
    )
    LOOP
        INSERT INTO arrangements (projectID, arrangementType, arrangementDescription, arrangementLocation, clientCost, arrangementQuantity, installationTimes, designerID, timesBilled)
        SELECT new_project_id, arrangementType, arrangementDescription, arrangementLocation, clientCost, arrangementQuantity, installationTimes, designerID, timesBilled
        FROM arrangements
        WHERE arrangementid = old_arrangement_id
        RETURNING arrangementid INTO new_arrangement_id;

        -- Duplicate flowerxarrangement for the new arrangement
        INSERT INTO flowerXarrangement(arrangementID, flowerID, amount)
        SELECT new_arrangement_id, flowerID, amount
        FROM flowerxarrangement
        WHERE arrangementID = old_arrangement_id;
    END LOOP;

    -- Return the new project ID
    RETURN new_project_id;

END;
$$ LANGUAGE plpgsql;
