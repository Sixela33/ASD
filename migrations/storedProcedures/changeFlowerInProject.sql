CREATE OR REPLACE PROCEDURE change_flower_in_project(
    p_project_id INT, 
    p_previous_flower_id INT, 
    p_new_flower_id INT
)
AS $$
DECLARE
    arrangements_to_edit INT[];
    arrangement_temp INT;
    flowers_to_add_temp FLOAT;
BEGIN
    -- Obtener los IDs de los arreglos que contienen la flor que se desea cambiar
    SELECT array_agg(a.arrangementID)
    INTO arrangements_to_edit
    FROM arrangements a 
    JOIN flowerXarrangement fxa ON fxa.arrangementID = a.arrangementID
    WHERE a.projectID = p_project_id
    AND fxa.flowerID = p_previous_flower_id;

    -- Iterar sobre cada arreglo para realizar los cambios
    FOREACH arrangement_temp IN ARRAY arrangements_to_edit
    LOOP
        -- Verificar si el arreglo ya contiene la nueva flor
        SELECT amount 
        INTO flowers_to_add_temp
        FROM flowerXarrangement 
        WHERE flowerID = p_new_flower_id
        AND arrangementID = arrangement_temp;

        -- Si el arreglo ya contiene la nueva flor, sumar la cantidad de la flor anterior
        IF flowers_to_add_temp IS NOT NULL THEN
            UPDATE flowerXarrangement 
            SET amount = amount + (
                SELECT amount FROM flowerXarrangement
                WHERE flowerID = p_previous_flower_id
                AND arrangementID = arrangement_temp
            )
            WHERE flowerID = p_new_flower_id
            AND arrangementID = arrangement_temp;

            DELETE FROM flowerXarrangement 
            WHERE flowerID = p_previous_flower_id
            AND arrangementID = arrangement_temp;
        ELSE
            -- Si el arreglo no contiene la nueva flor, simplemente actualizar la flor anterior por la nueva
            UPDATE flowerXarrangement 
            SET flowerID = p_new_flower_id
            WHERE flowerID = p_previous_flower_id
            AND arrangementID = arrangement_temp;
        END IF;
    END LOOP;

END;
$$ LANGUAGE plpgsql;
