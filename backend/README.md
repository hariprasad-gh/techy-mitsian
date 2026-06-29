# TechyPlacement Backend Server

Node.js, Express, and MongoDB backend API supporting the TechyPlacement campus recruitment portal.

## Technology Stack

- **Runtime Environment:** Node.js
- **Web Framework:** Express.js
- **Database Engine:** MongoDB
- **ODM Wrapper:** Mongoose
- **Authorization Layer:** JSON Web Tokens (JWT) & bcryptjs
- **File Upload Handler:** Multer

## Project Layout

```
backend/
├── config/
│   └── db.js                 # Database connection configurations
├── controllers/
│   ├── authController.js     # User registration, login & details fetching
│   ├── studentController.js  # Student indexes, profiles & resume uploads
│   ├── companyController.js  # Company profiles lookup & modifications
│   ├── jobController.js      # Recruitment drive postings CRUD
│   └── applicationController.js # Candidate job application routing & statuses
├── middleware/
│   ├── authMiddleware.js     # JWT token validation & role authorizations
│   └── uploadMiddleware.js   # Disk storage config for PDF uploads
├── models/
│   ├── User.js               # Account details & credentials schema
│   ├── Student.js            # Student candidate academic profile schema
│   ├── Company.js            # Recruiter corporate information schema
│   ├── Job.js                # Drive posting configuration schema
│   └── Application.js        # Link between jobs and candidates schema
├── uploads/
│   └── resumes/              # Destination for candidate resume files
├── .env                      # Environment configurations
├── package.json              # Dependency manifests
├── seed.js                   # Mock database populator
└── server.js                 # API application entry point
```

## Running the Server

### 1. Setup Environment Configuration

Create a `.env` file in the root of the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/techy-mitsian
JWT_SECRET=supersecretjwtkey12345
NODE_ENV=development
```

### 2. Install Project Dependencies

Make sure to install the required packages:

```bash
cd backend
npm install
```

### 3. Seed Database Mock Data (Optional)

You can run the built-in database seeder script to populate MongoDB with predefined accounts and active job postings (it drops existing tables first):

```bash
node seed.js
```

**Seed Credentials Created:**

- **Placement Admin:**
  - Email: `admin@placement.edu`
  - Password: `password123`
- **Candidate Student:**
  - Email: `student@placement.edu`
  - Password: `password123`
- **Google Recruiter:**
  - Email: `google@gmail.com`
  - Password: `password123`
- **Microsoft Recruiter:**
  - Email: `microsoft@gmail.com`
  - Password: `password123`

### 4. Boot Dev Server

Launch the REST server locally:

```bash
npm run dev
```

The application runs on [http://localhost:5000](http://localhost:5000).

## Uploading Resumes

The backend exposes `POST /api/students/upload-resume`. Authenticated students can send a PDF resume file as multipart/form-data under the field name `resume`. The server will store it in the static directory `uploads/resumes/` and return the public URL, updating their database profile automatically.
