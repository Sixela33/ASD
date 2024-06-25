const aggregateFlowerData = (flowerData) => {
    const aggregatedData = {}
    const uniqueFlowers = {}

    flowerData?.forEach(flower => {
        let { flowerid, flowername, amount, unitprice, projectid, numstems } = flower;

        // if the project has not appeard before, add an array
        if (flowerid && projectid) {
            if (!aggregatedData[projectid]) {
                aggregatedData[projectid] = [];
            }
            if (!unitprice){
                unitprice = 0
            }
            
            if (!uniqueFlowers[flowerid]) {
                uniqueFlowers[flowerid] = {flowerid, unitprice, flowername, addedStems: numstems || 0}
            } else {
                uniqueFlowers[flowerid].addedStems += numstems || 0
            }

            // find the index of the flower
            const existingFlowerIndex = aggregatedData[projectid].findIndex(item => item.flowerid === flowerid);
            if (existingFlowerIndex === -1) {
                aggregatedData[projectid].push({
                    flowerid,
                    flowername,
                    totalstems: amount || 0,
                    filledStems: numstems || 0,
                    projectid
                });
            } else {
                aggregatedData[projectid][existingFlowerIndex].totalstems += amount || 0;
                aggregatedData[projectid][existingFlowerIndex].filledStems += numstems || 0;
            }
        }
    });

    // Making the object into an array of arrays
    const aggregatedFlowerArrayByProject = Object.values(aggregatedData);
    const aggregatedUniqueFlowers = Object.values(uniqueFlowers);
    return {aggregatedFlowerArrayByProject, aggregatedUniqueFlowers};
};

export { aggregateFlowerData };
