var express = require('express');
var path = require('path');
var bodyParser = require('body-parser') //parse request parameters
const axios = require('axios');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcrypt');
const uri = "mongodb+srv://itshakgal:itshakgal2023@stockdash.fvzw1ma.mongodb.net/";
const cookieParser = require('cookie-parser')
const uuid = require('uuid')
const nodemailer = require("nodemailer");


var app = express();
var port = 3000;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const database = client.db('stockdb');
const users = database.collection('users');

//Create mail transporter
var transport = nodemailer.createTransport({
  service: 'gmail',
  port: 465,
  auth: {
    user: "itshak.gal@gmail.com",  
    pass: "vexwabewnjxksush" 
  }
});


// each session contains the username of the user and the time at which it expires
class Session {
  constructor(username, expiresAt, rememberMe) {
    this.username = username
    this.expiresAt = expiresAt
    this.rememberMe = this.rememberMe
  }

  // we'll use this method later to determine if the session has expired
  isExpired() {
    return this.expiresAt < (new Date())
  }
}

// this object stores the users sessions. For larger scale applications, you can use a database or cache for this purpose
const sessions = {}

const welcomeHandler = (req, res) => {
  // if this request doesn't have any cookies, that means it isn't
  // authenticated. Return an error code.
  if (!req.cookies) {
      // res.status(401).end()
      // return
      //TODO need to log in in order to see something
      return 'no-user'
  }

  // We can obtain the session token from the requests cookies, which come with every request
  const sessionToken = req.cookies['session_token']
  if (!sessionToken) {
      // If the cookie is not set, return an unauthorized status
      // res.status(401).end()
      // return
      return 'no-user'
  }

  // We then get the session of the user from our session map
  // that we set in the signinHandler
  userSession = sessions[sessionToken]
  if (!userSession || userSession.isExpired()) {
      // // If the session token is not present in session map, return an unauthorized error
      // res.status(401).end()
      // return
      return 'no-user'
  }
  // if the session has expired, return an unauthorized error, and delete the 
  // session from our map
 
  refreshSession(res, userSession.username, false);
  delete sessions[sessionToken]
  // If all checks have passed, we can consider the user authenticated and
  // send a welcome message
  console.log('in welcome ' + userSession.username)
  return userSession.username;
}

const refreshSession = (res, userEmail, rememberMe) => {
  // generate a random UUID as the session token
  const sessionToken = uuid.v4()

  // set the expiry time as 120s after the current time
  const now = new Date()
  var expiresAt 

  if(rememberMe == true){
    expiresAt = new Date(+now + 604800000) // week
  }else{
    expiresAt = new Date(+now + 120 * 1000) //two minutes 
  }
  
  // create a session containing information about the user and expiry time
  const session = new Session(userEmail, expiresAt ,rememberMe)
  // add the session information to the sessions map
  sessions[sessionToken] = session
  
  // In the response, set a cookie on the client with the name "session_cookie"
  // and the value as the UUID we generated. We also set the expiry time
  res.cookie("session_token", sessionToken, { expires: expiresAt })
  
}

app.use(express.static(__dirname));  //specifies the root directory from which to serve static assets [images, CSS files and JavaScript files]
app.use(bodyParser.urlencoded({ extended: true })); //parsing bodies from URL. extended: true specifies that req.body object will contain values of any type instead of just strings.
app.use(bodyParser.json()); //for parsing json objects
app.use(cookieParser());

app.get('/', function (req, res) {
  const validClient = welcomeHandler(req, res);
  if( validClient == 'no-user'){
    res.redirect('/sign-in')
    return
  }
  res.sendFile(path.join(__dirname + '/pages/index.html'));
  return validClient
})


// app.post('/', async function (req, res) {
//   const options = {
//     method: 'GET',
//     url: 'https://ms-finance.p.rapidapi.com/market/v2/auto-complete',
//     params: { q: 'tesla' },
//     headers: {
//       'X-RapidAPI-Key': '4f24578c82msh3960a1fefed24f5p161ec4jsn7a73d210651b',
//       'X-RapidAPI-Host': 'ms-finance.p.rapidapi.com'
//     }
//   };

