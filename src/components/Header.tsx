import { useState } from 'react';
import '@styles/Header.scss';
import Searchbar from '../components/Searchbar';

const Header = () => {
  const [showSearch, setShowSearch] = useState(false);
  const toggleSearch = () => {
    setShowSearch(!showSearch);
  };

  return (
    <header className="header">
      <div className="header-inner">
        <div className="header-logo"></div>
        <div className="header-btns">
          <button
            className="header-btn header-btn__plus"
            onClick={toggleSearch}></button>
          <button className="header-btn "></button>
          <button className="header-btn header-btn__theme"></button>
        </div>
      </div>
      {showSearch && <Searchbar />}
    </header>
  );
};

export default Header;
