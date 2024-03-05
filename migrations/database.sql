CREATE TABLE IF NOT EXISTS userRole (
    roleID SERIAL PRIMARY KEY,
    roleName VARCHAR(50),
    roleCode INT
);

CREATE TABLE IF NOT EXISTS users (
    userID SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(50) NOT NULL,
    passhash VARCHAR(100) NOT NULL,
    refreshToken VARCHAR(150) DEFAULT '',
    permissionLevel INT REFERENCES userRole(roleID),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flowerVendor (
    vendorID SERIAL PRIMARY KEY,
    vendorName VARCHAR(50) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
    clientID SERIAL PRIMARY KEY,
    clientName VARCHAR(50) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    projectID SERIAL PRIMARY KEY,
    clientID INT REFERENCES clients(clientID),
    projectDate DATE,
    projectDescription VARCHAR(255) NOT NULL,
    projectContact VARCHAR(150),
    staffBudget FLOAT,
    profitMargin FLOAT,
    creatorID INT REFERENCES users(userID),
    isClosed BOOLEAN DEFAULT false,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS arrangementTypes (
    arrangementTypeID SERIAL PRIMARY KEY,
    typeName VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS flowers (
    flowerID SERIAL PRIMARY KEY,
    flowerName VARCHAR(50) NOT NULL,
    flowerImage VARCHAR(255),
    flowerColor VARCHAR(50),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_flowername ON flowers (flowername);

CREATE TABLE IF NOT EXISTS arrangements (
    arrangementID SERIAL PRIMARY KEY,
    projectID INT REFERENCES projects(projectID),
    arrangementType INT REFERENCES arrangementTypes(arrangementTypeID),
    arrangementDescription VARCHAR(255) NOT NULL,
    clientCost FLOAT,
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
    invoiceNumber INT NOT NULL,
    invoiceAmount FLOAT NOT NULL,
    fileLocation VARCHAR(255) NOT NULL,
    uploaderID INT REFERENCES users(userID),
    vendorID INT REFERENCES flowervendor(vendorID),
    invoiceDate DATE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoiceTransaction (
    invoiceID INT REFERENCES invoices(invoiceID),
    transactionNumber VARCHAR(100) NOT NULL 
);

CREATE TABLE IF NOT EXISTS flowerXInvoice (
    comboID SERIAL PRIMARY KEY,
    invoiceID INT REFERENCES invoices(invoiceID),
    flowerID INT REFERENCES flowers(flowerID),
    projectID INT REFERENCES projects(projectID),
    unitPrice FLOAT,
    numStems FLOAT,
    loadedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
