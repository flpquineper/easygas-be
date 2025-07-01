// src/routes/carts.ts

import { Router } from "express";
import * as cartController from "../controllers/cart.controller";
import { authMiddleware } from "../middlewares/auth";

const router = Router();

router.get(
    "/", 
    authMiddleware, 
    cartController.getUserCart
);

router.post(
    "/item",
    authMiddleware,
    cartController.addItemToUserCart
);

router.patch(
    "/item/:itemId",
    authMiddleware,
    cartController.updateItem 
);

router.delete(
    "/item/:itemId",
    authMiddleware,
    cartController.removeItem 
);

router.delete(
    "/",
    authMiddleware,
    cartController.clearUserCart 
);


router.post(
    "/guest", 
    cartController.createCart
);

router.get(
    "/guest/:cartId", 
    cartController.getCart
);

router.post(
    "/guest/:cartId/item", 
    cartController.addItem
);

router.patch(
  "/:cartId/associate-user", 
  authMiddleware,
  cartController.associateUser
);


export default router;