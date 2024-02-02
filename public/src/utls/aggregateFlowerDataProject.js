const aggregateFlowerData = (flowerData) => {
    const aggregatedData = {};

    flowerData?.forEach(flower => {
        const { flowerid, flowername, amount, unitprice, projectid } = flower;

        // if the project has not appeard before, add an array
        if (flowerid && projectid) {
            if (!aggregatedData[projectid]) {
                aggregatedData[projectid] = [];
            }

            // find the index of the flower
            const existingFlowerIndex = aggregatedData[projectid].findIndex(item => item.flowerid === flowerid);
            if (existingFlowerIndex === -1) {
                aggregatedData[projectid].push({
                    flowerid,
                    flowername,
                    totalstems: amount,
                    unitprice,
                    estimatedcost: unitprice * amount,
                    projectid
                });
            } else {
                aggregatedData[projectid][existingFlowerIndex].totalstems += amount;
                aggregatedData[projectid][existingFlowerIndex].estimatedcost += unitprice * amount;
            }
        }
    });

    // Making the object into an array of arrays
    const aggregatedFlowerArray = Object.values(aggregatedData);
   
    return aggregatedFlowerArray;
};

export {aggregateFlowerData} 
