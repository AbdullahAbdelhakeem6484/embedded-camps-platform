import { Router } from 'express';
import authRoutes from './authRoutes';
import brandRoutes from './brandRoutes';
import announcementRoutes from './announcementRoutes';
import noteRoutes from './noteRoutes';
import analyticsRoutes from './analyticsRoutes';
import orderRoutes from './orderRoutes';
import campRoutes from './campRoutes';
import streamingRoutes from './streamingRoutes';
import userRoutes from './userRoutes';
import labRoutes from './labRoutes';
import quizRoutes from './quizRoutes';
import sessionRoutes from './sessionRoutes';
import progressRoutes from './progressRoutes';
import certificateRoutes from './certificateRoutes';
import bookmarkRoutes from './bookmarkRoutes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/brands', brandRoutes);
router.use('/announcements', announcementRoutes);
router.use('/notes', noteRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/orders', orderRoutes);
router.use('/camps', campRoutes);
router.use('/sessions', sessionRoutes);
router.use('/streaming', streamingRoutes);
router.use('/users', userRoutes);
router.use('/labs', labRoutes);
router.use('/quizzes', quizRoutes);
router.use('/progress', progressRoutes);
router.use('/certificates', certificateRoutes);
router.use('/bookmarks', bookmarkRoutes);

export default router;
