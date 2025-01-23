const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const mongoose = require("mongoose");
const app = require("./app");
const PORT = 3001;

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);
mongoose.connect(DB).then((res) => {
  console.log("Database connection established..!");
});
mongoose.connection.on("error", (err) => {
  console.log("Connection error", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Disconnected from MongoDB");
});
app.listen(PORT, () => {
  console.log(`App listening on ${process.env.PORT || PORT}`);
});
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("Database connection closed due to app termination");
    process.exit(0);
  } catch (err) {
    console.error("Error closing MongoDB connection:", err);
    process.exit(1);
  }
});
