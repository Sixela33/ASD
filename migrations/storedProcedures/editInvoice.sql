CREATE OR REPLACE PROCEDURE editInvoice(
    p_invoiceData JSONB,
    p_uploaderId INT,
    p_invoiceFileLocation VARCHAR(255),
    p_invoiceFlowerData JSONB[]
) AS $$
DECLARE
    single_flower_price JSONB;
    stems_purchased TEXT;
BEGIN
    UPDATE invoices
    SET
        fileLocation = p_invoiceFileLocation,
        invoiceAmount = (p_invoiceData->>'invoiceAmount')::FLOAT,
        uploaderID = p_uploaderId,
        vendorID = (p_invoiceData->>'vendor')::INT,
        invoiceDate = (p_invoiceData->>'dueDate')::DATE,
        invoiceNumber = (p_invoiceData->>'invoiceNumber')::VARCHAR
    WHERE
        invoiceID = (p_invoiceData->>'invoiceid')::INT;

    DELETE FROM flowerXInvoice
    WHERE invoiceID = (p_invoiceData->>'invoiceid')::INT;

    FOREACH single_flower_price IN ARRAY p_invoiceFlowerData
    LOOP
        stems_purchased := single_flower_price->>'numstems';

        IF NOT(stems_purchased = '' OR stems_purchased::NUMERIC <= 0) THEN
        INSERT INTO flowerXInvoice (invoiceID, flowerID, projectID, unitPrice, numstems)
            VALUES (
            (p_invoiceData->>'invoiceid')::INT,
            (single_flower_price->>'flowerid')::INT,
            (single_flower_price->>'projectid')::INT,
            (single_flower_price->>'unitprice')::FLOAT,
            (single_flower_price->>'numstems')::FLOAT
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;