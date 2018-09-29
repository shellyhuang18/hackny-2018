const express = require('express'),
     app = express();


//set view engine and static folder
app.set('view engine', 'pug');
app.set('views', __dirname + '/views')

app.use(express.static('./static'))

var port = 8000
const server = app.listen(port, () =>{
    console.log('Running on port ', port)
});