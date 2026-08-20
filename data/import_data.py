"""
Imports data from CSV files into database.
"""

import argparse
import csv
import os

from backend.apps.models import Team, Player, DraftPick
from backend.database import SessionLocal


def import_year_data(year: int) -> None:
    """Import players, teams, and draft picks for the provided year."""
    data_folder = os.path.join(os.path.dirname(__file__), str(year))
    if not os.path.isdir(data_folder):
        raise FileNotFoundError(f"No data folder found for year {year} at {data_folder}")

    session = SessionLocal()
    try:
        with open(os.path.join(data_folder, "players.csv"), newline="") as file:
            reader = csv.DictReader(file)
            for row in reader:
                player = Player(
                    name=row["Name"],
                    position=row["Position"],
                    college=row["College"],
                    rank=row["Rank"],
                    year=year,
                )
                session.add(player)

        with open(os.path.join(data_folder, "teams.csv"), newline="") as file:
            reader = csv.DictReader(file)
            for row in reader:
                team_year = int(row.get("Year", year)) if row.get("Year") else year
                team = Team(
                    name=row["Name"],
                    qb=row["QB"],
                    rb=row["RB"],
                    wr=row["WR"],
                    te=row["TE"],
                    ot=row["OT"],
                    iol=row["IOL"],
                    de=row["DE"],
                    dt=row["DT"],
                    lb=row["LB"],
                    cb=row["CB"],
                    s=row["S"],
                    year=team_year,
                )
                session.add(team)

        session.commit()

        with open(os.path.join(data_folder, "draft_picks.csv"), newline="") as file:
            reader = csv.DictReader(file)
            for row in reader:
                pick_year = int(row.get("Year", year)) if row.get("Year") else year
                current_team = session.query(Team).filter(
                    Team.name == row["Current Team"],
                    Team.year == pick_year,
                ).first()
                original_team = session.query(Team).filter(
                    Team.name == row["Original Team"],
                    Team.year == pick_year,
                ).first()

                draft_pick = DraftPick(
                    round=int(row["Round"]),
                    pick_number=int(row["Pick Number"]),
                    current_team_id=current_team.id if current_team else None,
                    original_team_id=original_team.id if original_team else None,
                    year=pick_year,
                )
                session.add(draft_pick)

        session.commit()
        print(f"{year} data imported successfully.")
    finally:
        session.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Import draft data for a specific year")
    parser.add_argument("--year", type=int, default=2026, help="Draft year to import")
    args = parser.parse_args()

    import_year_data(args.year)
