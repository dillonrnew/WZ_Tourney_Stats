import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import TournamentCard from "../../components/TournamentCard";
import { fetchRows } from "../../lib/supabaseRest";
import "../../styles/Left Bar Pages/TournamentsTab.css";

function Home() {
  const formatTourneyDate = (value) => {
    if (!value) return "Date TBD";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return String(value);
    return parsed.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const categories = [
    {
      id: "major",
      label: "Major Tournaments",
      subtitle: "Large Competitive events with top teams",
    },
    {
      id: "scrims",
      label: "Scrims",
      subtitle: "Competitive Scrims between top teams",
    },
    {
      id: "fun",
      label: "FUN Tournaments",
      subtitle: "Community events with FUN formats",
    },
  ];

  const [selectedCategories, setSelectedCategories] = useState(["major"]);
  const [scrims, setScrims] = useState([]);
  const [isLoadingScrims, setIsLoadingScrims] = useState(true);
  const [scrimsError, setScrimsError] = useState("");

  const majorTournaments = [
    {
      id: "820d3233-098e-45b4-a59c-67a03021df41",
      name: "Pullze Check Ladder Season 1",
      image: "https://pbs.twimg.com/profile_banners/1621275827051560960/1757431756/1500x500",
    },
    {
      id: "db57b67e-95ca-4c39-ae16-b7da5460d1b7",
      name: "Pullze Check Ladder Season 2",
      image: "/PCL_HEADER.png",
      imageFit: "fill",
    },
  ];

  const majorTournamentItems = {
    "820d3233-098e-45b4-a59c-67a03021df41": [
      { id: 1, title: "Qualifiers", to: "/tournament/820d3233-098e-45b4-a59c-67a03021df41/qualifiers" },
      { id: 2, title: "Group Stages", to: "/tournament/820d3233-098e-45b4-a59c-67a03021df41/GroupStages" },
      { id: 3, title: "Finals", to: "/tournament/820d3233-098e-45b4-a59c-67a03021df41/finals" },
    ],
    "db57b67e-95ca-4c39-ae16-b7da5460d1b7": [
      { id: 1, title: "Qualifiers", to: "/pcl-season-2/db57b67e-95ca-4c39-ae16-b7da5460d1b7/qualifiers" },
      { id: 2, title: "Group Stages", to: "/pcl-season-2/db57b67e-95ca-4c39-ae16-b7da5460d1b7/GroupStages" },
      { id: 3, title: "Finals", to: "/pcl-season-2/db57b67e-95ca-4c39-ae16-b7da5460d1b7/finals" },
    ],
  };

  const funTournies = [
    { id: 1, title: "Duo Chaos Cup", time: "March 2nd", status: "Upcoming" },
    { id: 2, title: "No Scope Night", time: "March 9th", status: "Upcoming" },
    { id: 3, title: "Meme Loadout Cup", time: "March 16th", status: "Upcoming" },
  ];

  useEffect(() => {
    let isMounted = true;

    const loadScrims = async () => {
      setIsLoadingScrims(true);
      setScrimsError("");

      try {
        const rows = await fetchRows("tournaments", {
          select: 'id,"Name","Tournament Type","Tournament Host","Format",tourney_date',
          filters: { '"Tournament Type"': "Scrim" },
          order: { column: "tourney_date", ascending: false },
        });

        if (!isMounted) {
          return;
        }

        const scrimRows = Array.isArray(rows)
          ? rows.filter((row) => String(row?.["Tournament Type"] || "").toLowerCase() === "scrim")
          : [];

        setScrims(
          scrimRows.map((row) => ({
            id: row.id,
            title: row.Name || "Unnamed Scrim",
            time: row["Tournament Host"] || row.Format || "No details",
            date: formatTourneyDate(row.tourney_date),
            status: "Scrim",
          }))
        );
      } catch (error) {
        if (isMounted) {
          setScrimsError(error.message || "Failed to load scrims.");
          setScrims([]);
        }
      } finally {
        if (isMounted) {
          setIsLoadingScrims(false);
        }
      }
    };

    loadScrims();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  return (
    <div className="home">
      <section className="home-section">
        <h1 className="tournaments-page-title">Tournaments</h1>

        <div className="tournaments-tabs" aria-label="Tournament categories">
          {categories.map((category) => {
            const isActive = selectedCategories.includes(category.id);

            return (
              <button
                key={category.id}
                type="button"
                aria-pressed={isActive}
                className={`tournaments-tab tournaments-tab--${category.id} ${isActive ? "tournaments-tab--active" : ""}`}
                onClick={() => handleCategoryToggle(category.id)}
              >
                <span className="tournaments-tab__title">{category.label}</span>
                <span className="tournaments-tab__subtitle">{category.subtitle}</span>
              </button>
            );
          })}
        </div>

        {selectedCategories.length > 0 ? (
          <div className="category-cards-grid">
            {selectedCategories.includes("major") &&
              majorTournaments.map((tournament) => (
                <div
                  key={`major-${tournament.id}`}
                  className="category-card category-card--major"
                >
                  <TournamentCard
                    tournament={tournament}
                    items={majorTournamentItems[tournament.id] || []}
                  />
                </div>
              ))}

            {selectedCategories.includes("scrims") && isLoadingScrims ? (
              <div className="category-card category-card--scrims">
                <div className="scrim-card">
                  <p className="scrim-card__title">Loading scrims...</p>
                </div>
              </div>
            ) : null}

            {selectedCategories.includes("scrims") && !isLoadingScrims && scrimsError ? (
              <div className="category-card category-card--scrims">
                <div className="scrim-card">
                  <p className="scrim-card__title">Unable to load scrims</p>
                  <div className="scrim-card__meta">
                    <span className="scrim-card__time">{scrimsError}</span>
                  </div>
                </div>
              </div>
            ) : null}

            {selectedCategories.includes("scrims") &&
              !isLoadingScrims &&
              !scrimsError &&
              scrims.length === 0 ? (
                <div className="category-card category-card--scrims">
                  <div className="scrim-card">
                    <p className="scrim-card__title">No scrims found</p>
                  </div>
                </div>
              ) : null}

            {selectedCategories.includes("scrims") &&
              !isLoadingScrims &&
              !scrimsError &&
              scrims.map((scrim) => (
                <div key={`scrim-${scrim.id}`} className="category-card category-card--scrims">
                  <div className="scrim-card">
                    <div className="scrim-card__top">
                      <p className="scrim-card__title">{scrim.title}</p>
                      <span className="scrim-card__badge">{scrim.status}</span>
                    </div>
                    <div className="scrim-card__meta">
                      <div className="scrim-card__metaText">
                        <span className="scrim-card__time">{scrim.time}</span>
                        <span className="scrim-card__date">{scrim.date}</span>
                      </div>
                      <Link to={`/tournament/${scrim.id}`} className="scrim-card__btn">
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}

            {selectedCategories.includes("fun") &&
              funTournies.map((tourny) => (
                <div key={`fun-${tourny.id}`} className="category-card category-card--fun">
                  <div className="scrim-card">
                    <div className="scrim-card__top">
                      <p className="scrim-card__title">{tourny.title}</p>
                      <span className="scrim-card__badge">{tourny.status}</span>
                    </div>
                    <div className="scrim-card__meta">
                      <span className="scrim-card__time">{tourny.time}</span>
                      <Link to="/tournaments" className="scrim-card__btn">
                        View
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="category-empty">
            Select one or more categories above to view tournaments.
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;
