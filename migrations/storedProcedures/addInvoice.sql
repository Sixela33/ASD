CREATE OR REPLACE FUNCTION addInvoice(
    p_invoiceData JSONB, 
    p_uploaderId INT,
    p_invoiceFileLocation VARCHAR(255),
    p_invoiceFlowerData JSONB[]
) RETURNS VOID AS $$
DECLARE
    new_invoice_id INT;
    single_flower_price JSONB;
BEGIN
    -- INSERT THE INVOICES INTO ITS TABLE AND STORE THE ID
    INSERT INTO invoices ( fileLocation, invoiceAmount, uploaderID, vendorID, invoiceDate, invoiceNumber)
    VALUES (
        p_invoiceFileLocation, 
        (p_invoiceData->>'invoiceAmount')::FLOAT,
        p_uploaderId, 
        (p_invoiceData->>'vendor')::INT, 
        (p_invoiceData->>'dueDate')::DATE,
        (p_invoiceData->>'invoiceNumber')::INT
    
    )
    RETURNING invoiceID INTO new_invoice_id;

    -- STORE ALL THE FLOWERS
    FOREACH single_flower_price IN ARRAY p_invoiceFlowerData
    LOOP
        IF (single_flower_price->>'filledStems') = '' THEN
            CONTINUE; -- Skip if filledStems is empty
        END IF;

        INSERT INTO flowerXInvoice (invoiceID, flowerID, projectID, unitPrice, numStems)
        VALUES (
            new_invoice_id,
            (single_flower_price->>'flowerid')::INT,
            (single_flower_price->>'projectid')::INT,
            (single_flower_price->>'unitPrice')::FLOAT,
            (single_flower_price->>'filledStems')::FLOAT
        );
    END LOOP;


END;
$$ LANGUAGE plpgsql;
