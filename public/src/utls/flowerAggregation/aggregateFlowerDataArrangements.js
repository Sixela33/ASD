const aggregateFlowerData = (flowerData) => {
    const aggregatedData = []
    const flowersByArrangement = {}

    flowerData?.forEach(flower => {
        flower.flowercolor = flower.flowercolors[0]
        const { flowerid, flowername, amount, unitprice, projectid, arrangementid, flowercolor } = flower;
        // if the project has not appeard before, add an array
        if (flowerid && projectid) {
     
            // find the index of the flower
            const existingFlowerIndex = aggregatedData.findIndex(item => item.flowerid === flowerid);
            if (existingFlowerIndex === -1) {
                aggregatedData.push({
                    flowerid,
                    flowername,
                    totalstems: amount,
                    unitprice,
                    estimatedcost: unitprice * amount,
                    projectid,
                    flowercolor
                });
            } else {
                aggregatedData[existingFlowerIndex].totalstems += amount;
                aggregatedData[existingFlowerIndex].estimatedcost += unitprice * amount;
            }
            if (!flowersByArrangement[arrangementid]) {
                flowersByArrangement[arrangementid] = [flower]
            } else {
                flowersByArrangement[arrangementid].push(flower)
            }
            
        }
    });

    // Making the object into an array of arrays
    const aggregatedFlowerArray = Object.values(aggregatedData);
   
    return {aggregatedFlowerArray, flowersByArrangement};
};

export {aggregateFlowerData} 
