ALTER TABLE flowerVendor 
ADD COLUMN vendorCode VARCHAR(50);

CREATE TABLE IF NOT EXISTS contacts (
    contactID SERIAL PRIMARY KEY,
    contactName VARCHAR(255) NOT NULL,
    isActive BOOLEAN DEFAULT true
);

INSERT INTO contacts (contactName)
SELECT DISTINCT projectContact
FROM projects
WHERE projectContact IS NOT NULL;

ALTER TABLE projects
ADD COLUMN projectContactID INT;

UPDATE projects
SET projectContactID = (
    SELECT contactID
    FROM contacts
    WHERE contacts.contactName = projects.projectContact
);

ALTER TABLE projects
ADD CONSTRAINT fk_project_contact
FOREIGN KEY (projectContactID) REFERENCES contacts(contactID);

ALTER TABLE projects
DROP COLUMN projectContact;

ALTER TABLE projects
RENAME COLUMN projectContactID to projectContact;