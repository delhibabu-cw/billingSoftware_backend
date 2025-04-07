const multer = require('multer');
const cloudinary = require('../utils/cloudinary');

// Set up Multer storage configuration
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, 'uploads/'); // Specify where to store uploaded files
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + path.extname(file.originalname)); // Set the file name
//   }
// });
// Initialize Multer with storage options
// const upload = multer({ storage: storage });

// const storage = multer.memoryStorage();
const upload = multer({ storage: multer.memoryStorage() });



// Helper function to upload file buffer to Cloudinary
const uploadToCloudinary = (buffer, mimetype) => {
  return new Promise((resolve, reject) => {
    const options = {
      folder: "billingSoftware",
      resource_type: "auto", // Auto-detect file type (supports both images & PDFs)
    };

    const stream = cloudinary.uploader.upload_stream(options, (error, result) => {
      if (error) {
        return reject(error);
      }

      let viewableUrl = result.secure_url; // Default URL

      // If the uploaded file is a PDF, modify the URL for viewing in the browser
      if (mimetype === "application/pdf") {
        viewableUrl = result.secure_url.replace("/upload/", "/upload/f_pdf/");
      }

      resolve({ ...result, viewableUrl });
    });

    stream.end(buffer);
  });
};



module.exports = {
  // Single file upload
  singleUpload: async (req, res) => {
    try {
      upload.single('file')(req, res, async (err) => {
        if (err) {
          return res.clientError({ msg: 'File upload failed', error: err });
        }
  
        if (!req.file) {
          return res.clientError({ msg: 'No file uploaded' });
        }
  
        try {
          const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
  
          res.success({
            msg: 'File uploaded successfully!',
            result: { location: result.secure_url },
          });
        } catch (uploadError) {
          console.error('Cloudinary upload error:', uploadError);
          return res.clientError({ msg: 'Error uploading to Cloudinary', error: uploadError });
        }
      });
    }catch (error) {
      console.error('Caught error:', error);
      return res.clientError({ msg: `File upload exception: ${error.message}`, error });
    }
  },

  // Multiple file upload
  multipleUpload: async (req, res) => {
    try {
      // Use Multer to process multiple file uploads
      upload.array('files', 5)(req, res, async (err) => {
        if (err) {
          return res.clientError({ msg: 'File upload failed', error: err });
        }

        if (!req.files || req.files.length === 0) {
          return res.clientError({ msg: 'No files uploaded' });
        }

        try {
          // Process each file
          const uploadedFiles = await Promise.all(
            req.files.map(async (file) => {
              try {
                // Upload each file to Cloudinary
                const result = await cloudinary.uploader.upload(file.path, {
                  folder: 'uploads', // Set folder in Cloudinary
                });
                return { location: result.secure_url };
              } catch (uploadError) {
                console.log('Cloudinary upload error for file:', file.originalname, uploadError);
                return { location: null, error: uploadError };
              }
            })
          );

          // Respond with the file URLs from Cloudinary
          return res.success({
            msg: 'Files uploaded successfully!',
            result: uploadedFiles.filter((file) => file.location !== null), // Filter out files with errors
          });
        } catch (error) {
          return res.clientError({
            msg: `File upload exception: ${error?.message}`,
            error,
          });
        }
      });
    } catch (error) {
      return res.clientError({
        msg: `File upload exception: ${error?.message}`,
        error,
      });
    }
  },
};
