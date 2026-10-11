# Uyir Kaval

Uyir Kaval is a web platform that connects people in need with nearby volunteers. It started as a hackathon project at Jeppiaar Institute of Technology.

## Features
- Three role-based interfaces: user (request help), volunteer (enrollment) and admin (verification and request management)
- GPS location using the browser Geolocation API, including live tracking with watchPosition
- Nearest-volunteer matching using the Haversine distance formula
- Map view showing volunteers around the user
- Admin dashboard to verify or remove volunteers and resolve requests

## Tech stack
HTML, CSS, JavaScript (no frameworks). Data is currently stored in the browser's localStorage.

## Future work
- Connect a database (Firebase Firestore or Node.js + MongoDB)
- User authentication and role-based access
- Real-time notifications to volunteers
- Verification of volunteer identity

## How to run
Open the folder in VS Code and run index.html with the Live Server extension.
