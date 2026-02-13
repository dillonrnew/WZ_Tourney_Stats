import { Link } from "react-router-dom";
import TournamentCard from "../../components/TournamentCard";
import "../../styles/Left Bar Pages/TournamentsTab.css";

function Home() {
  const majorTournaments = [
    {
      id: 1,
      name: "Pullze Check Ladder",
      image: "https://pbs.twimg.com/media/G-fRVqZXAAAOBHA?format=jpg&name=large",
    },
  ];

  const majorTournamentItems = {
    1: [
      { id: 1, title: "Qualifiers", to: "/tournament/1/qualifiers" },
      { id: 2, title: "Group Stages", to: "/tournament/1/GroupStages" },
      { id: 3, title: "Finals", to: "/tournament/1/finals" },
    ],
  };

  const scrims = [
    { id: 1, title: "Reapzr Scrim", time: "Febuary 5th", status: "Completed" },
    { id: 2, title: "LFAO vs WZPD", time: "4 hours ago", status: "Completed" },
    { id: 3, title: "T1 vs NINJAS IN PYJAMAS", time: "6 hours ago", status: "Completed" },
    { id: 4, title: "#ON vs GENTLE MATES", time: "8 hours ago", status: "Completed" },
    { id: 5, title: "SVGE ESPORTS vs ESC", time: "10 hours ago", status: "Completed" },
    { id: 6, title: "TEAM BAKA vs TEAM ZEBRA", time: "12 hours ago", status: "Completed" },
  ];

  return (
    <div className="home">
      {/* MAJOR TOURNAMENTS */}
      <section className="home-section">
        <div className="home-section__header">
          <h1 className="home-section__title">Major Tournaments</h1>
          <p className="home-section__subtitle">
            Big events with full pages (Qualifiers → Group Stages → Finals)
          </p>
        </div>

        <div className="home-grid">
          {majorTournaments.map((tournament) => (
            <TournamentCard
              key={tournament.id}
              tournament={tournament}
              items={majorTournamentItems[tournament.id] || []}
              cardTo={`/tournament/${tournament.id}`}
            />
          ))}
        </div>
      </section>

      {/* SCRIMS */}
      <section className="home-section">
        <div className="home-section__header home-section__header--row">
          <div className="header-center">
            <h2 className="home-section__title">Scrims</h2>
            <p className="home-section__subtitle">
              Quick matches and recent activity
            </p>
          </div>

          <Link className="home-link" to="/scrims">
            View all
          </Link>
        </div>

        <div className="scrims-grid">
          {scrims.map((scrim) => (
            <div key={scrim.id} className="scrim-card">
              <div className="scrim-card__top">
                <p className="scrim-card__title">{scrim.title}</p>
                <span className="scrim-card__badge">{scrim.status}</span>
              </div>
              <div className="scrim-card__meta">
                <span className="scrim-card__time">{scrim.time}</span>
                <Link
                  to={`/tournament/${scrim.id}`}
                  className="scrim-card__btn"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default Home;
