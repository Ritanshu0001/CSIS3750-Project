from functools import wraps

import pymongo
from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from werkzeug.security import check_password_hash
from bson.objectid import ObjectId
import jwt
import datetime

app = Flask(__name__)

# app.config["MONGO_URI"] = "mongodb+srv://nweikl:qyQrov-gyxsi1-dejtov@csis3750.auwttdg.mongodb.net/csis3750_db?retryWrites=true&w=majority&appName=csis3750"
# app.config["SECRET_KEY"] = "your_secret_key_here"
#
# mongo = PyMongo(app)
# db = db

client = pymongo.MongoClient("mongodb+srv://nweikl:qyQrov-gyxsi1-dejtov@csis3750.auwttdg.mongodb.net/csis3750_db?retryWrites=true&w=majority&appName=csis3750")
db = client["test"]


try:
    db.cx.admin.command('ping')
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


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        # Extract token from Authorization header
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            if auth_header.startswith("Bearer "):
                token = auth_header[7:]

        if not token:
            return jsonify({"error": "Token is missing!"}), 401

        try:
            # Decode token using the app secret
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_student = db.students.find_one({"_id": ObjectId(data["student_id"])})
            if not current_student:
                raise Exception("Student not found")
        except Exception as e:
            return jsonify({"error": "Token is invalid!"}), 401

        # Pass current_student to the route
        return f(current_student, *args, **kwargs)

    return decorated


