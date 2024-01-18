const aggregateFlowerData = (flowerData) => {
    const aggregatedData = {};
    flowerData?.forEach((flower) => {
        const { flowerid, flowername, amount, unitprice } = flower;
        if (flowerid){
            if (!aggregatedData[flowerid]) {
                aggregatedData[flowerid] = {
                    flowername,
                    totalstems: amount,
                    unitprice,
                    estimatedcost: unitprice * amount
                };
            } else {
                aggregatedData[flowerid].totalstems += amount;
                aggregatedData[flowerid].estimatedcost += unitprice * amount;
            }
        }
    });
    const aggregatedFlowerArray = Object.values(aggregatedData);
    return aggregatedFlowerArray
};

export {aggregateFlowerData}