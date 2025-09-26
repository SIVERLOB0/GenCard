// FILE: ./src/extraplorador/controllers/extraploradorController.js
function extraHome(req, res) {
  res.render('extraplorador/views/index', {
    title: 'Extraplorador',
    message: 'Proyecto en desarrollo'
  });
}

module.exports = { extraHome };