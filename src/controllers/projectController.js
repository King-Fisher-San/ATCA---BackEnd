const Project = require('../models/Project');
const Test = require('../models/Test');
const Scenario = require('../models/Scenario');
const fs = require('fs');
const catchAsync = require('../helpers/catchAsync');
const {
  projectValidation,
  testValidation,
  scenarioValidation,
  testUpdateValidation,
} = require('../validations/projectValidations');
const AppError = require('../helpers/appError');

const nodemailer = require("nodemailer");
const oauth2Client = require('../../googleapi');

const YOUR_CLIENT_ID = process.env.YOUR_CLIENT_ID;
const YOUR_CLIENT_SECRET = process.env.YOUR_CLIENT_SECRET;
const YOUR_REFRESH_TOKEN = process.env.YOUR_REFRESH_TOKEN;

const User = require('../models/User');

const assignTester = async (body, project) => {
  let testers = await User.find({ role: 'tester' });
  let assigned = [];

  for (let i = 0; i < testers.length; i++) {
    if (testers[i].language === body.language) {
      assigned.push(testers[i]);
    }
  }

  if (assigned.length === 0) {
    return new AppError('No tester found for this language', 400);
  }

  // expertise level
  let expertise = [];
  for (let i = 0; i < assigned.length; i++) {
    if (assigned[i].level >= body.difficultyLevel) {
      expertise.push(assigned[i]);
    }
  }

  if (expertise.length === 0) {
    return new AppError('No tester found for this expertise level', 400);
  }

  expertise.sort((a, b) => {
    return a.tests.length - b.tests.length;
  });

  console.log(expertise);

  for(let i=0; expertise.length>i; i++){
    let count = 0;
    for(let j=0;expertise[i].tests.length>j;j++){
      let cas = expertise[i].tests[j].status
      console.log(cas)
      if(cas === "pending"){
        count++;
      }
    }
    if(count < 3){
      return expertise[i];
    }
  }

  
  return new AppError("Testers are currently busy with the work",400);
};

//* PROJECTS

exports.getAllProjects = catchAsync(async (req, res) => {
  const projects = await Project.find();

  res.status(200).json({
    status: 'success',
    results: projects.length,
    projects,
  });
});

exports.createProject = catchAsync(async (req, res, next) => {
  const validate = projectValidation.validate(req.body);
  if (validate.error) {
    return next(new AppError(validate.error, 400));
  }

  const project = await Project.create(req.body);

  res.status(200).json({
    status: 'success',
    project,
  });
});

exports.getProject = catchAsync(async (req, res, next) => {
  const project = await Project.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    project,
  });
});

exports.updateProject = catchAsync(async (req, res, next) => {
  const validate = projectValidation.validate(req.body);
  if (validate.error) {
    return next(new AppError(validate.error, 400));
  }

  const updatedproject = await Project.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    {
      runValidators: true,
      new: true,
    }
  );

  if (!updatedproject)
    return next(
      new AppError(`Can't find any project with id ${projectId}`, 404)
    );

  res.status(200).json({
    status: 'success',
    project: updatedproject,
  });
});

exports.deleteProject = catchAsync(async (req, res, next) => {
  const deletedproject = await Project.findByIdAndDelete(req.params.id);

  if (!deletedproject)
    return next(new AppError(`No project found against id ${projectId}`, 404));

  res.status(200).json({
    status: 'success',
    project: deletedproject,
  });
});

//* TESTS

exports.getAllTests = catchAsync(async (req, res) => {
  const project = await Project.findById(req.params.id);

  const tests = project.tests;

  res.status(200).json({
    status: 'success',
    results: tests.length,
    tests,
  });
});

exports.createTest = catchAsync(async (req, res, next) => {
  const validate = testValidation.validate(req.body);
  if (validate.error) {
    return next(new AppError(validate.error, 400));
  }

  const project = await Project.findById(req.params.id);
  if (!project) {
    return next(new AppError(`No project found against id ${projectId}`, 404));
  }

  // If tester is assigned then only test will be created
  let tester = await assignTester(req.body, project);

  if (tester instanceof AppError) {
    console.log('No tester found for this language');
    return next(new AppError(tester.message, tester.statusCode));
  }

  req.body = {
    ...req.body,
    assigned: {
      userId: tester._id,
      name: tester.name,
    },
  };
  const test = await Test.create(req.body);
  console.log({
    testName: test.name,
    projectId: project.name,
    id: test._id,
    status: 'pending',
  });
  await User.findByIdAndUpdate(tester._id, {
    $push: {
      tests: {
        testName: test.name,
        projectName: project.name,
        id: test._id,
        status: 'pending',
      },
    },
  });
  project.tests.push(test._id);
  await project.save();

  const accessToken = oauth2Client.getAccessToken()

  let transport = await nodemailer.createTransport({
    service:'gmail',
    auth:{
      type:'OAuth2',
      user:'cs1812218@szabist.pk',
      clientId: YOUR_CLIENT_ID,
      clientSecret: YOUR_CLIENT_SECRET,
      refreshToken: YOUR_REFRESH_TOKEN,
      accessToken: accessToken
    }
  });

  let mailOptions = {
    from: '"Checking"', // sender address
    to: tester.email, // list of receivers
    subject: "Test Case Assigned", // Subject line
    text: "Hello world?", // plain text body
    html: `<h3>You have been assigned a test case,<br> Test Name: ${test.name} <br> Project: ${project.name} </h3>`, // html body
  };

  const result = await transport.sendMail(mailOptions)
  console.log(result)

  res.status(200).json({
    status: 'success',
    test,
  });
});

