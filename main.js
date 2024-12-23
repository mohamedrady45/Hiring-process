const express = require("express");
const connectDB = require("./config/db");
const dotenv = require("dotenv");
const applicantRouter = require("./routers/applicantRouter");
const trainingRouter = require("./routers/trainingRouter");
const scheduleRouter = require("./routers/scheduleRouter");
const userRouter = require("./routers/userRouter");
const { swaggerUi, swaggerDocs } = require("./config/swagger");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// Swagger Documentation
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/user", userRouter);
app.use("/api/schedule", scheduleRouter);
app.use("/api/trainingGroup", trainingRouter);
app.use("/api/applicant", applicantRouter);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
