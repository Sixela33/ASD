CREATE OR REPLACE PROCEDURE editInvoice(
    p_invoiceData JSONB,
    p_uploaderId INT,
    p_invoiceFileLocation VARCHAR(255),
    p_invoiceFlowerData JSONB[]
) AS $$
DECLARE
    single_flower_price JSONB;
    boxes_purchased TEXT;
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
        boxes_purchased := single_flower_price->>'boxespurchased';

        IF NOT(boxes_purchased = '' OR boxes_purchased::NUMERIC <= 0) THEN
            INSERT INTO flowerXInvoice (invoiceID, flowerID, projectID, unitPrice, stemsPerBox, boxPrice, boxesPurchased)
            VALUES (
                (p_invoiceData->>'invoiceid')::INT,
                (single_flower_price->>'flowerid')::INT,
                (single_flower_price->>'projectid')::INT,
                (single_flower_price->>'unitprice')::FLOAT,
                (single_flower_price->>'stemsperbox')::FLOAT,
                (single_flower_price->>'boxprice')::FLOAT,
                (single_flower_price->>'boxespurchased')::FLOAT
            );
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;