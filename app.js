var express = require('express');
var path = require('path');
var bodyParser = require('body-parser') //parse request parameters
const axios = require('axios');
const { MongoClient, ServerApiVersion } = require('mongodb');
const bcrypt = require('bcrypt');
const uri = "mongodb+srv://itshakgal:itshakgal2023@stockdash.fvzw1ma.mongodb.net/";


var app = express();
var port = 3000;
const saltRounds = 10;
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

app.use(express.static(__dirname));  //specifies the root directory from which to serve static assets [images, CSS files and JavaScript files]
app.use(bodyParser.urlencoded({ extended: true })); //parsing bodies from URL. extended: true specifies that req.body object will contain values of any type instead of just strings.
app.use(bodyParser.json()); //for parsing json objects

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname + '/pages/index.html'));
})


app.post('/', async function (req, res) {
  const options = {
    method: 'GET',
    url: 'https://ms-finance.p.rapidapi.com/market/v2/auto-complete',
    params: { q: 'tesla' },
    headers: {
      'X-RapidAPI-Key': '4f24578c82msh3960a1fefed24f5p161ec4jsn7a73d210651b',
      'X-RapidAPI-Host': 'ms-finance.p.rapidapi.com'
    }
  };

  try {
    const response = await axios.request(options);
    console.log(response.data);
  } catch (error) {
    console.error(error);
  }
})


app.get('/sign-in', function (req, res) {
  res.sendFile(path.join(__dirname + '/pages/login.html'));
})

app.post('/sign-in', async function (req, res) {
  if (req.body.email == "" || req.body.password == "") {
    return res.status(401).json({"error": "EMPTY_EMAIL_OR_PASSWORD"});
  }

  try {
    await client.connect();
    const query = { email: req.body.email }
    const user = await users.findOne(query);
    if (user == null) {
      return res.status(401).json({"error": "USER_DOES_NOT_EXISTS"});
    }
    console.log(req.body.password)
    console.log(user)
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      console.log("not equal");
      return res.status(401).json({"error": "INCORRECT_PASSWORD"});
    }
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
    return res.status(401).json({"error": "EMPTY_EMAIL_OR_PASSWORD"}); 
  }
  if (req.body.password != req.body.repeatedPassword) {
    return res.status(401).json({"error": "DIFFERENT_PASSWORDS"});
  }
  try {
    var encryptedPassword = bcrypt.hashSync(req.body.password, 10);;
    await client.connect();
    const query = { email: req.body.email }
    const user = await users.findOne(query);
    if (user != null) {
      return res.status(401).json({"error": "USER_ALREADY_EXISTS"});
    }
    console.log(encryptedPassword)
    user = await users.insertOne({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: encryptedPassword,
    });
    console.log("accepted")
    res.redirect('/')
  } finally {
    await client.close();
  }
})

app.listen(port);
console.log('Server started! At http://localhost:' + port);
