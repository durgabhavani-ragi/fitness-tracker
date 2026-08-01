const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const register = async (req, res) => {
  try {
    const { name, email, password, age, gender, height, weight } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        message: 'Name, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: 'Password must be at least 6 characters',
      });
    }

    const existingUser = await User.findOne({ email: email.trim().toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        message: 'Email already exists',
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: email.trim(),
      password: hashedPassword,
      age,
      gender,
      height,
      weight,
    });

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: 'Email already exists',
      });
    }

    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: 'Server error during registration',
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        message: 'Email and password are required',
      });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Invalid email or password',
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error during login',
    });
  }
};

const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: 'Server error while fetching profile',
    });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, age, gender, height, weight } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    if (name !== undefined) user.name = name.trim();
    if (age !== undefined) user.age = age;
    if (gender !== undefined) user.gender = gender;
    if (height !== undefined) user.height = height;
    if (weight !== undefined) user.weight = weight;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        height: user.height,
        weight: user.weight,
      },
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: error.message,
      });
    }

    res.status(500).json({
      message: 'Server error while updating profile',
    });
  }
};

const calculateBMI = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    const { height, weight } = user;

    if (!height || !weight || height <= 0 || weight <= 0) {
      return res.status(400).json({
        message: 'Height and weight must be provided to calculate BMI',
      });
    }

    const heightInMeters = height / 100;
    const bmiRaw = weight / (heightInMeters * heightInMeters);
    const bmi = Number(bmiRaw.toFixed(2));

    let category = '';
    if (bmi < 18.5) {
      category = 'Underweight';
    } else if (bmi <= 24.9) {
      category = 'Normal Weight';
    } else if (bmi <= 29.9) {
      category = 'Overweight';
    } else {
      category = 'Obese';
    }

    res.status(200).json({
      height,
      weight,
      bmi,
      category,
    });
  } catch (error) {
    res.status(500).json({
      message: 'Server error while calculating BMI',
    });
  }
};

module.exports = { register, login, getProfile, updateProfile, calculateBMI };