exports.getTest = catchAsync(async (req, res, next) => {
  const test = await Test.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    test,
  });
});

exports.updateTest = catchAsync(async (req, res, next) => {
  const validate = testUpdateValidation.validate(req.body);
  if (validate.error) {
    // return next(new AppError(validate.error, 400));
  }

  const updatedtest = await Test.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    {
      runValidators: true,
      new: true,
    }
  );

  if (!updatedtest)
    return next(new AppError(`Can't find any test with id ${testId}`, 404));

  res.status(200).json({
    status: 'success',
    test: updatedtest,
  });
});

exports.updateTestStatus = catchAsync(async (req, res, next) => {
  console.log(req.body);
  const test = await Test.findById(req.params.id);
  const user = await User.findById(test.assigned.userId);
  if (!test) {
    return next(new AppError(`No test found against id ${testId}`, 404));
  }
  if (!user) {
    return next(new AppError(`No user found against id ${userId}`, 404));
  }
  test.status = req.body.status;
  user.tests.forEach((testf) => {
    console.log(testf.id, test._id);
    if (testf.id.equals(test._id)) {
      testf.status = req.body.status;
    }
  });
  const update = await Test.findByIdAndUpdate(req.params.id, test, {
    new: true,
  });
  const updateUser = await User.findByIdAndUpdate(test.assigned.userId, user, {
    new: true,
  });

  return res.status(200).json({
    status: 'success',
    test,
  });
});

exports.genFile = catchAsync(async (req, res, next) => {
  console.log('Tei file controller chal raha hai');
  console.log(req.file, req.body);
});

exports.deleteTest = catchAsync(async (req, res, next) => {
  const deletedtest = await Test.findByIdAndDelete(req.params.id);

  if (!deletedtest)
    return next(new AppError(`No test found against id ${testId}`, 404));

  res.status(200).json({
    status: 'success',
    test: deletedtest,
  });
});

//* SCENARIOS

exports.getAllScenarios = catchAsync(async (req, res) => {
  const scenarios = await Scenario.find();

  res.status(200).json({
    status: 'success',
    scenarios,
  });
});

exports.createScenario = catchAsync(async (req, res, next) => {
  const validate = scenarioValidation.validate(req.body);
  if (validate.error) {
    return next(new AppError(validate.error, 400));
  }

  const { tid } = req.params;

  const test = await Test.findById(tid);
  if (!test) return next(new AppError(`No test found against id ${tid}`, 404));

  const scenario = await Scenario.create(req.body);
  test.scenarios.push(scenario._id);
  await test.save();

  res.status(200).json({
    status: 'success',
    scenario,
  });
});

exports.getScenario = catchAsync(async (req, res, next) => {
  const scenario = await Scenario.findById(req.params.id);

  res.status(200).json({
    status: 'success',
    scenario,
  });
});

exports.downloadReport = catchAsync(async (req, res, next) => {
  try {
    const { id } = req.params;
    const test = await Test.findById(id);
    if (!test) {
      return next(new AppError(`No test found against id ${id}`, 404));
    }
    if (test.status == 'pending') {
      return next(new AppError(`Test is not completed yet`, 404));
    }
    const report = test.report;
    const path = `uploads/${id}.pdf`;
    console.log('data');
    res.download(path)
  } catch(err) {
    console.log('error');
    return res.status(500).json({
      status: 'error',
      message: err.message,

    })
  }
});

exports.updateScenario = catchAsync(async (req, res, next) => {
  const validate = scenarioValidation.validate(req.body);
  if (validate.error) {
    // return next(new AppError(validate.error, 400));
  }

  const updatedscenario = await Scenario.findByIdAndUpdate(
    req.params.id,
    { ...req.body },
    {
      runValidators: true,
      new: true,
    }
  );

  if (!updatedscenario)
    return next(
      new AppError(`Can't find any scenario with id ${scenarioId}`, 404)
    );

  res.status(200).json({
    status: 'success',
    scenario: updatedscenario,
  });
});

exports.deleteScenario = catchAsync(async (req, res, next) => {
  const deletedscenario = await Scenario.findByIdAndDelete(req.params.id);

  if (!deletedscenario)
    return next(
      new AppError(`No scenario found against id ${scenarioId}`, 404)
    );

  res.status(200).json({
    status: 'success',
    scenario: deletedscenario,
  });
});
