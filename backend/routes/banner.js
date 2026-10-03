const express = require('express');
const multer = require('multer');
const Banner = require('../models/Banner');
const { auth, adminAuth } = require('../middleware/auth');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const router = express.Router();



// --- Ensure uploads folder exists ---
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  // console.log('📁 Uploads folder created at:', uploadDir);
} else {
  // console.log('📁 Uploads folder exists at:', uploadDir);
}

// --- Video validation helper function using ffprobe ---
const validateVideoDimensions = async (videoPath) => {
  return new Promise((resolve, reject) => {
    // Try to use ffprobe if available, otherwise use a simple check
    const ffprobePath = 'ffprobe'; // Assuming ffprobe is in PATH
    
    const command = `${ffprobePath} -v error -select_streams v:0 -show_entries stream=width,height -of csv=p=0 "${videoPath}"`;
    
    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('❌ FFprobe error:', error);
        // If ffprobe fails, accept the video but log warning
        // console.log('⚠️ Could not validate video dimensions, accepting video');
        resolve({ width: 0, height: 0, aspectRatio: 0, warning: true });
        return;
      }
      
      const dimensions = stdout.trim().split(',');
      if (dimensions.length >= 2) {
        const width = parseInt(dimensions[0]);
        const height = parseInt(dimensions[1]);
        const aspectRatio = width / height;
        const targetRatio = 16 / 9; // 1.777...
        const tolerance = 0.15; // Allow 15% tolerance
        
        // console.log(`📐 Video dimensions: ${width}x${height}, Ratio: ${aspectRatio.toFixed(2)}`);
        
        // Check if aspect ratio is approximately 16:9
        if (Math.abs(aspectRatio - targetRatio) > tolerance) {
          reject(new Error(`Invalid aspect ratio. Please use 16:9 ratio (e.g., 1280x720, 1920x1080). Current ratio: ${aspectRatio.toFixed(2)}`));
          return;
        }
        
        resolve({ width, height, aspectRatio });
      } else {
        reject(new Error('Could not read video dimensions'));
      }
    });
  });
};

// --- Manage banner limit (max 2 videos) ---
const manageBannerLimit = async (newBannerId) => {
  try {
    // Get all banners sorted by creation date (oldest first)
    const allBanners = await Banner.find().sort({ createdAt: 1 });
    
    // If we have more than 2 banners, delete the oldest ones
    if (allBanners.length > 2) {
      const bannersToDelete = allBanners.slice(0, allBanners.length - 2);
      
      for (const banner of bannersToDelete) {
        // console.log(`🗑️ Auto-deleting old banner: ${banner._id} - ${banner.title}`);
        
        // Delete video file
        const videoPath = path.join(__dirname, '..', banner.videoPath);
        if (fs.existsSync(videoPath)) {
          fs.unlinkSync(videoPath);
          // console.log('🗑️ Video file deleted:', videoPath);
        }
        
        // Delete from database
        await Banner.findByIdAndDelete(banner._id);
        // console.log('✅ Banner deleted from database');
      }
    }
  } catch (err) {
    console.error('❌ Error managing banner limit:', err);
  }
};

// --- Multer storage with file size limit (40MB) ---
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log('📍 Multer destination:', uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const filename = Date.now() + path.extname(file.originalname);
    // console.log('📄 Generated filename:', filename);
    cb(null, filename);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 40 * 1024 * 1024 }, // 40MB limit
  fileFilter: (req, file, cb) => {
    // console.log('🎥 File received:', {
    //   originalname: file.originalname,
    //   mimetype: file.mimetype,
    //   size: file.size
    // });
    
    // Check file size before upload
    if (file.size > 40 * 1024 * 1024) {
      console.log('❌ File too large:', file.size);
      return cb(new Error('File size must be less than 40MB'));
    }
    
    if (!file.mimetype.startsWith('video/')) {
      console.log('❌ Invalid file type:', file.mimetype);
      return cb(new Error('Only video files are allowed'));
    }
    console.log('✅ File type accepted');
    cb(null, true);
  }
});

// Middleware to log all requests
router.use((req, res, next) => {
  console.log(`\n📨 ${req.method} ${req.originalUrl} - ${new Date().toISOString()}`);
  // console.log('Headers:', {
  //   authorization: req.headers.authorization ? 'Present' : 'Missing',
  //   'content-type': req.headers['content-type']
  // });
  next();
});

