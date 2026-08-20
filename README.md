# NFL Mock Draft Simulator

![Main Logo](/frontend/public/site/main_logo.png)

*By Rohan Mistry - Last updated July 19, 2025*

---

## 📖 Overview

NFL Mock Draft Simulator is a comprehensive full-stack web application that delivers an immersive NFL Draft simulation experience, combining modern web technologies with sophisticated algorithmic decision-making. Built with a React frontend and FastAPI backend, the platform enables users to control multiple NFL teams simultaneously while an intelligent CPU system manages non-controlled teams using weighted algorithms based on positional needs and player rankings. The application features real-time draft progression, dynamic team roster management, and interactive trade evaluation systems powered by industry-standard draft value charts.

The platform demonstrates advanced full-stack development capabilities through its PostgreSQL database architecture, RESTful API design, and responsive user interface that handles complex state management across multiple concurrent draft simulations. Key technical achievements include implementing real-time data synchronization, automated background processing for CPU picks, comprehensive CRUD operations, and seamless deployment across cloud platforms (Netlify, Render, Supabase). The application processes over 250+ player profiles and manages intricate relational data structures while maintaining optimal performance through connection pooling and caching strategies.

**Target Users** are both casual and diehard NFL fans and analysts who want a hands-on mock draft experience to simulate NFL draft scenarios.

