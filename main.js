const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const applicantRouter = require("./routers/applicantRouter");
const userRouter = require("./routers/userRouter");
const { swaggerUi, swaggerDocs } = require("./config/swagger");
const bodyParser = require("body-parser");
const cors = require("cors");
const authenticateJWT = require("./middlewares/authMiddleware");

dotenv.config();

connectDB();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(cors());

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/user", userRouter);

app.use("/api/applicant", applicantRouter);

const PORT = process.env.PORT || 3000;
console.log(PORT);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
