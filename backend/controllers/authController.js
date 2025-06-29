const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// ❌ NO TOCAR - Responsabilidad del Desarrollador 2
exports.register = async (req, res) => {
  try {
    res.status(501).json({ 
      msg: 'Register function not implemented yet',
      developer: 'Desarrollador 2 debe implementar esta función' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ❌ NO TOCAR - Responsabilidad del Desarrollador 1
exports.login = async (req, res) => {
  try {
    res.status(501).json({ 
      msg: 'Login function not implemented yet',
      developer: 'Desarrollador 1 debe implementar esta función' 
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ IMPLEMENTADO - Responsabilidad del Desarrollador 3
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Obtener datos del usuario
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'Usuario no encontrado' });
    }
    
    // Simular datos del dashboard
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