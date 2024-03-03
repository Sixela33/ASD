const aggregateFlowerData = (flowerData) => {
    const aggregatedData = []
    const separatedByArrangement = {}
    const flowersByArrangement = {}

    flowerData?.forEach(flower => {
        const { flowerid, flowername, amount, unitprice, projectid, arrangementid } = flower;

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
                    projectid
                });
                separatedByArrangement[flowerid] = [arrangementid]
            } else {
                aggregatedData[existingFlowerIndex].totalstems += amount;
                aggregatedData[existingFlowerIndex].estimatedcost += unitprice * amount;
                separatedByArrangement[flowerid].push(arrangementid)
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
    console.log("separatedByArrangement", separatedByArrangement)
    console.log("flowersByArrangement", flowersByArrangement)
   
    return {aggregatedFlowerArray, separatedByArrangement, flowersByArrangement};
};

export {aggregateFlowerData} 
