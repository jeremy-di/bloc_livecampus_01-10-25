const express = require('express')
const server = require('./server')

const app = express()

const baseUrl = ''

app.use(`${baseUrl}/`,server)

app.get(`${baseUrl}/*`, (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});
app.listen(3000, () => {
    console.info('server démarré')
})