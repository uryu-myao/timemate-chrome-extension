import '../styles/_reset.css';
import '../styles/Timezone.scss';

const Timezone = () => {
  return (
    <div className="timezone">
      <div className="timezone-inner">
        <p className="timezone__meridiem">AM</p>
        <div className="timezone__location">Tokyo</div>
        <div className="timezone__time">4:28</div>
        <div className="timezone-footer">
          <p>
            <span className="timezone__tz">jst</span>
            <span className="timezone__offset">utc+9</span>
          </p>
          <p>
            <span className="timezone__week">mon</span>
            <span>
              <span className="timezone__date">30</span>
              <span className="timezone__month">jul</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Timezone;
