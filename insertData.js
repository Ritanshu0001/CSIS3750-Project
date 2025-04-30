// uploadSyllabus.js

const fs = require('fs');
const { MongoClient } = require('mongodb');

// ✅ Config: only change these for your setup
const uri               = 'mongodb+srv://ritanshu:Qwertyuiop%401@csis3750.auwttdg.mongodb.net/?retryWrites=true&w=majority&appName=csis3750';
const dbName            = 'test';            
const collectionName    = 'syllabus';      
const courseNameToUpdate = 'Web Development';  
const filePath          = './web.doc';    // Path to your local syllabus file

async function run() {
  try {
    console.log('📄 Reading file...', filePath);
    const fileBuffer = fs.readFileSync(filePath);
    const base64File = fileBuffer.toString('base64');
    const dataUri    = `data:application/pdf;base64,${base64File}`; 
    // If your file is a .doc or .docx use:
    // const dataUri = `data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,${base64File}`;

    console.log('🔗 Connecting to MongoDB…');
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);

    console.log(`✏️  Upserting syllabus for course "${courseNameToUpdate}"…`);
    const result = await db.collection(collectionName).updateOne(
      { courseName: courseNameToUpdate },
      {
        $set: {
          courseName: courseNameToUpdate,
          syllabusDataUri: dataUri,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    if (result.upsertedCount || result.modifiedCount) {
      console.log('✅ Syllabus uploaded successfully!');
    } else {
      console.log('⚠️  No change (maybe it was identical?)');
    }

    await client.close();
    console.log('🔒 MongoDB connection closed.');
  } catch (err) {
    console.error('❌ Error during upload:', err);
  }
}

run();
