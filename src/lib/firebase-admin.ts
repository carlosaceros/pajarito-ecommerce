import * as admin from 'firebase-admin';

// Singleton: initialize only once, lazily (not at import time)
let _app: admin.app.App | null = null;

function getFirebaseAdmin(): admin.app.App {
    if (_app) return _app;
    if (admin.apps.length > 0) {
        _app = admin.apps[0]!;
        return _app;
    }

    const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!process.env.FIREBASE_ADMIN_PROJECT_ID || !process.env.FIREBASE_ADMIN_CLIENT_EMAIL || !privateKey) {
        throw new Error(
            'Firebase Admin env vars missing. Set FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, FIREBASE_ADMIN_PRIVATE_KEY.'
        );
    }

    _app = admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
            clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
            privateKey,
        }),
    });

    return _app;
}

export function getAdminMessaging() {
    return admin.messaging(getFirebaseAdmin());
}

export function getAdminDB() {
    return admin.firestore(getFirebaseAdmin());
}

