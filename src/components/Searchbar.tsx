import '../styles/Searchbar.scss';

const Searchbar = () => {
  return (
    <div className="header-searchbar">
      <input
        className="header-searchbar__input"
        type="text"
        placeholder="Search..."
      />
    </div>
  );
};

export default Searchbar;
