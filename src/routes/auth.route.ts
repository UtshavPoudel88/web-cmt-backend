import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { AdminController } from "../controllers/admin.controller";
import { adminGuard } from "../middleware/admin.guard";
import { upload } from "../middleware/upload.middleware";

let authController = new AuthController();
let adminController = new AdminController();
const router = Router();

router.post("/register", authController.register)
router.post("/login", authController.login)
router.put("/:id", upload.single("image"), authController.updateProfile)
router.post("/user", adminGuard, upload.single("image"), adminController.createUser.bind(adminController))
export default router;