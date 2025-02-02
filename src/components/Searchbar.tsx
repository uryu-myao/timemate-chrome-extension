import '@styles/Searchbar.scss';

const Searchbar = () => {
  return (
    <>
      <div className="header-searchbar">
        <input
          className="header-searchbar__input"
          type="text"
          placeholder="Search..."
        />
      </div>
      <p className="timezone-subtext">
        For city time reference only. Not for precise timekeeping.
      </p>
    </>
  );
};

export default Searchbar;
