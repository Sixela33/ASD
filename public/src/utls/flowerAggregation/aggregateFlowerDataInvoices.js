const aggregateFlowerData = (flowerData) => {
    const aggregatedData = {}

    flowerData?.forEach(flower => {
        let { flowerid, projectid, flowername, amount, unitprice, stemsperbox, boxprice, boxespurchased } = flower

        if (flowerid && projectid) {

            if (!aggregatedData[projectid]) {
                aggregatedData[projectid] = [];
            }
            
            const existingFlowerIndex = aggregatedData[projectid].findIndex(item => item.flowerid === flowerid && item.boxprice == boxprice && item.stemsperbox == stemsperbox);
            if (existingFlowerIndex === -1) {
                aggregatedData[projectid].push({
                    flowerid,
                    projectid,
                    stemsperbox: stemsperbox || 0,
                    boxprice: boxprice || 0,
                    boxespurchased: boxespurchased || 0,
                    totalstems: amount || 0,
                    flowername,
                });
            } else {
                aggregatedData[projectid][existingFlowerIndex].boxespurchased += boxespurchased || 0;
            }
        }
    });

    // Making the object into an array of arrays
    const aggregatedFlowerArrayByProject = Object.values(aggregatedData);
    return { aggregatedFlowerArrayByProject };
};

export { aggregateFlowerData };
