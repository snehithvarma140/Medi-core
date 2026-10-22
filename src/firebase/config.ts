import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer, setDoc } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Firestore with the provisioned database ID
export const db = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Connection test helper per SKILL.md guidelines
export async function testFirebaseConnection(): Promise<boolean> {
  try {
    const testDocRef = doc(db, 'test', 'connection');
    // Try to ping the server test document
    await setDoc(testDocRef, { timestamp: new Date().toISOString(), status: 'online' }, { merge: true });
    await getDocFromServer(testDocRef);
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or network unavailable:', error.message);
    } else {
      console.info('Firebase connection status note:', error);
    }
    return false;
  }
}
