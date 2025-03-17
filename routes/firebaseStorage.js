const { getStorage } = require('firebase-admin/storage')
const admin = require('firebase-admin')

admin.initializeApp({
    credential: admin.credential.cert({
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'), // Fix newline issue
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    }),
    storageBucket: "gs://oslikavanje-livno-img-folder.firebasestorage.app"
})

const bucket = getStorage().bucket()

const uploadToFirebase = async (filePath, fileName) => {
    const file = bucket.file(fileName);
    await bucket.upload(filePath, {
        destination: fileName,
        metadata: { contentType: 'image' }
    })

    await file.makePublic(); // Makes the file accessible via URL

    return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}

async function deleteFromFirebase(fileName) {
    await bucket.file(fileName).delete();
}

module.exports = { uploadToFirebase, deleteFromFirebase }