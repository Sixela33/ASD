CREATE OR REPLACE PROCEDURE addInvoice(
    p_invoiceData JSONB, 
    p_uploaderId INT,
    p_invoiceFileLocation VARCHAR(255),
    p_invoiceFlowerData JSONB[]
)
AS $$
DECLARE
    new_invoice_id INT;
    single_flower_price JSONB;
BEGIN
    -- INSERTAR LAS FACTURAS EN SU TABLA Y ALMACENAR EL ID
    INSERT INTO invoices (fileLocation, invoiceAmount, uploaderID, vendorID, invoiceDate, invoiceNumber)
    VALUES (
        p_invoiceFileLocation, 
        (p_invoiceData->>'invoiceAmount')::FLOAT,
        p_uploaderId, 
        (p_invoiceData->>'vendor')::INT, 
        (p_invoiceData->>'dueDate')::DATE,
        (p_invoiceData->>'invoiceNumber')::INT
    )
    RETURNING invoiceID INTO new_invoice_id;

    -- ALMACENAR TODAS LAS FLORES
    FOREACH single_flower_price IN ARRAY p_invoiceFlowerData
    LOOP

        -- INSERTAR LOS DETALLES DE LA FLOR EN LA TABLA CORRESPONDIENTE
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
