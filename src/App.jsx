import { useEffect, useState } from 'react';
import { useDebounce } from 'react-use';

import { getTrendingGames, updateSearchCount } from './Appwrite';
import logo from './assets/logo.svg';
import GameCard from './components/GameCard';
import Search from './components/Search';
import Spinner from './components/Spinner';

const API_BASE_URL = 'https://api.rawg.io/api';
const API_KEY = import.meta.env.VITE_RAWG_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
  }
};

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  
  const [gamesList, setGamesList] = useState([]);
  const [trendingGames, setTrendingGames] = useState([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useDebounce(() =>  setDebouncedSearchTerm(searchTerm) , 500, [searchTerm]);
  
  const fetchGames = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');

    try{
      const currentYear = new Date().getFullYear();
      const endpoint = query
        ? `${API_BASE_URL}/games?search=${encodeURIComponent(query)}&key=${API_KEY}`
        : `${API_BASE_URL}/games?dates=${currentYear}-01-01,${currentYear}-12-31&ordering=-rating&key=${API_KEY}`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error(`Failed to fetch games`);
      }

      const data = await response.json();

      if(data.Response === 'False') {
        setErrorMessage(data.Error || `Failed to fetch games`);
        setGamesList([]);
        return;
      }

      setGamesList(data.results || []);
      
      if (query && data.results.length > 0) {
        await updateSearchCount(query, data.results[0]);
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      setErrorMessage('Failed to fetch games. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }

  const fetchTrendingGames = async () => {
    try {
      const games = await getTrendingGames();

      setTrendingGames(games);
    } catch (error) {
      console.error(`Error fetching trending games: ${error}`);
    }
  }

  useEffect(() => {
    fetchGames(debouncedSearchTerm);
  },[debouncedSearchTerm]);

  useEffect(() => {
    fetchTrendingGames();
  }, []);

  return (
    <main>
        <div className='pattern' />

        <div className='wrapper'>
            <img src={logo} alt='logo' className='logo' />
            <header>
                <h1>Find Your Next Favorite <span className='text-gradient'>Games</span></h1>

                <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            </header>

            { trendingGames.length > 0 && (
              <section className='trending-games'>
                <h2>Trending Games</h2>

                <ul>
                  {trendingGames.map((game, index) => (
                    <li key={game.$id}>
                      <p>{index + 1}</p>
                      <img src={game.poster_url} alt={game.name} />
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className='all-games'>
              <h2>All Games</h2>

              {isLoading ? (
                <Spinner />
              ) : errorMessage ? (
                <p className='text-red-500'>{errorMessage}</p>
              ) : (
                <ul>
                  {gamesList.map((game) => (
                    <GameCard key={game.id} game={game} />
                  ))}
                </ul>
              )}
            </section>
        </div>
    </main>
  )
}

export default App;