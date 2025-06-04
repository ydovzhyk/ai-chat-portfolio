import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { FieldValue } from 'firebase-admin/firestore'

let db

try {
  const serviceAccount = {
    type: 'service_account',
    project_id: 'gpt-chat-widget',
    private_key_id: process.env.PRIVATE_KEY_ID,
    private_key: process.env.PRIVATE_KEY?.replace(/\\n/g, '\n'),
    client_email:
      'firebase-adminsdk-fbsvc@gpt-chat-widget.iam.gserviceaccount.com',
    client_id: '106899033030186124524',
    auth_uri: 'https://accounts.google.com/o/oauth2/auth',
    token_uri: 'https://oauth2.googleapis.com/token',
    auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
    client_x509_cert_url:
      'https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-fbsvc%40gpt-chat-widget.iam.gserviceaccount.com',
    universe_domain: 'googleapis.com',
  }

  if (!getApps().length) {
    console.log('🔥 Initializing Firebase Admin')
    initializeApp({
      credential: cert(serviceAccount),
    })
  }

  db = getFirestore()
} catch (err) {
  console.error('Firebase Admin init failed:', err)
}

export { db, FieldValue }
