import { Link } from "react-router-dom";

function TournamentCard({ tournament, items = [] }) {
  const imageStyle = tournament.imageFit
    ? { objectFit: tournament.imageFit }
    : undefined;

  return (
    <div className="t-card">
      <div className="t-card__header">
        <div className="t-card__titleWrap">
          <h3 className="t-card__title">{tournament.name}</h3>
        </div>
        <div className="t-card__imgWrap">
          <img
            className="t-card__img"
            src={tournament.image}
            alt={tournament.name}
            style={imageStyle}
          />
          <div className="t-card__imgOverlay" aria-hidden="true" />
        </div>
      </div>

      {/* Items under the card */}
      <div className="t-card__items">
        {items.length === 0 ? (
          <p className="t-card__empty">No sections yet</p>
        ) : (
          items.map((item) => (
            <div key={item.id} className="t-card__item">
              {item.to ? (
                <Link to={item.to} className="t-card__itemLink">
                  <span className="t-card__itemTitle">{item.title}</span>
                  <span className="t-card__itemArrow">→</span>
                </Link>
              ) : (
                <div className="t-card__itemRow">
                  <span className="t-card__itemTitle">{item.title}</span>
                  {item.time ? <span className="t-card__itemTime">{item.time}</span> : null}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TournamentCard;
