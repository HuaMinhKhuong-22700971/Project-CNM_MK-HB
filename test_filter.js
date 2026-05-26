const axios = require('axios');

(async () => {
    try {
        const res = await axios.get("http://localhost:4000/api/products?brand_id=1&min_price=1000000");
        console.log(`✅ Success. Total items found:`, res.data.data.pagination.totalItems);
        if (res.data.data.items.length > 0) {
            console.log("First item:", res.data.data.items[0].product_name);
        }
    } catch (e) {
        console.error(e.message);
    }
})();
