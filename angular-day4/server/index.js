const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;

// In-Memory Database with Seed Data
let employees = [
  {
    id: 1,
    name: 'Sujal Nage',
    email: 'sujal@spikeoffice.io',
    department: 'Engineering',
    role: 'Senior Full Stack Developer',
    salary: 115000,
    active: true,
    joinDate: '2023-01-15',
    skills: ['Angular 17', 'TypeScript', 'Node.js', 'RxJS', 'Docker'],
    isManager: true,
    teamSize: 6,
    managerBonus: 12000,
    phone: '+1 (555) 234-5678',
    notes: 'Lead engineer on platform modernization and API integrations.'
  },
  {
    id: 2,
    name: 'Sarah Connor',
    email: 'sarah.connor@spikeoffice.io',
    department: 'Engineering',
    role: 'VP of Engineering',
    salary: 165000,
    active: true,
    joinDate: '2021-03-01',
    skills: ['System Design', 'Cloud Architecture', 'Leadership', 'Cybersecurity'],
    isManager: true,
    teamSize: 24,
    managerBonus: 25000,
    phone: '+1 (555) 345-6789',
    notes: 'Oversees engineering roadmap, infrastructure and security posture.'
  },
  {
    id: 3,
    name: 'Alex Mercer',
    email: 'alex.mercer@spikeoffice.io',
    department: 'Engineering',
    role: 'Senior Frontend Engineer',
    salary: 98000,
    active: true,
    joinDate: '2022-06-10',
    skills: ['Angular', 'RxJS', 'CSS Modules', 'WebSockets'],
    isManager: false,
    phone: '+1 (555) 456-7890',
    notes: 'Specialist in design systems and responsive dark UI.'
  },
  {
    id: 4,
    name: 'Elena Rostova',
    email: 'elena.rostova@spikeoffice.io',
    department: 'Design',
    role: 'Lead UI/UX Designer',
    salary: 95000,
    active: true,
    joinDate: '2022-09-18',
    skills: ['Figma', 'Design Systems', 'User Research', 'Prototyping'],
    isManager: true,
    teamSize: 4,
    managerBonus: 8000,
    phone: '+1 (555) 567-8901',
    notes: 'Authored enterprise design tokens and user flow guidelines.'
  },
  {
    id: 5,
    name: 'Marcus Vance',
    email: 'marcus.vance@spikeoffice.io',
    department: 'Product',
    role: 'Principal Product Manager',
    salary: 125000,
    active: true,
    joinDate: '2022-02-11',
    skills: ['Product Strategy', 'Agile / Scrum', 'Analytics', 'Market Research'],
    isManager: true,
    teamSize: 5,
    managerBonus: 15000,
    phone: '+1 (555) 678-9012',
    notes: 'Spearheads SaaS subscription metrics and sprint execution.'
  },
  {
    id: 6,
    name: 'Chloe Price',
    email: 'chloe.price@spikeoffice.io',
    department: 'Marketing',
    role: 'Growth Marketing Specialist',
    salary: 76000,
    active: false,
    joinDate: '2023-04-20',
    skills: ['SEO', 'Content Strategy', 'HubSpot', 'Campaign Automation'],
    isManager: false,
    phone: '+1 (555) 789-0123',
    notes: 'Currently on extended educational sabbatical.'
  },
  {
    id: 7,
    name: 'David Kim',
    email: 'david.kim@spikeoffice.io',
    department: 'Engineering',
    role: 'Backend Architect',
    salary: 132000,
    active: true,
    joinDate: '2021-11-05',
    skills: ['Node.js', 'PostgreSQL', 'Docker', 'Kubernetes', 'gRPC'],
    isManager: false,
    phone: '+1 (555) 890-1234',
    notes: 'Oversees distributed caching and database read-replicas.'
  },
  {
    id: 8,
    name: 'Amina Al-Mansoor',
    email: 'amina.mansoor@spikeoffice.io',
    department: 'Human Resources',
    role: 'Head of People Operations',
    salary: 105000,
    active: true,
    joinDate: '2020-08-14',
    skills: ['Talent Acquisition', 'Payroll Operations', 'Compliance', 'Conflict Resolution'],
    isManager: true,
    teamSize: 3,
    managerBonus: 10000,
    phone: '+1 (555) 901-2345',
    notes: 'Coordinates global employee compensation and benefits compliance.'
  }
];