🔗 **Try it live**: [https://nfl-mock-draft-simulator.netlify.app/](https://nfl-mock-draft-simulator.netlify.app/)

<br>

**Home Page**

![Home Page](/static/img/home_page.png)

**Draft Page**

![Draft Page](/static/img/draft_page.png)

**Results Page**

![Results Page](/static/img/results_page.png)

---

## 📁 Contents

```bash
|── alembic/
│   └── versions/               # Database migrations
│   └── env.py                  # Alembic environment configuration
|── backend/
│   └── apps/
│       └── crud.py             # CRUD operations
│       └── models.py           # SQLAlchemy ORM model structures
│       └── schemas.py          # Pydantic schemas
│   └── scripts/
│       └── draft_service.py    # Basic simulation script
│   └── database.py             # PostgreSQL database connection
│   └── main.py                 # FastAPI endpoints and CORS middleware
|── data/
│   └── 2025/                   # Draft data for 2025
│   └── import_data.py          # Database import from CSV data
│   └── schema.sql              # PostgreSQL database schema
|── frontend/
│   └── src/
│       └── pages/
│           └── Draft.jsx       # Draft page component
│           └── Home.jsx        # Home page component
│           └── Results.jsx     # Results page component
│       └── App.css             # CSS styling
│       └── App.jsx             # Main app component
|── LICENSE                     # MIT License
|── README.md                   # Project documentation
└── requirements.txt            # Python dependencies
```

___

## 🌟 Features

* **Full Draft Simulation**: Simulate NFL draft round-by-round.
* **Live Picks**: View and track draft picks live.
* **User-Controlled Teams**: Select specific teams to control your draft picks.
* **Draft Data**: Database-backed draft data (players, teams, draft picks), including a sample 2027 dataset for testing.
* **Team Needs**: Automatically updates team positional needs during the draft.
* **Draft Tools**: Undo picks, pause/resume draft, and restart draft.
* **Trades**: Trade picks with other teams with algorithm-based trade evaluation display.
* **Pick Clock**: 60-second pick clock for manual picks.
* **Big Board**: Best players available displayed in scrollable list with position filtering and name searching.
* **CPU**: For non-user-controlled picks, CPU auto-selects from big board
* **Sounds**: Mute/unmute draft sounds as desired.
* **Results**: After simulation concludes, draft results displayed in list and grid view. Can toggle between full draft and team-specific results.
* **Export**: Export draft results via PNG, CSV, or JSON.
* **Shareable Link**: Copy draft results link and share with others.
* **Responsive Design**: Responsive frontend web design optimized for desktop.
* **API**: REST API built with FastAPI.
* **Public Application**: View public web application, deployed via Render (backend) and Netlify (frontend).
* **Security**: CORS-configured secure API access.

---

## 🛠️ Installation Instructions

To run the app locally:
1. Clone the repository:
```bash
git clone https://github.com/rmluck/NFL-Mock-Draft-Simulator.git
cd NFL-Mock-Draft-Simulator
```
2. Set up frontend:
```bash
cd frontend
npm install
npm run dev
```
3. Access frontend at __http://localhost:5173__ (or your local Vite port).

---

## 💡 Usage

**Step 1: Draft Settings and Team Selection**
Choose your desired draft settings, including number of rounds and draft year (currently only 2025 is available). You can also give your draft a custom name. Then, select the teams you would like to control during the simulation. For the teams you choose, you will manually make each of their draft selections. For the teams you do not choose, their picks will be auto-selected by the CPU according to a weighted algorithm. After finishing your preferred configurations, you can enter the draft simulation.

![Draft Settings and Team Selection](/static/img/team_selection.png)


**Step 2: Draft Simulation**
The draft simulation will begin right away. The top of the interface contains a horizontally scrollable list of the draft's picks. The pick that is currently on the clock will always be set as the leftmost visible pick in the bar, though you can scroll left to see picks that have already been made or scroll right to see upcoming picks. Each pick that is associated with a team that you are controlling will have a blue 'User' badge.

The left sidebar of the main interface contains a selection of draft tools. You can undo the previous pick which will nullify its player assignment and return the player to the big board. If you undo a pick, a confirmation screen will pop up to where you can either confirm it or cancel it. You can pause or resume the draft and pick up where you left off later on. You can completely restart the draft which will return all previously selected players back to the big board and scroll back to the first overall pick, effectively resetting the entire draft. You can also trade the current pick. To do so, press the trade button to allow the trade window to pop up which will list all of the remaining picks for your current team and provide you a dropdown menu to select another team to trade with. You can individually select any remaining pick for either team to swap and doing so will result in a verdict bar appearing which states whether a trade is fair, acceptable, or lopsided. These evaluations are made based on the Rich Hill trade value chart along with some additional calculations. You can either submit the trade which will swap the chosen picks between the two teams or cancel the trade and return to the main interface.

![Trade Pick](/static/img/trade_pick.png)

There is also a volume toggle at the bottom of the sidebar which switches back and forth between muted and unmuted. If unmuted, sounds will play whenever you are back on the clock and after each draft selection you manually make. If muted, these sounds will not play.

The middle section is the big board. This is a list of all players that are still available, ordered by rank. There is a position filter at the top in which you can filter the list to only show available players of a specified position. There is also a search bar so that you can query for a player name rather than having to scroll through the entire list to find it. Each player has their own select button which can be clicked when the current pick is assigned to a user-controlled team. The selected player will be assigned to the team with the current pick, the player will be removed from the big board, and the simulation will move to the next pick.

The right sidebar displays a team profile for the team that has the pick that is currently on the clock. Every team has a positional needs grid with values associated for each position according to the urgency for that team to address that position in the draft. Higher values (green) signify higher urgency, lower values (red) signify lower urgency. The team profile also includes a list of all of their pick's throughout the entire draft, including ones that have already been made.

**Step 3: Draft Results**
Once every draft pick in the simulation has been made, the simulation will automatically navigate to the results page. Initially, the full draft results will be displayed in a list view, vertically scrollable with round dividers. In the bottom right corner, you can toggle to a grid view which displays the entire first round in one screen. In grid view, you can flip through each round of the draft.

![Results Grid View](/static/img/results_grid_view.png)

In addition to full draft results, you can scroll through the tabs at the top to any team-specific results. Every user-controlled team has its own list view with their entire draft haul.

![Results Team View](/static/img/results_team_view.png)


In the header, there are several export options. You can export the results as PNG which will simply take a snapshot of your current window and download the image. You can also export the results as a CSV file or a JSON file which will gather the full draft results (or just team-specific results if you are currently on an individual team view) in the desired format and download the file. There is a share button which, when clicked, will simply copy a shareable link of your draft results to your clipboard. There is also a new draft button which directs you back to the home page so that you can enter a new draft.

---

## 🚧 Future Improvements

* Multi-select position filtering for big board
* Add sim-to-end button to draft tools
* Dark mode support and advanced theme customization
* Advanced pre-draft setup enhancements (e.g., manually edit team needs, custom draft order, preset draft modes (realistic, chaos, team-focused, random, etc.))
* Post-draft analysis features (e.g., grades and team ranks)
* More complex CPU autodraft algorithm
* Social media sharing
* Optimize API performance and caching
* Advanced player stats and profiles
* Multiplayer mode
* User accounts with saved history tracking

---

## 🧰 Tech Stack

### Frontend Technologies
* **JavaScript**: Core language for frontend development
* **HTML5**: Markup language for structuring web content
* **CSS3**: Styling and layout
* **React 18**: User interface library for building interactive UIs
* **Vite**: Fast development build tool and dev server
* **React Router**: Declarative routing for React apps

### Backend & API
* **Python 3.11**: Backend programming language
* **FastAPI**: Modern, fast async web framework for building APIs
* **SQL**: Structured query language for data operations
* **SQLAlchemy**: ORM for database interactions
* **Pydantic**: Data validation and settings management
* **Alembic**: Database migrations and schema management

### Database & Data Management
* **PostgreSQL**: Relational database manaagement system
* **Supabase**: PostgreSQL database hosting, authentication, and management
* **CSV**: Draft data import/export

### Real-Time & State Management
* **React State**: Local and global state management
* **Custom hooks**: Encapsulated logic for draft simulation and UI state

### Development Tools
* **ESLint**: Code linting and formatting
* **Prettier**: Code formatting

### Build & Development
* **Node.js**: JavaScript runtime environment
* **npm**: Package management

### Deployment
* **Netlify**: Frontend development and hosting
* **Render**: Backend deployment and hosting

## 🙏 Contributions / Acknowledgements

This project was built independently as a portfolio project. Inspired by draft simulators like [PFF](https://www.pff.com/draft/nfl-mock-draft-simulator), [NFL Mock Draft Database](https://www.nflmockdraftdatabase.com/mock-draft-simulator), and [Mock Draft Central](https://www.mockdraftcentral.io/).

## 🪪 License

This project is licensed under the [MIT License](/LICENSE).