import admin from 'firebase-admin';
import path from 'path';

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // Use the same Firebase project as the client (629804234684)
    const serviceAccount = {
      type: "service_account",
      project_id: "aastatechnology",
      private_key_id: "a79143e6a433064fe0821253f619254ed47a3aae",
      private_key: "-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCkcfNjfVbmDJDO\nwgE+s9OcpN+zVM1+YpmCx5oou7seoIW39b4FWRXeMkUhSPewxwqZCcOLF0iaMMK+\ntABBgp9p5+qMAYtnuRE/i/EEXAVkPBa9+FRCuov1eypEane2FlZjGZvCMRUNVNR6\nCpm9duZkmiKpphO2Xs0FsGy7kYIpU95+OXeMGxbrajLkRLj+96+A1ZmSqJYKLoL8\nU7mdSbGkDgKRXZJlqS3N8iJNaXI32ibCKAw8U7MYh0B4X5issyYJry+Mk8rvkKik\nLK2/Fl6bQvfF5kUJaQQzwVAVK9qfEdN1JyVfa/irEvsxkE5IwB+9OxlosGOj9w7X\n7HsiqkJ1AgMBAAECggEAFfRGn7I0n0rvLENXYjUk28VhPjJkqupj/0NBsA18KlcY\n8xniUBl4I22HsC1rMBUqs4rLqe6mWTuITGiAnj5fpQZ62E0+fM8G3/qBZ2kXqS2i\nhaM5MJ1yIQhb+L1UFSG/T8Sz+EWQP3LjWRXAN7y/fo/bb9XFzPO0IH3QzmvbOkQK\n27Owro6g2TafN1ADMXhM8YSBIRvr82H8r3odZgu+6HOvbqeozmoi16mFTijMS1fV\ntDVm5IHgD4wA97zXzYNjRkgPdwrxio3rCVI4yeGMx23xlp2KnErpFj08cgWAu+y9\nzNNr29OLargww2a6CaL05SODDt4xaBtP5LVzGEJRIQKBgQDV2y5uoVsN8jVpt/le\nr817XDjWzURVKVqucc5T3J/dwpkDu6dqDk4pRjeLMLI5fDTY5y67nigWy7FK0FdG\nDOaDRN5KzoKStI5SmMyDkmk5yRbB+JgNvKPhtKcVidxOu5sCP6wqlqy+dHsHyXIW\n/6sQMJI4OpsVJP/kooIRHakFBQKBgQDE2gicGKIt35sIZzrDSlZbltcc/L9v0Knt\n+5F/57+6rt2kmvUJMWxU1j+4BefK5+kYbXC/FlBXzrp4c2qDn0+effh5NpoES9HL\nB1/PeBw8IFEEaU9Kv0nXdTfZC9ihkklIr3B0p45BcnQ2L/D/jsruR4YZiTeTRlBj\nvtlTTwDCsQKBgEyG7oqwOwE2l16Jczcq+gEW81AKjFVdQxIBr6/a12pn5JGtaS9O\nhzHF6sJoXp6rj82+jL6ezgG6SmtXOqPaofJ/hnyGgbs12Wg9PZInpngDOZ2X8/GW\ne56dIt1WQ/v4rnOTjWyAFrjgvdX/hFAulWxptSlh73UVlGygqqKtVnpxAoGAMaK8\nmweHFUQVpmfJJGcBIXUGZrPAXaRixLQzOuonqR3gm1nLQXcp1rZzOKacjMgvOU6X\nKEerGIjy8d5AVFH+VHt1BLNk4IJxstz4Jqsli2+mnhMjwDg9mUtgOqVHCW6GdgJu\nu6toLk56yRMLlJR258A3KwczcTpAmPYNfHkmOvECgYB4V9pZAdcbIc8T2ffsrC/8\nyuuNMBey9cvBVJJYbzwATjZqCp4jUqvEOAOKeG8nTWsbBXpdHl01OgGxWaj0Btfl\nhnv1o/vA03y9bNT/3KN0JzTlhJ+mjS2C+jPZb3Q6pVkl3YSkzIYOXftWLWnL45bi\np2BArC7ois2l/rex5u8K+g==\n-----END PRIVATE KEY-----\n",
      client_email: "firebase-adminsdk-fbsvc@aastatechnology.iam.gserviceaccount.com",
      client_id: "629804234684", // Use client's messagingSenderId to match
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40aastatechnology.iam.gserviceaccount.com"
    };

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      projectId: "aastatechnology",
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
