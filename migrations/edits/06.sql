

DROP TABLE IF EXISTS invoiceTransaction;

CREATE TABLE IF NOT EXISTS bankStatements (
    statementID SERIAL PRIMARY KEY,
    vendorID INT REFERENCES flowervendor(vendorID),
    fileLocation VARCHAR(255) NOT NULL,
    statementDate DATE NOT NULL
);

CREATE TABLE IF NOT EXISTS bankTransactions (
    transactionID SERIAL PRIMARY KEY,
    statementID INT REFERENCES bankStatements(statementID) ON DELETE CASCADE,
    transactionDate DATE NOT NULL,
    transactionAmount DECIMAL(10, 2) NOT NULL,
    transactionCode VARCHAR(50) NOT NULL,
    bankID VARCHAR(50) NOT NULL
);

ALTER TABLE invoices
ADD COLUMN bankTransaction INT REFERENCES bankTransactions(transactionID) ON DELETE SET NULL;
