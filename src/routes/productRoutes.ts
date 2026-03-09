import { Router } from 'express';
import { categorizeProduct, getProducts } from '../controllers/productController';

const router = Router();

router.post('/categorize', categorizeProduct);
router.get('/', getProducts);

export default router;
