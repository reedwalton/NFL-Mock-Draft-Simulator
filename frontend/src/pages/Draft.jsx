/* 
    * Draft page component. Handles draft process, including player selection, trades, and team management.
*/


// Import necessary libraries and components
import React, { use } from "react";
import { useState, useEffect, useRef } from "react";
import { useLocation, useParams, useNavigate, Link } from "react-router-dom";
import Select from "react-select";
import axios from "axios";


// Function to handle the draft process
function Draft() {
    // Define API URL from environment variable
    const apiURL = import.meta.env.VITE_API_URL;

    // Extract draft ID from URL parameters
    const { draftId } = useParams();

    // Initialize location state to retrieve created draft from previous page
    const location = useLocation();
    const [draft, setDraft] = useState(location.state?.createdDraft || null);

    // Initialize navigate function from react-router
    const navigate = useNavigate();

    // Initialize state variable for responsive design
    const [isStacked, setIsStacked] = useState(window.innerWidth <= 1300);

    // Initialize state variables for players
    const [players, setPlayers] = useState([]);

    // Initialize state variables for draft picks
    const [picks, setPicks] = useState([]);

    // Initialize state variables for user-controlled teams
    const [userControlledTeams, setUserControlledTeams] = useState([]);
    
    // Initialize state variables for draft management
    const [isSelecting, setIsSelecting] = useState(false);
    const currentPickIndex = picks.findIndex(pick => !pick.player);
    const currentPick = currentPickIndex !== -1 ? picks[currentPickIndex] : null;
    const currentTeam = currentPick ? currentPick.team : null;
    const isUserTurn = currentPick && userControlledTeams.includes(currentPick.team.id);
    const [timeLeft, setTimeLeft] = useState(60);
    const [autoPickDelay, setAutoPickDelay] = useState(location.state?.autoPickDelay || 1000);

    // Initialize state variables for draft tools
    const [toolsCollapsed, setToolsCollapsed] = useState(window.innerWidth <= 1300);
    const [pickToUndo, setPickToUndo] = useState(null);
    const [showTradeModal, setShowTradeModal] = useState(false);
    const [tradePartner, setTradePartner] = useState(null);
    const [tradedPicks, setTradedPicks] = useState({
        currentTeam: [],
        tradePartner: []
    });
    const [tradeEvaluation, setTradeEvaluation] = useState(null);
    const [paused, setPaused] = useState(false);
    const [showConfirmUndoModal, setShowConfirmUndoModal] = useState(false);
    const [showConfirmRestartModal, setShowConfirmRestartModal] = useState(false);
    const [soundsMuted, setSoundsMuted] = useState(false);
    const tradeValueChart = {2025: {1: 1000, 2: 717, 3: 514, 4: 491, 5: 468, 6: 446, 7: 426, 8: 406, 9: 387, 10: 369, 11: 358, 12: 347, 13: 336, 14: 325, 15: 315, 16: 305, 17: 296, 18: 287, 19: 278, 20: 269, 21: 261, 22: 253, 23: 245, 24: 237, 25: 230, 26: 223, 27: 216, 28: 209, 29: 202, 30: 196, 31: 190, 32: 184, 33: 180, 34: 175, 35: 170, 36: 166, 37: 162, 38: 157, 39: 153, 40: 149, 41: 146, 42: 142, 43: 138, 44: 135, 45: 131, 46: 128, 47: 124, 48: 121, 49: 118, 50: 115, 51: 112, 52: 109, 53: 106, 54: 104, 55: 101, 56: 98, 57: 96, 58: 93, 59: 91, 60: 88, 61: 86, 62: 84, 63: 82, 64: 80, 65: 78, 66: 76, 67: 75, 68: 73, 69: 71, 70: 70, 71: 68, 72: 67, 73: 65, 74: 64, 75: 63, 76: 61, 77: 60, 78: 59, 79: 57, 80: 56, 81: 55, 82: 54, 83: 52, 84: 51, 85: 50, 86: 49, 87: 48, 88: 47, 89: 46, 90: 45, 91: 44, 92: 43, 93: 32, 94: 41, 95: 40, 96: 39, 97: 38, 98: 37, 99: 36, 100: 35, 101: 34, 102: 34, 103: 33, 104: 33, 105: 32, 106: 32, 107: 31, 108: 31, 109: 30, 110: 30, 111: 29, 112: 29, 113: 28, 114: 28, 115: 27, 116: 26, 117: 26, 118: 25, 119: 25, 120: 24, 121: 24, 122: 23, 123: 23, 124: 22, 125: 21, 126: 21, 127: 20, 128: 20, 129: 19, 130: 19, 131: 18, 132: 18, 133: 18, 134: 17, 135: 17, 136: 17, 137: 16, 138: 16, 139: 15, 140: 15, 141: 15, 142: 14, 143: 14, 144: 14, 145: 13, 146: 13, 147: 13, 148: 13, 149: 12, 150: 12, 151: 12, 152: 12, 153: 11, 154: 11, 155: 11, 156: 11, 157: 10, 158: 10, 159: 10, 160: 10, 161: 10, 162: 10, 163: 10, 164: 9, 165: 9, 166: 9, 167: 9, 168: 9, 169: 9, 170: 9, 171: 9, 172: 9, 173: 8, 174: 8, 175: 8, 176: 8, 177: 8, 178: 8, 179: 8, 180: 7, 181: 7, 182: 7, 183: 7, 184: 7, 185: 6, 186: 6, 187: 6, 188: 6, 189: 6, 190: 6, 191: 6, 192: 6, 193: 5, 194: 5, 195: 5, 196: 5, 197: 5, 198: 5, 199: 5, 200: 5, 201: 5, 202: 4, 203: 4, 204: 4, 205: 4, 206: 4, 207: 4, 208: 4, 209: 4, 210: 4, 211: 4, 212: 4, 213: 4, 214: 4, 215: 4, 216: 3, 217: 3, 218: 3, 219: 3, 220: 3, 221: 3, 222: 3, 23: 3, 224: 3, 225: 3, 226: 2, 227: 2, 228: 2, 229: 2, 230: 2, 231: 2, 232: 2, 233: 2, 234: 2, 235: 2, 236: 2, 237: 2, 238: 1, 239: 1, 240: 1, 241: 1, 242: 1, 243: 1, 244: 1, 245: 1, 246: 1, 247: 1, 248: 1, 249: 1, 250: 1, 251: 1, 252: 1, 253: 1, 254: 1, 255: 1, 256: 1, 257: 1}};

    // Initialize state variables for position filtering and player search
    const [positionFilter, setPositionFilter] = useState({value: "ALL", label: "ALL"});
    const positionOptions = [
        {value: "ALL", label: "ALL"}, 
        {value: "QB", label: "QB"},
        {value: "RB", label: "RB"},
        {value: "WR", label: "WR"},
        {value: "TE", label: "TE"},
        {value: "OT", label: "OT"},
        {value: "IOL", label: "IOL"},
        {value: "DE", label: "DE"},
        {value: "DT", label: "DT"},
        {value: "LB", label: "LB"},
        {value: "CB", label: "CB"},
        {value: "S", label: "S"},
    ];
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchHovered, setIsSearchHovered] = useState(false);
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const filteredPlayers = [...players].filter(player => (positionFilter.value === "ALL" || player.position === positionFilter.value) && player.name.toLowerCase().includes(searchQuery.toLowerCase())).sort((a, b) => a.rank - b.rank);

    // Initialize state variables for team management
    const teamPositionalNeeds = currentTeam ? Object.entries(currentTeam).filter(([key, value]) => key !== "name" && key !== "id" && key !== "year") : [];
    const teamPicks = currentTeam ? picks.filter(pick => pick.team.id === currentTeam.id) : [];
    const getPositionUrgencyColor = (value) => {
        if (value >= 10) return '#9E1111';
        if (value === 9) return '#BA2626';
        if (value === 8) return '#C55555';
        if (value === 7) return '#E57373';
        if (value === 6) return '#F28B82';
        if (value === 5) return '#FAA199';
        if (value === 4) return '#A4CEAA';
        if (value === 3) return '#86C48F';
        if (value === 2) return '#58A263';
        if (value === 1) return '#3D8F40';
        return 'A5D6A7';
    };
    
    // Initialize refs for various elements and states
    const userInteractedRef = useRef(false);
    const pickRefs = useRef({});
    const previousPickIdRef = useRef(null);
    const timerRef = useRef(null);
    const timeoutRef = useRef(null);
    const onTheClockRef = useRef(null);
    const onTheClockSoundRef = useRef(null);
    const draftPickSoundRef = useRef(null);
    const autoPickInProgressRef = useRef( {id: null, active: false} );

    // Fetch draft data when component mounts
    useEffect(() => {
        const fetchDraft = async () => {
            try {
                if (!draft) {
                    const draft_result = await axios.get(`${apiURL}/mock_drafts/${draftId}`);
                    setDraft(draft_result.data);
                }
            } catch (err) {
                console.error("Failed to load draft:", err);
            }
        };
        fetchDraft();
    }, [draftId]);

    // Fetch draft picks, user-controlled teams, and players when draft data is available
    useEffect(() => {
        const fetchRest = async() => {
            try {
                // Check if draft is loaded
                if (!draft) return;

                // Fetch draft picks and sort by pick number
                const [picks_result, user_controlled_teams_result, players_result] = await Promise.all([
                    axios.get(`${apiURL}/mock_draft_picks/${draftId}`),
                    axios.get(`${apiURL}/user_controlled_teams/${draftId}`),
                    axios.get(`${apiURL}/players/by_year/`, { params: { year: draft.year } })
                ]);

                // Process picks
                const sortedPicks = picks_result.data.sort((a, b) => {
                    return a.draft_pick.pick_number - b.draft_pick.pick_number;
                });
                setPicks(sortedPicks);

                // Process user-controlled teams
                setUserControlledTeams(user_controlled_teams_result.data.map(team => team.team_id));

                // Process players
                const pickedPlayers = sortedPicks.filter(pick => pick.player).map(pick => pick.player.id);
                const availablePlayers = players_result.data.filter(player => !pickedPlayers.includes(player.id));
                setPlayers(availablePlayers);
            } catch (err) {
                console.error("Failed to fetch additional data:", err);
            }
        };
        fetchRest();
    }, [draft]);

    // Handle window resize for responsive design
    useEffect(() => {
  let lastStacked = window.innerWidth <= 1300;
  setToolsCollapsed(lastStacked);
  const handleResize = () => {
    const stacked = window.innerWidth <= 1300;
    if (stacked !== lastStacked) {
      setToolsCollapsed(stacked);
      lastStacked = stacked;
    }
    setIsStacked(stacked);
  };
  window.addEventListener("resize", handleResize);
  return () => window.removeEventListener("resize", handleResize);
}, []);

    // Scroll to the next pick on the clock when picks change
    useEffect(() => {
        // Check if there is a next pick without a player
        const nextPickIndex = picks.findIndex(p => !p.player);

        // If there is a next pick and the on-the-clock ref is set, scroll to it
        if (nextPickIndex !== -1 && onTheClockRef.current) {
            // Set the on-the-clock ref to the next pick element
            const pickElement = onTheClockRef.current;
            const container = document.querySelector(".draft_picks");

            // If the pick element and container exist, scroll to the pick element
            if (pickElement && container) {
                const containerRect = container.getBoundingClientRect();
                const pickRect = pickElement.getBoundingClientRect();
                const scrollOffset = pickRect.left - containerRect.left + 2;

                container.scrollBy({
                    left: scrollOffset,
                    behavior: "smooth"
                });
            }
        }
    }, [picks]);

    // Redirect to results page if all picks are made
    useEffect(() => {
        // Check if all picks have a player assigned
        const allPicked = picks.length > 0 && picks.every(p => p.player);
        if (allPicked) {
            navigate(`/results/${draftId}`);
        }
    }, [picks, draftId])

    // Initialize audio elements for draft sounds
    useEffect(() => {
        // Create audio elements for draft pick selection and on-the-clock sounds
        draftPickSoundRef.current = new Audio("/sounds/draft_pick.mp3");
        draftPickSoundRef.current.preload = "auto";
        draftPickSoundRef.current.playbackRate = 1.5;
        onTheClockSoundRef.current = new Audio("/sounds/on_the_clock.mp3");
        onTheClockSoundRef.current.preload = "auto";
    }, []);

    // Handle timer for current pick
    useEffect(() => {
        // Check if there is a current pick and if it has a team
        if (!currentPick || !currentPick.team) {
            return;
        }

        // Check if the current pick is assigned to a user-controlled team and if it is different from the previous pick
        const isUserPick = userControlledTeams.includes(currentPick.team.id);
        if (isUserPick && currentPick.id !== previousPickIdRef.current) {
            // Reset timer to 60 seconds
            setTimeLeft(60);

            // Play on-the-clock sound if user has interacted and sounds are not muted
            if (!soundsMuted && userInteractedRef.current && onTheClockSoundRef.current) {
                onTheClockSoundRef.current.currentTime = 0;
                setTimeout(() => {
                    onTheClockSoundRef.current.play();
                }, 1000);
            }

            previousPickIdRef.current = currentPick.id;
        }

        // Clear any existing timer or timeout
        clearInterval(timerRef.current);
        clearTimeout(timeoutRef.current);

        autoPickInProgressRef.current = {id: null, active: false};

        // If the draft is paused, do not start a new timer
        if (paused) {
            return;
        }

        // Check if user is making the pick
        if (isUserPick) {
            // If current pick is a user pick, start a countdown timer
            timerRef.current = setInterval(() => {
                // Update time left every second
                setTimeLeft(prev => {
                    // If paused, clear the timer and return previous value
                    if (paused) {
                        clearInterval(timerRef.current);
                        return prev;
                    }

                    // if time has run out, clear the timer and auto-select player
                    if (prev <= 1) {
                        clearInterval(timerRef.current);
                        if (!autoPickInProgressRef.current.active) {
                            handleAutoSelectPlayer(currentPick);
                        }
                        return 0;
                    }

                    return prev - 1;
                });
            }, 1000); // Update every second
        } else if (!currentPick.player && players.length > 0) {
            // If current pick is not a user pick and there are available players, auto-select a player after a delay
            timeoutRef.current = setTimeout(() => {
                if (!autoPickInProgressRef.current.active) {
                    handleAutoSelectPlayer(currentPick);
                }
            }, autoPickDelay);
        }

        // Cleanup function to clear the timer when component unmounts or dependencies change
        return () => {
            clearInterval(timerRef.current);
            clearTimeout(timeoutRef.current);
        };
    }, [currentPick?.id, currentPick, players.length, userControlledTeams, paused]);

    // Handle user interaction to enable sounds
    useEffect(() => {
        // If user has not interacted yet, add event listeners to enable sounds
        const handleUserInteraction = () => {
            userInteractedRef.current = true;
            window.removeEventListener("click", handleUserInteraction);
            window.removeEventListener("keydown", handleUserInteraction);
        };
        window.addEventListener("click", handleUserInteraction);
        window.addEventListener("keydown", handleUserInteraction);

        return () => {
            window.removeEventListener("click", handleUserInteraction);
            window.removeEventListener("keydown", handleUserInteraction);
        };
    }, []);

    // Load draft data if not already loaded
    if (!draft) {
        return <div>Loading draft...</div>;
    }

    // Handle manual player selection
    const handleSelectPlayer = async (selectedPlayer) => {
        // Check if already selecting a player, if draft is paused, if there is no current pick, or if the current pick does not belong to a user-controlled team
        if (isSelecting) {
            return;
        } else if (paused) {
            alert("Draft is paused. Please resume before selecting a player.");
            return;
        } else if (!currentPick) {
            alert("No pick is currently on the clock.");
            return;
        } else if (!userControlledTeams.includes(currentPick.team.id)) {
            alert("You do not control this team.");
            return;
        }
        
        // Check if sounds are muted and if draft pick sound is available
        if (!soundsMuted && draftPickSoundRef.current) {
            draftPickSoundRef.current.pause();
            draftPickSoundRef.current.currentTime = 0;
            setTimeout(() => {
                draftPickSoundRef.current.play().catch(() => {});
            }, 50);
        }

        setIsSelecting(true);

        // Select player for current pick
        try {
            // Wait for player to be selected
            await axios.put(`${apiURL}/mock_draft_picks/${currentPick.id}`, {
                player_id: selectedPlayer.id
            });

            // Update current pick with selected player and remove player from big board
            const updatedPick = {...currentPick, player: selectedPlayer};
            setPicks(prevPicks => prevPicks.map(pick => pick.id === updatedPick.id ? updatedPick : pick));
            setPlayers(prevPlayers => prevPlayers.filter(player => player.id !== selectedPlayer.id));
        } catch (err) {
            console.error("Failed to select player: ", err);
            alert("An error occurred while selecting the player. Please try again.");
        }
        
        setIsSelecting(false);
    }

    // Handle player auto-selection
    const handleAutoSelectPlayer = async (pick) => {
        // Check if there is no current pick, the current pick has already been selected, or if auto-pick is already in progress
        if (!pick || pick.player) {
            autoPickInProgressRef.current = {id: null, active: false};
            return;
        } else if (autoPickInProgressRef.current.active && autoPickInProgressRef.current.id === pick.id) {
            return;
        }

        autoPickInProgressRef.current = {id: pick.id, active: true};

        // Retrieve current team's positional needs and calculate urgency
        const teamNeeds = {};
        if (pick.team) {
            Object.entries(pick.team).forEach(([position, urgency]) => {
                if (position !== "id" && position !== "name") {
                    teamNeeds[position.toLowerCase()] = 1 + urgency * 0.2;
                }
            });
        }

        // Check which positions have already been drafted by the current team
        const positionsDrafted = new Set(teamPicks.filter(pick => pick.player).map(pick => pick.player.position.toLowerCase()));
        
        // Gather top candidates from big board based on draft round
        const poolSize = pick.draft_pick.round >= 4 ? 40 : 20;
        const candidates = players.slice(0, poolSize);

        // Calculate adjusted scores for each candidate
        const scoredCandidates = candidates.map(player => {
            // Initialize position weight based on team needs
            let positionWeight = teamNeeds[player.position.toLowerCase()] || 1.0;

            // Handle special case for QB position
            if (player.position === "QB") {
                const qbNeed = teamNeeds["qb"] || 0;
                if (qbNeed >= 8) {
                    positionWeight *= 2;
                } else if (qbNeed <= 3) {
                    positionWeight *= 0.5;
                }
            }

            // Adjust position weight based on already drafted positions
            if (positionsDrafted.has(player.position.toLowerCase())) {
                positionWeight *= 0.35;
            }

            // Calculate adjusted score with randomness based on draft round
            const randomness = Math.random() * (pick.draft_pick.round >= 4 ? 0.1 : 0.03) + (pick.draft_pick.round >= 4 ? 0.9 : 0.97);
            const adjustedScore = player.rank * (1 / positionWeight) * randomness;

            // Return player with adjusted score
            return { ...player, adjustedScore };
        });

        // Sort candidates by adjusted score
        scoredCandidates.sort((a, b) => a.adjustedScore - b.adjustedScore);

        // Select random candidate
        const randomIndex = Math.floor(Math.random() * Math.min(5, scoredCandidates.length));
        const randomnessFactor = pick.draft_pick.round >= 4 ? 0.15 : 0.05;
        const selectedPlayer = Math.random() < randomnessFactor ? scoredCandidates[0] : scoredCandidates[randomIndex];

        if (selectedPlayer) {
            try {
                await axios.put(`${apiURL}/mock_draft_picks/${pick.id}`, {
                    player_id: selectedPlayer.id
                });

                const updatedPick = {...pick, player: selectedPlayer};
                setPicks(prevPicks => prevPicks.map(pick => (pick.id === updatedPick.id ? updatedPick : pick)));
                setPlayers(prevPlayers => prevPlayers.filter(player => player.id !== selectedPlayer.id));
            } catch (err) {
                console.error("Failed to auto-select player: ", err);
            } finally {
                autoPickInProgressRef.current = {id: null, active: false};
            }
        }
    };

    // Handle undo pick action
    const initiateUndoPick = () => {
        // Find the most recent completed pick
        const lastCompletedPickIndex = [...picks].reverse().findIndex(pick => pick.player);

        // Check if there are any completed picks
        if (lastCompletedPickIndex === -1) {
            alert("No picks have been made yet.");
            return;
        }

        // Set pick to undo based on last completed pick
        const indexToUndo = picks.length - 1 - lastCompletedPickIndex;
        setPickToUndo(picks[indexToUndo]);
        setShowConfirmUndoModal(true);
    };

    // Handle confirm undo pick action
    const confirmUndoPick = async () => {
        // Wait for user confirmation before proceeding with undo
        try {
            // Remove player for pick to undo
            await axios.put(`${apiURL}/mock_draft_picks/${pickToUndo.id}`, { player_id: null });

            // Add player back to the big board and update picks
            setPlayers(prev => [...prev, pickToUndo.player].sort((a, b) => a.rank - b.rank));
            setPicks(prev => prev.map(pick => pick.id === pickToUndo.id ? {...pick, player: null, player_id: null} : pick));
        } catch (err) {
            console.error("Failed to undo pick: ", err);
            alert("An error occurred while undoing the pick. Please try again.");
        } finally {
            setShowConfirmUndoModal(false);
            setPickToUndo(null);
        }
    };

    // Handle cancel undo pick action
    const cancelUndoPick = () => {
        setShowConfirmUndoModal(false);
        setPickToUndo(null);
    };

    // Display all possible trade partners
    // const getTradePartnerOptions = () => {
    //     return [...new Set(picks.map(pick => pick.team))].filter(team => team.id !== currentTeam.id).map(team => ({ value: team.id, label: team.name, team }));
    // };

    const getTradePartnerOptions = () => {
        const teamsById = {};
        picks.forEach(pick => {
            if (pick.team && pick.team.id != currentTeam.id) {
                teamsById[pick.team.id] = pick.team;
            }
        });
        return Object.values(teamsById).map(team => ({
            value: team.id,
            label: team.name,
            team,
        }));
    };

    // Handle trade partner selection
    const handleSelectTradePartner = (selectedOption) => {
        setTradePartner(selectedOption.team);
        setTradedPicks(prev => ({ ...prev, tradePartner: []}));
    };

    // Handle pick selection for trades
    const togglePickSelection = (teamSide, pickId) => {
        // Update traded picks for specified team
        setTradedPicks(prev => {
            const currentSelectedIds = prev[teamSide];
            const updated = {
                ...prev,
                [teamSide]: currentSelectedIds.includes(pickId) ? currentSelectedIds.filter(id => id !== pickId) : [...currentSelectedIds, pickId]
            };

            const picksDataFromIds = (pickIds) => picks.filter(pick => pickIds.includes(pick.id));

            // Update trade state for both teams
            const team1Picks = picksDataFromIds(updated.currentTeam);
            const team2Picks = picksDataFromIds(updated.tradePartner);

            // Evaluate trade if there are picks selected for both teams
            if (team1Picks.length > 0 || team2Picks.length > 0) {
                const evaluation = evaluateTrade(team1Picks, team2Picks, tradeValueChart);
                setTradeEvaluation(evaluation);
            } else {
                setTradeEvaluation(null);
            }

            return updated;
        });
    };

    // Evaluate trade based on selected picks and trade value chart
    const evaluateTrade = (team1Picks, team2Picks, tradeValueChart) => {
        // Calculate total trade value for each team's picks
        const yearChart = tradeValueChart[draft.year] || tradeValueChart[2025];
        const sumValues = picks => picks.reduce((sum, pick) => sum + (yearChart?.[pick.draft_pick.pick_number] || 0), 0);
        const team1Total = sumValues(team1Picks);
        const team2Total = sumValues(team2Picks);

        // Calculate difference and percentage difference
        const difference = Math.abs(team1Total - team2Total);
        const largerTotal = Math.max(team1Total, team2Total);
        const percentDifference = (difference / largerTotal) * 100;
        console.log("Team 1 Total:", team1Total, "Team 2 Total:", team2Total, "Difference:", difference, "Percent Difference:", percentDifference);
        // Determine trade verdict based on percentage difference
        let verdict;
        if (percentDifference <= 10) {
            verdict = "Fair";
        } else if (percentDifference <= 20) {
            verdict = "Acceptable";
        } else {
            verdict = "Lopsided";
        }

        return { team1Total, team2Total, difference, percentDifference, verdict };
    };

    // Handle trade submission
    const submitTrade = () => {
        // Check if picks are selected for both teams
        if (tradedPicks.currentTeam.length === 0 && tradedPicks.tradePartner.length === 0) {
            alert("Please select at least one pick from each team to trade.");
            return;
        }

        // Submit trade
        try {
            // Update picks for current team
            for (const pickId of tradedPicks.currentTeam) {
                axios.put(`${apiURL}/mock_draft_picks/${pickId}`, {
                    team_id: tradePartner.id
                });

                setPicks(prevPicks => prevPicks.map(pick => pick.id === pickId ? {...pick, team: tradePartner } : pick));
            }

            // Update picks for trade partner
            for (const pickId of tradedPicks.tradePartner) {
                axios.put(`${apiURL}/mock_draft_picks/${pickId}`, {
                    team_id: currentTeam.id
                });

                setPicks(prevPicks => prevPicks.map(pick => pick.id === pickId ? {...pick, team: currentTeam } : pick));
            }
        } catch (err) {
            console.error("Failed to submit trade: ", err);
            alert("An error occurred while submitting the trade. Please try again.");
        } finally {
            setShowTradeModal(false);
            setTradePartner(null);
            setTradedPicks({
                currentTeam: [],
                tradePartner: []
            });
            setTimeLeft(60);
            setPaused(false);
        }
    };

    // Handle restart draft confirmation
    const confirmRestartDraft = () => {
        // Reset draft picks to their original state
        setPicks(prev => prev.map(pick => ({...pick, player: null, player_id: null, team: pick.original_team, team_id: pick.original_team.id})));

        // Return all players to big board
        const fetchAllPlayers = async () => {
            try {
                const players_result = await axios.get(`${apiURL}/players/by_year/`, { params: { year: draft.year } });
                setPlayers(players_result.data.sort((a, b) => a.rank - b.rank));
            } catch (err) {
                console.error("Failed to fetch players:", err);
            }
        };

        fetchAllPlayers();
        setShowConfirmRestartModal(false);
    };

    // Styling for position filter dropdown
    const positionFilterStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused || state.menuIsOpen ? '#264653' : '#68CABE',
            borderColor: 'black',
            borderWidth: '2px',
            borderRadius: '8px',
            boxShadow:'4px 4px 0 black',
            minHeight: '36px',
            fontSize: '0.9rem',
            cursor: 'pointer',
            '&:hover': {
                backgroundColor: '#264653',
            },
        }), 
        menu: (base) => ({
            ...base,
            backgroundColor: '#264653',
            border: '2px solid black',
            borderRadius: '8px',
            boxShadow: '4px 4px 0 black',
            marginTop: '8px',
            zIndex: 10
        }), 
        menuList: (base) => ({
            ...base,
            borderRadius: '8px',
            paddingTop: 0,
            paddingBottom: 0,
        }),
        option: (base, state) => ({
            ...base,
            fontWeight: state.isSelected ? 700 : state.isFocused ? 500 : 400,
            backgroundColor: state.isSelected ? '#264643' : state.isFocused ? '#92AFAC' : 'white',
            color: state.isSelected ? 'white' : '#222',
            padding: '8px 12px',
            cursor: 'pointer'
        }),
        singleValue: (base, state) => ({
            ...base,
            color: state.isFocused || state.menuIsOpen ? 'white' : 'black',
            fontWeight: 700,
        }),
        dropdownIndicator: (base, state) => ({
            ...base,
            color: state.isFocused || state.menuIsOpen ? 'white' : 'black',
        }),
    };
    const positionFilterTheme = (theme) => ({
        ...theme,
        borderRadius: 8,
        colors: {
            ...theme.colors,
            primary: '#264643',
            primary25: '#92AFAC', // hover background
            neutral0: '#264653', // control background
            neutral20: 'black', // control border
            neutral80: '#EDF2F4', // control text
        },
    });


    // Render draft page
    return (
        <div className="draft_container">
            <header className="draft_header">
                <Link to="/" className="logo_link">
                    <img
                        src="/site/icon_logo.png"
                        alt="NFL Mock Draft Simulator logo"
                        className="draft_logo" 
                    />
                </Link>

                {currentPick && (
                    <div className={`pick_timer ${timeLeft <= 10 ? "urgent" : ""} ${isUserTurn ? "" : "cpu_turn"}`}>
                        <span>
                            {isUserTurn ? `${timeLeft}s` : "CPU"}
                        </span>
                    </div>
                )}
                
                <div className="draft_picks_wrapper">
                    <div className="draft_picks">
                        {picks.length === 0 ? (
                            <div className="picks_loading_message">
                                Loading picks
                                <span className="dot_animate"></span>
                            </div>
                        ) : (
                            picks.map((pick, index) => {
                                if (index === currentPickIndex) {
                                    return (
                                        <React.Fragment key={pick.id + "-with-header"}>
                                            <p ref={onTheClockRef} className="on_the_clock_header">
                                                On the
                                                <br />
                                                Clock
                                            </p>

                                            <div ref={el => pickRefs.current[pick.id] = el} className={`draft_pick on_the_clock`}>
                                                <div className="pick_team_logo_wrapper">
                                                    <img
                                                        src={`/logos/nfl/${pick.team.name.toLowerCase()}.png`}
                                                        alt={pick.team.name}
                                                        className="pick_team_logo"
                                                    />
                                                </div>

                                                <div className="pick_text_wrapper">
                                                    <div className="pick_team_name">
                                                        {pick.team.name}
                                                    </div>
                                                </div>

                                                <div className="pick_label">
                                                    {userControlledTeams.includes(pick.team.id) && !pick.player &&
                                                        (<small className="user_controlled_team_label">User</small>)
                                                    }

                                                    <small>
                                                        {pick.draft_pick.round}.{pick.draft_pick.pick_number}
                                                    </small>
                                                </div>
                                            </div>
                                        </React.Fragment>
                                    );
                                }

                                return (
                                    <div
                                        key={pick.id}
                                        ref={el => pickRefs.current[pick.id] = el}
                                        className={`draft_pick ${pick.player ? "picked" : "future"}`}
                                    >
                                        <div className="pick_team_logo_wrapper">
                                            <img
                                                src={`/logos/nfl/${pick.team.name.toLowerCase()}.png`}
                                                alt={pick.team.name}
                                                className="pick_team_logo"
                                            />
                                        </div>

                                        <div className="pick_text_wrapper">
                                            <div className={`pick_team_name ${pick.player ? 'picked' : ''}`}>
                                                {pick.team.name}
                                            </div>

                                            {pick.player && (
                                                <div className="pick_selected_player">{pick.player.name}</div>
                                            )}
                                        </div>

                                        <div className="pick_label">
                                            {userControlledTeams.includes(pick.team.id) && !pick.player &&
                                                (<small className="user_controlled_team_label">User</small>)
                                            }

                                            <small className="pick_badge">
                                                {pick.draft_pick.round}.{pick.draft_pick.pick_number}
                                            </small>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </header>

            <main className="draft_main">
                <aside className={`draft_tools ${toolsCollapsed ? "collapsed" : ""}`}>
                    <div
                        className="draft_tools_header"
                        onClick={() => {
                            if (isStacked) setToolsCollapsed(prev => !prev);
                        }}
                        style={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                        }}
                    >
                        <div></div>
                        <h2
                            style={{
                                margin: 0,
                            }}
                        >
                            Draft Tools
                        </h2>
                        <div>
                            <span className={`chevron ${toolsCollapsed ? "collapsed" : ""}`}>
                                {toolsCollapsed ? "▼" : "▲"}
                            </span>
                        </div>
                    </div>

                    <div>
                        {!toolsCollapsed && (
                            <>
                                <div className="draft_tools_buttons">
                                    <button className="draft_tool" onClick={initiateUndoPick}>
                                        Undo Pick
                                    </button>
                                    <button className="draft_tool" onClick={() => {
                                        setShowTradeModal(true);
                                        setPaused(true);
                                    }}>
                                        Trade Pick
                                    </button>
                                    <button className="draft_tool" onClick={() => setPaused(prev => !prev)}>
                                        {paused ? "Resume" : "Pause"} Draft
                                    </button>
                                    <button className="draft_tool" onClick={() => setShowConfirmRestartModal(true)}>
                                        Restart Draft
                                    </button>
                                </div>

                                {showConfirmUndoModal && (
                                    <div className="confirm_undo_modal">
                                        <div className="confirm_undo_modal_content">
                                            <p className="confirm_undo_modal_message">
                                                Undo pick {pickToUndo?.draft_pick.round}.{pickToUndo?.draft_pick.pick_number}?
                                            </p>
                                            <p className="confirm_undo_modal_pick">
                                                {pickToUndo?.player.name} selected by {pickToUndo?.team.name}
                                            </p>
                                            <div className="confirm_undo_modal_buttons">
                                                <button className="confirm_undo_modal_btn confirm" onClick={confirmUndoPick}>Yes</button>
                                                <button className="confirm_undo_modal_btn cancel" onClick={cancelUndoPick}>No</button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {showTradeModal && (
                                    <div className="trade_modal">
                                        <div className="trade_modal_content">
                                            <div className="trade_modal_header">
                                                <h2>Trade Picks</h2>
                                                <Select
                                                    className="trade_team_dropdown"
                                                    options={getTradePartnerOptions()}
                                                    onChange={handleSelectTradePartner}
                                                    placeholder="Select Trade Partner" 
                                                />
                                            </div>

                                            <div className="trade_columns">
                                                <div className="trade_team_column">
                                                    <div className="trade_team">
                                                        <div className="trade_team_logo_wrapper">
                                                            <img
                                                                src={`/logos/nfl/${currentTeam.name.toLowerCase()}.png`}
                                                                alt={currentTeam.name}
                                                                className="trade_team_logo"
                                                            />
                                                        </div>

                                                        <div className="trade_team_name">
                                                            {currentTeam.name}
                                                        </div>
                                                    </div>

                                                    <div className="trade_picks">
                                                        {teamPicks.filter(pick => !pick.player).map(pick => (
                                                            <button
                                                                key={pick.id}
                                                                className={`trade_pick_btn ${tradedPicks.currentTeam.includes(pick.id) ? "selected" : ""}`}
                                                                onClick={() => togglePickSelection("currentTeam", pick.id)}
                                                            >
                                                                {pick.draft_pick.round}.{pick.draft_pick.pick_number}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="trade_team_column">
                                                    {tradePartner && (
                                                        <>
                                                            <div className="trade_team">
                                                                <div className="trade_team_logo_wrapper">
                                                                    <img
                                                                        src={`/logos/nfl/${tradePartner.name.toLowerCase()}.png`}
                                                                        alt={tradePartner.name}
                                                                        className="trade_team_logo"
                                                                    />
                                                                </div>

                                                                <div className="trade_team_name">
                                                                    {tradePartner.name}
                                                                </div>
                                                            </div>

                                                            <div className="trade_picks">
                                                                {picks.filter(pick => pick.team.id === tradePartner.id && !pick.player).map(pick => (
                                                                    <button
                                                                        key={pick.id}
                                                                        className={`trade_pick_btn ${tradedPicks.tradePartner.includes(pick.id) ? "selected" : ""}`}
                                                                        onClick={() => togglePickSelection("tradePartner", pick.id)}
                                                                    >
                                                                        {pick.draft_pick.round}.{pick.draft_pick.pick_number}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {tradeEvaluation && (
                                                <div className="trade_evaluation">
                                                    <div
                                                        className={`trade_evaluation_bar ${tradeEvaluation.verdict.toLowerCase()}`}
                                                        style={{
                                                            transform: tradeEvaluation.verdict === "Fair" ? "translateX(0)" : tradeEvaluation.team1Total > tradeEvaluation.team2Total ? `translateX(${tradeEvaluation.percentDifference}%)` : `translateX(${-tradeEvaluation.percentDifference}%)`
                                                        }}
                                                        title={`Trade Verdict: ${tradeEvaluation.verdict}`}
                                                    >
                                                        {tradeEvaluation.verdict}
                                                    </div>
                                                </div>
                                            )}

                                            <div className="trade_modal_buttons">
                                                <button className="trade_modal_btn submit" onClick={submitTrade}>
                                                    Submit Trade
                                                </button>
                                                <button className="trade_modal_btn cancel" onClick={() => {
                                                    setShowTradeModal(false);
                                                    setPaused(false);
                                                }}>
                                                    Cancel Trade
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {showConfirmRestartModal && (
                                    <div className="confirm_restart_modal">
                                        <div className="confirm_restart_modal_content">
                                            <p className="confirm_restart_modal_message">
                                                Restart draft?
                                            </p>
                                            
                                            <div className="confirm_restart_modal_buttons">
                                                <button className="confirm_restart_modal_btn confirm" onClick={confirmRestartDraft}>
                                                    Yes
                                                </button>
                                                <button className="confirm_restart_modal_btn cancel" onClick={() => setShowConfirmRestartModal(false)}>
                                                    No
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="draft_details">
                                    <h3>
                                        Details
                                    </h3>
                                    <br />
                                    <p>
                                        <strong>Name</strong>
                                    </p>
                                    <p>
                                        {draft.name}
                                    </p>
                                    <br />
                                    <p>
                                        <strong>Year</strong>
                                    </p>
                                    <p>
                                        {draft.year}
                                    </p>
                                    <br />
                                    <p>
                                        <strong>Rounds</strong>
                                    </p>
                                    <p>
                                        {draft.num_rounds}
                                    </p>
                                    <br />

                                    <div className="auto_pick_speed_wrapper">
                                        <label className="auto_pick_speed_label">
                                            Pick Speed
                                        </label>
                                        <div className="auto_pick_speed_slider_container">
                                            <input
                                                className="auto_pick_speed_slider"
                                                type="range"
                                                min={200}
                                                max={5000}
                                                step={100}
                                                value={5200 - autoPickDelay}
                                                onChange={(e) => setAutoPickDelay(5200 - parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    <button
                                        className={`mute_btn_wrapper ${soundsMuted ? "muted" : "unmuted"}`}
                                        onClick={() => setSoundsMuted(prev => !prev)}
                                    >
                                        <img
                                            src={soundsMuted ? "/site/unmute.svg" : "/site/mute.svg"}
                                            alt={soundsMuted ? "Unmute" : "Mute"}
                                            className="mute_btn"
                                        />
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </aside>

                <section className="big_board">
                    <div className="big_board_header">
                        <div className="big_board_left">
                            <Select
                                className="position_filter"
                                classNamePrefix="select"
                                options={positionOptions}
                                value={positionFilter}
                                onChange={setPositionFilter}
                                isSearchable={false}
                                styles={positionFilterStyles} theme={positionFilterTheme}
                            />
                        </div>

                        <div className="big_board_center">
                            <h2>Big Board</h2>
                        </div>

                        <div className="big_board_right">
                            <div className="player_search_wrapper">
                                <input
                                    type="text"
                                    placeholder={isSearchFocused || isSearchHovered ? "Search players by name" : "Search"}
                                    className="player_search_input"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onFocus={() => setIsSearchFocused(true)}
                                    onBlur={() => setIsSearchFocused(false)}
                                    onMouseEnter={() => setIsSearchHovered(true)}
                                    onMouseLeave={() => setIsSearchHovered(false)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="players">
                        {filteredPlayers.length === 0 ? (
                            <div className="players_loading_message">
                                Loading players
                                <span className="dot_animate"></span>
                            </div>
                        ) : (
                            filteredPlayers.map(player => (
                                <div key={player.id} className="player">
                                    <div className="player_college_logo_wrapper">
                                        <img
                                            src={`/logos/college/${player.college.replaceAll(" ", "_")}.png`}
                                            alt={player.college}
                                            className="player_college_logo"
                                        />
                                    </div>

                                    <div className="player_details">
                                        <span className="player_name">
                                            {player.name}
                                        </span>
                                        <span className="player_background">
                                            {player.college}
                                        </span>
                                    </div>

                                    <div className="player_label">
                                        <small className="player_position">
                                            {player.position}
                                        </small>

                                        <small className="player_rank">
                                            {player.rank}
                                        </small>
                                    </div>

                                    <div className="select_player">
                                        <button
                                            className="select_player_btn"
                                            onClick={() => handleSelectPlayer(player)}
                                            disabled={isSelecting || !isUserTurn || timeLeft === 0}
                                        >
                                            Select
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <aside className="team_profile">
                    {currentTeam ? (
                        <div className="team">
                            <div className="team_profile_header">
                                <div className="team_profile_logo_wrapper">
                                    <img
                                        src={`/logos/nfl/${currentTeam.name.toLowerCase()}.png`}
                                        alt={currentTeam.name}
                                        className="team_profile_logo"
                                    />
                                </div>

                                <h2 className="team_name">
                                    {currentTeam.name}
                                </h2>
                            </div>

                            <div className="team_positional_needs_grid">
                                <h3 className="team_positional_needs_header">
                                    Positional Needs
                                    <span className="positional_needs_info_icon" tabIndex="0">
                                        ⓘ
                                        <span className="positional_needs_tooltip_text">
                                            Each position is scored from 1 (low need) to 10 (high need). Color-coded by urgency from dark green (1) to dark red (10), with lighter shades in between. Based on team-specific roster evaluations.
                                        </span>
                                    </span>
                                </h3>

                                <div className="positional_needs_row offensive_need">
                                    {teamPositionalNeeds.slice(0, 6).map(([position, value]) => (
                                        <div
                                            key={position}
                                            className="position_box"
                                            style={{ backgroundColor: getPositionUrgencyColor(value) }}
                                        >
                                            <span className="position_label">
                                                {position.toUpperCase()}
                                            </span>

                                            <span className="position_value">
                                                {value}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="positional_needs_row defensive_need">
                                    {teamPositionalNeeds.slice(6).map(([position, value]) => (
                                        <div
                                            key={position}
                                            className="position_box"
                                            style={{ backgroundColor: getPositionUrgencyColor(value) }}
                                        >
                                            <span className="position_label">
                                                {position.toUpperCase()}
                                            </span>

                                            <span className="position_value">
                                                {value}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="team_picks_list">
                                <h3 className="team_picks_list_header">
                                    Picks
                                </h3>
                                
                                <div className="team_picks">
                                    {teamPicks.map((pick, index) => (
                                        <div key={index} className={`team_pick ${pick.id === currentPick?.id ? "current_team_pick" : ""}`}>
                                            <span className="pick_info">
                                                {pick.draft_pick.round}.{pick.draft_pick.pick_number}
                                            </span>

                                            {pick.player ? (
                                                <span className="pick_player">
                                                    <strong>{pick.player.name}</strong>
                                                    <br /> {pick.player.position} - {pick.player.college}
                                                </span>
                                            ) : (
                                                <span className="pick_empty">
                                                    Not picked yet
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="team_picks_list_spacer"></div>
                        </div>
                    ) : (
                        <div className="team_loading_message">
                            Loading team
                            <span className="dot_animate"></span>
                        </div>
                    )}
                </aside>
            </main>
        </div>
    );
}

export default Draft;