const express = require("express");
const router = express.Router();
const trainingController = require("../controllers/trainingController");

/**
 * @swagger
 * components:
 *   schemas:
 *     GroupDetails:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: "Frontend Bootcamp"
 *         category:
 *           type: string
 *           example: "frontend"
 *         daysAndTimes:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               day:
 *                 type: string
 *                 enum: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"]
 *                 example: "saturday"
 *               time:
 *                 type: string
 *                 example: "6:00 PM"
 *         level:
 *           type: integer
 *           example: 2
 *     Session:
 *       type: object
 *       properties:
 *         day:
 *           type: string
 *           enum: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"]
 *           example: "monday"
 *         time:
 *           type: string
 *           example: "10:00 AM"
 *         feedback:
 *           type: string
 *           enum: ["done", "cancelled", "postponed"]
 *           example: "done"
 *         customFeedback:
 *           type: string
 *           example: "Great session, learned a lot!"
 *     Group:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         category:
 *           type: string
 *         level:
 *           type: integer
 *         startDate:
 *           type: string
 *           format: date
 *         sessions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Session'
 */

/**
 * @swagger
 * /api/trainingGroup/groupsDetails:
 *   get:
 *     summary: Get all groups sorted by recently added
 *     tags: [Training Group]
 *     responses:
 *       200:
 *         description: Groups retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Groups retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/GroupDetails'
 *       500:
 *         description: Internal server error
 */
router.get('/groupsDetails', trainingController.getGroupsWithDetails);
/**
 * @swagger
 * /api/trainingGroup/createGroup:
 *   post:
 *     summary: Create a new training group
 *     tags: [Training Group]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               level:
 *                 type: integer
 *                 example: 2
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               numberOfWeeks:
 *                 type: integer
 *                 example: 12
 *               category:
 *                 type: string
 *                 enum: ["university", "school pst", "school diploma", "grads", "CFK", "private", "flutter", "frontend", "backend"]
 *                 example: "frontend"
 *               seats:
 *                 type: integer
 *                 example: 20
 *               classNumber:
 *                 type: integer
 *                 example: 1
 *               initialSessions:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Session'
 *     responses:
 *       201:
 *         description: Group created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Group created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Group'
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Internal server error
 */
router.post('/createGroup', trainingController.createGroup);


/**
 * @swagger
 * /api/trainingGroup/sessionsToday:
 *   get:
 *     summary: Get all training groups that have sessions today
 *     tags: [Training Group]
 *     responses:
 *       200:
 *         description: Sessions for today retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sessions for today retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       groupName:
 *                         type: string
 *                         example: "Frontend Bootcamp"
 *                       category:
 *                         type: string
 *                         example: "frontend"
 *                       day:
 *                         type: string
 *                         enum: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"]
 *                         example: "saturday"
 *                       time:
 *                         type: string
 *                         example: "18:00"
 *                       feedback:
 *                         type: string
 *                         enum: ["done", "cancelled", "postponed"]
 *                         example: "no feedback yet"
 *       500:
 *         description: Internal server error
 */
router.get('/sessionsToday', trainingController.getSessionsForToday);

/**
 * @swagger
 * /api/trainingGroup/sessionsTomorrow:
 *   get:
 *     summary: Get all training groups that have sessions tomorrow
 *     tags: [Training Group]
 *     responses:
 *       200:
 *         description: Sessions for tomorrow retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sessions for tomorrow retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       groupName:
 *                         type: string
 *                         example: "Frontend Bootcamp"
 *                       category:
 *                         type: string
 *                         example: "frontend"
 *                       day:
 *                         type: string
 *                         enum: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"]
 *                         example: "sunday"
 *                       time:
 *                         type: string
 *                         example: "18:00"
 *                       feedback:
 *                         type: string
 *                         enum: ["done", "cancelled", "postponed"]
 *                         example: "no feedback yet"
 *       500:
 *         description: Internal server error
 */
router.get('/sessionsTomorrow', trainingController.getSessionsForTomorrow);

/**
 * @swagger
 * /api/trainingGroup/sessionsYesterday:
 *   get:
 *     summary: Get all training groups that had sessions yesterday
 *     tags: [Training Group]
 *     responses:
 *       200:
 *         description: Sessions for yesterday retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sessions for yesterday retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       groupName:
 *                         type: string
 *                         example: "Frontend Bootcamp"
 *                       category:
 *                         type: string
 *                         example: "frontend"
 *                       day:
 *                         type: string
 *                         enum: ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"]
 *                         example: "friday"
 *                       time:
 *                         type: string
 *                         example: "18:00"
 *                       feedback:
 *                         type: string
 *                         enum: ["done", "cancelled", "postponed"]
 *                         example: "no feedback yet"
 *       500:
 *         description: Internal server error
 */
router.get('/sessionsYesterday', trainingController.getSessionsForYesterday);


