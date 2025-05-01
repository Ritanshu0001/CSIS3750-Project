import os
import pymongo
import base64
import io
from dotenv import load_dotenv
from base64 import b64encode
from flask import Flask, request, jsonify, send_file, Response
from flask_cors import CORS
from datetime import datetime, timedelta
from bson.objectid import ObjectId
from bson.binary import Binary
from bson.json_util import dumps


load_dotenv()
MONGO_URI = os.getenv("MONGO_URI")
if not MONGO_URI:
    raise ValueError("Missing MONGO_URI in .env file")


client = pymongo.MongoClient(MONGO_URI)
db = client["test"]

try:
    client.admin.command('ping')
    print("Connected to MongoDB")
except Exception as e:
    print("MongoDB connection error:", e)


app = Flask(__name__)
CORS(app)

@app.after_request
def after_request(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


try:
    client.admin.command('ping')
    print("Pinged your deployment. You successfully connected to MongoDB!")
except Exception as e:
    print(e)


def parse_object_ids(document):
    if isinstance(document, list):
        return [parse_object_ids(item) for item in document]
    elif isinstance(document, dict):
        return {key: parse_object_ids(value) for key, value in document.items()}
    elif isinstance(document, ObjectId):
        return str(document)
    else:
        return document


@app.route('/signin', methods=['POST'])
def login():
    data = request.get_json(force=True)
    university = data.get('university')
    email = data.get('email')
    password = data.get('password')

    if not all([university, email, password]):
        print("Invalid data")
        return jsonify({"error": "Invalid data"}), 401

    
    user = db.users.find_one({
        "university": university,
        "email": email
    })
    if not user:
        
        print("User not found")
        return jsonify({"error": "User not found"}), 401

    
    stored_pw = user.get('password')  
    if stored_pw != password:
        
        print("Wrong password")
        return jsonify({"error": "Wrong password"}), 401

  
    return jsonify({
        "message": "Login successful",
        "student_id": str(user['_id']),
        "username": user.get('username'),
        "firstName": user.get('firstName'),  
    }), 200


def serialize_doc(doc):
    doc['_id'] = str(doc['_id'])
    if 'student_id' in doc:
        doc['student_id'] = str(doc['student_id'])
    if 'dueDate' in doc and isinstance(doc['dueDate'], datetime):
        doc['dueDate'] = doc['dueDate'].isoformat()
    return doc

@app.route('/assignments/student/<username>/todo', methods=['GET'])
def get_student_todo(username):
    now = datetime.utcnow()
    tomorrow = now + timedelta(days=1)

    raw_tasks = db.assignments.find({
        "username": username,
        "dueDate": {"$gte": now, "$lte": tomorrow}
    })

    tasks = []
    for task in raw_tasks:
        task['_id'] = str(task['_id'])  
        task['dueDate'] = task['dueDate'].isoformat() if 'dueDate' in task else None

        
        task.pop('uploadedFileData', None)

        tasks.append(task)

    return jsonify(tasks)
@app.route('/test/users/<string:username>', methods=['GET', 'PUT'])
def student_profile(username):
    if request.method == 'GET':
        user = db.users.find_one({"username": username})
        if not user:
            return jsonify({"error": "Student not found."}), 404
        return jsonify(serialize_doc(user))

    elif request.method == 'PUT':
        data = request.json
        if not data:
            return jsonify({"error": "No data provided."}), 400
        result = db.students.update_one({"user": username}, {"$set": data})
        if result.matched_count == 0:
            return jsonify({"error": "Student not found."}), 404
        return jsonify({"status": "Profile updated"})


@app.route('/test/courses/<string:username>', methods=['GET'])
def get_courses_by_username(username):
    courses = list(db.courses.find({"username": username}))
    if not courses:
        return jsonify({"error": "No courses found for user."}), 404
    courses = [serialize_doc(course) for course in courses]
    return jsonify(courses), 200


@app.route('/test/teacherclasses/<string:courseName>/<string:teacherUsername>', methods=['GET'])
def get_teacherclass_students(courseName, teacherUsername):
    try:
        
        teacher_doc = db.teacherclasses.find_one({
            "teacherUsername": teacherUsername,
            "courses.courseName": courseName
        })

        if not teacher_doc:
            return jsonify({"error": "Teacher or course not found"}), 404

        
        course = next((c for c in teacher_doc['courses'] if c['courseName'] == courseName), None)
        if not course:
            return jsonify({"error": "Course not found in teacher's list"}), 404

        student_usernames = course.get("students", [])

        
        users = list(db.users.find({"username": {"$in": student_usernames}}))
        result = [
            {
                "username": u["username"],
                "firstName": u.get("firstName", ""),
                "lastName": u.get("lastName", "")
            } for u in users if u["username"] != teacherUsername
        ]

        return jsonify(result), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/test/assignments/<string:username>/<string:courseName>', methods=['GET'])
def get_student_assignments(username, courseName):
    try:
        assignments = list(db.assignments.find({
            "username": username,
            "courseName": {"$regex": f"^{courseName}$", "$options": "i"}
        }))
        return Response(dumps(assignments), mimetype='application/json'), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/test/assignments/<string:assignment_id>/grade', methods=['PUT'])
def update_assignment_grade(assignment_id):
    try:
        data = request.get_json()
        new_grade = data.get('marksObtained')

        if new_grade is None:
            return jsonify({"error": "Missing marksObtained"}), 400

        result = db.assignments.update_one(
            {"_id": ObjectId(assignment_id)},
            {"$set": {"marksObtained": new_grade}}
        )

        if result.modified_count == 0:
            return jsonify({"error": "Assignment not found or grade unchanged"}), 404

        return jsonify({"message": "Grade updated successfully"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/test/assignments/<string:username>/<string:courseName>', methods=['GET'])
def get_assignments_by_user_and_course(username, courseName):
    assignments = list(db.assignments.find({
        "username": username,
        "courseName": courseName
    }))
    if not assignments:
        return jsonify({"error": "No assignments found."}), 404
    return jsonify([serialize_doc(a) for a in assignments]), 200


@app.route('/test/announcements/<string:username>/<string:courseName>', methods=['GET'])
def get_announcements(username, courseName):
    try:
        
        teacher_doc = db.teacherclasses.find_one({
            "courses.courseName": courseName,
            "courses.students": username
        })

        if not teacher_doc:
            return jsonify({"error": "User not enrolled in this course"}), 403

        
        announcements = list(db.announcements.find({
            "courseName": {"$regex": f"^{courseName}$", "$options": "i"}
        }))
        return jsonify([serialize_doc(a) for a in announcements]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/test/assignments', methods=['PUT'])
def update_assignment_marks():
    data = request.json
    username = data.get("username")
    courseName = data.get("courseName")
    assignmentName = data.get("assignmentName")
    marksObtained = data.get("marksObtained")

    if not all([username, courseName, assignmentName]):
        return jsonify({"error": "Missing required fields"}), 400

    result = db.assignments.update_one(
        {"username": username, "courseName": courseName, "name": assignmentName},
        {"$set": {"marksObtained": marksObtained}}
    )

    if result.modified_count == 1:
        return jsonify({"message": "Marks updated successfully"}), 200
    else:
        return jsonify({"error": "Update failed or no change made"}), 400



@app.route('/test/announcements', methods=['POST'])
def post_announcement():
    try:
        data = request.json

        
        if not all(k in data for k in ("username", "courseName", "message", "title")):
            return jsonify({"error": "Missing fields"}), 400

        announcement = {
            "username": data["username"],
            "courseName": data["courseName"],
            "title": data["title"],  
            "message": data["message"],
            "createdAt": datetime.now() 
        }

        db.announcements.insert_one(announcement)
        return jsonify({"success": True}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/test/assignments', methods=['POST'])
def create_assignment():
    data = request.get_json()
    required_fields = ['name', 'description', 'totalMarks', 'dueDate', 'courseName', 'username']

    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    course_name = data['courseName']
    teacher_username = data['username']

    
    teacher_doc = db.teacherclasses.find_one({
        "teacherUsername": teacher_username,
        "courses.courseName": course_name
    })

    if not teacher_doc:
        return jsonify({'error': 'Teacher or course not found'}), 404

    course = next((c for c in teacher_doc['courses'] if c['courseName'] == course_name), None)
    if not course:
        return jsonify({'error': 'Course not found in teacher record'}), 404

    student_usernames = course.get("students", [])
    all_usernames = student_usernames + [teacher_username]

    inserted_ids = []

    for username in all_usernames:
        assignment = {
            "name": data['name'],
            "description": data['description'],
            "totalMarks": data['totalMarks'],
            "dueDate": datetime.fromisoformat(data['dueDate']),  
            "courseName": course_name,
            "username": username,
            "createdAt": datetime.utcnow(),
            "marksObtained": None,
            "uploadedFileName": "",
            "uploadedFileData": b""
        }
        result = db.assignments.insert_one(assignment)
        inserted_ids.append(str(result.inserted_id))

    return jsonify({
        "message": f"Assignment created for {len(all_usernames)} users",
        "insertedIds": inserted_ids
    }), 201

from bson.binary import Binary  


@app.route("/test/assignments/upload", methods=["POST"])
def upload_assignment():
    username = request.form.get("username")
    courseName = request.form.get("courseName")
    assignmentName = request.form.get("assignmentName")
    uploadedFile = request.files.get("file")

    if not uploadedFile:
        return jsonify({"error": "No file uploaded"}), 400

    file_data = uploadedFile.read()

    result = db.assignments.update_one(
        {"username": username, "courseName": courseName, "name": assignmentName},
        {
            "$set": {
                "uploadedFileName": uploadedFile.filename,
                "uploadedFileData": Binary(file_data)
            }
        }
    )

    if result.modified_count:
        return jsonify({"message": "File uploaded successfully!"}), 200
    else:
        return jsonify({"error": "Assignment not found or update failed"}), 404
from bson import ObjectId

@app.route('/test/assignments/submissions/<string:courseName>/<string:assignmentName>', methods=['GET'])
def get_assignment_submissions(courseName, assignmentName):
    try:
        
        submissions = list(db.assignments.find({
            "courseName": courseName,
            "name": assignmentName,
            "uploadedFileName": {"$ne": ""}
        }))

        
        usernames = [s["username"] for s in submissions]

        
        user_details = list(db.users.find({"username": {"$in": usernames}}))
        user_map = {
            u["username"]: {
                "firstName": u.get("firstName", ""),
                "lastName": u.get("lastName", "")
            } for u in user_details
        }

        
        response = []
        for s in submissions:
            response.append({
                "_id": str(s["_id"]),
                "username": s["username"],
                "filename": s.get("uploadedFileName", ""),
                "firstName": user_map.get(s["username"], {}).get("firstName", ""),
                "lastName": user_map.get(s["username"], {}).get("lastName", "")
            })

        return jsonify(response), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500



@app.route("/test/assignments/download/<string:username>/<string:courseName>/<string:assignmentName>", methods=["GET"])
def download_assignment(username, courseName, assignmentName):
    doc = db.assignments.find_one({
        "username": username,
        "courseName": courseName,
        "name": assignmentName
    })

    if not doc or not doc.get("uploadedFileData"):
        return jsonify({"error": "No submission found"}), 404

    encoded_data = b64encode(doc["uploadedFileData"]).decode('utf-8')
    return jsonify({
        "filename": doc.get("uploadedFileName", "submission"),
        "fileData": encoded_data
    }), 200


@app.route('/test/announcements/course/<string:courseName>', methods=['GET'])
def get_announcements_by_course(courseName):
    try:
        announcements = list(db.announcements.find({
            "courseName": {"$regex": f"^{courseName}$", "$options": "i"}
        }))
        return jsonify([serialize_doc(a) for a in announcements]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/syllabus/upload', methods=['POST'])
def upload_syllabus():
    
    courseName = request.form.get('courseName')
    file       = request.files.get('file')
    if not courseName or not file:
        return jsonify({"error": "Missing courseName or file"}), 400

    
    data = file.read()
    b64  = b64encode(data).decode('utf-8')
    dataUri = f"data:{file.mimetype};base64,{b64}"

    
    db.syllabus.update_one(
        {"courseName": courseName},
        {"$set": {
            "syllabusDataUri": dataUri,
            "filename":        file.filename,
            "updatedAt":       datetime.utcnow()
        }},
        upsert=True
    )

    return jsonify({
        "message":    "Syllabus uploaded",
        "courseName": courseName
    }), 201



@app.route('/syllabus/download/<string:courseName>', methods=['GET'])
def download_syllabus(courseName):
    doc = db.syllabus.find_one({"courseName": courseName})
    if not doc:
        return jsonify({"error": "Syllabus not found"}), 404

    
    header, b64data = doc["syllabusDataUri"].split(",", 1)
    raw = base64.b64decode(b64data)

    return send_file(
        io.BytesIO(raw),
        mimetype=doc.get("contentType", "application/pdf"),
        as_attachment=True,
        download_name=doc.get("filename", f"{courseName}.pdf")
    )
if __name__ == '__main__':
    app.run(debug=True, port=5000)