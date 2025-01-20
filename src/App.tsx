import Header from './components/Header';
import Timezone from './components/Timezone';
import '@styles/_reset.css';
import '@styles/main.scss';

function App() {
  return (
    <div className="app">
      <Header />
      <div className="app-content">
        <Timezone />
      </div>
    </div>
  );
}

export default App;
