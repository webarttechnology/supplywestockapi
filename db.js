const mongoose = require("mongoose");
const configData = require("./config/config.json")
const mongoose_url = configData.MONGOOSE_URL;

mongoose.connect(mongoose_url, { useNewUrlParser: true, useUnifiedTopology: true }).then(() => {
	if(configData.NODE_ENV !== "test") {
		console.log("Database connected");
	}
})
.catch(err => {
	console.error("App starting error:", err.message);
	process.exit(1);
});
var db = mongoose.connection; 