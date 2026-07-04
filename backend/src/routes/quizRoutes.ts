import { Router } from 'express';
import { createQuiz, deleteQuiz, getQuizBySession, submitQuizAttempt, getMyQuizAttempts, createQuizSchema, submitQuizSchema } from '../controllers/quizController';
import { authenticate, authorize } from '../middlewares/auth';
import { validate } from '../middlewares/validate';

const router = Router();

router.post('/', authenticate, authorize(['ADMIN']), validate(createQuizSchema), createQuiz);
router.delete('/:id', authenticate, authorize(['ADMIN']), deleteQuiz);
router.get('/session/:sessionId', authenticate, getQuizBySession);
router.post('/submit', authenticate, validate(submitQuizSchema), submitQuizAttempt);
router.get('/my-attempts', authenticate, getMyQuizAttempts);

export default router;
