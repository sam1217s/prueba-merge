const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ✅ IMPLEMENTADO - Registro de usuarios
exports.register = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: 'Username and password are required' });
    }

    if (username.length < 3 || username.length > 20) {
      return res.status(400).json({ msg: 'Username must be between 3 and 20 characters' });
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ msg: 'Username can only contain letters, numbers and underscores' });
    }

    if (password.length < 6 || password.length > 50) {
      return res.status(400).json({ msg: 'Password must be between 6 and 50 characters' });
    }

    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    if (!hasLetter || !hasNumber) {
      return res.status(400).json({ msg: 'Password must contain at least one letter and one number' });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ msg: 'Please provide a valid email address' });
      }
    }

    const existingUser = await User.findOne({
      $or: [
        { username: username.toLowerCase() },
        ...(email ? [{ email: email.toLowerCase() }] : [])
      ]
    });

    if (existingUser) {
      if (existingUser.username === username.toLowerCase()) {
        return res.status(400).json({ msg: 'Username already exists' });
      }
      if (existingUser.email === email?.toLowerCase()) {
        return res.status(400).json({ msg: 'Email already registered' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      username: username.toLowerCase(),
      password: hashedPassword,
      email: email ? email.toLowerCase() : null,
      createdAt: new Date(),
      isActive: true
    });

    await newUser.save();

    res.status(201).json({
      msg: 'User registered successfully',
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        createdAt: newUser.createdAt
      }
    });
  } catch (err) {
    console.error('Registration error:', err);
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      return res.status(400).json({
        msg: `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
      });
    }
    res.status(500).json({ error: 'Internal server error during registration' });
  }
};

// ✅ IMPLEMENTADO - Login de usuarios
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ msg: 'Username and password are required' });
    }

    const user = await User.findByUsernameOrEmail(username);
    if (!user) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    user.lastLogin = new Date();
    await user.save();

    res.json({
      msg: 'Login successful',
      token,
      user: user.getPublicProfile()
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Internal server error during login' });
  }
};

// ✅ IMPLEMENTADO - Datos del dashboard
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }

    const dashboardData = {
      user: {
        name: user.username,
        avatar: `https://ui-avatars.com/api/?name=${user.username}&background=6366f1&color=fff`
      },
      earnings: {
        amount: 8350,
        change: '+10% since last month',
        trend: 'up'
      },
      rank: {
        position: 98,
        description: 'in top 100'
      },
      projects: {
        total: 32,
        pending: 'mobile app',
        completed: 'branding'
      },
      recentInvoices: [
        {
          id: 1,
          client: 'Alexander Williams',
          company: 'AX creations',
          amount: 1200.87,
          status: 'Paid',
          avatar: 'https://ui-avatars.com/api/?name=Alexander+Williams&background=10b981&color=fff'
        },
        {
          id: 2,
          client: 'John Phillips',
          company: 'design studio',
          amount: 12989.88,
          status: 'Late',
          avatar: 'https://ui-avatars.com/api/?name=John+Phillips&background=ef4444&color=fff'
        }
      ],
      yourProjects: [
        {
          id: 1,
          title: 'Logo design for Bakery',
          daysRemaining: 3,
          avatar: 'https://ui-avatars.com/api/?name=Bakery&background=f59e0b&color=fff'
        },
        {
          id: 2,
          title: 'Personal branding project',
          daysRemaining: 5,
          avatar: 'https://ui-avatars.com/api/?name=Branding&background=8b5cf6&color=fff'
        }
      ],
      recommendedProject: {
        client: 'Thomas Martin',
        company: 'Upside Designs',
        title: 'Need a designer to form branding essentials for my business.',
        description: 'Looking for a talented brand designer to create all the branding materials for my new bakery.',
        budget: 8700,
        status: 'Design',
        avatar: 'https://ui-avatars.com/api/?name=Thomas+Martin&background=6366f1&color=fff'
      }
    };

    res.json(dashboardData);
  } catch (err) {
    console.error('Dashboard data error:', err);
    res.status(500).json({ error: 'Error loading dashboard data' });
  }
};
