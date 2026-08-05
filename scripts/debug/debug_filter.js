const axios = require('axios');

(async () => {
    try {
        console.log("Fetching filter options...");
        const optRes = await axios.get("http://localhost:4000/api/products/filter-options");
        const brands = optRes.data.data.brands;
        console.log("Brands available:", brands);
        
        if (brands && brands.length > 0) {
            const testBrand = brands.find(b => b.name === 'Intel') || brands[0];
            const testUrl = `http://localhost:4000/api/products?brand_id=${testBrand.id}&min_price=1000000`;
            console.log("Testing search URL:", testUrl);
            
            const pRes = await axios.get(testUrl);
            console.log("Found products:", pRes.data.data.items.length);
        }
    } catch (e) {
        console.error(e.message);
    }
})();
