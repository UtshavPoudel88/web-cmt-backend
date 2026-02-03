import { Router } from "express";
import { AdminController } from "../controllers/admin.controller";
import { adminGuard } from "../middleware/admin.guard";
import { upload } from "../middleware/upload.middleware";

const router = Router();
const adminController = new AdminController();

router.use(adminGuard);

router.post("/users", upload.single("image"), adminController.createUser.bind(adminController));
router.get("/users", adminController.listUsers.bind(adminController));
router.get("/users/:id", adminController.getUserById.bind(adminController));
router.put("/users/:id", upload.single("image"), adminController.updateUser.bind(adminController));
router.delete("/users/:id", adminController.deleteUser.bind(adminController));

export default router;
