"""
Runs basic mock draft simulation in terminal by prompting user for draft settings, teams, and player selections.
"""


# Import necessary libraries
import requests
from backend.database import SessionLocal
from backend.apps import schemas


def prompt_user_for_draft_settings() -> list[int, str, int]:
    """
    Prompts user for mock draft settings including draft name, year, and number of rounds.

    Returns:
        list[int, str, int]: list containing the mock draft ID, name, number of rounds, and year
    """

    # Prompt user for mock draft name, defaulting to "Mock Draft" if not provided
    draft_name = input("Enter a name for your mock draft (press Enter to use default): ")
    if draft_name == "":
        draft_name = "Mock Draft"

    # Prompt user for eligible draft year
    years = [2025, 2026, 2027]
    while True:
        try:
            year = int(input("Enter year: "))
            if year in years:
                break
            else:
                print(f"Please enter an eligible year: {years}")
        except ValueError:
            print("Invalid input. Please enter a number.")
    
    # Prompt user for number of rounds
    while True:
        try:
            num_rounds = int(input("Enter number of rounds (1-7): "))
            if 1 <= num_rounds <= 7:
                break
            else:
                print("Please enter a number between 1 and 7.")
        except ValueError:
            print("Invalid input. Please enter a number.")
    
    # Create mock draft settings and send to backend
    draft_settings = schemas.MockDraftCreate(name=draft_name, num_rounds=num_rounds, year=year)
    response = requests.post("http://localhost:8000/mock_drafts", json=draft_settings.model_dump())
    if response.status_code != 200:
        print("Failed to create mock draft: ", response.text)
        return
    draft_settings = response.json()

    # Extract mock draft id, name, number of rounds, and year
    mock_draft_id, mock_draft_name, num_rounds, year = draft_settings["id"], draft_settings["name"], draft_settings["num_rounds"], draft_settings["year"]
    
    # Return mock draft settings
    return [mock_draft_id, mock_draft_name, num_rounds, year]


def prompt_user_for_teams(mock_draft_id: int) -> list[dict, list[int]]:
    """
    Prompts user to select teams to control in the mock draft.

    Parameters:
        mock_draft_id (int): ID of the mock draft
    
    Returns:
        list[dict, list[int]]: list containing teams and chosen team IDs
    """

    # Fetch teams from backend
    response = requests.get("http://localhost:8000/teams/")
    teams = response.json()

    # Display teams and prompt user for team selection
    print("Select teams to control:")
    for team in teams:
        print(f"{team['id']}: {team['name']}")
    
    # Prompt user for team IDs
    while True:
        try:
            chosen_ids = input("Enter team ID (or 0 for all teams): ")
            print(chosen_ids)
            if len(chosen_ids) == 1 and int(chosen_ids) == 0:
                chosen_ids = [i for i in range(1, 33)]
            else:
                chosen_ids = [int(id.strip()) for id in chosen_ids.split(",") if 1 <= id.strip().isdigit() <= 32]
            break
        except ValueError:
            print("invalid input. Please enter only numeric IDs.")
    
    # Create user controlled teams and send to backend
    for chosen_id in chosen_ids:
        user_controlled_team = schemas.UserControlledTeamCreate(mock_draft_id=mock_draft_id, team_id=chosen_id)
        response = requests.post("http://localhost:8000/user_controlled_teams", json=user_controlled_team.model_dump())
        if response.status_code != 200:
            print("Failed to create user controlled team: ", response.text)
            return
    
    # Return teams and chosen team IDs
    return [teams, chosen_ids]


