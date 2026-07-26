import { Router } from 'express';
import { getUserProfileAndUserBasedOnUsername, register } from '../controllers/user.controller.js';
import { login } from '../controllers/user.controller.js';
import multer from 'multer';
import ConnectionRequest from "../models/connections.model.js";
import { updateProfilePicture } from '../controllers/user.controller.js';
import { uploadProfilePicture, uploadProfileBanner } from '../controllers/user.controller.js';
import { getUserAndProfile } from '../controllers/user.controller.js';
import { updateProfileData } from '../controllers/user.controller.js';
import { getAllUserProfile } from '../controllers/user.controller.js';
import { downloadProfile } from '../controllers/user.controller.js';
import { sendConnectionRequest } from '../controllers/user.controller.js';
import { getMyConnectionRequests } from '../controllers/user.controller.js';
import { whatAreMyConnections } from '../controllers/user.controller.js';
import { acceptConnectionRequest } from '../controllers/user.controller.js';
const router = Router();

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage: storage });

router.route("/update-profile-picture")
    .post(upload.single('profileImage'), uploadProfilePicture);

router.route("/update-profile-banner")
    .post(upload.single('bannerImage'), uploadProfileBanner);

router.route('/register').post(upload.single('profileImage'), register);
router.route('/login').post(login);
router.route("/user_upload").post(updateProfilePicture)
router.get('/get_user_and_profile', getUserAndProfile);
router.post('/update_profile_data', updateProfileData);
router.route("/user/get_all_users").get(getAllUserProfile);
router.route("/user/download_resume").get(downloadProfile);
router.route("/user/send_connection_request").post(sendConnectionRequest);
router.route("/user/getConnectionRequests").get(getMyConnectionRequests);
router.route("/user/user_connection_request").get(whatAreMyConnections);
router.route("/user/accept_connection_request").post(acceptConnectionRequest);
router.route("/user/get_profile_based_on_username").get(getUserProfileAndUserBasedOnUsername);


export default router;