require('babel-register')({
    retainLines: true
});

const App = require('./app');
const app = new App();

app.start();