// --- Admin uploads video with validation and limit management ---
router.post('/upload', auth, adminAuth, upload.single('video'), async (req, res) => {
  // console.log('\n🎬 UPLOAD ROUTE CALLED');
  // console.log('Request body:', req.body);
  // console.log('Request file:', req.file);
  
  try {
    const { title } = req.body;
    // console.log('Title:', title);
    
    if (!req.file) {
      // console.log('❌ No file received');
      return res.status(400).json({ success: false, message: 'Video required' });
    }
    
    if (!title) {
      // console.log('❌ No title provided');
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ success: false, message: 'Title required' });
    }
    
    // console.log('📁 File saved at:', req.file.path);
    // console.log('📊 File size:', req.file.size, 'bytes');
    
    // Check file size (40MB limit)
    if (req.file.size > 40 * 1024 * 1024) {
      // console.log('❌ File exceeds 40MB limit');
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        success: false, 
        message: `File size exceeds 40MB limit (Current: ${(req.file.size / (1024 * 1024)).toFixed(2)}MB)` 
      });
    }
    
    // Validate video dimensions (16:9 ratio)
    // console.log('🔍 Validating video dimensions...');
    try {
      const dimensions = await validateVideoDimensions(req.file.path);
      // console.log('✅ Video dimensions valid:', dimensions);
      if (dimensions.warning) {
        // console.log('⚠️ Video dimension validation skipped due to missing ffprobe');
      }
    } catch (validationError) {
      console.error('❌ Dimension validation failed:', validationError.message);
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(400).json({ 
        success: false, 
        message: validationError.message || 'Video must be in 16:9 aspect ratio (e.g., 1280x720, 1920x1080)' 
      });
    }
    
    // Check if we already have 2 banners
    const currentBanners = await Banner.find();
    if (currentBanners.length >= 2) {
      console.log(`⚠️ Already have ${currentBanners.length} banners, will auto-delete oldest`);
    }
    
    // Compute file hash
    // console.log('🔐 Computing file hash...');
    const buffer = fs.readFileSync(req.file.path);
    const fileHash = crypto.createHash('md5').update(buffer).digest('hex');
    // console.log('File hash:', fileHash);
    
    // Check for duplicate
    const existingBanner = await Banner.findOne({ fileHash });
    if (existingBanner) {
      console.log('⚠️ Duplicate video detected');
      if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(409).json({ success: false, message: 'This video already exists' });
    }
    
    const videoPath = `/uploads/${req.file.filename}`;
    // console.log('Video path:', videoPath);
    
    // Save to DB
    // console.log('💾 Saving to database...');
    const banner = await Banner.create({ title, videoPath, fileHash });
    // console.log('✅ Banner saved successfully:', banner._id);
    
    // Manage banner limit - keep only 2 most recent
    await manageBannerLimit(banner._id);
    
    // Get current count after auto-deletion
    const remainingBanners = await Banner.find().sort({ createdAt: -1 });
    // console.log(`📊 Total banners after upload: ${remainingBanners.length}`);
    
    res.json({ 
      success: true, 
      message: 'Video uploaded successfully', 
      data: banner,
      totalBanners: remainingBanners.length,
      maxBanners: 2
    });
  } catch (err) {
    console.error('❌ Upload error:', err);
    
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
      console.log('🗑️ Deleted file due to error');
    }
    
    res.status(500).json({ success: false, message: 'Upload failed', error: err.message });
  }
});

// --- User fetch banners (limit to 2 most recent) ---
router.get('/', async (req, res) => {

  try {
    // console.log('Fetching banners from database...');
    // Fetch only the 2 most recent banners
    const banners = await Banner.find()
      .sort({ createdAt: -1 })
      .limit(2)
      .select('title videoPath createdAt updatedAt');
    
    // console.log(`✅ Found ${banners.length} banners (max 2)`);
    if (banners.length > 0) {
      // console.log('Sample banner:', {
      //   id: banners[0]._id,
      //   title: banners[0].title,
      //   videoPath: banners[0].videoPath
      // });
    }
    
    res.json({ success: true, data: banners });
  } catch (err) {
    console.error('❌ Fetch error:', err);
    res.status(500).json({ success: false, message: 'Fetch failed', error: err.message });
  }
});

