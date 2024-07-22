

DROP TABLE IF EXISTS invoiceTransaction;

CREATE TABLE IF NOT EXISTS bankStatements (
    statementID SERIAL PRIMARY KEY,
    vendorID INT REFERENCES flowervendor(vendorID),
    fileLocation VARCHAR(255) NOT NULL,
    statementDate DATE
);

CREATE TABLE IF NOT EXISTS bankTransactions (
    transactionID SERIAL PRIMARY KEY,
    statementID INT REFERENCES bankStatements(statementID),
    transactionDate DATE,
    transactionAmount DECIMAL,
    transactionCode VARCHAR,
    bankID VARCHAR
);

CREATE TABLE IF NOT EXISTS invoices (
    invoiceID SERIAL PRIMARY KEY,
    invoiceNumber VARCHAR(255) NOT NULL,
    invoiceAmount FLOAT NOT NULL,
    fileLocation VARCHAR(255) NOT NULL,
    uploaderID INT REFERENCES users(userID),
    vendorID INT REFERENCES flowervendor(vendorID),
    invoiceDate DATE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    isRemoved BOOLEAN DEFAULT false
    bankTransaction INT REFERENCES bankTransactions(transactionID)
);