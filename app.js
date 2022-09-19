const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');
const cookieParser = require('cookie-parser')
require("dotenv/config");
const allowlist = ['https://ncf-hldzlp49w-davidedortona.vercel.app/', 'https://ncfapp-n1zejh6jv-davidedortona.vercel.app/', 'https://ncfappfe-clkfc6awu-davidedortona.vercel.app/', 'https://davidedortona.github.io'];
app.use(cors(allowlist));
app.options("*", cors());

app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(errorHandler);
app.use(cookieParser());

const categoriesRoutes = require("./routes/categories");
const bannersRoutes = require("./routes/banners");
const eventsRoutes = require("./routes/events");
const visitorRoutes = require("./routes/visitors");
const userRoutes = require("./routes/users");
const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/banners`, bannersRoutes);
app.use(`${api}/events`, eventsRoutes);
app.use(`${api}/users`, userRoutes);
app.use(`${api}/visitor`, visitorRoutes);



//Database
mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify:false,
    dbName: "nicolascuozzofotografodb",
  })
  .then(() => {
    console.log("Database Connection is ready...");
    console.log(api);
    
  })
  .catch((err) => {
    console.log(err);
  });

app.listen((process.env.PORT || 3000), () => {
    console.log("server is running");
  });