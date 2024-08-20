const aggregateFlowerData = (flowerData) => {
    const aggregatedData = {}

    flowerData?.forEach(flower => {
        let { flowerid, projectid, flowername, amount, unitprice, numstems } = flower

        if (flowerid && projectid) {

            if (!aggregatedData[projectid]) {
                aggregatedData[projectid] = [];
            }
            
            const existingFlowerIndex = aggregatedData[projectid].findIndex(item => item.flowerid === flowerid &&  item.numstems == numstems);
            if (existingFlowerIndex === -1) {
                aggregatedData[projectid].push({
                    flowerid,
                    projectid,
                    unitprice: unitprice || 0,
                    numstems: numstems || 0,
                    totalstems: amount || 0,
                    flowername,
                });
            } else {
                aggregatedData[projectid][existingFlowerIndex].numstems += numstems || 0;
            }
        }
    });

    // Making the object into an array of arrays
    const aggregatedFlowerArrayByProject = Object.values(aggregatedData);
    return { aggregatedFlowerArrayByProject };
};

export { aggregateFlowerData };
