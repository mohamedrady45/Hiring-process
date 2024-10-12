const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const USER = process.env.USER; 
const PASSWORD = process.env.PASSWORD; 

const login = (req, res) => {
    const { username, password } = req.body;
    if (username == USER && password == PASSWORD) {
        const token = jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: '1h' });
      
      return res.status(200).json({
        success: true,
        message: 'Login successful',
        token: token
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials!' 
      });
    }
  };
  

module.exports = { login };
