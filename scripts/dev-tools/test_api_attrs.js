const axios = require('axios');

(async () => {
    try {
        const res = await axios.get('http://localhost:4000/api/catalog/products/razer-blade-15');
        console.log("Status:", res.status);
        console.log("Product Name:", res.data.name);
        console.log("Attributes Count:", res.data.attributes.length);
        console.log("First 3 Attributes:", res.data.attributes.slice(0, 3));
    } catch (e) {
        console.error("API Error:", e.message);
    }
})();
