const searchInput = document.getElementById('search-input');
const searchButton = document.getElementById('search-button');
const genreSelect = document.getElementById('genre-select');
const movieList = document.getElementById('movie-list');

const tmdbApiKey = '810a85b73a9cb28fa74f2b5af994044b';
const omdbApiKey = '32c728c2';
const youtubeApiKey = 'AIzaSyBL9rTqWu3Xcw6GeqGNyoV6ZwfMXFS3Jvs';

async function fetchMovies(query = '', genre = '') {
  let url;
  if (query) {
    url = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${query}`;
  } else if (genre) {
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&with_genres=${genre}`;
  } else {
    url = `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}`;
  }

  try {
    const response = await fetch(url);
    const data = await response.json();
    displayMovies(data.results);
  } catch (error) {
    console.error('Error fetching movies:', error);
  }
}

async function fetchOMDBDetails(movieTitle) {
  const url = `http://www.omdbapi.com/?apikey=${omdbApiKey}&t=${encodeURIComponent(movieTitle)}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching OMDB details:', error);
    return null;
  }
}

async function fetchYouTubeTrailer(movieTitle) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(movieTitle + ' trailer')}&key=${youtubeApiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.items && data.items.length > 0) {
      return data.items[0].id.videoId;
    }
    return null;
  } catch (error) {
    console.error('Error fetching YouTube trailer:', error);
    return null;
  }
}

async function fetchStreamingAvailability(movieTitle) {
  const streamingServices = ['Netflix', 'Amazon Prime', 'Disney+', 'Hulu'];
  return streamingServices[Math.floor(Math.random() * streamingServices.length)];
}

async function displayMovies(movies) {
  movieList.innerHTML = '';
  for (const movie of movies) {
    const movieCard = document.createElement('div');
    movieCard.classList.add('movie-card');

    let poster;
    if (movie.poster_path) {
      poster = `https://image.tmdb.org/t/p/w200${movie.poster_path}`;
    } else {
      poster = 'https://via.placeholder.com/200x300?text=No+Poster';
    }

    const omdbDetails = await fetchOMDBDetails(movie.title);
    const youtubeTrailerId = await fetchYouTubeTrailer(movie.title);
    const streamingService = await fetchStreamingAvailability(movie.title);

    let imdbRating = '';
    let plot = '';
    let trailer = '';

    if (omdbDetails) {
      imdbRating = `<p>IMDB Rating: ${omdbDetails.imdbRating}</p>`;
      plot = `<p>Plot: ${omdbDetails.Plot}</p>`;
    }

    if (youtubeTrailerId) {
      trailer = `<iframe width="200" height="150" src="https://www.youtube.com/embed/${youtubeTrailerId}" frameborder="0" allowfullscreen></iframe>`;
    }

    movieCard.innerHTML = `
      <img src="${poster}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <p>${movie.release_date}</p>
      ${imdbRating}
      ${plot}
      ${trailer}
      <button class="details-button" data-movie-id="${movie.id}">More Details</button>
    `;

    movieList.appendChild(movieCard);
  }

  document.querySelectorAll('.details-button').forEach(button => {
    button.addEventListener('click', async () => {
      const movieId = button.getAttribute('data-movie-id');
      const movieDetails = await fetchMovieDetails(movieId);
      showMovieDetails(movieDetails);
    });
  });
}

async function fetchMovieDetails(movieId) {
  const url = `https://api.themoviedb.org/3/movie/${movieId}?api_key=${tmdbApiKey}`;
  try {
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
}

function showMovieDetails(movie) {
  const modal = document.createElement('div');
  modal.classList.add('modal');

  modal.innerHTML = `
    <div class="modal-content">
      <span class="close-button">&times;</span>
      <h2>${movie.title}</h2>
      <p><strong>Release Date:</strong> ${movie.release_date}</p>
      <p><strong>Runtime:</strong> ${movie.runtime} minutes</p>
      <p><strong>Overview:</strong> ${movie.overview}</p>
      <p><strong>Rating:</strong> ${movie.vote_average}/10 (${movie.vote_count} votes)</p>
      <p><strong>Genres:</strong> ${movie.genres.map(genre => genre.name).join(', ')}</p>
      <p><strong>Watch on:</strong> ${fetchStreamingAvailability(movie.title)}</p>
    </div>
  `;

  modal.querySelector('.close-button').addEventListener('click', () => {
    modal.remove();
  });

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });

  document.body.appendChild(modal);
}

searchButton.addEventListener('click', () => {
  const query = searchInput.value.trim();
  const genre = genreSelect.value;
  if (query || genre) {
    fetchMovies(query, genre);
  }
});

fetchMovies();