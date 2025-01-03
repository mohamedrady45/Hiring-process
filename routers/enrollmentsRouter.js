const express = require('express');
const router = express.Router();
const enrollmentController = require('../controllers/enrollmentController');

/**
 * @swagger
 * tags:
 *   - name: Students and Enrollments
 *     description: Endpoints for student enrollments and management
 */

/**
 * @swagger
 * /api/enrollments/requests/{groupId}:
 *   get:
 *     summary: Get enrollment requests for a group
 *     tags:
 *       - Students and Enrollments
 *     parameters:
 *       - name: groupId
 *         in: path
 *         description: The ID of the group
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enrollment requests fetched successfully
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.get('/requests/:groupId', enrollmentController.getEnrollmentRequests);

/**
 * @swagger
 * /api/enrollments/request:
 *   post:
 *     summary: Submit a request to enroll in a group
 *     tags:
 *       - Students and Enrollments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: string
 *               studentName:
 *                 type: string
 *               studentEmail:
 *                 type: string
 *               studentPhone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Request to enroll submitted successfully
 *       400:
 *         description: No available seats in the group
 *       500:
 *         description: Internal server error
 */
router.post('/request', enrollmentController.requestToEnroll);

/**
 * @swagger
 * /api/enrollments/confirm-payment/{groupId}/{requestId}:
 *   put:
 *     summary: Confirm payment and enroll a student
 *     tags:
 *       - Students and Enrollments
 *     parameters:
 *       - name: groupId
 *         in: path
 *         description: The ID of the group
 *         required: true
 *         schema:
 *           type: string
 *       - name: requestId
 *         in: path
 *         description: The ID of the enrollment request
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student successfully enrolled and history updated
 *       404:
 *         description: Group or request not found
 *       500:
 *         description: Internal server error
 */
router.put('/confirm-payment/:groupId/:requestId', enrollmentController.confirmPaymentAndEnroll);

/**
 * @swagger
 * /api/enrollments/enrolled-students/{groupId}:
 *   get:
 *     summary: Get enrolled students in a group
 *     tags:
 *       - Students and Enrollments
 *     parameters:
 *       - name: groupId
 *         in: path
 *         description: The ID of the group
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Enrolled students fetched successfully
 *       404:
 *         description: Group not found
 *       500:
 *         description: Internal server error
 */
router.get('/enrolled-students/:groupId', enrollmentController.getEnrolledStudents);

/**
 * @swagger
 * /api/enrollments/enroll/{groupId}:
 *   post:
 *     summary: Enroll a student directly into a group
 *     tags:
 *       - Students and Enrollments
 *     parameters:
 *       - name: groupId
 *         in: path
 *         description: The ID of the group
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               studentName:
 *                 type: string
 *               studentEmail:
 *                 type: string
 *               studentPhone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student enrolled successfully
 *       400:
 *         description: No available seats in the group
 *       500:
 *         description: Internal server error
 */
router.post('/enroll/:groupId', enrollmentController.enrollStudent);

/**
 * @swagger
 * /api/enrollments/transfer/{fromGroupId}/{toGroupId}/{studentEmail}:
 *   put:
 *     summary: Transfer a student from one group to another
 *     tags:
 *       - Students and Enrollments
 *     parameters:
 *       - name: fromGroupId
 *         in: path
 *         description: The ID of the source group
 *         required: true
 *         schema:
 *           type: string
 *       - name: toGroupId
 *         in: path
 *         description: The ID of the target group
 *         required: true
 *         schema:
 *           type: string
 *       - name: studentEmail
 *         in: path
 *         description: The email of the student to be transferred
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student successfully transferred
 *       404:
 *         description: Group or student not found
 *       500:
 *         description: Internal server error
 */
router.put('/transfer/:fromGroupId/:toGroupId/:studentEmail', enrollmentController.transferStudent);

/**
 * @swagger
 * /api/enrollments/remove:
 *   post:
 *     summary: Remove a student from a group
 *     tags:
 *       - Students and Enrollments
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               groupId:
 *                 type: string
 *               studentEmail:
 *                 type: string
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student successfully removed
 *       404:
 *         description: Group or student not found
 *       500:
 *         description: Internal server error
 */
router.post('/remove', enrollmentController.removeStudent);

/**
 * @swagger
 * /api/enrollments/student-history/{studentEmail}:
 *   get:
 *     summary: Get a student's details and enrollment history
 *     tags:
 *       - Students and Enrollments
 *     parameters:
 *       - name: studentEmail
 *         in: path
 *         description: The email of the student
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student details and history fetched successfully
 *       404:
 *         description: Student or history not found
 *       500:
 *         description: Internal server error
 */
router.get('/student-history/:studentEmail', enrollmentController.getStudentDetailsWithHistory);

module.exports = router;
