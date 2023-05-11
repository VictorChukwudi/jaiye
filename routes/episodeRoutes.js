import { Router } from 'express'
const router = Router()
import {
  getEpisodes,
  getEpisodeById,
  deleteEpisode,
  createEpisode,
  updateEpisode,
  createEpisodeReview,
  getTopEpisodes,
} from '../controllers/episodeController.js'
import { protect, admin } from '../middleware/authMiddleware.js'

router.route('/').get(getEpisodes).post(protect, admin, createEpisode)
router.route('/:id/reviews').post(protect, createEpisodeReview)
router.get('/top', getTopEpisodes)
router
  .route('/:id')
  .get(getEpisodeById)
  .delete(protect, admin, deleteEpisode)
  .put(protect, admin, updateEpisode)

export default router