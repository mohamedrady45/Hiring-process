const express = require('express');
const router = express.Router();
const trainingController = require('../controllers/trainingController');

/**
 * @swagger
 * components:
 *   schemas:
 *     TimeSlot:
 *       type: object
 *       properties:
 *         startTime:
 *           type: string
 *           example: "11:11"
 *         endTime:
 *           type: string
 *           example: "23:12"
 *     DaySchedule:
 *       type: object
 *       properties:
 *         selected:
 *           type: boolean
 *           example: true
 *         times:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TimeSlot'
 *     CoachSchedule:
 *       type: object
 *       properties:
 *         email:
 *           type: string
 *           example: "coach@example.com"
 *         timeSchedule:
 *           type: object
 *           properties:
 *             saturday:
 *               $ref: '#/components/schemas/DaySchedule'
 *             sunday:
 *               $ref: '#/components/schemas/DaySchedule'
 *             monday:
 *               $ref: '#/components/schemas/DaySchedule'
 *             tuesday:
 *               $ref: '#/components/schemas/DaySchedule'
 *             wednesday:
 *               $ref: '#/components/schemas/DaySchedule'
 *             thursday:
 *               $ref: '#/components/schemas/DaySchedule'
 *             friday:
 *               $ref: '#/components/schemas/DaySchedule'
 */

/**
 * @swagger
 * /api/schedule:
 *   post:
 *     summary: Save or update a coach's schedule
 *     tags: [Coach Schedule]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CoachSchedule'
 *     responses:
 *       200:
 *         description: Schedule saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Schedule saved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/CoachSchedule'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/', trainingController.saveSchedule);

module.exports = router;
