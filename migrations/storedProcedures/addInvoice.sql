CREATE OR REPLACE PROCEDURE addInvoice(
    p_invoiceData JSONB, 
    INOUT p_uploaderId INT, -- PUAJ
    p_invoiceFileLocation VARCHAR(255),
    p_invoiceFlowerData JSONB[]
)
AS $$
DECLARE
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
        (p_invoiceData->>'invoiceNumber')::VARCHAR
    )
    RETURNING invoiceID INTO p_uploaderId;

    -- ALMACENAR TODAS LAS FLORES
    FOREACH single_flower_price IN ARRAY p_invoiceFlowerData
    LOOP

        -- INSERTAR LOS DETALLES DE LA FLOR EN LA TABLA CORRESPONDIENTE
        INSERT INTO flowerXInvoice (invoiceID, flowerID, projectID, unitPrice, stemsPerBox, boxPrice, boxesPurchased)
        VALUES (
            p_uploaderId,
            (single_flower_price->>'flowerid')::INT,
            (single_flower_price->>'projectid')::INT,
            (single_flower_price->>'unitprice')::FLOAT,
            (single_flower_price->>'stemsperbox')::FLOAT,
            (single_flower_price->>'boxprice')::FLOAT,
            (single_flower_price->>'boxespurchased')::FLOAT
        );
    END LOOP;

END;
$$ LANGUAGE plpgsql;
