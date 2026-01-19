const express = require('express');
const userRoutes = require('./routes/user.routes');
const dotenv =require('dotenv');
dotenv.config();
const connectToDB = require("./config/db");
connectToDB();
const cookieParser =require('cookie-parser');

const app = express();
const indexRouter = require('./routes/index.routes')

app.set('view engine', 'ejs');
app.use(cookieParser())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const uploadRoutes = require("./routes/upload.routes");
const fileRoutes = require("./routes/file.routes");


app.use('/',indexRouter)
app.use("/", uploadRoutes);
app.use("/", fileRoutes);


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server is running on port", PORT);
});