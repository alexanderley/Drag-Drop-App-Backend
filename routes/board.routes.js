const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const { isAuthenticated } = require('./../middleware/jwt.middleware.js');

const User = require("../models/User.model")
const Board = require('../models/Board.model')
const Task = require('../models/Task.model')

// Create new Board 
router.post('/board', isAuthenticated, async (req, res, next) => {
    const { title } = req.body;
    console.log('title:', title)
    const userId = req.payload._id;

    try {
        const foundUser = await User.findOne({ _id: userId });

        if (!foundUser) {
            return res.status(404).json({ message: 'User not found ❌' });
        }

        if (!foundUser.boards) {
            foundUser.boards = [];
        }

        if (title.trim() !== '') {
            const users = [userId]
            const drafts = [];

            const newBoard = await Board.create({ title, drafts, users });
            
            foundUser.boards.push(newBoard);

            await foundUser.save();

            res.status(200).json({ message: 'Board added ✔', board: newBoard });
        } else {
            res.status(400).json({ message: 'Title cannot be empty ❌' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Could not add board to the database ❌' });
    }
});

// Add task to board


module.exports = router;

