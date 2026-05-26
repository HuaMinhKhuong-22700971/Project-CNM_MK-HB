const axios = require('axios');

(async () => {
    try {
        const res = await axios.get('http://localhost:4000/api/catalog/products/110');
        console.log("Product:", res.data.data.name);
        console.log("Attributes Length:", res.data.data.attributes?.length);
        console.log("Attributes Sample:", res.data.data.attributes?.slice(0, 5));
        console.log("Description Snippet:", res.data.data.description?.substring(0, 100));
    } catch (e) {
        console.log("Error:", e.message);
    }
})();
