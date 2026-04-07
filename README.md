# HBnB Evolution - Airbnb Clone Project

A comprehensive learning project from Holberton School that implements a simplified Airbnb-like web application with a focus on architecture, design patterns, and backend development.

---

## 📋 Project Overview

**HBnB Evolution** is a full-stack web application that demonstrates professional software architecture and development practices. The project is divided into three progressive phases:

- **Part 1**: Design & Architecture (UML diagrams, system design)
- **Part 2**: Backend Implementation (API development )
- **Part 3**: Advanced Features (database integration)

---

## 🎯 Core Features

The platform enables users to:
- ✅ **Register and manage user profiles** - Create accounts with authentication
- ✅ **Create and list properties** - Add properties (places) to the marketplace
- ✅ **Submit and read reviews** - Share feedback and ratings on places
- ✅ **Associate amenities** - Link features (WiFi, pool, parking, etc.) to properties
- ✅ **Manage user data** - Update profile information and place listings

---

## 🏗️ Architecture

The application follows a **3-Layer Architecture** with the **Facade Pattern**:

```
┌─────────────────────────────┐
│   Presentation Layer (API)  │  ← REST endpoints, request handling
├─────────────────────────────┤
│  Business Logic Layer       │  ← Core business rules, validation
├─────────────────────────────┤
│   Persistence Layer (DB)    │  ← Data storage and retrieval
└─────────────────────────────┘
```

### Core Entities

| Entity | Description |
|--------|-------------|
| **User** | Platform users who can register, manage profiles, and own places |
| **Place** | Property listings with details (title, description, price, location) |
| **Review** | User feedback on places with ratings and comments |
| **Amenity** | Features/services available at properties (WiFi, pool, etc.) |



---

## 🔄 API Workflows

### User Registration
1. Client submits registration data (name, email, password)
2. API validates input (format, uniqueness)
3. Business Logic hashes password, generates UUID
4. Database stores user data
5. API returns created user (without password)

### Place Creation
1. Authenticated user submits place details
2. API validates required fields
3. Business Logic associates user as owner, generates UUID
4. Database stores place listing
5. API returns created place object

### Review Submission
1. User submits review (place_id, rating, comment)
2. API authenticates user and validates data
3. Business Logic ensures proper authorization
4. Database stores review entry
5. API confirms successful submission

---

## 🛠️ Technology Stack

- **Backend Framework**: Flask (Python)
- **Database**: Relational Database (SQL)
- **Authentication**: JWT/Session-based
- **API Standard**: REST
- **Architecture Pattern**: 3-Layer + Facade Pattern

---

## 👥 Development Team

| Developer | GitHub |
|-----------|--------|
| Haitham | [@haitham71](https://github.com/haitham71) |
| Abdullah | [@AXA6](https://github.com/AXA6) |
| Mustafa | [@i1SaSa](https://github.com/i1SaSa) |

---

## 📄 License

This project is part of the Holberton School curriculum.

---

## 🚀 Getting Started

For detailed setup and implementation guides, refer to the documentation in each phase folder.