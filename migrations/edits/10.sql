-- To be able to remove arrangement types from the system without removing links
ALTER TABLE arrangementTypes 
ADD COLUMN isRemoved boolean DEFAULT false;

-- to order the flowers on the invoice page
ALTER TABLE flowerXInvoice
ADD COLUMN addedOrder INT DEFAULT 0;
 
ALTER TABLE bankTransactions
DROP COLUMN transactioncode;