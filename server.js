let express = require('express');
let mongoose = require('mongoose');
let cors = require('cors');
let bodyParser = require('body-parser');
let dbConfig = require('./db/userdb');


const authRoute = require('./routes/authRoutes')
const appointRoute = require('./routes/appointRoutes')
mongoose.Promise = global.Promise;

mongoose.connect(dbConfig.db, {
    useNewUrlParser: true
}).then(()=>{
    console.log('Database successfully connected!')
},
    error => {
        console.log('Could not connect to database:' + error)
    }
)

const app = express()
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}))
app.use(cors())
app.use('/api/auth', authRoute)
app.use('/api/user', appointRoute)

const port = process.env.PORT || 8080;
const server = app.listen(port, ()=>{
    console.log('Connected to port' + port)
})
app.use((req, res, next)=>{
    next(createError(404));
});

const corsOpts = {
    origin: '*',
  
    methods: [
      'GET',
      'POST',
    ],
  
    allowedHeaders: [
      'Content-Type',
    ],
  };
  
  app.use(cors(corsOpts));
app.use(function (err, req, res, next){
    console.error(err.message);
    if(!err.statusCode) err.statusCode = 500;
    res.status(err.statusCode).send(err.message);
});