// --- Admin delete banner ---
router.delete('/:id', auth, adminAuth, async (req, res) => {
  // console.log('\n🗑️ DELETE BANNER ROUTE CALLED');
  // console.log('Banner ID:', req.params.id);
  
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      console.log('❌ Banner not found:', req.params.id);
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    
    // console.log('Found banner:', {
    //   id: banner._id,
    //   title: banner.title,
    //   videoPath: banner.videoPath
    // });
    
    // Delete the video file
    const videoPath = path.join(__dirname, '..', banner.videoPath);
    // console.log('Video file path:', videoPath);
    
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
      // console.log('🗑️ Video file deleted');
    } else {
      console.log('⚠️ Video file not found on disk');
    }
    
    await Banner.findByIdAndDelete(req.params.id);
    // console.log('✅ Banner deleted from database');
    
    res.json({ success: true, message: 'Banner deleted successfully' });
  } catch (err) {
    console.error('❌ Delete error:', err);
    res.status(500).json({ success: false, message: 'Delete failed', error: err.message });
  }
});

// --- Admin update banner ---
router.put('/:id', auth, adminAuth, upload.single('video'), async (req, res) => {
  // console.log('\n✏️ UPDATE BANNER ROUTE CALLED');
  // console.log('Banner ID:', req.params.id);
  // console.log('Request body:', req.body);
  // console.log('Request file:', req.file ? 'Present' : 'Not present');
  
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      console.log('❌ Banner not found:', req.params.id);
      if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
      return res.status(404).json({ success: false, message: 'Banner not found' });
    }
    
    console.log('Current banner:', {
      id: banner._id,
      title: banner.title,
      videoPath: banner.videoPath
    });
    
    const updateData = { title: req.body.title };
    
    // If new video uploaded
    if (req.file) {
      console.log('📹 New video uploaded:', req.file.filename);
      
      // Check file size (40MB limit)
      if (req.file.size > 40 * 1024 * 1024) {
        console.log('❌ File exceeds 40MB limit');
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          success: false, 
          message: `File size exceeds 40MB limit (Current: ${(req.file.size / (1024 * 1024)).toFixed(2)}MB)` 
        });
      }
      
      // Validate video dimensions
      console.log('🔍 Validating video dimensions...');
      try {
        const dimensions = await validateVideoDimensions(req.file.path);
        // console.log('✅ Video dimensions valid:', dimensions);
      } catch (validationError) {
        console.error('❌ Dimension validation failed:', validationError.message);
        if (fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
        return res.status(400).json({ 
          success: false, 
          message: validationError.message || 'Video must be in 16:9 aspect ratio (e.g., 1280x720, 1920x1080)' 
        });
      }
      
      // Compute file hash
      const buffer = fs.readFileSync(req.file.path);
      const fileHash = crypto.createHash('md5').update(buffer).digest('hex');
      console.log('New file hash:', fileHash);
      
      // Check for duplicate
      const existing = await Banner.findOne({ fileHash, _id: { $ne: req.params.id } });
      if (existing) {
        console.log('⚠️ Duplicate video detected');
        fs.unlinkSync(req.file.path);
        return res.status(409).json({ success: false, message: 'Video already exists' });
      }
      
      // Delete old video file
      const oldVideoPath = path.join(__dirname, '..', banner.videoPath);
      console.log('Old video path:', oldVideoPath);
      
      if (fs.existsSync(oldVideoPath)) {
        fs.unlinkSync(oldVideoPath);
        console.log('🗑️ Old video file deleted');
      }
      
      updateData.videoPath = `/uploads/${req.file.filename}`;
      updateData.fileHash = fileHash;
      console.log('Updated video path:', updateData.videoPath);
    }
    
    const updatedBanner = await Banner.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    
    console.log('✅ Banner updated successfully:', updatedBanner._id);
    res.json({ success: true, message: 'Banner updated successfully', data: updatedBanner });
  } catch (err) {
    console.error('❌ Update error:', err);
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
      console.log('🗑️ Deleted uploaded file due to error');
    }
    res.status(500).json({ success: false, message: 'Update failed', error: err.message });
  }
});

// --- Get banner count (for checking limit) ---
router.get('/count', auth, adminAuth, async (req, res) => {
  // console.log('\n📊 GET BANNER COUNT');
  try {
    const count = await Banner.countDocuments();
    res.json({ 
      success: true, 
      data: { 
        count, 
        max: 2,
        canUpload: count < 2 
      } 
    });
  } catch (err) {
    console.error('❌ Count error:', err);
    res.status(500).json({ success: false, message: 'Failed to get count' });
  }
});

// --- Test route to check if banner routes are working ---
router.get('/test', (req, res) => {
  // console.log('\n🧪 TEST ROUTE CALLED');
  res.json({ 
    success: true, 
    message: 'Banner routes are working!',
    timestamp: new Date().toISOString(),
    uploadDir: uploadDir,
    maxBanners: 2,
    maxFileSize: '40MB',
    requiredAspectRatio: '16:9'
  });
});
 
module.exports = router;