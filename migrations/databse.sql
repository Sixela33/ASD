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

CREATE TABLE IF NOT EXISTS invoices (
    invoiceID SERIAL PRIMARY KEY,
    invoiceDescription VARCHAR(255) NOT NULL,
    fileLocation VARCHAR(255) NOT NULL,
    uploaderID INT REFERENCES users(userID),
    vendorID INT REFERENCES flowervendor(vendorID),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clients (
    clientID SERIAL PRIMARY KEY,
    clientName VARCHAR(255) NOT NULL,
    clientEmail VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS projects (
    projectID SERIAL PRIMARY KEY,
    projectDate DATE,
    projectDescription VARCHAR(255) NOT NULL,
    projectContact VARCHAR(255),
    staffBudget FLOAT,
    profitMargin FLOAT,
    creatorID INT REFERENCES users(userID),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS clientXproject (
    clientID INT REFERENCES clients(clientID),
    projectID INT REFERENCES projects(projectID),
    PRIMARY KEY (clientID, projectID)
);

CREATE TABLE IF NOT EXISTS arrangements (
    arrangementID SERIAL PRIMARY KEY,
    projectID INT REFERENCES projects(projectID),
    creatorID INT REFERENCES users(userID),
    arrangementType VARCHAR(255) NOT NULL,
    arrangementDescription VARCHAR(255) NOT NULL,
    flowerBudget FLOAT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flowers (
    flowerID SERIAL PRIMARY KEY,
    flowerName VARCHAR(255) NOT NULL,
    flowerImage VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flowerPrice (
    priceID SERIAL PRIMARY KEY,
    flowerID INT REFERENCES flowers(flowerID),
    invoiceID INT REFERENCES invoices(invoiceID),
    price FLOAT,
    priceDate TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS flowerXarrangement (
    arrangementID INT REFERENCES arrangements(arrangementID),
    flowerID INT REFERENCES flowers(flowerID),
    priceID INT REFERENCES flowerPrice(priceID),
    amount FLOAT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (arrangementID, flowerID, priceID)
);

CREATE TABLE IF NOT EXISTS workers (
    workerID SERIAL PRIMARY KEY,
    workerName VARCHAR(255),
    minimumHours FLOAT,
    dni VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workerRoles (
    roleID SERIAL PRIMARY KEY,
    roleName VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lastEdit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS roleXworker (
    roleID INT REFERENCES workerRoles(roleID),
    workerID INT REFERENCES workers(workerID),
    PRIMARY KEY (roleID, workerID)
);

CREATE TABLE IF NOT EXISTS workerXproject (
    projectID INT REFERENCES projects(projectID),
    workerID INT REFERENCES workers(workerID),
    hourlyRate FLOAT,
    hoursWorked FLOAT,
    notes VARCHAR(255)
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
