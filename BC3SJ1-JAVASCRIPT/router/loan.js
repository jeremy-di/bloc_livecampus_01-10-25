const express = require('express')
const router = express.Router()
const db = require('./../services/database')
const jwt = require('jsonwebtoken')

const JWT_SECRET = "HelloThereImObiWan"

function authenticateToken(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.sendStatus(401);
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
}

function isAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).send('Accès interdit');
  next();
}

router.post('/new', authenticateToken, (req, res) => {
  const { livre_id } = req.body || {};
  const utilisateur_id = req.user.id;

  if (!livre_id) return res.status(400).send('livre_id requis');

  const sqlCheck = 'SELECT id, statut FROM livres WHERE id = ? LIMIT 1';
  db.query(sqlCheck, [livre_id], (err, rows) => {
    if (err) return res.status(500).send('Erreur SQL (check livre)');
    if (rows.length === 0) return res.status(404).send('Livre inexistant');
    if (rows[0].statut !== 'disponible') return res.status(400).send('Livre non disponible');

    const sqlInsert = `
      INSERT INTO emprunts (utilisateur_id, livre_id, date_emprunt, date_retour_prevue)
      VALUES (?, ?, NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY))
    `;
    db.query(sqlInsert, [utilisateur_id, livre_id], (err2, result) => {
      if (err2) return res.status(500).send('Erreur SQL (création emprunt)');

      const sqlUpdateBook = 'UPDATE livres SET statut = "emprunté" WHERE id = ?';
      db.query(sqlUpdateBook, [livre_id], (err3) => {
        if (err3) return res.status(500).send('Erreur SQL (MAJ livre)');
        res.status(201).json({ message: 'Emprunt créé', emprunt_id: result.insertId });
      });
    });
  });
});

router.post('/:id/return', authenticateToken, (req, res) => {
  const empruntId = req.params.id;

  const sqlGet = 'SELECT id, utilisateur_id, livre_id, date_retour_effective FROM emprunts WHERE id = ? LIMIT 1';
  db.query(sqlGet, [empruntId], (err, rows) => {
    if (err) return res.status(500).send('Erreur SQL (lecture emprunt)');
    if (rows.length === 0) return res.status(404).send('Emprunt introuvable');

    const e = rows[0];
    if (e.date_retour_effective) return res.status(400).send('Déjà retourné');

    const isOwner = e.utilisateur_id === req.user.id;
    const isAdminUser = req.user.role === 'admin';
    if (!isOwner && !isAdminUser) return res.status(403).send('Non autorisé à retourner cet emprunt');

    const sqlReturn = 'UPDATE emprunts SET date_retour_effective = NOW() WHERE id = ?';
    db.query(sqlReturn, [empruntId], (err2) => {
      if (err2) return res.status(500).send('Erreur SQL (MAJ retour)');

      const sqlBook = 'UPDATE livres SET statut = "disponible" WHERE id = ?';
      db.query(sqlBook, [e.livre_id], (err3) => {
        if (err3) return res.status(500).send('Erreur SQL (MAJ livre)');
        res.json({ message: 'Livre retourné' });
      });
    });
  });
});

router.get('/me', authenticateToken, (req, res) => {
  const sql = `
    SELECT 
      e.id,
      e.date_emprunt,
      e.date_retour_prevue,
      e.date_retour_effective,
      l.id AS livre_id,
      l.titre, l.auteur, l.isbn, l.photo_url,
      (CASE 
         WHEN e.date_retour_effective IS NULL AND NOW() > e.date_retour_prevue THEN 1
         ELSE 0
       END) AS en_retard
    FROM emprunts e
    JOIN livres l ON l.id = e.livre_id
    WHERE e.utilisateur_id = ?
    ORDER BY e.id DESC
  `;
  db.query(sql, [req.user.id], (err, rows) => {
    if (err) return res.status(500).send('Erreur SQL (liste mes emprunts)');
    res.json(rows);
  });
});

router.get('/', authenticateToken, isAdmin, (req, res) => {
  const { active, overdue } = req.query || {};
  const where = [];
  const params = [];

  if (active === 'true') where.push('e.date_retour_effective IS NULL');
  if (overdue === 'true') where.push('e.date_retour_effective IS NULL AND NOW() > e.date_retour_prevue');

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const sql = `
    SELECT 
      e.id, e.utilisateur_id, e.livre_id, e.date_emprunt, e.date_retour_prevue, e.date_retour_effective,
      u.nom, u.prenom, u.email,
      l.titre, l.auteur, l.isbn
    FROM emprunts e
    JOIN utilisateurs u ON u.id = e.utilisateur_id
    JOIN livres l       ON l.id = e.livre_id
    ${whereSql}
    ORDER BY e.id DESC
  `;
  db.query(sql, params, (err, rows) => {
    if (err) return res.status(500).send('Erreur SQL (liste emprunts)');
    res.json(rows);
  });
});

module.exports = router;