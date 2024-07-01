BEGIN;

    -- ALTER TABLE STATEMENT SO THAT THIS SCRIPT ONLY RUNS ONCE
    ALTER TABLE flowerXInvoice ADD boxPrice FLOAT;

    ALTER TABLE flowerXInvoice RENAME TO flowerXInvoice_old;

    CREATE TABLE flowerXInvoice (
        invoiceID INT REFERENCES invoices(invoiceID) ON DELETE CASCADE,
        flowerID INT REFERENCES flowers(flowerID) NOT NULL,
        projectID INT REFERENCES projects(projectID) NOT NULL,
        unitPrice FLOAT NOT NULL,
        stemsPerBox FLOAT REQUIRED NOT NULL,
        boxPrice FLOAT REQUIRED NOT NULL,
        boxesPurchased FLOAT DEFAULT 1 REQUIRED,
        loadedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    INSERT INTO flowerXInvoice (invoiceID, flowerID, projectID, unitPrice, boxesPurchased, boxPrice, stemsPerBox ,loadedDate)
    SELECT invoiceID, flowerID, projectID, unitPrice, numStems, unitPrice, 1, loadedDate
    FROM flowerXInvoice_old;

    DROP TABLE flowerXInvoice_old;

    /*
    boxesPurchased -> Unit Purchased - manually enter (this can be a bunch, a bundle, a box, etc)
    stemsPerBox    -> Stems per Unit - manually enter
    boxPrice       -> Unit Price - manually enter
    unitPrice      -> Stem Price - auto-calculate Unit Price divided by Stems per Unit
    */

COMMIT;