//   try {
//     const response = await axios.request(options);
//     console.log(response.data);
//   } catch (error) {
//     console.error(error);
//   }
// })


app.get('/sign-in', function (req, res) {
  res.sendFile(path.join(__dirname + '/pages/login.html'));
})

app.post('/sign-in', async function (req, res) {
  if (req.body.email == "" || req.body.password == "") {
    return res.status(401).json({ "error": "EMPTY_EMAIL_OR_PASSWORD" });
  }

  try {
    await client.connect();
    const query = { email: req.body.email }
    const user = await users.findOne(query);
    if (user == null) {
      return res.status(401).json({ "error": "USER_DOES_NOT_EXISTS" });
    }
    console.log(req.body.password)
    console.log(user)
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      console.log("not equal");
      return res.status(401).json({ "error": "INCORRECT_PASSWORD" });
    }
    
      refreshSession(res, req.body.email, req.body.rememberMe);
    
    res.redirect('/')
  } finally {
    await client.close();
  }
})

app.get('/sign-up', function (req, res) {
  res.sendFile(path.join(__dirname + '/pages/register.html'));
})
app.post('/sign-up', async function (req, res) {
  if (req.body.email == "" || req.body.password == "" || req.body.lastName == "" || req.body.firstName == "" || req.body.repeatedPassword == "") {
    return res.status(401).json({ "error": "EMPTY_EMAIL_OR_PASSWORD" });
  }
  if (req.body.password != req.body.repeatedPassword) {
    return res.status(401).json({ "error": "DIFFERENT_PASSWORDS" });
  }
  try {
    var encryptedPassword = bcrypt.hashSync(req.body.password, 10);;
    await client.connect();
    const query = { email: req.body.email }
    if ( await users.findOne(query) != null) {
      return res.status(401).json({ "error": "USER_ALREADY_EXISTS" });
    }
    console.log(encryptedPassword)
    const user = await users.insertOne({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: encryptedPassword,
      favorites:  [],
    });
    console.log("accepted")
    const message = "Hi, " + req.body.firstName + " " + req.body.lastName + "\nWelcome to StockDashboard!"
    mailHandler("Welcome!",message,req.body.email)
    refreshSession(res, req.body.email, false);
    res.redirect('/')
  } finally {
    await client.close();
  }
})

app.get('/logout', logoutHandler = (req, res) => {
  if (!req.cookies) {
    res.redirect('/sign-in')
    return
}

const sessionToken = req.cookies['session_token']
if (!sessionToken) {
    res.redirect('/sign-in')
    return
}

delete sessions[sessionToken]

res.cookie("session_token", "", { expires: new Date() })
res.end()
res.redirect('/sign-in')
})


app.get('/favorites', favoritesHandler = async (req, res) => {
  const userName = welcomeHandler(req,res);
  if(userName == 'no-user'){
   res.redirect('/sign-in');
   return
  }
  const stock = req.query.stock;

  try {
    await client.connect();
    const user = await users.findOne({email: userName, favorites: {$in: [stock]}})
    if(user == null){
      console.log('there isnt')
      await users.updateOne(
        { email: userName },
        { $push: { favorites: stock } });
    }
    else{
      console.log('there is')
      await users.updateOne(
        { email: userName },
        { $pull: { favorites: stock } } );
    }
   
    res.end();
    return;
  } finally {
    await client.close();
  }
});

// app.get('/contact-us', function (req, res) {
//   res.sendFile(path.join(__dirname + '/pages/contact.html'));
// })

app.post('/contact-us', function (req, res) {
  const message = "Hi " + req.body.firstName + " " + req.body.firstName + "\n\nWe have received your inquiry about " + req.body.subject + ".\nYour request will be attended soon.\n\nThank you,\nStock Dashboard"
  const subject = "Inquiry Received!"

  if( mailHandler(subject,message,req.body.email) ){
    res.status(200)
  } 
  return res.status(500)
})

const mailHandler = (subject,message, mailTo) =>{
  var mailOptions = {
    from: 'itshak.gal@gmail.com',
    to: mailTo,
    subject: subject,
    text: message 
    
  };
  
  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return 0;
    }
    return 1;
  });
}
app.listen(port);
console.log('Server started! At http://localhost:' + port);
