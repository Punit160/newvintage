// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const helmet = require('helmet');
// const compression = require('compression');
// const rateLimit = require('express-rate-limit');
// const morgan = require('morgan');
// const http = require('http');
// const { Server } = require('socket.io');
// const seedAdmin=require('./scripts/seedData');
// const { sendReminders } = require('./utils/reminderService');
// require('dotenv').config();
// const cron = require('node-cron');
// const app = express();
// const server = http.createServer(app);
// //testing
// // app.use(
// //   "/api/webhooks/stripe",
// //   express.raw({ type: "application/json" }),
// //   require("./routes/subscriptionsWebhook")
// // );

// //live
// app.use(
//   "/api/webhook",
//   express.raw({ type: "application/json" }),
//   require("./routes/subscriptionsWebhook")
// );

// // ✅ Socket IO Setup (allow all origins for testing)
// const io = new Server(server, {
//   cors: {
//     origin: "*",
//     methods: ["GET", "POST"],
//     credentials: true
//   }
// });

// // ✅ Socket user mapping
// const userSocketMap = {};

// io.on("connection", (socket) => {
//   console.log("✅ Socket connected:", socket.id);

//   socket.on("registerUser", (userId) => {
//     userSocketMap[userId] = socket.id;
//     // console.log("🎯 Registered:", userId, socket.id);
//   });

//   socket.on("sendPrivateMessage", ({ receiverId, chatId, message, senderId }) => {
//     const receiverSocket = userSocketMap[receiverId];
// // console.log("::::::::::_::::::::",receiverId, chatId, message, senderId );

//     if (receiverSocket) {
//       io.to(receiverSocket).emit("receiveMessage", {
//         chatId,
//         message,
//         senderId,
//         timestamp: new Date()
//       });
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("❌ Socket disconnected:", socket.id);
//     for (const userId in userSocketMap) {
//       if (userSocketMap[userId] === socket.id) {
//         delete userSocketMap[userId];
//       }
//     }
//   });
// });

// // ✅ expose socket to routes
// app.set("io", io);
// app.set("userSocketMap", userSocketMap);

// const PORT = process.env.PORT || 5000;




// // ✅ Security and optimization middlewares
// app.use(cors({ origin: "*", credentials: true }));

// app.use(helmet());
// app.use(compression());

// // ✅ Prevent overloads
// app.use(rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 1000
// }));

// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true }));
// app.use(morgan('combined'));

// // ✅ Database connection
// mongoose
//   .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/healthwellness")
//   .then(async () => {
//     console.log("MongoDB Connected ✅");

//     // 🔥 Auto create admin if missing
//     await seedAdmin();
//   })
//   .catch(err => console.error("MongoDB Error ❌", err));

// // ✅ Routes
// app.use('/api/auth', require('./routes/auth'));
// app.use('/api/users', require('./routes/users'));
// app.use('/api/admin', require('./routes/admin'));
// app.use('/api/categories', require('./routes/categories'));
// app.use('/api/subscriptions', require('./routes/subscriptions'));
// app.use('/api/chat', require('./routes/chat'));
// app.use('/api/meetings', require('./routes/meetings'));
// app.use('/api/symptoms', require('./routes/symptoms'));
// app.use('/api/banner', require('./routes/banner'));
// app.use('/api/wellness', require('./routes/wellnessRoutes'));
// app.use("/uploads", express.static("uploads"));

// app.use("/api/blocked-dates", require("./routes/blockedDates"));

// // ✅ Health check
// app.get('/health', (req, res) =>
//   res.status(200).json({
//     success: true,
//     message: 'Server running',
//     timestamp: new Date().toISOString()
//   })
// );

// // ✅ Wildcard route
// app.use('*', (req, res) =>
//   res.status(404).json({ success: false, message: 'Route not found' })
// );

// cron.schedule('0 * * * *', async () => {
//   try {
//     await sendReminders();
//   } catch (err) {
//     console.error('❌ Reminder job error:', err.message);
//   }
// });
// // ✅ Crucial: Listen on all interfaces (Local Network Support)
// server.listen(PORT, "0.0.0.0", () =>
//   console.log(`🔥 Server running at: http://192.168.1.5:${PORT}`)
// );

