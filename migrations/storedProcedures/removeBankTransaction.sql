CREATE OR REPLACE PROCEDURE removeBankTransaction(
    p_tx_number INT
) AS $$
BEGIN
    -- Set bankTransaction to NULL in related invoices
    UPDATE invoices
    SET bankTransaction = NULL
    WHERE bankTransaction = p_tx_number;

    -- Delete the bank transaction
    DELETE FROM bankTransactions
    WHERE transactionID = p_tx_number;
END;
$$ LANGUAGE plpgsql;
