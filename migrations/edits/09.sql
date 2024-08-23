ALTER TABLE flowers 
ADD COLUMN clientName VARCHAR(50);

CREATE TABLE IF NOT EXISTS seasons (
    seasonsID SERIAL PRIMARY KEY,
    seasonName VARCHAR(20) NOT NULL UNIQUE
);

INSERT INTO seasons (seasonName) (SELECT * FROM (VALUES
   ('Summer'),
   ('Spring'),
   ('Winter'),
   ('Fall')
) AS temp(seasonName));

CREATE TABLE IF NOT EXISTS seasonsXFlower (
    seasonsID INT REFERENCES seasons(seasonsID),
    flowerID INT REFERENCES flowers(flowerID)
);