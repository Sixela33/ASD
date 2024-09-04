CREATE OR REPLACE PROCEDURE linkFlowersToInvoice(
    IN p_flowers JSONB[],
    IN p_invoiceID INT
) AS $$
DECLARE
    flower JSONB;
BEGIN
    
    FOREACH flower IN ARRAY p_flowers
    LOOP
        INSERT INTO flowerXInvoice (
            invoiceID,
            flowerID,
            unitPrice,
            numStems,
            additionOrder
        )
        VALUES (
            p_invoiceID,
            (flower->>'flowerid')::INT, 
            (flower->>'numstems')::FLOAT, 
            (flower->>'unitprice')::FLOAT, 
            (flower->>'order')::INT
        );
    END LOOP;
END;
$$ LANGUAGE plpgsql;
