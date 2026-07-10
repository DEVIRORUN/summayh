import { Router } from 'express';
import { FoundersPassController } from '../controllers/foundersPass.controller';
import { protectRoute } from '../middleware/auth';

const router = Router();

/**
 * @openapi
 * /api/founders-pass/initialize:
 *  post:
 *      summary: Pays through paystack
 *      tags: [Founders Pass]
 *      security:
 *          - bearerAuht: []
 */
router.post('/initialize', protectRoute,  FoundersPassController.initialize);
/**
 * @openapi
 * /api/founders-pass/avaialbility:
 *  post:
 *      summary: Pays through paystack
 *      tags: [Founders Pass]
 */
router.get('/availability', FoundersPassController.availability);

export default router;