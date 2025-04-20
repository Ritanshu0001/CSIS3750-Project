from functools import wraps
import pymongo
from flask import Flask, request, jsonify
# from flask_pymongo import PyMongo
# from werkzeug.security import check_password_hash
from bson.objectid import ObjectId
# import jwt
import datetime

app = Flask(__name__)


@app.after_request
def after_request(response):
    # Allow your React app's origin OR use "*" to allow all
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:3000"
    # Which methods are allowed
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    # Which headers can be sent (include Authorization if you use JWT)
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

# app.config["MONGO_URI"] = "mongodb+srv://nweikl:qyQrov-gyxsi1-dejtov@csis3750.auwttdg.mongodb.net/csis3750_db?retryWrites=true&w=majority&appName=csis3750"
# app.config["SECRET_KEY"] = "your_secret_key_here"
#
# mongo = PyMongo(app)
# db = db


client = pymongo.MongoClient("mongodb+srv://nweikl:qyQrov-gyxsi1-dejtov@csis3750.auwttdg.mongodb.net/csis3750_db?retryWrites=true&w=majority&appName=csis3750")
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


# def token_required(f):
#     @wraps(f)
#     def decorated(*args, **kwargs):
#         token = None
#         # Extract token from Authorization header
#         if 'Authorization' in request.headers:
#             auth_header = request.headers['Authorization']
#             if auth_header.startswith("Bearer "):
#                 token = auth_header[7:]
#
#         if not token:
#             return jsonify({"error": "Token is missing!"}), 401
#
#         try:
#             # Decode token using the app secret
#             # data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
#             current_student = db.students.find_one({"_id": ObjectId(data["student_id"])})
#             if not current_student:
#                 raise Exception("Student not found")
#         except Exception as e:
#             return jsonify({"error": "Token is invalid!"}), 401
#
#         # Pass current_student to the route
#         return f(current_student, *args, **kwargs)
#
#     return decorated


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
        "student_id": str(user['_id'])
    }), 200


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