def get_draft_picks(mock_draft_id: int, num_rounds: int):
    """
    Fetches draft picks for the specified number of rounds and creates mock draft picks in the backend.

    Parameters:
        mock_draft_id (int): ID of the mock draft
        num_rounds (int): number of rounds in the draft
    """


    # Fetch draft picks for the specified number of rounds
    response = requests.get("http://localhost:8000/draft_picks/by_rounds/", params={"num_rounds": num_rounds})
    draft_picks = response.json()

    # Create mock draft picks and send to backend
    for draft_pick in draft_picks:
        draft_pick_id = draft_pick["id"]
        current_team_id = draft_pick["current_team_id"]
        mock_draft_pick = schemas.MockDraftPickCreate(mock_draft_id=mock_draft_id, team_id=current_team_id, draft_pick_id= draft_pick_id)
        response = requests.post("http://localhost:8000/mock_draft_picks", json=mock_draft_pick.model_dump())
        if response.status_code != 200:
            print("Failed to create mock draft pick: ", response.text)
            return


def prompt_user_for_player(players: list[dict], team: str):
    """
    Prompts user to select a player from the best available players list.

    Parameters:
        players (list[dict]): list of available players with their details
        team (str): name of the team for which the player is being selected
    """

    # Display the 10 best players available
    print("\nBEST PLAYERS AVAILABLE\n----------------------")
    for player in players[:10]:
        print(f"{player['rank']}. {player['name']}, {player['position']}, {player['college']}")

    # Prompt user for player name
    while True:
        name = input(f"\nEnter a player name for {team}: ").strip()
        for player in players:
            if player.get("name") == name:
                return player
        print("Name not found. Please try again.")


def run_mock_draft_simulation(mock_draft_id: int, year: int):
    """
    Runs mock draft simulation by fetching draft picks, user-controlled teams, and allowing user to select players.

    Parameters:
        mock_draft_id (int): ID of the mock draft
        year (int): year of the draft
    """

    # Fetch mock draft picks for the specified mock draft ID and sort them by ID
    response = requests.get("http://localhost:8000/mock_draft_picks/" + str(mock_draft_id))
    draft_picks = sorted(response.json(), key=lambda x: x["id"])
    
    # Fetch user-controlled teams for the specified mock draft ID
    response = requests.get("http://localhost:8000/user_controlled_teams/" + str(mock_draft_id))
    user_controlled_teams = response.json()
    user_team_ids = [team["team_id"] for team in user_controlled_teams]
    
    # Fetch players available for the specified year
    response = requests.get("http://localhost:8000/players/by_year/", params={"year": year})
    players = response.json()
    
    # Loop through draft picks and let user select player if they control that team
    for pick in draft_picks:
        # Retrieve team ID for the current pick
        team_id = pick["team_id"]

        # Check if the user controls the team that owns the current pick
        if team_id in user_team_ids:
            # If user controls the team, prompt them to select a player
            selected_player = prompt_user_for_player(players, pick["team"]["name"])
        else:
            # If user does not control the team, let CPU select the first player on the best available list
            selected_player = players[0]
        
        # Update the pick with the selected player
        pick["player"] = selected_player
        pick_update = schemas.MockDraftPickUpdate(player_id=selected_player["id"])
        response = requests.put("http://localhost:8000/mock_draft_picks/" + str(pick["id"]), json=pick_update.model_dump())
        if response.status_code != 200:
            print("Failed to make draft pick: ", response.text)

        # Print the pick details
        print(f"With the No. {pick['draft_pick']['pick_number']} pick in the {year} NFL Draft, the {pick['team']['name']} select {pick['player']['name']}.")

        # Remove the selected player from the available players list
        players.remove(selected_player)

    return


def run_mock_draft():
    """
    Main function to run the mock draft simulation.
    """

    # Prompt user for draft settings and teams to control, fetch draft picks, and run the mock draft simulation
    mock_draft_id, mock_draft_name, num_rounds, year = prompt_user_for_draft_settings()
    teams, chosen_team_ids = prompt_user_for_teams(mock_draft_id)
    get_draft_picks(mock_draft_id, num_rounds)
    run_mock_draft_simulation(mock_draft_id, year)


if __name__ == "__main__":
    run_mock_draft()