// Registered System Users
const users = [
  {
    id: 'usr_admin',
    name: 'Sarah Connor',
    email: 'admin@spikeoffice.io',
    password: 'Admin@123',
    role: 'Admin',
    avatar: 'SC'
  },
  {
    id: 'usr_manager',
    name: 'Marcus Vance',
    email: 'manager@spikeoffice.io',
    password: 'Manager@123',
    role: 'Manager',
    avatar: 'MV'
  },
  {
    id: 'usr_employee',
    name: 'Alex Mercer',
    email: 'employee@spikeoffice.io',
    password: 'Employee@123',
    role: 'Employee',
    avatar: 'AM'
  }
];

// Active sessions: refreshToken -> { userId, role, email, expiresAt }
const refreshTokens = new Map();

// Helper: Generate simple mock token string containing encoded payload
function generateToken(payload, expiresInSeconds = 900) {
  const expiresAt = Date.now() + expiresInSeconds * 1000;
  const data = JSON.stringify({ ...payload, exp: expiresAt });
  return Buffer.from(data).toString('base64');
}

function verifyToken(tokenStr) {
  if (!tokenStr) return null;
  try {
    const raw = Buffer.from(tokenStr, 'base64').toString('utf8');
    const parsed = JSON.parse(raw);
    if (parsed.exp && Date.now() > parsed.exp) {
      return { expired: true };
    }
    return parsed;
  } catch (e) {
    return null;
  }
}

// Request Body Parser helper
function getRequestBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        reject(new Error('Invalid JSON payload'));
      }
    });
  });
}

// Send JSON Response helper
function sendJSON(res, statusCode, data, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Simulate-Error',
    ...headers
  });
  res.end(JSON.stringify(data));
}

// Extract Bearer Token
function getBearerToken(req) {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return null;
  return auth.substring(7).trim();
}

