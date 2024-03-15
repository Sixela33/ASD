CREATE OR REPLACE FUNCTION editInvoice(
    p_invoiceData JSONB,
    p_uploaderId INT,
    p_invoiceFileLocation VARCHAR(255),
    p_invoiceFlowerData JSONB[]
) RETURNS VOID AS $$
DECLARE
    single_flower_price JSONB;
    filled_stems_value TEXT;
BEGIN
    UPDATE invoices
    SET
        fileLocation = p_invoiceFileLocation,
        invoiceAmount = (p_invoiceData->>'invoiceAmount')::FLOAT,
        uploaderID = p_uploaderId,
        vendorID = (p_invoiceData->>'vendor')::INT,
        invoiceDate = (p_invoiceData->>'dueDate')::DATE,
        invoiceNumber = (p_invoiceData->>'invoiceNumber')::INT
    WHERE
        invoiceID = (p_invoiceData->>'invoiceid')::INT;

    DELETE FROM flowerXInvoice
    WHERE invoiceID = (p_invoiceData->>'invoiceid')::INT;

    FOREACH single_flower_price IN ARRAY p_invoiceFlowerData
    LOOP
        filled_stems_value := single_flower_price->>'filledStems';

        IF NOT(filled_stems_value = '' OR filled_stems_value::NUMERIC <= 0) THEN
            INSERT INTO flowerXInvoice (invoiceID, flowerID, projectID, unitPrice, numStems)
            VALUES (
                (p_invoiceData->>'invoiceid')::INT,
                (single_flower_price->>'flowerid')::INT,
                (single_flower_price->>'projectid')::INT,
                (single_flower_price->>'unitPrice')::FLOAT,
                (filled_stems_value)::FLOAT
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;