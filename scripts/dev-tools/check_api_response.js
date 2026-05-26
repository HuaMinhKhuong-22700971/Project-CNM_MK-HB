const axios = require('axios');

(async () => {
    try {
        const res = await axios.get('http://localhost:4000/api/products/razer-blade-15');
        const d = res.data.data;
        const v = d.variants?.[0];
        console.log("product_id:", d.product_id);
        console.log("product_name:", d.product_name);
        if (v) {
            console.log("variant_id:", v.variant_id);
            console.log("variant stock:", v.stock);
            console.log("variant stock_quantity:", v.stock_quantity);
            console.log("variant status:", v.status);
            console.log("variant price:", v.price);
        } else {
            console.log("NO VARIANTS FOUND");
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
})();
