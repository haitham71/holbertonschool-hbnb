# HBnB Evolution - Part 2: API Implementation

A simplified Airbnb clone project for Holberton School.

---

## 📘 About

**HBnB Evolution** is a web application that allows users to:

- Register and manage user accounts
- Create and manage property listings (Places)
- Associate amenities with properties
- Maintain structured relationships between Users, Places, and Amenities

This repository now includes:

✅ Architecture & Design (Part 1)  
✅ API Implementation with Flask-RESTx (Part 2)

---

## 🏗️ Architecture

The application follows a clean **3-layer architecture**:

Presentation Layer (Flask REST API)
↓
Business Logic Layer (Facade Pattern)
↓
Persistence Layer (InMemory Repository)


### 🔹 Presentation Layer
- Built using **Flask + Flask-RESTx**
- Handles HTTP requests & responses
- Validates input data
- Returns structured JSON responses

### 🔹 Business Logic Layer
- Centralized in `HBnBFacade`
- Handles application rules
- Validates relationships between entities
- Manages object creation and updates

### 🔹 Persistence Layer
- Uses `InMemoryRepository`
- Stores objects in memory (temporary storage)
- Designed to be replaced later by SQLAlchemy (Part 3)

---

## 📁 Project Structure
```
holbertonschool-hbnb/
│
├── part2/
│ └── hbnb/
│ ├── app/
│ │ ├── init.py
│ │ ├── api/
│ │ │ └── v1/
│ │ │ ├── users.py
│ │ │ ├── places.py
│ │ │ └── amenities.py
│ │ ├── models/
│ │ │ ├── user.py
│ │ │ ├── place.py
│ │ │ └── amenity.py
│ │ ├── services/
│ │ │ └── facade.py
│ │ └── persistence/
│ │ └── repository.py
│ ├── run.py
│ └── test_models/
│
├── Part1/
│ ├── README.md
│ ├── Class Diagrams.jpeg
│ ├── High-Level Package Diagram.png
│ └── Sequence_Diagrams_for_API_Calls.md
│
└── README.md
```

---

## 🔥 Implemented API Endpoints

### 👤 Users

| Method | Endpoint | Description |
|--------|----------|------------|
| POST | /api/v1/users/ | Create a new user |
| GET | /api/v1/users/ | Retrieve all users |
| GET | /api/v1/users/<id> | Retrieve user by ID |
| PUT | /api/v1/users/<id> | Update user |

---

### 🏠 Places

| Method | Endpoint | Description |
|--------|----------|------------|
| POST | /api/v1/places/ | Create a new place |
| GET | /api/v1/places/ | Retrieve all places |
| GET | /api/v1/places/<id> | Retrieve place by ID |
| PUT | /api/v1/places/<id> | Update place |

✔ Includes:
- Owner validation
- Amenity validation
- Price validation (> 0)
- Latitude validation (-90 to 90)
- Longitude validation (-180 to 180)

---

### 🛠 Amenities

| Method | Endpoint | Description |
|--------|----------|------------|
| POST | /api/v1/amenities/ | Create amenity |
| GET | /api/v1/amenities/ | Retrieve all amenities |
| GET | /api/v1/amenities/<id> | Retrieve amenity by ID |
| PUT | /api/v1/amenities/<id> | Update amenity |

---

## 🧠 Design Patterns Used

### ✔ Facade Pattern
Centralizes communication between layers.

### ✔ Repository Pattern
Abstracts data storage from business logic.

### ✔ Layered Architecture
Ensures separation of concerns.

---

## 🧪 Running the Project

### 1️⃣ Install Dependencies

```bash
pip install flask flask-restx
```

### 2️⃣ Run the Server
```bash
python run.py
```

Server will run at:
```
http://127.0.0.1:5000
```

Swagger UI available at:
```
http://127.0.0.1:5000
```
---

###🧪 Running Tests

##Run all tests:
```bash
python -m unittest discover
```

Run specific test:

```bash
python -m unittest test_models.test_user
```
---
## 👤 Author

**Haitham** - [@haitham71](https://github.com/haitham71)
**Abdullah** - [@ASD](https://github.com/AXA6)
**Mustafa** - [@i1SaSa](https://github.com/i1SaSa)