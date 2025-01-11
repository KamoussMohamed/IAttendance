const express = require('express');
const router = express.Router();
const Session = require('../models/Session');
const authenticateToken = require('../middlewares/auth');
const authorizeRole = require('../middlewares/roleAuth');


//Get all sessions
router.get('/', authenticateToken, authorizeRole('teacher','admin'), async(req,res)=>{
    try{
        const sessions = await Session.find({});
        res.json(sessions);
    } catch(error){
        res.status(500).json({message: error.message});
    }
});

//Search session by name
router.get('/searchByName', authenticateToken, authorizeRole('teacher', 'admin'), async (req, res) => {
    try {
        const { sessionName } = req.query;

        if (!sessionName) {
            return res.status(400).json({ message: 'Session name is required' });
        }

        const session = await Session.findOne({ sessionName: sessionName });

        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.json(session);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

//Search sessions by teacherName
router.get('/searchByTeacher', authenticateToken, authorizeRole('teacher', 'admin'), async(req, res)=>{
    try{
        const { teacherName } = req.query;

        if(!teacherName){
            return res.status(400).json({message: 'Teacher name is required'});
        }

        const session = await Session.find({ taughtBy:teacherName});

        if(!session){
            return res.status(404).json({message:'Session not found'});
        }

        res.json(session);
    }catch(error){
        res.status(500).json({message:error.message});
    }
})

//Add Session
router.post('/addSession', authenticateToken, authorizeRole('admin'), async(req, res)=>{
    try{
        const { sessionName, sessionDuration, taughtBy } = req.body;
        if (!sessionName || !sessionDuration || !taughtBy){
            return res.status(400).json({ message: 'Missing arguments, provide all the information'});
        };
        const session = await Session.create({
            sessionName:sessionName,
            sessionDuration:sessionDuration,
            taughtBy:taughtBy
        });
        
        res.status(201).json({
            message: 'Session created successfully',
            session
        });
    }catch(error){
        res.status(500).json({message: error.message});
    }
});

//Delete Session
router.delete('/deleteByName/:sessionName', authenticateToken, authorizeRole('admin'), async (req, res) => {
    try {
        const session = await Session.findOneAndDelete({ sessionName: req.params.sessionName });
        
        if (!session) {
            return res.status(404).json({ message: 'Session not found' });
        }

        res.json({ message: 'Session deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;