/**
 * @swagger
 * /api/trainingGroup/submitFeedback:
 *   post:
 *     summary: Submit feedback for a specific session
 *     tags: [Training Group]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: string
 *                 example: "60d3b41abdacab002f8b365d"
 *               sessionId:
 *                 type: string
 *                 example: "60d3b41abdacab002f8b365e"
 *               feedback:
 *                 type: string
 *                 enum: ["done", "cancelled", "postponed"]
 *                 example: "done"
 *               customFeedback:
 *                 type: string
 *                 example: "Great session, learned a lot!"
 *     responses:
 *       200:
 *         description: Feedback submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Feedback submitted successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Session'
 *       404:
 *         description: Group or session not found
 *       500:
 *         description: Internal server error
 */
router.post("/submitFeedback", trainingController.submitFeedback);

/**
 * @swagger
 * /api/trainingGroup/finishGroup/{id}:
 *   put:
 *     summary: Finish a training group
 *     tags: [Training Group]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the group to finish
 *     responses:
 *       200:
 *         description: Group finished successfully
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.put("/finishGroup/:id", trainingController.toggleGroupStatus);

/**
 * @swagger
 * /api/trainingGroup/getGroup/{id}:
 *   get:
 *     summary: Get a specific training group by ID
 *     tags: [Training Group]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the group to retrieve
 *     responses:
 *       200:
 *         description: Group retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           description: Name of the training group
 *         category:
 *           type: string
 *           description: Category of the training group
 *         level:
 *           type: string
 *           description: Level of the training group
 *         startDate:
 *           type: string
 *           format: date-time
 *           description: Start date of the training group
 *         sessions:
 *           type: array
 *           description: List of sessions in the training group
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: ID of the session
 *               sessionNumber:
 *                 type: integer
 *                 description: The session number in the group
 *               sessionDates:
 *                 type: array
 *                 description: List of dates for this session
 *                 items:
 *                   type: string
 *                   format: date-time
 *               time:
 *                 type: string
 *                 description: Time of the session
 *               feedback:
 *                 type: string
 *                 description: General feedback for the session
 *               customFeedback:
 *                 type: string
 *                 description: Custom feedback for the session
 */

router.get("/getGroup/:id", trainingController.getGroupById);

/**
 * @swagger
 * /api/trainingGroup/editGroup/{id}:
 *   put:
 *     summary: Edit details of an existing training group
 *     tags: [Training Group]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the group to edit
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Updated Bootcamp Name"
 *               category:
 *                 type: string
 *                 example: "backend"
 *               level:
 *                 type: integer
 *                 example: 3
 *               sessions:
 *                 type: array
 *                 items:
 *                   $ref: '#/components/schemas/Session'
 *     responses:
 *       200:
 *         description: Group updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Group updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Group'
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.put("/editGroup/:id", trainingController.editGroup);

/**
 * @swagger
 * /api/trainingGroup/pauseGroup/{id}:
 *   put:
 *     summary: Pause a training group and reschedule its sessions
 *     tags: [Training Group]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the group to pause
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-15"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-22"
 *     responses:
 *       200:
 *         description: Group paused and sessions rescheduled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Group paused and sessions rescheduled successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Group'
 *       400:
 *         description: Invalid input or date range
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.put("/pauseGroup/:id", trainingController.pauseGroup);

/**
 * @swagger
 * /api/trainingGroup/resumeGroup/{id}:
 *   put:
 *     summary: Resume a paused training group and reschedule its sessions
 *     tags: [Training Group]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the group to resume
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resumeDate:
 *                 type: string
 *                 format: date
 *                 example: "2024-01-25"
 *     responses:
 *       200:
 *         description: Group resumed and sessions rescheduled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Group resumed and sessions rescheduled successfully"
 *                 data:
 *                   $ref: '#/components/schemas/Group'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.put("/resumeGroup/:id", trainingController.resumeGroup);


/**
 * @swagger
 * /api/trainingGroup/assignGroupToCoach:
 *   post:
 *     summary: Assign a group to a coach and lock the coach's available slots.
 *     description: This endpoint assigns a training group to a coach and locks the time slots in the coach's schedule for the group sessions.
 *     operationId: assignGroupToCoach
 *     tags:
 *       - Group
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - coachEmail
 *               - groupId
 *               - duration
 *             properties:
 *               coachEmail:
 *                 type: string
 *                 description: Email of the coach to assign the group to.
 *               groupId:
 *                 type: string
 *                 description: The ID of the group to be assigned.
 *               duration:
 *                 type: integer
 *                 description: Duration of the session in hours to be locked in the coach's schedule.
 *     responses:
 *       200:
 *         description: Successfully assigned the group and updated the coach's schedule.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Group successfully assigned to coach and schedule updated'
 *                 data:
 *                   type: object
 *                   properties:
 *                     group:
 *                       type: object
 *                       description: The group data assigned to the coach.
 *                     coachSchedule:
 *                       type: object
 *                       description: The updated coach schedule after locking the time slots.
 *       400:
 *         description: Bad Request (Missing fields or no available slots)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'No available slot for Monday at 06:00 for 2 hours'
 *       404:
 *         description: Group or Coach not found.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Group not found' or 'Coach not found'
 *       500:
 *         description: Internal Server Error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 'Internal server error'
 */

router.post('/assign-group-to-coach', assignGroupToCoach);

module.exports = router;