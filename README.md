# jaina-cards
#### Installations
- Node js (I have 14.15.0)
- Postgres (Create database jaina-cards)
#### First time steps of git:
1. git clone https://github.com/komal-lunkad/jaina-cards.git
2. cd jaina-cards
3. git checkout main

#### To avail latest code
git pull origin main

#### Run app
- cd jaina-cards
- npm i
- DEBUG=* node app.js
- Run client - DEBUG=* node client.js

Note: Application will start on port 8000

#### Export Users from csv to local database
```
DEBUG=* node scripts/readAndStoreUsers.js
```

#### Export Questions from csv to local database
```
DEBUG=* node scripts/readAndStoreQuestions.js
```

### APIS Documentation
**1.  LOGIN API**

**Route:** localhost:8000/login

**Method:** POST

**Body:** 
```
{
	"dob": "04/02/1991",
	"contact_no": "7878787878"
}
```

**2.  JOIN ROOM API**

**Route:** localhost:8000/join/room?token=9-qEZigngnQVaHHl-c6GoStU1lsqyHklGiRU46mzWDXOEbzHC8K5qxFwX52czDzD

**Method:** GET

**Response:**
```
{
    "result": {
        "color": "red",
        "room_id": 3,
        "name": "Simran"
    },
    "status": {
        "code": 200
    }
}
```

**3.  DISPLAY SCOREBOARD API**

**Route:** localhost:8000/scoreboard?token=8UzbHCvLrFkxh7f2WYpjY5s1QuSw20CgnkgDwZaGiLua0mPxoCyUC_dez_MK57cz

**Method:** GET

**RESPONSE:**
```
{
    "result": [
        {
            "marks": 0,
            "rank": 1,
            "color": "red",
            "name": "Simran"
        }
    ],
    "status": {
        "code": 200
    }
}
```

**4.  LOGOUT API**

**Route:** localhost:8000/logout

**Method:** POST

**RESPONSE:**
```
{
    "status": {
        "code": 200
    }
}
```
