
const router = require('express').Router();
const express = require('express');
const feedbackRoutes = require('./feedbackRoutes');
const projRoutes = require('./projRoutes');
const userRoutes = require('./userRoutes');
const tagRoutes = require('./tagRoutes');
const tokenRoutes = require('./tokenRoutes');
const path = require('path')
// const client = require('../client/dist')

router.use('/user', userRoutes);
router.use('/proj', projRoutes);
router.use('/tags', tagRoutes);
router.use('/token', tokenRoutes);
router.use('/feedback', feedbackRoutes);
router.use('/', express.static(path.join(__dirname, '../client/dist', 'index.html')))

router.use((req, res) => {
    res.status(404).end();
});


module.exports = router;