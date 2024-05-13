CREATE TABLE IF NOT EXISTS userRole (
    roleID SERIAL PRIMARY KEY,
    roleName VARCHAR(50) UNIQUE,
    roleCode INT UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    userID SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    username VARCHAR(50),
    picture VARCHAR,
    refreshToken VARCHAR(500) DEFAULT '',
    permissionLevel INT REFERENCES userRole(roleID)
);

CREATE TABLE IF NOT EXISTS flowerVendor (
    vendorID SERIAL PRIMARY KEY,
    vendorName VARCHAR(50) UNIQUE NOT NULL,
    isActive BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS clients (
    clientID SERIAL PRIMARY KEY,
    clientName VARCHAR(50) UNIQUE NOT NULL,
    isActive BOOLEAN DEFAULT true

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
    isRecurrent BOOLEAN DEFAULT false,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS additionalsXproejct (
    aditionalID SERIAL PRIMARY KEY,
    additionalDescription VARCHAR(255) NOT NULL,
    projectID INT REFERENCES projects(projectID) ON DELETE CASCADE,
    clientCost INT NOT NULL
);

CREATE TABLE IF NOT EXISTS arrangementTypes (
    arrangementTypeID SERIAL PRIMARY KEY,
    typeName VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS flowers (
    flowerID SERIAL PRIMARY KEY,
    flowerName VARCHAR(50) NOT NULL,
    flowerDescription VARCHAR(50),
    flowerImage VARCHAR(255),
    isActive BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS flowerColors (
    colorID SERIAL PRIMARY KEY,
    colorName VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS colorsXFlower (
    flowerID INT REFERENCES flowers(flowerID),
    colorID INT REFERENCES flowerColors(colorID)
);

CREATE TABLE IF NOT EXISTS recurrentProjectCheckpoint (
    checkpointID SERIAL PRIMARY KEY,
    projectID INT REFERENCES projects(projectID),
    checkpointDate DATE NOT NULL,
    totalExtrasCost FLOAT,
    totalArrangementsCost FLOAT,
    profitMargin FLOAT,
    staffBudget FLOAT
);

CREATE INDEX IF NOT EXISTS idx_flowername ON flowers (flowername);

CREATE TABLE IF NOT EXISTS arrangements (
    arrangementID SERIAL PRIMARY KEY,
    projectID INT REFERENCES projects(projectID) ON DELETE CASCADE,
    arrangementType INT REFERENCES arrangementTypes(arrangementTypeID),
    arrangementDescription VARCHAR(255) NOT NULL,
    clientCost FLOAT,
    arrangementQuantity INT,
    designerID INT REFERENCES users(userID),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flowerXarrangement (
    arrangementID INT REFERENCES arrangements(arrangementID) ON DELETE CASCADE,
    flowerID INT REFERENCES flowers(flowerID),
    amount FLOAT,
    PRIMARY KEY (arrangementID, flowerID)
);

CREATE TABLE IF NOT EXISTS invoices (
    invoiceID SERIAL PRIMARY KEY,
    invoiceNumber VARCHAR(255) NOT NULL,
    invoiceAmount FLOAT NOT NULL,
    invoiceTax FLOAT DEFAULT 0,
    fileLocation VARCHAR(255) NOT NULL,
    uploaderID INT REFERENCES users(userID),
    vendorID INT REFERENCES flowervendor(vendorID),
    invoiceDate DATE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS invoiceCategory (
    categoryID SERIAL PRIMARY KEY,
    categoryName VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS invoiceTransaction (
    invoiceID INT REFERENCES invoices(invoiceID) ON DELETE CASCADE,
    transactionNumber VARCHAR(100) NOT NULL 
);

CREATE TABLE IF NOT EXISTS flowerXInvoice (
    invoiceID INT REFERENCES invoices(invoiceID) ON DELETE CASCADE,
    flowerID INT REFERENCES flowers(flowerID),
    projectID INT REFERENCES projects(projectID),
    unitPrice FLOAT,
    numStems FLOAT,
    loadedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (invoiceID, flowerID, projectID)
);

CREATE TABLE IF NOT EXISTS aditionalXinvoice (
    invoiceID INT REFERENCES invoices(invoiceID) ON DELETE CASCADE,
    aditionalID INT REFERENCES additionalsXproejct(aditionalID)
);
