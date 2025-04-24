import pymongo
from flask import Response
from bson.json_util import dumps
from flask import Flask, request, jsonify
from datetime import datetime, timedelta
from bson.objectid import ObjectId
from base64 import b64encode
from flask_cors import CORS
app = Flask(__name__)
CORS(app)  # Allow all cross-origin requests (for dev only)


app = Flask(__name__)


@app.after_request
def after_request(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


client = pymongo.MongoClient(
    "mongodb+srv://nweikl:qyQrov-gyxsi1-dejtov@csis3750.auwttdg.mongodb.net/csis3750_db?retryWrites=true&w=majority&appName=csis3750")
db = client["test"]

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
        # return jsonify({"error": "university, email, and password are required"}), 400
        print("Invalid data")
        return jsonify({"error": "Invalid data"}), 401

    # Look up the user by university + email
    user = db.users.find_one({
        "university": university,
        "email": email
    })
    if not user:
        # return jsonify({"error": "Invalid credentials"}), 401
        print("User not found")
        return jsonify({"error": "User not found"}), 401

    # Plaintext check
    stored_pw = user.get('password')  # assumes your documents have a 'password' field
    if stored_pw != password:
        # return jsonify({"error": "Invalid credentials"}), 401
        print("Wrong password")
        return jsonify({"error": "Wrong password"}), 401

    # Success
    return jsonify({
        "message": "Login successful",
        "student_id": str(user['_id']),
        "username": user.get('username'),
        "firstName": user.get('firstName'),  # Safely gets 'username'
    }), 200


def serialize_doc(doc):
    doc['_id'] = str(doc['_id'])
    if 'student_id' in doc:
        doc['student_id'] = str(doc['student_id'])
    if 'dueDate' in doc and isinstance(doc['dueDate'], datetime):
        doc['dueDate'] = doc['dueDate'].isoformat()
    return doc


@app.route('/test/student/<username>/todo', methods=['GET'])
def get_todo(username):
    try:
        now = datetime.utcnow()
        start_today = datetime(now.year, now.month, now.day)
        end_tomorrow = start_today + timedelta(days=2)

        assignments = list(db.assignments.find({
            "username": username,
            "dueDate": {
                "$gte": start_today,
                "$lt": end_tomorrow
            }
        }))

        for assignment in assignments:
            assignment["_id"] = str(assignment["_id"])
            assignment["dueDate"] = assignment["dueDate"].isoformat()

        return jsonify(assignments), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


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
        # Get the teacher's document
        teacher_doc = db.teacherclasses.find_one({
            "teacherUsername": teacherUsername,
            "courses.courseName": courseName
        })

        if not teacher_doc:
            return jsonify({"error": "Teacher or course not found"}), 404

        # Find the course object from their list
        course = next((c for c in teacher_doc['courses'] if c['courseName'] == courseName), None)
        if not course:
            return jsonify({"error": "Course not found in teacher's list"}), 404

        student_usernames = course.get("students", [])

        # Fetch student details from the users collection
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
        # Check if user is a student in the course
        teacher_doc = db.teacherclasses.find_one({
            "courses.courseName": courseName,
            "courses.students": username
        })

        if not teacher_doc:
            return jsonify({"error": "User not enrolled in this course"}), 403

        # Return all announcements for the course
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


# ✅ Post an announcement with title support
@app.route('/test/announcements', methods=['POST'])
def post_announcement():
    try:
        data = request.json

        # ✅ Validate required fields including "title"
        if not all(k in data for k in ("username", "courseName", "message", "title")):
            return jsonify({"error": "Missing fields"}), 400

        announcement = {
            "username": data["username"],
            "courseName": data["courseName"],
            "title": data["title"],  # ✅ Add title here
            "message": data["message"],
            "createdAt": datetime.now()  # ✅ Store timestamp
        }

        db.announcements.insert_one(announcement)
        return jsonify({"success": True}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

#To add assignments in the database 
@app.route('/test/assignments', methods=['POST'])
def create_assignment():
    data = request.get_json()
    required_fields = ['name', 'description', 'totalMarks', 'dueDate', 'courseName', 'username']

    if not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400

    course_name = data['courseName']
    teacher_username = data['username']

    # Find the teacher's course from teacherclasses
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
            "dueDate": datetime.fromisoformat(data['dueDate']),  # ✅ handles full datetime
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

from bson.binary import Binary  # Make sure this import is at the top

#Upload an assignment 
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
        # Find all assignments with a file uploaded
        submissions = list(db.assignments.find({
            "courseName": courseName,
            "name": assignmentName,
            "uploadedFileName": {"$ne": ""}
        }))

        # Extract all usernames
        usernames = [s["username"] for s in submissions]

        # Get full name info for each username
        user_details = list(db.users.find({"username": {"$in": usernames}}))
        user_map = {
            u["username"]: {
                "firstName": u.get("firstName", ""),
                "lastName": u.get("lastName", "")
            } for u in user_details
        }

        # Format response and strip unneeded/binary fields
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


#download an assignment
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

#get announcement
@app.route('/test/announcements/course/<string:courseName>', methods=['GET'])
def get_announcements_by_course(courseName):
    try:
        announcements = list(db.announcements.find({
            "courseName": {"$regex": f"^{courseName}$", "$options": "i"}
        }))
        return jsonify([serialize_doc(a) for a in announcements]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    app.run(debug=True)