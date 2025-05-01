

const fs = require('fs');
const { MongoClient } = require('mongodb');


const uri = 'mongodb+srv://ritanshu:Qwertyuiop%401@csis3750.auwttdg.mongodb.net/?retryWrites=true&w=majority&appName=csis3750';
const dbName = 'test';            
const collectionName = 'users';          
const usernameToUpdate = 'teacher';       
const imagePath = './3.jpeg';       

async function run() {
  try {
    console.log('Reading image...');
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const dataUri = `data:image/png;base64,${base64Image}`;

    console.log('Connecting to MongoDB...');
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    const result = await db.collection(collectionName).updateOne(
      { username: usernameToUpdate },
      { $set: { profileImage: dataUri } }
    );

    if (result.modifiedCount > 0) {
      console.log('Profile image uploaded successfully!');
    } else {
      console.log('No user found with that username.');
    }

    await client.close();
  } catch (err) {
    console.error('Error:', err);
  }
}

run();