// module.exports = app;



const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const http = require('http');
const { Server } = require('socket.io');
const seedAdmin = require('./scripts/seedData');
const { sendReminders } = require('./utils/reminderService');
require('dotenv').config();
const cron = require('node-cron');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
app.set('trust proxy', 1);
//live
app.use(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  require("./routes/subscriptionsWebhook")
);

// ✅ Socket IO Setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// ✅ Socket user mapping
const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("✅ Socket connected:", socket.id);

  socket.on("registerUser", (userId) => {
    userSocketMap[userId] = socket.id;
  });

  socket.on("sendPrivateMessage", ({ receiverId, chatId, message, senderId }) => {
    const receiverSocket = userSocketMap[receiverId];
    if (receiverSocket) {
      io.to(receiverSocket).emit("receiveMessage", {
        chatId,
        message,
        senderId,
        timestamp: new Date()
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
    for (const userId in userSocketMap) {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
      }
    }
  });
});

app.set("io", io);
app.set("userSocketMap", userSocketMap);

const PORT = process.env.PORT || 5000;

function rewriteLiveAppUrl(url) {
  const queryIndex = url.indexOf('?');
  const query = queryIndex === -1 ? '' : url.slice(queryIndex);
  let path = queryIndex === -1 ? url : url.slice(0, queryIndex);

  while (path === '/api/api' || path.startsWith('/api/api/')) {
    path = path.slice(4);
  }

  if (path === '/api/uploads' || path.startsWith('/api/uploads/')) {
    path = path.slice(4);
  }

  if (path === '/images' || path.startsWith('/images/')) {
    path = `/uploads${path.slice('/images'.length)}`;
  } else if (path === '/api/images' || path.startsWith('/api/images/')) {
    path = `/uploads${path.slice('/api/images'.length)}`;
  }

  const next = path + query;
  return next === url ? null : next;
}

function publicOrigin(req) {
  const configured = (process.env.PUBLIC_URL || '').trim().replace(/\/$/, '');
  if (configured) return configured;
  const proto = String(req.headers['x-forwarded-proto'] || req.protocol || 'http').split(',')[0].trim();
  const host = String(req.headers['x-forwarded-host'] || req.get('host') || '').split(',')[0].trim();
  return `${proto}://${host}`;
}

function absolutizeUploads(value, origin) {
  if (typeof value === 'string') {
    if (value.startsWith('http://') || value.startsWith('https://')) return value;
    if (value.startsWith('/uploads/') || value.startsWith('/images/')) {
      const filePath = value.startsWith('/images/')
        ? `/uploads/${value.slice('/images/'.length)}`
        : value;
      return `${origin}${filePath}`;
    }
    return value;
  }
  if (Array.isArray(value)) return value.map((item) => absolutizeUploads(item, origin));
  if (value && typeof value === 'object') {
    const copy = {};
    for (const key of Object.keys(value)) copy[key] = absolutizeUploads(value[key], origin);
    return copy;
  }
  return value;
}

// ✅ Enhanced CORS configuration
const corsOptions = {
  origin: "*",
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With', 'Accept', 'Range'],
  exposedHeaders: ['Content-Range', 'Content-Length', 'Accept-Ranges']
};

app.use(cors(corsOptions));

// ✅ Updated Helmet configuration to allow video streaming
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false, // Allow cross-origin video embedding
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      mediaSrc: ["'self'", "data:", "blob:", "*"],
      connectSrc: ["'self'", "https:", "wss:", "http:"],
      fontSrc: ["'self'", "data:", "https://fonts.gstatic.com", "https://cdn.jsdelivr.net"],
      upgradeInsecureRequests: null,
    },
  },
}));

app.use(compression());

// ✅ Prevent overloads
// app.use(rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 1000
// }));
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  validate: { trustProxy: true }
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('combined'));

