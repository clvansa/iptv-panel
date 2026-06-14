require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

const importRoutes = require("./routes/import.routes");
const channelRoutes = require("./routes/channel.routes");
const exportRoutes = require("./routes/export.routes");
const languageRoutes = require("./routes/language.routes");
const playlistRoutes = require("./routes/playlist.routes");
const countryRoutes = require("./routes/country.routes");
const categoryRoutes = require("./routes/category.routes");


app.use("/api/channels", channelRoutes);
app.use("/api/import", importRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/playlists", playlistRoutes);
app.use("/api/languages", languageRoutes);
app.use("/api/countries", countryRoutes);
app.use("/api/categories", categoryRoutes);

module.exports = app;