const crypto = require("crypto");

module.exports = (password,KEY="lightBlue") => {
    const hmac = crypto.createHmac("sha256",KEY);
    hmac.update(password);
    const passwordHmac = hmac.digest("hex");
    return passwordHmac;
};