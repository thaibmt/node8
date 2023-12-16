const express = require('express');
const config = require("config");
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongodbStore = require("connect-mongodb-session")(session);
const mainController = require('./controllers/mainController');
const app = express();
const DATABASE_CONNECT_URI = 'mongodb://127.0.0.1:27017/fruit';
const HOST = 'localhost';
const PORT = 3000;
/* set store*/
const store = new mongodbStore({
    uri: DATABASE_CONNECT_URI,
    collection: "sessions",
});
app.use(
    session({
        secret: "session_secret",
        resave: false,
        saveUninitialized: false,
        store: store,
    })
);
// Define view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use('/styles', express.static(__dirname + '/styles'));
app.use(bodyParser.urlencoded({ extended: true }));
// Connect MongoDB 
mongoose.connect(DATABASE_CONNECT_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});
// Controller
app.use('/', mainController);
// run server
app.listen(PORT, () => {
    console.log(`Server is running on http://${HOST}:${PORT}`);
});
