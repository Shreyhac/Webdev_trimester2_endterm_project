const searchInput = document.getElementById("search-input")
const searchButton = document.getElementById("search-button")
const genreSelect = document.getElementById("genre-select")
const movieList = document.getElementById("movie-list")

const tmdbApiKey = "810a85b73a9cb28fa74f2b5af994044b"
const omdbApiKey = "32c728c2"
const youtubeApiKey = "AIzaSyDMuugb0DVBoqN6eLpXQHayR5wxNg-prSY"

async function fetchMovies(query = "", genre = "") {
  let url
  if (query) {
    url = `https://api.themoviedb.org/3/search/movie?api_key=${tmdbApiKey}&query=${query}`
  } else if (genre) {
    url = `https://api.themoviedb.org/3/discover/movie?api_key=${tmdbApiKey}&with_genres=${genre}`
  } else {
    url = `https://api.themoviedb.org/3/movie/popular?api_key=${tmdbApiKey}`
  }

  try {
    const response = await fetch(url)
    const data = await response.json()
    displayMovies(data.results)
  } catch (error) {
    console.error("Error fetching movies:", error)
  }
}

async function fetchOMDBDetails(movieTitle) {
  const url = `http://www.omdbapi.com/?apikey=${omdbApiKey}&t=${encodeURIComponent(movieTitle)}`
  try {
    const response = await fetch(url)
    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching OMDB details:", error)
    return null
  }
}

async function fetchYouTubeTrailer(movieTitle) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(movieTitle + " trailer")}&key=${youtubeApiKey}`
  try {
    const response = await fetch(url)
    const data = await response.json()
    if (data.items && data.items.length > 0) {
      return data.items[0].id.videoId
    }
    return null
  } catch (error) {
    console.error("Error fetching YouTube trailer:", error)
    return null
  }
}

async function fetchStreamingAvailability(movieTitle) {
  const streamingServices = ["Netflix", "Amazon Prime", "Disney+", "Hulu", "HBO Max", "Apple TV+"]
  return streamingServices[Math.floor(Math.random() * streamingServices.length)]
}

async function displayMovies(movies) {
  movieList.innerHTML = ""
  for (const movie of movies) {
    const movieCard = document.createElement("div")
    movieCard.classList.add("movie-card")

    let poster
    if (movie.poster_path) {
      poster = `https://image.tmdb.org/t/p/w500${movie.poster_path}`
    } else {
      poster = "https://via.placeholder.com/500x750?text=No+Poster"
    }

    const omdbDetails = await fetchOMDBDetails(movie.title)
    const youtubeTrailerId = await fetchYouTubeTrailer(movie.title)
    const streamingService = await fetchStreamingAvailability(movie.title)

    movieCard.innerHTML = `
      <img src="${poster}" alt="${movie.title}">
      <h3>${movie.title}</h3>
      <p>Release Date: ${movie.release_date}</p>
      <button class="details-button" data-movie-id="${movie.id}">More Details</button>
      <div class="movie-details" style="display: none;">
        <p><strong>IMDB Rating:</strong> ${omdbDetails?.imdbRating || "N/A"}</p>
        <p><strong>Runtime:</strong> ${omdbDetails?.Runtime || "N/A"}</p>
        <p><strong>Director:</strong> ${omdbDetails?.Director || "N/A"}</p>
        <p><strong>Cast:</strong> ${omdbDetails?.Actors || "N/A"}</p>
        <p><strong>Plot:</strong> ${omdbDetails?.Plot || "N/A"}</p>
        <p><strong>Genre:</strong> ${omdbDetails?.Genre || "N/A"}</p>
        <p><strong>Awards:</strong> ${omdbDetails?.Awards || "N/A"}</p>
        <p><strong>Available on:</strong> ${streamingService}</p>
        ${youtubeTrailerId ? `<iframe width="100%" height="200" src="https://www.youtube.com/embed/${youtubeTrailerId}" frameborder="0" allowfullscreen></iframe>` : ""}
      </div>
    `

    movieList.appendChild(movieCard)
  }

  document.querySelectorAll(".details-button").forEach((button) => {
    button.addEventListener("click", () => {
      const movieCard = button.closest(".movie-card")
      const movieDetails = movieCard.querySelector(".movie-details")
      const allMovieCards = document.querySelectorAll(".movie-card")


      allMovieCards.forEach((card) => {
        if (card !== movieCard) {
          card.classList.remove("expanded")
          card.querySelector(".movie-details").style.display = "none"
          card.querySelector(".details-button").textContent = "More Details"
        }
      })


      if (movieDetails.style.display === "none") {
        movieDetails.style.display = "block"
        movieCard.classList.add("expanded")
        button.textContent = "Less Details"
      } else {
        movieDetails.style.display = "none"
        movieCard.classList.remove("expanded")
        button.textContent = "More Details"
      }
    })
  })
}

searchButton.addEventListener("click", () => {
  const query = searchInput.value.trim()
  const genre = genreSelect.value
  if (query || genre) {
    fetchMovies(query, genre)
  }
})

fetchMovies()

