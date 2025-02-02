import Header from './components/Header';
import TimezoneList from './components/TimezoneList';
import '@styles/_reset.css';
import '@styles/main.scss';

function App() {
  return (
    <div className="app">
      <Header />
      <div className="app-content">
        <TimezoneList />
      </div>
    </div>
  );
}

export default App;
