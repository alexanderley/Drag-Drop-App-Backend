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

router.get('/getBoards', isAuthenticated, async (req, res, next) => {
    const userId = req.payload._id;
  
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      res.status(400).json({ message: "Specified userId is not valid" });
      return;
    }
  
    try {
      const foundUser = await User.findById(userId).populate({
        path: 'boards',
        populate: {
          path: 'drafts',
          populate: {
            path: 'tasks', // If tasks also need to be populated
          },
        },
      });
  
      const userBoards = foundUser.boards;
  
      res.status(200).json({ boards: userBoards, message: 'Successfully received the boards ✔' });
    } catch (err) {
      res.status(500).json({ message: 'Failed to get the boards ❌' });
    }
  });


// Add draft to the board
router.post('/addDraft', isAuthenticated ,async (req, res, next) => {
    const {title, boardId} = req.body
    const tasks = []

    console.log('title + boardId', title, boardId);

    if(title.trim() === '' || !boardId) return
       
    try{
        const newDraft = await Draft.create({title, tasks, board: boardId})

        await newDraft.save()

        const board = await Board.findById(boardId);

        if(!board){
            res.status(400).json({message: 'No Board found, for the draft 🤷‍♂️'})
        }
        
        board.drafts.push(newDraft)

        await board.save();
        console.log('Added to the database 🌭');
        res.status(200).json({message: 'Draft was successfully created and added to the board 👀'})
    }catch(err){
        res.status(500).json({message: 'Could not create new Draft 🤷‍♂️'})
    }
})

router.get('/getDrafts/:boardId',isAuthenticated, async (req, res, next) => {
    const { boardId } = req.params;
    console.log('boardId 🛹: ', boardId);
  
    if (!mongoose.Types.ObjectId.isValid(boardId)) {
      res.status(400).json({ message: "Specified boardId is not valid" });
      return;
    }

  
    try {
        const foundBoard = await Board.findById(boardId).populate({
            path: 'drafts',
            populate: { path: 'tasks' }
        });
      console.log('This is the Boards: 🛹', foundBoard.drafts);
      const drafts = foundBoard.drafts;
      res.status(200).json({ drafts });
    } catch (err) {
      res.status(500).json({ message: "Could not get Drafts" });
    }
  });

  router.put('/updateDrafts', isAuthenticated, async(req, res, next) => {
    const {boardId, drafts} = req.body
    console.log('drafts 🌭', drafts.length);


    try{
        const foundBoard = await Board.findById(boardId)
        foundBoard.drafts = drafts;

        drafts.map(async (draft, index)=>{
            const id = draft._id; 
            const foundDraft = await Draft.findById(id)
            console.log('😁 found Draft', foundDraft)
            foundDraft.tasks = drafts[index].tasks
            await foundDraft.save()
        })

  
        await foundBoard.save();
        res.status(200).json({message: 'Board got updatet succesfully!'})
    }catch(err){
        res.status(500).json({message: 'Could not update the drafts!'})
    }
  })




router.post('/addTask', isAuthenticated, async (req, res, next) => {
 
    const { draftId, title } = req.body;
    console.log(draftId);
    
    try {
        const draft = await Draft.findById(draftId);
        if (!draft) {
            res.status(500).json({ message: 'Could not find draft ❌' });
            return;
        }    

        const subtasks = [];
    
        const newTask = await Task.create({ title, subtasks });
        draft.tasks.push(newTask);
       
        await draft.save();
       
        res.status(200).json({ message: 'Task added successfully ✅' , newTask  });
    } catch (err) {
      console.error(err);
        res.status(500).json({ message: 'Could not add a new task ❌' });
    }
});


module.exports = router;

