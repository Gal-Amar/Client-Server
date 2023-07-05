var express = require('express');
var path = require('path');
var bodyParser = require('body-parser') //parse request parameters
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcrypt');
const uri = "mongodb+srv://itshakgal:itshakgal2023@stockdash.fvzw1ma.mongodb.net/";
const cookieParser = require('cookie-parser')
const uuid = require('uuid')
const nodemailer = require("nodemailer");


var app = express();
var port = 3000;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(process.env.MONGODB_URI, {
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
    this.rememberMe = rememberMe
  }

  // we'll use this method later to determine if the session has expired
  isExpired() {
    return this.expiresAt < (new Date())
  }
}

const welcomeHandler = (req, res) => {
  if (!req.cookies || !req.cookies['session_token'])
    return 'no-user'

  const cookie = req.cookies['session_token']

  if (new Date(cookie.expires) <= new Date())
    return 'no-user'
  
  return userSession.username;
}

const refreshSession = (res, userEmail, rememberMe) => {
  const sessionToken = userEmail
  const now = new Date()  
  var expiresAt

  if (rememberMe == "true")
    expiresAt = new Date(+now + 604800000) // week
  else
    expiresAt = new Date(+now + 10800 * 4000) // 3 hours

  res.cookie("session_token", sessionToken, { expires: expiresAt, secure: true, sameSite: 'lax' })
}

app.use(express.static(__dirname + '/public'));  //specifies the root directory from which to serve static assets [images, CSS files and JavaScript files]
app.use(bodyParser.urlencoded({ extended: true })); //parsing bodies from URL. extended: true specifies that req.body object will contain values of any type instead of just strings.
app.use(bodyParser.json()); //for parsing json objects
app.use(cookieParser());

app.get('/stock', function (req, res) {
  const validClient = welcomeHandler(req, res);
  if (validClient == 'no-user') {
    res.redirect('/sign-in')
    return
  }

  res.sendFile(path.join(__dirname + '/public/pages/stock.html'));
  return validClient
})



app.get('/sign-in', function (req, res) {
  if (welcomeHandler(req, res) == 'no-user')
    res.sendFile(path.join(__dirname + '/public/pages/login.html'));
  else
    res.redirect('/')
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
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      return res.status(401).json({ "error": "INCORRECT_PASSWORD" });
    }

    refreshSession(res, req.body.email, req.body.rememberMe);
    res.end()
  } finally {
    await client.close();
  }
})

app.get('/sign-up', function (req, res) {
  if (welcomeHandler(req, res) == 'no-user')
    res.sendFile(path.join(__dirname + '/public/pages/register.html'));
  else
    res.redirect('/')
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
    if (await users.findOne(query) != null) {
      return res.status(401).json({ "error": "USER_ALREADY_EXISTS" });
    }
    const user = await users.insertOne({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: encryptedPassword,
      favorites: [],
    });
    const message = "Hi, " + req.body.firstName + " " + req.body.lastName + "\nWelcome to StockDashboard!"
    mailHandler("Welcome!", message, req.body.email)
    refreshSession(res, req.body.email, false);
    res.end()
  } finally {
    await client.close();
  }
})

app.get('/logout', logoutHandler = (req, res) => {
  if (welcomeHandler(req, res) == 'no-user') {
    res.redirect('/sign-in');
    return
  }
  else {
    const sessionToken = req.cookies['session_token']
    if (!sessionToken) {
      res.redirect('/sign-in')
      return
    } else {
      delete sessions[sessionToken]
      res.cookie("session_token", "", { expires: new Date() })
      res.redirect('/sign-in')
    }
  }
})

app.get('/favorites', async function (req, res) {
  const userName = welcomeHandler(req, res);
  if (userName == 'no-user') {
    res.redirect('/sign-in');
    return
  }

  try {
    await client.connect();
    const user = await users.findOne({ email: userName })
    res.json({ 'favorites': user.favorites })
  } finally {
    await client.close();
  }
})

app.get('/favorite', favoritesHandler = async (req, res) => {
  const userName = welcomeHandler(req, res);
  if (userName == 'no-user') {
    res.redirect('/sign-in');
    return
  }

  const symbol = req.query.symbol;
  const name = req.query.name;

  try {
    await client.connect();
    const user = await users.findOne(
      { email: userName, "favorites.symbol": symbol },
      { _id: 1 }
    );

    if (user == null) {
      await users.updateOne(
        { email: userName },
        { $addToSet: { favorites: { symbol: symbol, name: name } } }
      );
      res.json({ 'result': 'add' });
    } else {
      await users.updateOne(
        { email: userName },
        { $pull: { favorites: { symbol: symbol } } }
      );
      res.json({ 'result': 'remove' });
    }

    res.end();
  } finally {
    await client.close();
  }
});

app.get('/favorites-check/', async function (req, res) {
  const userName = welcomeHandler(req, res);
  if (userName == 'no-user') {
    res.redirect('/sign-in');
    return
  }

  const symbol = req.query.symbol;
  try {
    await client.connect();
    const result = await users.findOne(
      { email: userName, "favorites.symbol": symbol },
      { _id: 1 }
    );

    if (result == null)
      res.json({ 'exists': false });
    else
      res.json({ 'exists': true });
  } finally {
    await client.close()
  }
})

app.get('/contact-us', function (req, res) {
  if (welcomeHandler(req, res) == 'no-user')
    res.redirect('/sign-in')
  else
    res.sendFile(path.join(__dirname + '/public/pages/contact-us.html'));
})

app.post('/contact-us', function (req, res) {
  const message = "Hi " + req.body.firstName + " " + req.body.lastName + "\n\nWe have received your inquiry about " + req.body.subject + "\nMessage received is: " + req.body.message + ".\nYour request will be attended soon.\n\nThank you,\nStock Dashboard"
  const subject = "Inquiry Received!"

  if (mailHandler(subject, message, req.body.email) == 'true') {
    res.status(200)
  }
  else {
    res.status(500)
  }
  res.end();
})

const mailHandler = (subject, message, mailTo) => {
  var mailOptions = {
    from: 'itshak.gal@gmail.com',
    to: mailTo,
    subject: subject,
    text: message

  };
  try {
    transport.sendMail(mailOptions);
  } catch (err) {
    return 'false';
  }

  return 'true';
}

app.get('/', function (req, res) {
  if (welcomeHandler(req, res) == 'no-user')
    res.redirect('/sign-in')
  else
    res.sendFile(path.join(__dirname + '/public/pages/index.html'));
})


// app.use(function(req, res, next) {
//   res.status(404);
//   res.sendFile(path.join(__dirname + '/public/pages/404.html'));
// });

app.listen(port);
console.log('Server started! At http://localhost:' + port);
