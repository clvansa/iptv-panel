# IPTV Panel

A modern IPTV management panel built with **React**, **Node.js**, **Express**, **MySQL**, and **Sequelize**.

## Features

### Channel Management

* Add channels manually
* Edit existing channels
* Delete channels
* Bulk channel operations
* Search and filter channels
* Channel logos support

### Playlist Import

* Import channels from remote M3U URLs
* Automatic duplicate detection
* Automatic country detection from TVG ID
* Automatic language synchronization from IPTV-Org metadata

### Playlist Management

* Create and manage playlists
* Add selected channels to playlists
* Add filtered channel groups to playlists
* Drag & Drop channel sorting
* Automatic playlist updates

### Streaming

* Built-in HLS player
* Direct stream playback
* Optional proxy mode
* Stream status checking
* M3U8 support

### Filtering

* Filter by country
* Filter by language
* Filter by category
* Search by channel name

## Technology Stack

### Frontend

* React
* Vite
* Material UI
* React Query
* React Router
* HLS.js

### Backend

* Node.js
* Express
* Sequelize
* MySQL
* Axios

## Installation

### Clone Repository

```bash
git clone https://github.com/clvansa/iptv-panel.git
cd iptv-panel
```

### Backend

```bash
cd backend
npm install
```

Create a `.env` file:

```env
PORT=5000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=iptv_panel
DB_USER=root
DB_PASSWORD=

```

Start backend:

```bash
npm start
```

### Frontend

```bash
cd frontend
npm install
```

Create a `.env` file:

```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:

```bash
npm run dev
```

## Project Structure

```text
iptv-panel/
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── scripts/
│   └── config/
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   └── layouts/
│   └── public/
│
└── README.md
```

## Future Plans

* User management
* Subscription packages
* Xtream Codes support
* API authentication
* M3U generation
* Dashboard analytics
* Stream monitoring

## License

This project is for educational and development purposes.
