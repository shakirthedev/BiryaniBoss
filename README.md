# Biryani Boss

Full-stack demo app with a Vite + React frontend and a Node.js/Express backend.
The backend proxies Google Cloud Vertex AI requests from the frontend.

This project is for demonstration and prototyping only and is not intended for production use.

## Prerequisites

- Google Cloud SDK (gcloud CLI): https://cloud.google.com/sdk/docs/install
- Node.js and npm

## Google Cloud setup

Initialize gcloud and create Application Default Credentials:

```bash
gcloud init
gcloud auth application-default login
```

## Project structure

- `frontend/`: Vite + React app
- `backend/`: Node.js/Express API proxy

## Backend environment variables

The `backend/.env.local` file is generated when the app is downloaded and contains
the Google Cloud settings used by the backend. You can edit it if needed.

Expected variables:

- `API_BACKEND_PORT`: Backend server port (for example, `5000`)
- `API_PAYLOAD_MAX_SIZE`: Max request payload size (for example, `5mb`)
- `GOOGLE_CLOUD_LOCATION`: Google Cloud region
- `GOOGLE_CLOUD_PROJECT`: Google Cloud project ID

## Install and run

From the repository root:

```bash
npm install
npm run dev
```

The dev script installs frontend and backend dependencies and starts both servers.

## Troubleshooting

- If the backend cannot call Google Cloud APIs, re-run `gcloud auth application-default login`.
- If ports are in use, update `API_BACKEND_PORT` in `backend/.env.local`.
