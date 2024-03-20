CREATE OR REPLACE PROCEDURE linkBankTx(
    p_tx_number VARCHAR(255),
    invoices_linked INT[]
) AS $$
DECLARE
    invID INT;
BEGIN

    FOR invID IN SELECT unnest(invoices_linked) 
    LOOP
        IF EXISTS (SELECT 1 FROM invoices WHERE invoiceID = invID) THEN
            INSERT INTO invoiceTransaction (invoiceID, transactionNumber)
            VALUES (invID, p_tx_number);
        END IF;
    END LOOP;

END;
$$ LANGUAGE plpgsql;
