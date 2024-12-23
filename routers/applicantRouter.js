const express = require("express");
const multer = require("multer");
const router = express.Router();
const applicantController = require("../controllers/applicantController");
const { storage } = require("../config/cloudinary");
const authenticateJWT = require("../middlewares/authMiddleware");

const upload = multer({ storage });

/**
 * @swagger
 * /api/applicant:
 *   post:
 *     summary: Create a new applicant with CV upload
 *     tags: [Applicants]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               cv:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Applicant created
 *       400:
 *         description: CV file is required
 *       500:
 *         description: Server error
 */
router.post("/", upload.single("cv"), applicantController.createApplicant);

router.use(authenticateJWT);

/**
 * @swagger
 * /api/applicant:
 *   get:
 *     summary: Get all applicants
 *     tags: [Applicants]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of applicants
 *       500:
 *         description: Server error
 */
router.get("/", applicantController.getAllApplicants);
/**
 * @swagger
 * /api/applicant/update-status:
 *   put:
 *     summary: Update the status of multiple applicants
 *     tags: [Applicants]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Accepted, Rejected]
 *                 description: The new status to set for the applicants
 *               applicantIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                 description: Array of applicant IDs to update
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully updated multiple applicants' statuses
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 updatedCount:
 *                   type: integer
 *                   description: Number of applicants whose statuses were updated
 *       400:
 *         description: Invalid input; status or applicantIds not provided
 *       404:
 *         description: No applicants found with the provided IDs
 *       500:
 *         description: Server error
 */
router.put("/update-status", applicantController.updateApplicationStatus);

module.exports = router;