// Live Play Store / App Store builds call https://vintagecms.cloud/api/api/api
// and load media from https://vintagecms.cloud/api/api/uploads.
// The admin portal keeps using /api and /uploads. Rewrite before the routes.
app.use((req, res, next) => {
  const url = req.url || '';
  const rewritten = rewriteLiveAppUrl(url);
  if (rewritten) req.url = rewritten;

  if ((req.url || '').startsWith('/api')) {
    delete req.headers['if-none-match'];
    delete req.headers['if-modified-since'];
  }

  const origin = publicOrigin(req);
  const sendJson = res.json.bind(res);
  res.json = (body) => {
    res.set('Cache-Control', 'no-store');
    try {
      return sendJson(absolutizeUploads(JSON.parse(JSON.stringify(body)), origin));
    } catch (error) {
      return sendJson(body);
    }
  };
  next();
});

// ✅ Database connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/healthwellness")
  .then(async () => {
    console.log("MongoDB Connected ✅");
    await seedAdmin();
  })
  .catch(err => console.error("MongoDB Error ❌", err));

// ✅ Create uploads directory
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('📁 Created uploads directory:', uploadsDir);
}

// ✅ Serve static files with proper headers
app.use('/uploads', (req, res, next) => {
  // Log video requests
  // console.log('🎥 Video requested:', req.url);
  
  // Set CORS headers
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Range');
  res.header('Access-Control-Expose-Headers', 'Content-Length, Content-Range, Accept-Ranges');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  res.header('Cross-Origin-Embedder-Policy', 'credentialless');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
}, express.static(uploadsDir, {
  setHeaders: (res, filePath, stat) => {
    const ext = path.extname(filePath).toLowerCase();
    
    if (ext === '.mp4') {
      res.setHeader('Content-Type', 'video/mp4');
    } else if (ext === '.mov') {
      res.setHeader('Content-Type', 'video/quicktime');
    } else if (ext === '.avi') {
      res.setHeader('Content-Type', 'video/x-msvideo');
    } else if (ext === '.webm') {
      res.setHeader('Content-Type', 'video/webm');
    }
    
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

console.log('📁 Serving static files from:', uploadsDir);

// ✅ Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/meetings', require('./routes/meetings'));
app.use('/api/symptoms', require('./routes/symptoms'));
app.use('/api/banner', require('./routes/banner'));
app.use('/api/wellness', require('./routes/wellnessRoutes'));
app.use("/api/blocked-dates", require("./routes/blockedDates"));

// ✅ Test endpoint for video debugging
app.get('/check-video/:filename', (req, res) => {
  const filename = req.params.filename;
  const videoPath = path.join(uploadsDir, filename);
  
  if (fs.existsSync(videoPath)) {
    res.json({
      success: true,
      message: 'Video exists',
      path: videoPath,
      size: fs.statSync(videoPath).size,
      url: `http://localhost:${PORT}/uploads/${filename}`
    });
  } else {
    res.status(404).json({
      success: false,
      message: 'Video not found',
      path: videoPath
    });
  }
});

// ✅ Health check
app.get('/health', (req, res) =>
  res.status(200).json({
    success: true,
    message: 'Server running',
    timestamp: new Date().toISOString()
  })
);

const adminDist = path.join(__dirname, '../frontend/dist');
const adminIndex = path.join(adminDist, 'index.html');
if (fs.existsSync(adminIndex)) {
  app.use(express.static(adminDist));
  console.log('Admin panel served from', adminDist);
}

app.use((req, res) => {
  const isApi = req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/health') || req.path.startsWith('/check-video');
  if (!isApi && req.method === 'GET' && fs.existsSync(adminIndex)) {
    return res.sendFile(adminIndex);
  }
  res.status(404).json({ success: false, message: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  res.status(err.status || 500).json({
    success: false,
    message: 'Something went wrong',
  });
});

cron.schedule('0 * * * *', async () => {
  try {
    await sendReminders();
  } catch (err) {
    console.error('❌ Reminder job error:', err.message);
  }
});

server.listen(PORT, "0.0.0.0", () =>
  console.log(`Server running on port ${PORT}`)
);

module.exports = app;
