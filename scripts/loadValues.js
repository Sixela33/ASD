import CnxPostgress from '../model/CnxPostgress.js';
import ModelPostgres from '../model/DAO/ModelPostgres.js';

const vendors = [
    "Associated",
    "GPage",
    "FleuraMetz",
    "Evergreen",
    "Dutch",
    "28th St wholesale",
    "Abraflora",
    "JRose",
    "Tropical Plants & Orchids",
    "Fragrance Plants & Flowers",
    "Foliage Paradise",
    "Foliage Garden and Tony's",
    "Holiday Flowers & Plants",
    "Flowers on Essex",
    "International Garden",
    "Holiday Foliage",
    "Caribbean Cuts",
    "Major",
    "Jamali Floral & Garden",
    "NYFG",
    "Whole Foods"
]

const CLIENTS = [

]

const ARRANGEMENT_TYPES = [
    "Mini Arrangement",
    "Petite Arrangement",
    "Bud Vase Arrangement",
    "Small Arrangement",
    "Medium Arrangement",
    "Medium Tall Arrangement",
    "Medium Large Arrangement",
    "Large Arrangement",
    "Large Low Arrangement",
    "Extra Large Arrangement",
    "Plant",
    "Organic Installation",
    "Chuppah",
    "Personals",
    "Bouquet",
    "Large Installation"
]

const loadVendors = async (model) => {
    console.log('loading Vendors')
    try {
        for (let v of vendors) {
            await model.addVendor(v)
        }
    } catch (error) {
        console.error('error while loading providers: \n', error)
    }
}

const loadClients = async (model) => {
    console.log('loading clients')
    try {
        for (let c of CLIENTS) {
            await model.createClient(c)
        }
    } catch (error) {
        console.error('error while loading clients: \n', error)

    }
}

const loadArrangementTypes = async (model) => {
    console.log('loading ArrangementTypes')
    try {
        for (let at of ARRANGEMENT_TYPES) {
            await model.loadArrangementType(at)
        }
    } catch (error) {
        console.error('error while loading arrangementTypes: \n', error)

    }
}

const runScript = async() => {
    try {
        await CnxPostgress.connect();
        const model = new ModelPostgres();
        await loadClients(model)
        await loadArrangementTypes(model)
        await loadVendors(model)
    } catch (error) {
        console.log(error)
    } finally {
        console.log('Closing database connection')
        await CnxPostgress.disconnect();

    }

}

(async () => {
    await runScript();
})();