const server = http.createServer(async (req, res) => {
  // Global CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Simulate-Error'
    });
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;
  const method = req.method;

  // Simulate Error header test
  if (req.headers['x-simulate-error'] === '500') {
    return sendJSON(res, 500, {
      error: 'Simulated 500 Internal Server Error',
      message: 'Header X-Simulate-Error triggered server crash simulation.'
    });
  }

  // Artificial slight latency (120ms) to ensure smooth loading indicator testing
  await new Promise(r => setTimeout(r, 120));

  // ----------------------------------------------------
  // Failure Test Endpoints (Step 5)
  // ----------------------------------------------------
  if (pathname === '/api/test/simulate-500') {
    return sendJSON(res, 500, {
      error: 'Internal Server Error',
      message: 'Intentionally triggered 500 server crash for testing.'
    });
  }

  // ----------------------------------------------------
  // Auth Endpoints
  // ----------------------------------------------------
  // POST /api/auth/login
  if (pathname === '/api/auth/login' && method === 'POST') {
    try {
      const { email, password } = await getRequestBody(req);
      const user = users.find(u => u.email.toLowerCase() === (email || '').toLowerCase());

      if (!user || user.password !== password) {
        return sendJSON(res, 401, {
          error: 'Unauthorized',
          message: 'Invalid email or password. Check credentials and try again.'
        });
      }

      // Generate Access Token (valid for 15 mins) & Refresh Token (valid for 7 days)
      const accessToken = generateToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }, 900); // 15 mins

      const refreshToken = generateToken({
        id: user.id,
        type: 'refresh'
      }, 7 * 24 * 3600);

      refreshTokens.set(refreshToken, {
        userId: user.id,
        role: user.role,
        email: user.email
      });

      return sendJSON(res, 200, {
        accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar
        }
      });
    } catch (e) {
      return sendJSON(res, 400, { error: 'Bad Request', message: e.message });
    }
  }

  // POST /api/auth/refresh
  if (pathname === '/api/auth/refresh' && method === 'POST') {
    try {
      const { refreshToken } = await getRequestBody(req);
      if (!refreshToken || !refreshTokens.has(refreshToken)) {
        return sendJSON(res, 401, {
          error: 'Invalid Refresh Token',
          message: 'The session has expired. Please sign in again.'
        });
      }

      const decoded = verifyToken(refreshToken);
      if (!decoded || decoded.expired) {
        refreshTokens.delete(refreshToken);
        return sendJSON(res, 401, {
          error: 'Refresh Token Expired',
          message: 'Session validity period elapsed. Please re-authenticate.'
        });
      }

      const session = refreshTokens.get(refreshToken);
      const user = users.find(u => u.id === session.userId);
      if (!user) {
        return sendJSON(res, 401, { error: 'User Not Found' });
      }

      // Rotate tokens
      refreshTokens.delete(refreshToken);
      const newAccessToken = generateToken({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }, 900);

      const newRefreshToken = generateToken({
        id: user.id,
        type: 'refresh'
      }, 7 * 24 * 3600);

      refreshTokens.set(newRefreshToken, {
        userId: user.id,
        role: user.role,
        email: user.email
      });

      return sendJSON(res, 200, {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken
      });
    } catch (e) {
      return sendJSON(res, 400, { error: 'Bad Request', message: e.message });
    }
  }

  // POST /api/auth/logout
  if (pathname === '/api/auth/logout' && method === 'POST') {
    try {
      const { refreshToken } = await getRequestBody(req);
      if (refreshToken) {
        refreshTokens.delete(refreshToken);
      }
      return sendJSON(res, 200, { message: 'Signed out successfully' });
    } catch (e) {
      return sendJSON(res, 200, { message: 'Signed out' });
    }
  }

  // ----------------------------------------------------
  // Employees CRUD Endpoints
  // ----------------------------------------------------

  // Verify authentication token for all /api/employees routes
  if (pathname.startsWith('/api/employees')) {
    const token = getBearerToken(req);
    const tokenPayload = verifyToken(token);

    if (!tokenPayload) {
      return sendJSON(res, 401, {
        error: 'Unauthorized',
        message: 'A valid Bearer authentication token is required.'
      });
    }

    if (tokenPayload.expired) {
      return sendJSON(res, 401, {
        error: 'Token Expired',
        message: 'Your access token has expired. Use refresh token to obtain a new one.'
      });
    }

    // Attach requester context
    req.user = tokenPayload;
  }

  // GET /api/employees (List with Search, Filter, Sort, Pagination)
  if (pathname === '/api/employees' && method === 'GET') {
    let list = [...employees];
    const q = (parsedUrl.query.search || '').trim().toLowerCase();
    const dept = parsedUrl.query.department;
    const status = parsedUrl.query.status;
    const sortBy = parsedUrl.query.sortBy || 'name';
    const sortOrder = parsedUrl.query.sortOrder || 'asc';
    const page = Math.max(1, parseInt(parsedUrl.query.page, 10) || 1);
    const pageSize = Math.max(1, parseInt(parsedUrl.query.pageSize, 10) || 5);

    // Filter by Search Query
    if (q) {
      list = list.filter(
        e =>
          e.name.toLowerCase().includes(q) ||
          e.email.toLowerCase().includes(q) ||
          e.role.toLowerCase().includes(q) ||
          (e.skills && e.skills.some(s => s.toLowerCase().includes(q)))
      );
    }

    // Filter by Department
    if (dept && dept !== 'All') {
      list = list.filter(e => e.department === dept);
    }

    // Filter by Active Status
    if (status && status !== 'all') {
      const wantActive = status === 'active';
      list = list.filter(e => e.active === wantActive);
    }

    // Sorting
    const mult = sortOrder === 'desc' ? -1 : 1;
    list.sort((a, b) => {
      if (sortBy === 'salary') return (a.salary - b.salary) * mult;
      if (sortBy === 'department') return a.department.localeCompare(b.department) * mult;
      return a.name.localeCompare(b.name) * mult;
    });

    const total = list.length;
    const totalPages = Math.ceil(total / pageSize) || 1;
    const start = (page - 1) * pageSize;
    const items = list.slice(start, start + pageSize);

    return sendJSON(res, 200, {
      items,
      total,
      page,
      pageSize,
      totalPages
    });
  }

  // GET /api/employees/:id
  const singleMatch = pathname.match(/^\/api\/employees\/(\d+)$/);
  if (singleMatch && method === 'GET') {
    const id = parseInt(singleMatch[1], 10);
    const employee = employees.find(e => e.id === id);

    if (!employee) {
      return sendJSON(res, 404, {
        error: 'Not Found',
        message: `Employee #${id} does not exist.`
      });
    }

    return sendJSON(res, 200, employee);
  }

  // POST /api/employees (Create)
  if (pathname === '/api/employees' && method === 'POST') {
    try {
      const data = await getRequestBody(req);

      // Validation
      if (!data.name || !data.email || !data.department || !data.role) {
        return sendJSON(res, 400, {
          error: 'Validation Failed',
          message: 'Name, email, department, and role are required fields.'
        });
      }

      if (employees.some(e => e.email.toLowerCase() === data.email.toLowerCase())) {
        return sendJSON(res, 400, {
          error: 'Duplicate Record',
          message: `An employee with email ${data.email} is already registered.`
        });
      }

      const nextId = employees.length > 0 ? Math.max(...employees.map(e => e.id)) + 1 : 1;
      const newEmployee = {
        ...data,
        id: nextId,
        active: data.active !== undefined ? data.active : true,
        skills: Array.isArray(data.skills) ? data.skills : ['General'],
        joinDate: data.joinDate || new Date().toISOString().substring(0, 10)
      };

      employees = [newEmployee, ...employees];
      return sendJSON(res, 201, newEmployee);
    } catch (e) {
      return sendJSON(res, 400, { error: 'Bad Request', message: e.message });
    }
  }

  // PATCH /api/employees/:id (Update)
  if (singleMatch && method === 'PATCH') {
    try {
      const id = parseInt(singleMatch[1], 10);
      const index = employees.findIndex(e => e.id === id);

      if (index === -1) {
        return sendJSON(res, 404, {
          error: 'Not Found',
          message: `Cannot update employee #${id}: record not found.`
        });
      }

      const patchData = await getRequestBody(req);
      const updated = {
        ...employees[index],
        ...patchData,
        id // enforce ID immutability
      };

      employees[index] = updated;
      return sendJSON(res, 200, updated);
    } catch (e) {
      return sendJSON(res, 400, { error: 'Bad Request', message: e.message });
    }
  }

  // DELETE /api/employees/:id (Admin-only Authorization Check)
  if (singleMatch && method === 'DELETE') {
    const id = parseInt(singleMatch[1], 10);

    // Step 4: Authorization Check: Admin-only employee deletion!
    if (req.user.role !== 'Admin') {
      return sendJSON(res, 403, {
        error: 'Forbidden',
        message: `Action Forbidden: Only users with the 'Admin' role can delete employee records. Your current role is '${req.user.role}'.`
      });
    }

    const index = employees.findIndex(e => e.id === id);
    if (index === -1) {
      return sendJSON(res, 404, {
        error: 'Not Found',
        message: `Employee #${id} not found.`
      });
    }

    const removed = employees[index];
    employees.splice(index, 1);

    return sendJSON(res, 200, {
      success: true,
      message: `Employee #${id} (${removed.name}) successfully deleted.`
    });
  }

  // 404 Fallback
  return sendJSON(res, 404, {
    error: 'Route Not Found',
    path: pathname
  });
});

server.listen(PORT, () => {
  console.log(`[SpikeHR Backend API] Running on http://localhost:${PORT}`);
  console.log(`  Endpoints:`);
  console.log(`  - POST   /api/auth/login`);
  console.log(`  - POST   /api/auth/refresh`);
  console.log(`  - POST   /api/auth/logout`);
  console.log(`  - GET    /api/employees`);
  console.log(`  - GET    /api/employees/:id`);
  console.log(`  - POST   /api/employees`);
  console.log(`  - PATCH  /api/employees/:id`);
  console.log(`  - DELETE /api/employees/:id (Admin Only)`);
  console.log(`  - POST   /api/test/simulate-500`);
});
