from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO
from datetime import datetime, timedelta
import jwt
import os
import base64
import json

app = Flask(__name__)
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")

# Configurations
SECRET_KEY = "this_is_a_secret_key_trust"  # Replace with a secure, random secret key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30


# Generate JWT token
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


# Verify JWT token
def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        return None  # Token expired
    except jwt.InvalidTokenError:
        return None  # Invalid token


global_list_of_users = [
    {"username": "asd@asd.asd", "password": "asd"},
    {"username": "test", "password": "test"}
]


def get_all_users():
    return global_list_of_users


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    token = create_access_token(data={"sub": username})
    response = jsonify({"access_token": token, "token_type": "bearer"})
    return response


@app.route('/user', methods=['POST'])
def user_exists():
    data = request.json
    users = get_all_users()
    username = data.get('username')
    answer = {'user_exists': False}
    for user in users:
        if user.get('username') == username:
            answer['user_exists'] = True
            break
    response = jsonify(answer)
    return response


@app.route('/password_check', methods=['POST'])
def user_matches_pass():
    data = request.json
    users = get_all_users()
    username = data.get('username')
    password = data.get('password')
    answer = {'user_exists': False, 'user_matches_pass': False}
    for user in users:
        if user.get('username') == username:
            answer['user_exists'] = True
            if user.get('password') == password:
                answer['user_matches_pass'] = True
            break
    response = jsonify(answer)
    return response


@app.route('/signup', methods=['POST'])
def signup_user():
    data = request.json
    users = get_all_users()
    username = data.get('username')
    password = data.get('password')
    users.append({"username": username, "password": password})
    response = jsonify({})
    return response


global_list_of_items = [
    {"id": 1, "name": "Item 1", "quantity": 10, "available": True, "lastEdit": "2023-10-10T10:00:00"},
    {"id": 2, "name": "Item 2", "quantity": 5, "available": False, "lastEdit": "2023-10-11T12:30:00"},
    {"id": 3, "name": "Item 3", "quantity": 7, "available": True, "lastEdit": "2023-10-12T14:15:00"}
]


def get_all_items():
    return global_list_of_items


def get_page_of_items(all_items, page_size, page_number):
    start = page_size * page_number
    end = start + page_size
    return all_items[start:end]


def protected_request(request):
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        return {"detail": "Authorization header missing"}

    token = auth_header.split(" ")[1] if len(auth_header.split(" ")) > 1 else None
    if not token:
        return {"detail": "Token missing"}

    payload = verify_token(token)
    if not payload:
        return {"detail": "Invalid or expired token"}

    return {"message": "This is a protected route", "user": payload["sub"], "passes": True}


@app.route('/items/<int:page_size>/<int:page_number>', methods=['GET'])
def get_items(page_size, page_number):
    answer = protected_request(request)
    if not answer.get('passes'):
        return jsonify(answer)
    items = get_all_items()
    page = get_page_of_items(items, page_size, page_number) if page_size > 0 else items
    response = jsonify(page)
    return response


@app.route('/items/<int:item_id>', methods=['GET'])
def get_item(item_id):
    answer = protected_request(request)
    if not answer.get('passes'):
        return jsonify(answer)
    items = get_all_items()
    item = next((item for item in items if item["id"] == item_id), None)
    response = jsonify(item) if item else ("Item not found", 404)
    return response


@app.route('/items/<int:item_id>', methods=['PUT'])
def update_item(item_id):
    answer = protected_request(request)
    if not answer.get('passes'):
        return jsonify(answer)
    data = request.json
    items = get_all_items()
    item = next((item for item in items if item["id"] == item_id), None)
    if item is not None:
        item.update(data)
        item['available'] = (item['available'] == 'true')
        item["lastEdit"] = datetime.now().isoformat()
        response = jsonify(item)
        return response
    return "Item not found", 404


@app.route('/items', methods=['POST'])
def add_item():
    answer = protected_request(request)
    if not answer.get('passes'):
        return jsonify(answer)
    data = request.json
    items = get_all_items()
    if not all(k in data for k in ("name", "quantity", "available")):
        return "Invalid item data", 400

    new_id = max(item["id"] for item in items) + 1 if items else 1
    new_item = {
        "id": new_id,
        "name": data["name"],
        "quantity": data["quantity"],
        "available": data["available"],
        "lastEdit": datetime.now().isoformat()
    }
    items.append(new_item)

    socketio.emit('new_item', {"id": new_id})

    response = jsonify(new_item)
    return response, 201


IMAGES_FOLDER = 'Resources/images'
LOCATION_FILE = 'Resources/locations/locations.json'


def load_locations():
    with open(LOCATION_FILE, "r") as f:
        return json.load(f)


def save_locations(data):
    with open(LOCATION_FILE, "w") as f:
        json.dump(data, f)


@app.route('/save_location', methods=['POST'])
def save_location():
    data = request.json
    item_id = str(data['itemId'])
    latitude = data['latitude']
    longitude = data['longitude']

    locations = load_locations()
    locations[item_id] = {"latitude": latitude, "longitude": longitude}
    save_locations(locations)

    return jsonify({"message": "Location saved successfully"}), 200


@app.route('/get_location', methods=['POST'])
def get_location():
    data = request.json
    item_id = str(data['itemId'])

    locations = load_locations()
    if item_id in locations:
        return jsonify(locations[item_id]), 200
    else:
        return jsonify({"message": "Location not found"}), 404


@app.route('/upload_photo', methods=['POST'])
def upload_photo():
    answer = protected_request(request)
    if not answer.get('passes'):
        return jsonify(answer)

    data = request.json
    item_id = data['itemId']
    image_base64 = data['image']

    # Decode the image and save it as a file
    image_data = base64.b64decode(image_base64.split(",")[1])  # Remove "data:image/jpeg;base64,"
    file_path = os.path.join(IMAGES_FOLDER, f"{item_id}.jpeg")

    print('GOT HERE!!!')

    with open(file_path, 'wb') as f:
        f.write(image_data)

    return jsonify({"message": "Photo saved successfully"}), 200


@app.route('/get_photo', methods=['POST'])
def get_photo():
    answer = protected_request(request)
    if not answer.get('passes'):
        return jsonify(answer)

    data = request.json
    item_id = data['itemId']
    file_path = os.path.join(IMAGES_FOLDER, f"{item_id}.jpeg")

    if not os.path.exists(file_path):
        return jsonify({"message": "Photo not found"}), 404

    # Read the image file and encode it as base64
    with open(file_path, 'rb') as f:
        image_base64 = base64.b64encode(f.read()).decode('utf-8')

    # Return the base64-encoded image
    return jsonify({"image": f"data:image/jpeg;base64,{image_base64}"}), 200


@app.route('/status', methods=['GET'])
def is_online():
    return jsonify({}), 200


if __name__ == '__main__':
    socketio.run(app, debug=True)
