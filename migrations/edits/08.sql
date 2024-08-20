ALTER TABLE flowerXInvoice RENAME TO flowerXInvoice_old;

CREATE TABLE IF NOT EXISTS flowerXInvoice (
    invoiceID INT REFERENCES invoices(invoiceID) ON DELETE CASCADE,
    flowerID INT REFERENCES flowers(flowerID),
    projectID INT REFERENCES projects(projectID),
    unitPrice FLOAT,
    numStems FLOAT,
    loadedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO flowerXInvoice (invoiceID, flowerID, projectID, unitPrice, numStems, loadedDate)
SELECT 
    invoiceID,
    flowerID,
    projectID,
    boxPrice / stemsPerBox AS unitPrice,
    boxesPurchased * stemsPerBox AS numStems,
    loadedDate
FROM
    flowerXInvoice_old;