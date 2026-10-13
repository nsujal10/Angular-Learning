const http = require('http');
const url = require('url');

const PORT = process.env.PORT || 3000;

// Seed employees dataset with realistic workforce data
const employees = [
  {
    id: 1,
    name: 'Sujal Nage',
    email: 'sujal@spikeoffice.io',
    department: 'Engineering',
    role: 'Senior Full Stack Engineer',
    avatar: 'SN',
    location: 'San Francisco, CA',
    status: 'Active'
  },
  {
    id: 2,
    name: 'Sarah Connor',
    email: 'sarah.connor@spikeoffice.io',
    department: 'Engineering',
    role: 'VP of Engineering',
    avatar: 'SC',
    location: 'Austin, TX',
    status: 'Active'
  },
  {
    id: 3,
    name: 'Alex Mercer',
    email: 'alex.mercer@spikeoffice.io',
    department: 'Engineering',
    role: 'Senior Angular Specialist',
    avatar: 'AM',
    location: 'New York, NY',
    status: 'Active'
  },
  {
    id: 4,
    name: 'Elena Rostova',
    email: 'elena.rostova@spikeoffice.io',
    department: 'Design',
    role: 'Lead UI/UX Designer',
    avatar: 'ER',
    location: 'London, UK',
    status: 'Active'
  },
  {
    id: 5,
    name: 'Marcus Vance',
    email: 'marcus.vance@spikeoffice.io',
    department: 'Product',
    role: 'Principal Product Manager',
    avatar: 'MV',
    location: 'Seattle, WA',
    status: 'Active'
  },
  {
    id: 6,
    name: 'Chloe Price',
    email: 'chloe.price@spikeoffice.io',
    department: 'Marketing',
    role: 'Growth Marketing Lead',
    avatar: 'CP',
    location: 'Portland, OR',
    status: 'On Leave'
  },
  {
    id: 7,
    name: 'David Kim',
    email: 'david.kim@spikeoffice.io',
    department: 'Engineering',
    role: 'Backend Architect',
    avatar: 'DK',
    location: 'Chicago, IL',
    status: 'Active'
  },
  {
    id: 8,
    name: 'Amina Al-Mansoor',
    email: 'amina.mansoor@spikeoffice.io',
    department: 'Human Resources',
    role: 'Head of People Operations',
    avatar: 'AA',
    location: 'Toronto, CA',
    status: 'Active'
  },
  {
    id: 9,
    name: 'Julian Thorne',
    email: 'julian.thorne@spikeoffice.io',
    department: 'Finance',
    role: 'Director of Financial Planning',
    avatar: 'JT',
    location: 'Boston, MA',
    status: 'Active'
  },
  {
    id: 10,
    name: 'Sophia Chen',
    email: 'sophia.chen@spikeoffice.io',
    department: 'Design',
    role: 'Design Systems Architect',
    avatar: 'SC',
    location: 'San Jose, CA',
    status: 'Active'
  },
  {
    id: 11,
    name: 'Liam O’Connor',
    email: 'liam.oconnor@spikeoffice.io',
    department: 'Product',
    role: 'Technical Product Specialist',
    avatar: 'LO',
    location: 'Dublin, IE',
    status: 'Active'
  },
  {
    id: 12,
    name: 'Zoe Kravitz',
    email: 'zoe.kravitz@spikeoffice.io',
    department: 'Marketing',
    role: 'Content Strategy Director',
    avatar: 'ZK',
    location: 'Los Angeles, CA',
    status: 'Active'
  }
];

function sendJSON(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization'
  });
  res.end(JSON.stringify(data));
}

let requestCounter = 0;

const server = http.createServer((req, res) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization'
    });
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const pathname = parsedUrl.pathname;

  // GET /api/employees?search=...
  if (pathname === '/api/employees' && req.method === 'GET') {
    requestCounter++;
    const currentReqId = requestCounter;
    const term = (parsedUrl.query.search || '').trim().toLowerCase();
    const shouldFail = parsedUrl.query.fail === 'true';
    const delayMs = parseInt(parsedUrl.query.delay, 10) || 250; // realistic server latency to observe switchMap cancellation

    console.log(`[REQ #${currentReqId}] GET /api/employees?search="${term}" (Latency: ${delayMs}ms)`);

    setTimeout(() => {
      if (shouldFail) {
        console.log(`[REQ #${currentReqId}] Simulated Server Error`);
        return sendJSON(res, 500, {
          error: 'Internal Server Error',
          message: 'Simulated backend search failure.'
        });
      }

      let results = [...employees];
      if (term) {
        results = results.filter(emp =>
          emp.name.toLowerCase().includes(term) ||
          emp.department.toLowerCase().includes(term) ||
          emp.email.toLowerCase().includes(term) ||
          emp.role.toLowerCase().includes(term)
        );
      }

      console.log(`[REQ #${currentReqId}] Responding with ${results.length} matches`);
      sendJSON(res, 200, results);
    }, delayMs);
    return;
  }

  // 404 Fallback
  sendJSON(res, 404, { error: 'Not Found', path: pathname });
});

server.listen(PORT, () => {
  console.log(`[Live Search API] Server listening on http://localhost:${PORT}`);
  console.log(`  Endpoint available: GET /api/employees?search=term`);
});
