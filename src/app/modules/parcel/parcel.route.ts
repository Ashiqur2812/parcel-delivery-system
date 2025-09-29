import express from 'express';
import { checkAuth } from '../../middleware/checkAuth';
import { Role } from '../user/user.interface';
import { validateRequest } from '../../middleware/validationRequest';
import { ParcelController } from './parcel.controller';
import { checkParcelOwnerOrAdmin } from '../../middleware/checkParcelOwnerOrAdmin';
import { ParcelValidation } from './parcel.validation';


const router = express.Router();

router.post('/create', checkAuth(Role.SENDER), validateRequest(ParcelValidation.createParcelValidationSchema), ParcelController.createParcel);

router.get('/my-parcels', checkAuth(Role.SENDER), ParcelController.getParcelsBySender);

router.patch('/cancel/:id', checkAuth(Role.SENDER), checkParcelOwnerOrAdmin, ParcelController.cancelParcel);

router.get('/incoming-parcels', checkAuth(Role.RECEIVER), ParcelController.getParcelsByReceiver);

router.patch('/confirm-delivery/:id', checkAuth(Role.RECEIVER), checkParcelOwnerOrAdmin, ParcelController.confirmDelivery);

// Admin Routes

router.get('/all-parcels', checkAuth(Role.ADMIN), ParcelController.getAllParcels);

router.get('/statistics', checkAuth(Role.ADMIN), ParcelController.getParcelStatistics);

router.get('/search', checkAuth(Role.ADMIN), ParcelController.searchParcels);

router.patch('/status/:id', checkAuth(Role.ADMIN), validateRequest(ParcelValidation.updateParcelStatusValidationSchema), ParcelController.updateParcelStatus);

router.patch('/block-unblock/:id', checkAuth(Role.ADMIN), validateRequest(ParcelValidation.blockParcelValidationSchema), ParcelController.blockUnblockParcel);

router.patch('/payment/:id', checkAuth(Role.ADMIN), validateRequest(ParcelValidation.paymentValidationSchema), ParcelController.updatePaymentStatus);

router.delete('/:id', checkAuth(Role.ADMIN), ParcelController.deleteParcel);

// public routes

router.get('/track/:trackingId', ParcelController.getParcelByTrackingId);

// authenticated user routes with ownership check
router.get('/:id', checkAuth(Role.ADMIN, Role.SENDER, Role.RECEIVER), checkParcelOwnerOrAdmin, ParcelController.getParcelById);

export const ParcelRoutes = router;
