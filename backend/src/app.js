// MAY NEED TO REMOVE!!
// MAY NEED TO REMOVE!!
// MAY NEED TO REMOVE!!


const express = require("express");
const cors = require("cors");

const { errorResponse } = require("./utils/apiResponse");

const app = express();

app.use(cors({
  origin: "http://localhost:3000"
}));

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    data: {
      message: "TrustTicket backend is running"
    },
    error: null
  });
});

app.use((req, res) => {
  return errorResponse(res, "NOT_FOUND", "Route not found", {}, 404);
});

module.exports = app;