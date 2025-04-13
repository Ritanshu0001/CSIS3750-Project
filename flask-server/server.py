from functools import wraps
from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from werkzeug.security import check_password_hash
from bson.objectid import ObjectId
import jwt
import datetime

app = Flask(__name__)

app.config["MONGO_URI"] = "mongodb+srv://nweikl:qyQrov-gyxsi1-dejtov@csis3750.auwttdg.mongodb.net/csis3750_db?retryWrites=true&w=majority&appName=csis3750"
app.config["SECRET_KEY"] = "your_secret_key_here"

mongo = PyMongo(app)
db = mongo.db


try:
    mongo.cx.admin.command('ping')
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

    user = mongo.db.users.find_one({"username": username})
    if not user or not check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid username or password"}), 401

    token = jwt.encode({
        'username': username,
        'exp': datetime.datetime.now(datetime.UTC) + datetime.timedelta(hours=1)
    }, app.config['SECRET_KEY'], algorithm='HS256')

    return jsonify({'token': token})


def serialize_doc(doc):
    """
    Helper function to convert MongoDB documents to JSON-serializable dictionaries.
    It converts ObjectId values to strings.
    """
    doc['_id'] = str(doc['_id'])
    return doc


@app.route('/api/student/<student_id>/dashboard', methods=['GET'])
def student_dashboard(student_id):
    """
    Endpoint to get the complete dashboard for a student.
    Returns:
      - Student profile
      - List of courses the student is enrolled in
      - Assignments for those courses
      - Notifications specifically targeted for the student
    """
    try:
        student_obj_id = ObjectId(student_id)
    except Exception:
        abort(400, description="Invalid student ID format.")

    # Get student profile
    student = mongo.db.students.find_one({"_id": student_obj_id})
    if not student:
        abort(404, description="Student not found.")

    # Retrieve courses where the student is enrolled.
    # Here, we assume that each course document has a field "student_ids" which is a list of ObjectId
    raw_courses = list(mongo.db.courses.find({"student_ids": student_obj_id}))
    courses = [serialize_doc(course) for course in raw_courses]
    # Extract the original ObjectId values for querying assignments
    course_ids = [course['_id'] for course in raw_courses]

    # Retrieve assignments for these courses.
    # We assume each assignment document has a "course_id" field referencing a course's ObjectId.
    # Note: course_ids from the database are ObjectId objects; since our serialize_doc converts them to string,
    # we use the ones we extracted before serialization.
    assignments = list(mongo.db.assignments.find({"course_id": {"$in": course_ids}}))
    assignments = [serialize_doc(assignment) for assignment in assignments]

    # Retrieve notifications for the student.
    # In the notifications collection, we assume there's a field "student_ids" listing the target students.
    notifications = list(mongo.db.notifications.find({"student_ids": student_obj_id}))
    notifications = [serialize_doc(notification) for notification in notifications]

    # Compose and return the dashboard data.
    dashboard_data = {
        "student": serialize_doc(student),
        "courses": courses,
        "assignments": assignments,
        "notifications": notifications
    }
    return jsonify(dashboard_data)


@app.route('/api/student/<student_id>/profile', methods=['GET', 'PUT'])
def student_profile(student_id):
    """
    GET: Returns the student's profile information.
    PUT: Updates the student's profile with data provided in JSON.
    """
    try:
        student_obj_id = ObjectId(student_id)
    except Exception:
        abort(400, description="Invalid student ID format.")

    if request.method == 'GET':
        student = mongo.db.students.find_one({"_id": student_obj_id})
        if not student:
            abort(404, description="Student not found.")
        return jsonify(serialize_doc(student))

    elif request.method == 'PUT':
        data = request.json
        if not data:
            abort(400, description="No data provided.")
        result = mongo.db.students.update_one({"_id": student_obj_id}, {"$set": data})
        if result.matched_count == 0:
            abort(404, description="Student not found.")
        return jsonify({"status": "Profile updated"})


@app.route('/api/student/<student_id>/courses', methods=['GET'])
def student_courses(student_id):
    """
    Returns the list of courses in which the student is enrolled.
    """
    try:
        student_obj_id = ObjectId(student_id)
    except Exception:
        abort(400, description="Invalid student ID format.")

    courses = list(mongo.db.courses.find({"student_ids": student_obj_id}))
    courses = [serialize_doc(course) for course in courses]
    return jsonify(courses)


@app.route('/api/student/<student_id>/assignments', methods=['GET'])
def student_assignments(student_id):
    """
    Returns all assignments for courses in which the student is enrolled.
    """
    try:
        student_obj_id = ObjectId(student_id)
    except Exception:
        abort(400, description="Invalid student ID format.")

    # Find courses for the student
    raw_courses = list(mongo.db.courses.find({"student_ids": student_obj_id}))
    course_ids = [course['_id'] for course in raw_courses]

    # Find assignments for these courses
    assignments = list(mongo.db.assignments.find({"course_id": {"$in": course_ids}}))
    assignments = [serialize_doc(assignment) for assignment in assignments]
    return jsonify(assignments)


@app.route('/api/student/<student_id>/notifications', methods=['GET'])
def student_notifications(student_id):
    """
    Returns notifications for the student.
    """
    try:
        student_obj_id = ObjectId(student_id)
    except Exception:
        abort(400, description="Invalid student ID format.")

    notifications = list(mongo.db.notifications.find({"student_ids": student_obj_id}))
    notifications = [serialize_doc(notification) for notification in notifications]
    return jsonify(notifications)

if __name__ == '__main__':
    # Run the Flask development server.
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


if __name__ == "__main__":
    app.run(debug=True)




























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



