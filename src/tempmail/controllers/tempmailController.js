// FILE: ./src/tempmail/controllers/tempmailController.js
function tempmailHome(req, res) {
  res.render('tempmail/views/index', {
    title: 'TempMail',
    message: 'Proyecto en desarrollo'
  });
}

module.exports = { tempmailHome };