@app.route('/signin', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({"error": "Missing username or password"}), 400

    user = db.users.find_one({"user": username})
    if not user or not check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid username or password"}), 401

    token = jwt.encode({
        'username': username,
        'exp': datetime.datetime.now(datetime.UTC) + datetime.timedelta(hours=1)
    }, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({'token': token})


def serialize_doc(doc):
    doc['_id'] = str(doc['_id'])
    if 'student_id' in doc:
        doc['student_id'] = str(doc['student_id'])
    return doc


# ---------------------------------
# Endpoints for dashboard, profile, courses, assignments, and notifications.
# ---------------------------------

@app.route('/api/student/<student_id>/dashboard', methods=['GET'])
def student_dashboard(student_id):
    try:
        student_obj_id = ObjectId(student_id)
    except Exception:
        return jsonify({"error": "Invalid student ID format."}), 400

    # Retrieve student profile
    student = db.students.find_one({"_id": student_obj_id})
    if not student:
        return jsonify({"error": "Student not found."}), 404

    # Retrieve courses where the student is enrolled (assumes courses have a "student_ids" field)
    raw_courses = list(db.courses.find({"student_ids": student_obj_id}))
    courses = [serialize_doc(course) for course in raw_courses]

    # Extract course IDs (keep original ObjectId values) to query assignments
    course_ids = [course['_id'] for course in raw_courses]

    # Retrieve assignments for these courses (each assignment document has a "course_id" field)
    assignments = list(db.assignments.find({"course_id": {"$in": course_ids}}))
    assignments = [serialize_doc(assignment) for assignment in assignments]

    # Retrieve notifications for the student (assumes notifications have a "student_ids" field)
    notifications = list(db.notifications.find({"student_ids": student_obj_id}))
    notifications = [serialize_doc(notification) for notification in notifications]

    dashboard_data = {
        "student": serialize_doc(student),
        "courses": courses,
        "assignments": assignments,
        "notifications": notifications
    }
    return jsonify(dashboard_data)


@app.route('/test/users/<string:user>', methods=['GET', 'PUT'])
def student_profile(user):

    if request.method == 'GET':
        user = db.users.find_one({"user": user})
        if not user:
            return jsonify({"error": "Student not found."}), 404
        return jsonify(serialize_doc(user))

    elif request.method == 'PUT':
        data = request.json
        if not data:
            return jsonify({"error": "No data provided."}), 400
        result = db.students.update_one({"user": user}, {"$set": data})
        if result.matched_count == 0:
            return jsonify({"error": "Student not found."}), 404
        return jsonify({"status": "Profile updated"})


@app.route('/api/student/<student_id>/courses', methods=['GET'])
def student_courses(student_id):
    try:
        student_obj_id = ObjectId(student_id)
    except Exception:
        return jsonify({"error": "Invalid student ID format."}), 400

    courses = list(db.courses.find({"student_ids": student_obj_id}))
    courses = [serialize_doc(course) for course in courses]
    return jsonify(courses)


@app.route('/api/student/<student_id>/assignments', methods=['GET'])
def student_assignments(student_id):
    try:
        student_obj_id = ObjectId(student_id)
    except Exception:
        return jsonify({"error": "Invalid student ID format."}), 400

    raw_courses = list(db.courses.find({"student_ids": student_obj_id}))
    course_ids = [course['_id'] for course in raw_courses]
    assignments = list(db.assignments.find({"course_id": {"$in": course_ids}}))
    assignments = [serialize_doc(assignment) for assignment in assignments]
    return jsonify(assignments)


@app.route('/api/student/<student_id>/notifications', methods=['GET'])
def student_notifications(student_id):
    try:
        student_obj_id = ObjectId(student_id)
    except Exception:
        return jsonify({"error": "Invalid student ID format."}), 400

    notifications = list(db.notifications.find({"student_ids": student_obj_id}))
    notifications = [serialize_doc(notification) for notification in notifications]
    return jsonify(notifications)


# ---------------------------------
# Endpoints for the student to-do page
# ---------------------------------

@app.route('/api/student/<student_id>/todo', methods=['GET', 'POST'])
def student_todo(student_id):
    """
    GET: Retrieve all to-do items for the student.
    POST: Create a new to-do item. Required fields: title, due_date, class, and description.
    """
    try:
        student_obj_id = ObjectId(student_id)
    except Exception:
        return jsonify({"error": "Invalid student ID format."}), 400

    if request.method == 'GET':
        # Retrieve all to-do items that belong to the student
        todos = list(db.todos.find({"student_id": student_obj_id}))
        todos = [serialize_doc(todo) for todo in todos]
        return jsonify(todos)

    elif request.method == 'POST':
        data = request.get_json()
        required_fields = ["title", "due_date", "class", "description"]
        if not data or not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields. Required: title, due_date, class, description."}), 400

        # Create a new to-do item; default 'completed' is False if not provided
        new_todo = {
            "student_id": student_obj_id,
            "title": data.get("title"),
            "due_date": data.get("due_date"),  # expects an ISO 8601 formatted string
            "class": data.get("class"),
            "description": data.get("description"),
            "completed": data.get("completed", False)
        }
        result = db.todos.insert_one(new_todo)
        new_todo['_id'] = str(result.inserted_id)
        new_todo['student_id'] = str(new_todo['student_id'])
        return jsonify(new_todo), 201


@app.route('/api/student/<student_id>/todo/<todo_id>', methods=['PUT', 'DELETE'])
def modify_todo(student_id, todo_id):
    """
    PUT: Update an existing to-do item. Allowed fields: title, due_date, class, description, completed.
    DELETE: Remove the to-do item.
    """
    try:
        student_obj_id = ObjectId(student_id)
        todo_obj_id = ObjectId(todo_id)
    except Exception:
        return jsonify({"error": "Invalid ID format."}), 400

    # Ensure the to-do item belongs to the student.
    todo = db.todos.find_one({"_id": todo_obj_id, "student_id": student_obj_id})
    if not todo:
        return jsonify({"error": "To-do item not found for the specified student."}), 404

    if request.method == 'PUT':
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided for update."}), 400
        # Allow updates only for specific fields.
        allowed_fields = ["title", "due_date", "class", "description", "completed"]
        update_data = {field: data[field] for field in allowed_fields if field in data}
        if not update_data:
            return jsonify({"error": "No valid fields provided for update."}), 400
        db.todos.update_one({"_id": todo_obj_id}, {"$set": update_data})
        updated_todo = db.todos.find_one({"_id": todo_obj_id})
        return jsonify(serialize_doc(updated_todo))

    elif request.method == 'DELETE':
        db.todos.delete_one({"_id": todo_obj_id})
        return jsonify({"status": "To-do item deleted"})


# -----------------------------------------------------
# New Endpoints for Viewing and Submitting Assignments,
# Taking Quizzes/Tests, and Viewing Announcements.
# -----------------------------------------------------

# 1. Viewing a single assignment's details.
@app.route('/api/student/<student_id>/assignments/<assignment_id>', methods=['GET'])
def view_assignment(student_id, assignment_id):
    try:
        student_obj = ObjectId(student_id)
        assignment_obj = ObjectId(assignment_id)
    except Exception:
        return jsonify({"error": "Invalid ID format."}), 400

    assignment = db.assignments.find_one({"_id": assignment_obj})
    if not assignment:
        return jsonify({"error": "Assignment not found."}), 404

    return jsonify(serialize_doc(assignment))

# 2. Submitting an assignment.
@app.route('/api/student/<student_id>/assignments/<assignment_id>/submission', methods=['POST'])
def submit_assignment(student_id, assignment_id):
    try:
        student_obj = ObjectId(student_id)
        assignment_obj = ObjectId(assignment_id)
    except Exception:
        return jsonify({"error": "Invalid ID format."}), 400

    data = request.get_json()
    if not data or "content" not in data:
        return jsonify({"error": "Missing required field: content."}), 400

    submission = {
        "student_id": student_obj,
        "assignment_id": assignment_obj,
        "content": data.get("content"),
        "submitted_at": datetime.utcnow().isoformat() + "Z"
    }
    result = db.submissions.insert_one(submission)
    submission['_id'] = str(result.inserted_id)
    submission['student_id'] = str(submission['student_id'])
    submission['assignment_id'] = str(submission['assignment_id'])
    return jsonify(submission), 201

# 3. Viewing available quizzes/tests.
@app.route('/api/student/<student_id>/quizzes', methods=['GET'])
def view_quizzes(student_id):
    try:
        student_obj = ObjectId(student_id)
    except Exception:
        return jsonify({"error": "Invalid student ID format."}), 400

    # Retrieve courses the student is enrolled in to determine relevant quizzes.
    courses = list(db.courses.find({"student_ids": student_obj}))
    course_ids = [course['_id'] for course in courses]

    quizzes = list(db.quizzes.find({"course_id": {"$in": course_ids}}))
    quizzes = [serialize_doc(quiz) for quiz in quizzes]
    return jsonify(quizzes)

# 4. Viewing details for a specific quiz/test.
@app.route('/api/student/<student_id>/quizzes/<quiz_id>', methods=['GET'])
def view_quiz(student_id, quiz_id):
    try:
        student_obj = ObjectId(student_id)
        quiz_obj = ObjectId(quiz_id)
    except Exception:
        return jsonify({"error": "Invalid ID format."}), 400

    quiz = db.quizzes.find_one({"_id": quiz_obj})
    if not quiz:
        return jsonify({"error": "Quiz not found."}), 404

    return jsonify(serialize_doc(quiz))

# 5. Submitting quiz/test answers.
@app.route('/api/student/<student_id>/quizzes/<quiz_id>/submission', methods=['POST'])
def submit_quiz(student_id, quiz_id):
    try:
        student_obj = ObjectId(student_id)
        quiz_obj = ObjectId(quiz_id)
    except Exception:
        return jsonify({"error": "Invalid ID format."}), 400

    data = request.get_json()
    if not data or "answers" not in data:
        return jsonify({"error": "Missing required field: answers."}), 400

    submission = {
        "student_id": student_obj,
        "quiz_id": quiz_obj,
        "answers": data.get("answers"),  # Expected to be a dict or list of answers.
        "submitted_at": datetime.utcnow().isoformat() + "Z"
    }
    result = db.quiz_submissions.insert_one(submission)
    submission['_id'] = str(result.inserted_id)
    submission['student_id'] = str(submission['student_id'])
    submission['quiz_id'] = str(submission['quiz_id'])
    return jsonify(submission), 201

# 6. Viewing announcements made by teachers.
@app.route('/api/student/<student_id>/announcements', methods=['GET'])
def view_announcements(student_id):
    try:
        student_obj = ObjectId(student_id)
    except Exception:
        return jsonify({"error": "Invalid student ID format."}), 400

    # Retrieve the student's courses to fetch relevant announcements.
    courses = list(db.courses.find({"student_ids": student_obj}))
    course_ids = [course['_id'] for course in courses]

    announcements = list(db.announcements.find({"course_id": {"$in": course_ids}}))
    announcements = [serialize_doc(announcement) for announcement in announcements]
    return jsonify(announcements)


if __name__ == '__main__':
    app.run(debug=True)



# @app.route('/student/home', methods=['GET'])
# @token_required
# def student_home(current_student):
#     # Retrieve the list of class IDs the student is enrolled in
#     student_class_ids = current_student.get("class_ids", [])
# 
#     # Convert the list of string IDs to ObjectId instances for the query
#     try:
#         object_ids = [ObjectId(cid) for cid in student_class_ids]
#     except Exception as e:
#         return jsonify({"error": "Invalid class IDs for student"}), 400
# 
#     # Query the classes collection to fetch the enrolled classes and their assignments
#     classes = list(db.classes.find({"_id": {"$in": object_ids}}))
#     classes = parse_object_ids(classes)
# 
#     return jsonify({"classes": classes}), 200


# if __name__ == "__main__":
#     app.run(debug=True)




























# @app.route('/classes', methods=['POST'])
# def create_class():
#     """
#     Endpoint to create a new class.
#     Expected JSON payload:
#       {
#         "name": "Introduction to Math",
#         "description": "Basic mathematics concepts"
#       }
#     """
#     data = request.get_json()
#     if not data or 'name' not in data:
#         return jsonify({"error": "Missing required field: name"}), 400
#
#     class_doc = {
#         "name": data["name"],
#         "description": data.get("description", ""),
#         "assignments": [],   # List to hold assignments for the class
#         "attendance": [],    # List to hold attendance records
#         "created_at": datetime.datetime.now(datetime.UTC),
#     }
#     result = db.classes.insert_one(class_doc)
#     return jsonify({
#         "message": "Class created successfully",
#         "class_id": str(result.inserted_id)
#     }), 201
#
#
# @app.route('/classes/<class_id>/assignments', methods=['POST'])
# def create_assignment(class_id):
#     """
#     Endpoint to add an assignment within an existing class.
#     Expected JSON payload:
#       {
#         "title": "Homework 1",
#         "description": "Algebra problems",
#         "due_date": "2025-05-01"
#       }
#     """
#     data = request.get_json()
#     if not data or 'title' not in data:
#         return jsonify({"error": "Missing required field: title"}), 400
#
#     # Create an assignment document with its own unique _id
#     assignment = {
#         "_id": ObjectId(),
#         "title": data["title"],
#         "description": data.get("description", ""),
#         "due_date": data.get("due_date"),  # Ideally validated or parsed
#         "grades": [],  # List to store grades for this assignment
#         "created_at": datetime.datetime.now(datetime.UTC)
#     }
#
#     result = db.classes.update_one(
#         {"_id": ObjectId(class_id)},
#         {"$push": {"assignments": assignment}}
#     )
#
#     if result.modified_count == 0:
#         return jsonify({"error": "Class not found"}), 404
#
#     return jsonify({
#         "message": "Assignment added successfully",
#         "assignment_id": str(assignment["_id"])
#     }), 201
#
#
# @app.route('/classes/<class_id>/assignments/<assignment_id>/grades', methods=['POST'])
# def input_grade(class_id, assignment_id):
#     """
#     Endpoint to input a grade for a student on a specific assignment.
#     Expected JSON payload:
#       {
#         "student_id": "student123",
#         "grade": 95
#       }
#     """
#     data = request.get_json()
#     if not data or 'student_id' not in data or 'grade' not in data:
#         return jsonify({"error": "Missing required fields: student_id and grade"}), 400
#
#     grade_record = {
#         "student_id": data["student_id"],
#         "grade": data["grade"],
#         "graded_at": datetime.datetime.now(datetime.UTC)
#     }
#
#     result = db.classes.update_one(
#         {
#             "_id": ObjectId(class_id),
#             "assignments._id": ObjectId(assignment_id)
#         },
#         {
#             "$push": {"assignments.$.grades": grade_record}
#         }
#     )
#
#     if result.modified_count == 0:
#         return jsonify({"error": "Class or assignment not found"}), 404
#
#     return jsonify({"message": "Grade recorded successfully"}), 201
#
#
# @app.route('/classes/<class_id>/attendance', methods=['POST'])
# def mark_attendance(class_id):
#     """
#     Endpoint to mark attendance for a student in a class.
#     Expected JSON payload:
#       {
#         "student_id": "student123",
#         "date": "2025-04-15",  // Optional; defaults to today's date if not provided
#         "status": "present"     // Optional; could be "present", "absent", etc.
#       }
#     """
#     data = request.get_json()
#     if not data or 'student_id' not in data:
#         return jsonify({"error": "Missing required field: student_id"}), 400
#
#     attendance_record = {
#         "student_id": data["student_id"],
#         "date": data.get("date", datetime.datetime.now(datetime.UTC).date().isoformat()),
#         "status": data.get("status", "present")
#     }
#
#     result = db.classes.update_one(
#         {"_id": ObjectId(class_id)},
#         {"$push": {"attendance": attendance_record}}
#     )
#
#     if result.modified_count == 0:
#         return jsonify({"error": "Class not found"}), 404
#
#     return jsonify({"message": "Attendance recorded successfully"}), 201
#
#
# @app.route('/classes', methods=['GET'])
# def get_classes():
#     """
#     Endpoint to retrieve all classes. This is useful for debugging and administration.
#     """
#     classes = list(db.classes.find())
#     classes = parse_object_ids(classes)
#     return jsonify(classes), 200
#
#
# @app.route('/classes/<class_id>', methods=['GET'])
# def get_class(class_id):
#     """
#     Endpoint to retrieve a single class by its ID.
#     """
#     class_doc = db.classes.find_one({"_id": ObjectId(class_id)})
#     if not class_doc:
#         return jsonify({"error": "Class not found"}), 404
#     class_doc = parse_object_ids(class_doc)
#     return jsonify(class_doc), 200



