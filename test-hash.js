const bcrypt = require("bcryptjs");
const hash = "$2a$10$utcqRyxGzC2yp2uCRaye8ujewpiriFs2BpWX0w.VgO4H1I8PTm.eO";
bcrypt.compare("123456", hash).then(res => {
    console.log("Match:", res);
});
