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
 * tags:
 *   - name: Coach Schedule
 *     description: Operations related to the coach's schedule
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

/**
 * @swagger
 * /api/schedule/getSchedule:
 *   get:
 *     summary: Get the schedule for a specific coach by email
 *     tags: [Coach Schedule]
 *     parameters:
 *       - in: query
 *         name: email
 *         required: true
 *         schema:
 *           type: string
 *           example: "coach@example.com"
 *     responses:
 *       200:
 *         description: Schedule for the coach retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Schedule retrieved successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     email:
 *                       type: string
 *                       example: "coach@example.com"
 *                     schedule:
 *                       type: object
 *                       properties:
 *                         saturday:
 *                           type: object
 *                           properties:
 *                             selected:
 *                               type: boolean
 *                               example: true
 *                             intervals:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["9:00 AM - 11:00 AM", "2:00 PM - 4:00 PM"]
 *                         sunday:
 *                           type: object
 *                           properties:
 *                             selected:
 *                               type: boolean
 *                               example: false
 *                             intervals:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: []
 *                         monday:
 *                           type: object
 *                           properties:
 *                             selected:
 *                               type: boolean
 *                               example: true
 *                             intervals:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["1:00 PM - 3:00 PM"]
 *                         tuesday:
 *                           type: object
 *                           properties:
 *                             selected:
 *                               type: boolean
 *                               example: true
 *                             intervals:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["9:00 AM - 11:00 AM"]
 *                         wednesday:
 *                           type: object
 *                           properties:
 *                             selected:
 *                               type: boolean
 *                               example: false
 *                             intervals:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: []
 *                         thursday:
 *                           type: object
 *                           properties:
 *                             selected:
 *                               type: boolean
 *                               example: true
 *                             intervals:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["9:00 AM - 12:00 PM"]
 *                         friday:
 *                           type: object
 *                           properties:
 *                             selected:
 *                               type: boolean
 *                               example: true
 *                             intervals:
 *                               type: array
 *                               items:
 *                                 type: string
 *                               example: ["10:00 AM - 12:00 PM"]
 *       400:
 *         description: Email is required
 *       404:
 *         description: Coach schedule not found
 *       500:
 *         description: Internal server error
 */
router.get('/getSchedule', trainingController.getCoachScheduleByEmail);

module.exports = router;
