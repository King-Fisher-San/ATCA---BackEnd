const { google } = require('googleapis');

// Developer console
const YOUR_CLIENT_ID = process.env.YOUR_CLIENT_ID; //email
const YOUR_CLIENT_SECRET = process.env.YOUR_CLIENT_SECRET; // password

const YOUR_REDIRECT_URL = process.env.YOUR_REDIRECT_URL; // oauth



const YOUR_REFRESH_TOKEN = process.env.YOUR_REFRESH_TOKEN;


// OAuth2 
// application (Account access)(email and password)(OAuth2) -> Mail 


// email and password

const oauth2Client = new google.auth.OAuth2(
  YOUR_CLIENT_ID,
  YOUR_CLIENT_SECRET,
  YOUR_REDIRECT_URL
);

oauth2Client.setCredentials({
  refresh_token: YOUR_REFRESH_TOKEN,
});

module.exports = oauth2Client



// Backend -> Frontend 
// API - Application Programming Interface
// 1.get - ONly provide data
// 2.post - Only new Data 
// 3.put - Change data
// 4.delete - Delete 

// API GET
// Frontend -> Backend (server.js)  -> Route -> Middleware -> Controller
// Controller -> Frontend
// Middleware -> Frontend

// Hacker -> HIT -> Controller ->  validation -> Model (Check) 


// Mailing

// Email (Sender Email)

// Nodemailer (Allow Node application to send mails)

// -> Authorization Token (googleapi)

// -> Nodemailer Mail send




// Page-> 
// Home -> 
//  Components -> Components -> Components -> Components (props)
//    Context -> 
// Utils

// Hooks -> React application (Components) -> Reload

// Login
