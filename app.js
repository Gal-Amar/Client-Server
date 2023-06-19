var express = require('express');
var path = require('path');
var bodyParser = require('body-parser') //parse request parameters
const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://itshakgal:itshakgal2023@stockdash.fvzw1ma.mongodb.net/";

// API KEY RD2KTXLLT0Q229Z8
var app = express();
var port = 5000;

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
  res.sendFile(path.join(__dirname + '/pages/blank.html'));
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
  if(req.body.email == "" || req.body.password == ""){
    //TODO send message to the client 
  }

  try {
    await client.connect();
    const query = { email: req.body.email }
    const user = await users.findOne(query);
    if(user == null){
      //TODO return user not exists
    }
    if(!await bcrypt.compare(req.body.password, user.password)){
      //TODO return password isnt correct
    }

    res.end()
   
  } finally {
    await client.close();
  }
})

app.get('/sign-up', function (req, res) {
  res.sendFile(path.join(__dirname + '/pages/register.html'));
})

app.get('/contact-us', function (req, res) {
  res.sendFile(path.join(__dirname + '/pages/contact-us.html'));
})

app.listen(port);
console.log('Server started! At http://localhost:' + port);