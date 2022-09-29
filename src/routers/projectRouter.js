const express = require('express');
const projectController = require('../controllers/projectController');
const protect = require('../middlewares/protect');
const restrictTo = require('../middlewares/restrictTo');
const multer  = require('multer')
var storage = multer.diskStorage(
  {
      destination: './uploads/',
      filename: function ( req, file, cb ) {
          //req.body is empty...
          //How could I get the new_file_name property sent from client here?
          cb( null, file.originalname+".pdf");
      }
  }
);

// NPM package multer handles the file uploads
var upload = multer( { storage: storage } );

const router = express.Router();
router.use(protect);

router
  .route('/')
  .get(projectController.getAllProjects)
  .post(restrictTo('qaManager'), projectController.createProject);

router
  .route('/:id')
  .get(projectController.getProject)
  .patch(restrictTo('admin'), projectController.updateProject)
  .delete(restrictTo('admin'), projectController.deleteProject);

router
  .route('/:id/tests')
  .get(projectController.getAllTests)
  .post(projectController.createTest);

router
  .route('/test/:id')
  .get(projectController.getTest)
  .patch(projectController.updateTest)
  .delete(restrictTo('qaManager', 'admin'), projectController.deleteTest);

router
  .route('/test/update/:id')
  .get(projectController.downloadReport)
  .post(upload.single('uploaded_file'), projectController.genFile)
  .patch(projectController.updateTestStatus);



router
  .route('/tests/:tid/scenario')
  .get(projectController.getAllScenarios)
  .post(projectController.createScenario);

router
  .route('/scenario/:id')
  .get(projectController.getScenario)
  .patch(projectController.updateScenario)
  .delete(projectController.deleteScenario);

module.exports = router;
