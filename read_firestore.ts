import { getAdminDB } from './src/lib/firebase-admin';

async function run() {
    try {
        const db = getAdminDB();
        const doc = await db.doc('admin_config/shipping').get();
        console.log(JSON.stringify(doc.data(), null, 2));
    } catch(e) {
        console.error(e);
    }
}
run();
