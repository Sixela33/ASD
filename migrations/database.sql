CREATE TABLE IF NOT EXISTS users (
    userID SERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    passhash VARCHAR(255) NOT NULL,
    refreshToken VARCHAR(255) DEFAULT '',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flowerVendor (
    vendorID SERIAL PRIMARY KEY,
    vendorName VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
    clientID SERIAL PRIMARY KEY,
    clientName VARCHAR(255) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    projectID SERIAL PRIMARY KEY,
    clientID INT REFERENCES clients(clientID),
    projectDate DATE,
    projectDescription VARCHAR(255) NOT NULL,
    projectContact VARCHAR(255),
    staffBudget FLOAT,
    profitMargin FLOAT,
    creatorID INT REFERENCES users(userID),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS arrangementTypes (
    arrangementTypeID SERIAL PRIMARY KEY,
    typeName VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS flowers (
    flowerID SERIAL PRIMARY KEY,
    flowerName VARCHAR(255) NOT NULL,
    flowerImage VARCHAR(255),
    flowerColor VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS arrangements (
    arrangementID SERIAL PRIMARY KEY,
    projectID INT REFERENCES projects(projectID),
    arrangementType INT REFERENCES arrangementTypes(arrangementTypeID),
    arrangementDescription VARCHAR(255) NOT NULL,
    flowerBudget FLOAT,
    arrangementQuantity INT,
    designerID INT REFERENCES users(userID),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flowerXarrangement (
    arrangementID INT REFERENCES arrangements(arrangementID),
    flowerID INT REFERENCES flowers(flowerID),
    amount FLOAT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (arrangementID, flowerID)
);

CREATE TABLE IF NOT EXISTS invoices (
    invoiceID SERIAL PRIMARY KEY,
    invoiceDescription VARCHAR(255) NOT NULL,
    fileLocation VARCHAR(255) NOT NULL,
    uploaderID INT REFERENCES users(userID),
    vendorID INT REFERENCES flowervendor(vendorID),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flowerXInvoice (
    invoiceID INT REFERENCES invoices(invoiceID),
    flowerID INT REFERENCES flowers(flowerID),
    projectID INT REFERENCES projects(projectID),
    unitPrice FLOAT,
    PRIMARY KEY (invoiceID, flowerID)
);

CREATE TABLE IF NOT EXISTS userRole (
    roleID SERIAL PRIMARY KEY,
    roleName VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roleXuser (
    userID INT REFERENCES users(userID),
    roleID INT REFERENCES userRole(roleID),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (userID, roleID)
);