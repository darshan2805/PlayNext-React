import React from 'react';
import star from '../assets/star.svg';
const GameCard = ({game :
  {name, rating, background_image, released, genres}
}) => {
  return (
    <div className='game-card'>
      <img src={background_image ? background_image : '/no-poster.png'} alt={name} className='game-card-img' />
      <div className='mt-4'>
        <h3>{name}</h3>
        <div className='content'>
          <div className='rating'>
            <img src={star} alt='rating' />
            <p>{rating ? rating.toFixed(1) : 'N/A'}</p>
          </div>
          <span>•</span>
          <p className='genres'>
            {genres && genres.length > 0 ? genres[0].name : 'N/A'}
          </p>
          <span>•</span>
          <p className='year'>{released ? released.split('-')[0] : 'N/A'}</p>
        </div>
      </div>
    </div>
  )
}

export default GameCard