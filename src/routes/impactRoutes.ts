import { Router } from 'express';
import { generateImpactReport, getImpactReports } from '../controllers/impactController';

const router = Router();

router.post('/generate', generateImpactReport);
router.get('/', getImpactReports);

export default router;
