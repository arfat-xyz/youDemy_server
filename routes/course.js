import express from "express";
const router = express.Router();

// middlewares
import { requireSignin } from "../middlewares";

// controllers
import { uploadImage } from "../controllers/course";

router.post("/course/upload-image", uploadImage);
module.exports = router;
