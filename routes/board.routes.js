const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const { isAuthenticated } = require('./../middleware/jwt.middleware.js');

const User = require("../models/User.model")
const Board = require('../models/Board.model')
const Draft = require('../models/Draft.model.js')
const Task = require('../models/Task.model')

// Create new Board 
router.post('/addBoard', isAuthenticated, async (req, res, next) => {
    const { title } = req.body;
    console.log('title:', title)
    const userId = req.payload._id;

    if(title.trim() === '') res.status(400).json({ message: "Empty request string" });

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

// Add draft to the board
router.post('/addDraft', isAuthenticated ,async (req, res, next) => {
    const {title, boardId} = req.body
    const tasks = []

    if(title.trim() === '' || !boardId) return
       
    try{
        const newDraft = await Draft.create({title, tasks, board: boardId})

        await newDraft.save()

        res.status(200).json({message: 'Draft was successfully created 👀'})
    }catch(err){
        res.status(500).json({message: 'Could not create new Draft 🤷‍♂️'})
    }
})

router.get('/getDrafts/:boardId', async (req, res, next) => {
    const { boardId } = req.params;
    console.log('boardId 🛹: ', boardId);
  
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      res.status(400).json({ message: "Specified boardId is not valid" });
      return;
    }
  
    try {
      const foundBoard = await Board.findById(boardId).populate('drafts');
      console.log('This is the Boards: 🛹', foundBoard);
      res.status(200).json({ foundBoard });
    } catch (err) {
      res.status(500).json({ message: "Could not get Drafts" });
    }
  });


router.get('/getBoards', isAuthenticated, async(req,res,next)=>{
    const userId = req.payload._id; 

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        res.status(400).json({ message: "Specified userId is not valid" });
        return;
      }

    try{
        const foundUser = await User.findById(userId).populate('boards'); 
        const userBoards = foundUser.boards;

        res.status(200).json({boards: userBoards, message: 'Successfully received the boards ✔'})
    } catch(err){
        res.status(500).json({message: 'Failed to get the boards ❌'})
    }
})


module.exports = router;

