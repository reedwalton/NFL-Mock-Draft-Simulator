/* 
    * Home page component. Handles mock draft creation and team selection.
*/


// Import necessary libraries and hooks
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";


// Function to handle the draft creation process
function Home() {
    // Define API URL from environment variable
    const apiURL = import.meta.env.VITE_API_URL;

    // Initialize navigate function from react-router
    const navigate = useNavigate();

    // Initialize state variables for draft settings
    const [name, setName] = useState("");
    const [numRounds, setNumRounds] = useState(1);
    const [year, setYear] = useState(2026);
    const [autoPickDelay, setAutoPickDelay] = useState(1000);
    const [soundsMuted, setSoundsMuted] = useState(false);
    const [yearDropdownInteracted, setYearDropdownInteracted] = useState(false);

    // Initialize state variables for team selection
    const [teamsLoading, setTeamsLoading] = useState(true);
    const [teamsError, setTeamsError] = useState("");
    const [teams, setTeams] = useState([]);
    const [selectedTeams, setSelectedTeams] = useState([]);
    const [showSelectTeamModal, setShowSelectTeamModal] = useState(false);

    // Initialize state variables for draft creation status
    const [loading, setLoading] = useState(false);
    const [loadingStartTime, setLoadingStartTime] = useState(null);
    const [dots, setDots] = useState("");
    const [error, setError] = useState("");

    // Initialize state for dark mode (commented out for now)
    const [darkMode, setDarkMode] = useState(false);
    
    // Fetch teams from the API when the component mounts
    useEffect(() => {
        const fetchTeams = async () => {
            setTeamsLoading(true);
            setTeamsError("");
            setLoadingStartTime(Date.now());

            try {
                // Create an abort controller for timeout
                const controller = new AbortController();
                const timeoutId = setTimeout(() => {
                    controller.abort();
                }, 45000); // 45 second timeout

                const response = await axios.get(`${apiURL}/teams`, {
                    params: { year: year },
                    signal: controller.signal,
                    timeout: 45000,
                    headers: {
                        "Cache-Control": "no-cache",
                        "Pragma": "no-cache",
                    }
                });
                
                clearTimeout(timeoutId);
                setTeams(response.data);

                const loadTime = Date.now() - loadingStartTime;
                console.log(`Teams loaded in ${loadTime}ms`);
            } catch (err) {
                console.error("Failed to fetch teams", err);

                if (err.name === "AbortError" || err.code === "ECONNABORTED") {
                    setTeamsError("Server is starting up (this can take up to 60 seconds on first visit). Please wait...");
                } else if (err.response?.status >= 500) {
                    setTeamsError("Server error. Please refresh the page.");
                } else {
                    setTeamsError("Failed to fetch teams. Please check your connection and try again.");
                }
            } finally {
                setTeamsLoading(false);
            }
        };

        fetchTeams();
    }, [apiURL, year]);

    useEffect(() => {
        if (loading) {
            const interval = setInterval(() => {
                setDots(prev => prev.length < 3 ? prev + "." : "");
            }, 500);

            return () => clearInterval(interval);
        } else {
            setDots("");
        }
    }, [loading]);

    // useEffect(() => {
    //     if (darkMode) {
    //         document.documentElement.classList.add("dark_mode");
    //     } else {
    //         document.documentElement.classList.remove("dark_mode");
    //     }
    // }, [darkMode]);

    // Handle team selection toggle
    const handleToggleTeam = (teamId) => {
        setSelectedTeams((prev) => prev.includes(teamId) ? prev.filter((id) => id !== teamId) : [...prev, teamId]);
    };

    // Handle select all/deselect all teams
    const handleSelectAll = () => {
        if (selectedTeams.length === teams.length) {
            setSelectedTeams([]);
        } else {
            setSelectedTeams(teams.map((team) => team.id));
        }
    };

    // Handle draft creation
    const handleStartDraft = async () => {
        if (selectedTeams.length === 0) {
            setShowSelectTeamModal(true);
            return;
        }

        setLoading(true);
        setError("");

        try {
            // Create new mock draft with selected settings
            const result = await axios.post(`${apiURL}/mock_drafts/bootstrap`, {
                name: name || "Mock Draft",
                num_rounds: numRounds,
                year: year,
                user_team_ids: selectedTeams
            });
            const createdDraft = result.data;

            // Navigate to the created draft page with the created draft data
            navigate(`/draft/${createdDraft.id}`, { state: { createdDraft, autoPickDelay } });
        } catch (err) {
            setError("Failed to create mock draft.");
        } finally {
            setLoading(false);
        }
    };

    // Render home page
    return (
        <div className="home_container">
            <header className="home_header">
                <img
                    src={!darkMode ? "/site/main_logo.png" : "/site/main_logo_dark_mode.png"}
                    alt="NFL Mock Draft Simulator logo"
                    className="main_logo"
                />
            </header>

            <main className="home_main">
                <aside className="mock_draft_settings">
                    <h2>
                        Mock Draft Settings
                    </h2>

                    <p className="mock_draft_instructions">
                        1. Select preferred draft settings
                        <br />
                        2. Pick teams to control as user
                        <br />
                        3. Simulate each draft pick
                    </p>

                    {/* <div className="nfl_draft_logo_container">
                        <img 
                            src="/logos/nfl_draft.svg"
                            alt="NFL Draft logo"
                            className="nfl_draft_logo"
                        />
                    </div> */}

                    <label className="draft_name">
                        Draft Name
                        <br />
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Mock Draft" 
                        />
                    </label>

                    <div className="draft_year_and_sounds">
                        <label className="draft_year">
                            Year
                            <br />
                            <select
                                value={year}
                                onChange={(e) => {
                                    setYear(parseInt(e.target.value));
                                    setSelectedTeams([]);
                                    setYearDropdownInteracted(true);
                                }}
                                onBlur={() => setYearDropdownInteracted(true)}
                                className={yearDropdownInteracted ? "interacted" : ""}
                            >
                                <option value={2027}>
                                    2027
                                </option>
                                <option value={2026}>
                                    2026
                                </option>
                                <option value={2025}>
                                    2025
                                </option>
                            </select>
                        </label>

                        <label className="mute_sounds">
                            Mute Sounds
                            <br />
                            <button
                                type="button"
                                className={`mute_sounds_wrapper ${soundsMuted ? "muted" : "unmuted"}`}
                                onClick={() => setSoundsMuted(prev => !prev)}
                                tabIndex={0}
                                aria-label={soundsMuted ? "Unmute sounds" : "Mute sounds"}
                            >
                                <img 
                                    src={soundsMuted ? "/site/unmute.svg" : "/site/mute.svg"}
                                    alt={soundsMuted ? "Unmute": "Mute"}
                                    className="mute_sounds_btn"
                                />
                            </button>
                        </label>
                    </div>

                    {/* <button className="dark_mode_btn" onClick={() => setDarkMode(prev => !prev)}>
                        {darkMode ? "Light Mode" : "Dark Mode"}
                    </button> */}
                    {/* <br /> */}

                    <div className="pick_speed">
                        Pick Speed
                        <div className="pick_speed_wrapper">
                            <div className="pick_speed_slider_container">
                                <input
                                    className="pick_speed_slider"
                                    type="range"
                                    min={200}
                                    max={5000}
                                    step={100}
                                    value={5200 - autoPickDelay}
                                    onChange={(e) => setAutoPickDelay(5200 - parseInt(e.target.value))}
                                ></input>
                                <div className="pick_speed_labels">
                                    <span className="pick_speed_label fast">Fast</span>
                                    <span className="pick_speed_label slow">Slow</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="num_rounds">
                        Number of Rounds
                        <div className="num_rounds_selector">
                            {[1, 2, 3, 4, 5, 6, 7].map((round) => (
                                <button
                                    key={round}
                                    className={numRounds === round ? "selected" : ""}
                                    onClick={() => setNumRounds(round)}
                                >
                                    {round}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        className="start_draft_btn"
                        onClick={handleStartDraft}
                        disabled={loading}
                    >
                        {loading ? `Creating${dots}` : "Start Draft"}
                    </button>

                    {showSelectTeamModal && (
                        <div className="select_team_modal_overlay">
                            <div className="select_team_modal">
                                <h3>You must select at least one team.</h3>
                                <button
                                    className="close_modal_btn"
                                    onClick={() => setShowSelectTeamModal(false)}
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}

                    

                    {error && <p className="error">{error}</p>}
                </aside>

                <section className="team_selection">
                    <div className="team_selection_grid_header">
                        <h2>
                            Select Teams to Control
                        </h2>

                        <button
                            onClick={handleSelectAll}
                            disabled={teamsLoading}
                            className="select_all_btn"
                        >
                            {selectedTeams.length === teams.length ? "Deselect All" : "Select All"}
                        </button>
                    </div>

                    <div className="team_selection_grid">
                        {teamsLoading ? (
                            <div className="teams_loading_message">
                                {loadingStartTime && Date.now() - loadingStartTime > 10000 ? (
                                    "Server is waking up, please wait (up to 60 seconds on first visit)"
                                ) : (
                                    "Loading teams"
                                )}
                                <span className="dot_animate"></span>
                            </div>
                            ) : teamsError ? (
                                <div
                                    className="teams_loading_message"
                                    style={{ color: "red", flexDirection: "column", gap: "10px" }}
                                >
                                    {teamsError}
                                    <button
                                        onClick={() => window.location.reload()}
                                        style={{
                                            padding: "10px 20px",
                                            backgroundColor: "var(--light-red)",
                                            border: "2px solid var(--black)",
                                            borderRadius: "6px",
                                            cursor: "pointer",
                                            fontWeight: "bold"
                                        }}
                                    >
                                        Retry
                                    </button>
                                </div>
                            ) : (
                                teams.map((team) => (
                                    <button
                                        key={team.id}
                                        onClick={() => handleToggleTeam(team.id)}
                                        className={`select_team_btn ${selectedTeams.includes(team.id) ? "selected" : ""}`}
                                    >
                                        <div className="select_team_logo_wrapper">
                                            <img
                                                src={`/logos/nfl/${team.name.toLowerCase()}.png`}
                                                alt={`${team.name} logo`}
                                                className="select_team_logo"
                                                loading="lazy"
                                            />
                                        </div>

                                        <span className="select_team_name">
                                            {team.name}
                                        </span>
                                    </button>
                                ))
                            )
                        }
                    </div>
                </section>
            </main>
        </div>
    );
}

export default Home;