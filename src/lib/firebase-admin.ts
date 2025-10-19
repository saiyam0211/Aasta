import admin from 'firebase-admin';
import path from 'path';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Use environment variables for consistency with client config
    const serviceAccount = {
      type: "service_account",
      project_id: process.env.FIREBASE_PROJECT_ID || 'aastatechnology',
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${process.env.FIREBASE_CLIENT_EMAIL}`
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || 'aastatechnology',
    });
    
    console.log('✅ Firebase Admin SDK initialized with environment variables');
  } catch (error) {
    console.error('❌ Failed to initialize Firebase Admin SDK with environment variables:', error);
    
    // Fallback to service account JSON file
    try {
      const serviceAccountPath = path.join(process.cwd(), 'aastatechnology-firebase-adminsdk-fbsvc-a79143e6a4.json');
      
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccountPath),
        projectId: 'aastatechnology'
      });
      
      console.log('✅ Firebase Admin SDK initialized with service account file');
    } catch (fallbackError) {
      console.error('❌ Failed to initialize Firebase Admin SDK with service account file:', fallbackError);
    }
  }
}

export default admin;
