const express = require("express");
const path = require("path");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session')
const flash = require('connect-flash');

// Init App
const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost/nodekb');
let db = mongoose.connection;

// Bring in model
let Article = require('./models/article');


// Check Connection
db.once('open', () => {
    console.log("Connect to MongoDB !");
})

// Check db error
db.on('error', err => {
    logError(err);
})

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// Load View Engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// Set Public Folder
app.use(express.static(path.join(__dirname, 'public')));

// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

// Express Messages Middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
});


// Home Route
app.get('/', (req, res) => {
    Article.find({}, function(err, articles){
        if(err) {
            console.log(err);
        }else{
            res.render('index', {
                articles: articles
            })
        } 
    });
})

// Get Articles
app.get('/article/:id', function(req, res){
    Article.findById(req.params.id, function(err, article){
        res.render('article', {
            article: article
        })
    })
});

// Add Articles
app.get('/articles/add', (req, res) => {
    res.render('add_articles')
})

// Edit Articles
app.get('/article/edit/:id', function(req, res){
    Article.findById(req.params.id, function(err, article){
        res.render('edit', {
            article: article
        })
    })
});

// Method Add
app.post('/articles/add', function(req, res){
    let article = new Article();
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;
    
    article.save(function(err){
        if(err){
            console.log(err);
            return;
        }else{
            req.flash('success', 'Article Added')
            res.redirect('/');
        }
    })
})

// Method Edit
app.post('/articles/edit/:id', function(req, res){
    let article = {};
    article.title = req.body.title;
    article.author = req.body.author;
    article.body = req.body.body;

    let query = {_id:req.params.id}
    
    Article.updateOne(query, article, function(err){
        if(err){
            console.log(err);
            return;
        }else{
            req.flash('success', 'Article Updated')
            res.redirect('/');
        }
    })
})

// Method Delete
app.delete('/article/:id', function(req, res){
    let query = {_id:req.params.id}

    Article.deleteOne(query, function(err){
        if(err) {
            console.log(err);
        }else{
            req.flash('danger', 'Article Deleted')
            res.send('success');
        }
    })
})

// Start Server
app.listen(port, () => {
    console.log(`Running app at http://localhost:${port}`);
})