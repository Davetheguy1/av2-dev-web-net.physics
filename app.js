const API_KEY = "3f197a5e6c35af045a738731078dbe50";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const grid = document.querySelector("#movie-grid");
const status = document.querySelector("#status");
const page = document.body.dataset.page;

const demoMovies = [
  { id: 550, title: "Clube da Luta", release_date: "1999-10-15", poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", overview: "Um trabalhador insone e um fabricante de sabonetes formam um clube de luta clandestino." },
  { id: 680, title: "Pulp Fiction", release_date: "1994-09-10", poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", overview: "As vidas de dois assassinos, um boxeador, um gângster e sua esposa se entrelaçam." },
  { id: 13, title: "Forrest Gump", release_date: "1994-06-23", poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", overview: "Um homem com baixo QI conquista grandes feitos ao longo da vida." },
  { id: 155, title: "Batman: O Cavaleiro das Trevas", release_date: "2008-07-16", poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", overview: "Batman enfrenta um criminoso conhecido como Coringa, que mergulha Gotham no caos." },
  { id: 603, title: "Matrix", release_date: "1999-03-30", poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg", overview: "Um programador descobre que a realidade pode ser uma simulação." },
  { id: 238, title: "O Poderoso Chefão", release_date: "1972-03-14", poster_path: "/3bhkrj58Vtu7enYsRolD1fZdja1.jpg", overview: "O patriarca de uma dinastia do crime transfere o controle para seu filho." },
  { id: 157336, title: "Interestelar", release_date: "2014-11-05", poster_path: "/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg", overview: "Exploradores viajam através de um buraco de minhoca em busca de um novo lar." },
  { id: 489, title: "O Bom, o Mau e o Feio", release_date: "1966-12-23", poster_path: "/bX2xnavhMYjWDoZp1VM6VnU1xwe.jpg", overview: "Três pistoleiros procuram um tesouro enterrado durante a Guerra Civil." },
  { id: 497, title: "À Espera de um Milagre", release_date: "1999-12-10", poster_path: "/velWPhVMQeQKcxggNEU8YmIo52R.jpg", overview: "Um agente penitenciário conhece um prisioneiro com um dom extraordinário." },
  { id: 27205, title: "A Origem", release_date: "2010-07-15", poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg", overview: "Um especialista em invasão de sonhos recebe uma missão impossível." },
  { id: 11, title: "Guerra nas Estrelas, Uma nova esperança", release_date: "1977-05-25", poster_path: "/6FfCtAuVAW8XJjZ7eWeLibRLWTw.jpg", overview: "Um jovem fazendeiro se junta à resistência contra um império galáctico." },
  { id: 1891, title: "O Império Contra-Ataca", release_date: "1980-05-17", poster_path: "/nNAeTmF4CtdSgMDplXTDPOpYzsX.jpg", overview: "A resistência enfrenta novas ameaças enquanto a guerra se intensifica." }
];

function year(date) { 
  return date ? date.slice(0, 4) : "—" ; 
}

function posterUrl(path) { 
  return path ? IMAGE_URL + path : "" ; 
}

function updateRentalCount() { 
  document.querySelectorAll(".rental-count").forEach((counter) => 
    { counter.textContent = JSON.parse(localStorage.getItem("rentals") || "[]").length; }
  ); 
}

function renderMovies(movies) {
  if (!grid) 
    return;

  grid.innerHTML = movies.length ? movies.map((movie) => 
    `<article class="movie-card"><a href="movie.html?id=${movie.id}"><img class="poster" 
       src="${posterUrl(movie.poster_path)}" alt="Pôster de ${movie.title}"><h3>${movie.title}</h3>
        <span class="meta">${year(movie.release_date)} · 4 formatos disponíveis</span></a></article>`).join("") : "<p class='empty'>Nenhum filme encontrado para essa busca.</p>";
}

async function requestMovies(search = "", releaseBefore = null) {
  
  if (API_KEY === "YOUR_TMDB_API_KEY") {
    const query = search.toLocaleLowerCase();

    let movies = query ? demoMovies.filter((movie) => `${movie.title} ${movie.overview}`.toLocaleLowerCase().includes(query)) : demoMovies;
    
    if (!query && releaseBefore) movies = movies.filter((movie) => Number(movie.release_date.slice(0, 4)) < releaseBefore);
    return movies;

  }
  
  const endpoint = search ? "search/movie" : releaseBefore ? "discover/movie" : "movie/popular";
  const filters = search ? `&query=${encodeURIComponent(search)}` : releaseBefore ? `&sort_by=popularity.desc&primary_release_date.lte=${releaseBefore - 1}-12-31` : "";
  const url = `https://api.themoviedb.org/3/${endpoint}?api_key=${API_KEY}&language=pt-BR${filters}`;
  const response = await fetch(url);

  if (!response.ok) 
    throw new Error("Falha na resposta da TMDB");
  
  const data = await response.json();

  return data.results || [];
}

async function loadCatalog(limit = null, releaseBefore = null) {
  
  if (!grid) 
    return;

  if (status) 
    status.textContent = "Carregando o catálogo...";
  
  try {
    const movies = await requestMovies(document.querySelector("#search-input")?.value.trim() || "", releaseBefore);

    renderMovies(limit ? movies.slice(0, limit) : movies);

    if (status) 
     status.textContent = `${movies.length} 
     filmes disponíveis.`;

  } catch (error) {
    renderMovies([]);

    if (status) 
      status.textContent = "Não foi possível carregar a TMDB. Verifique sua chave e a conexão.";
  }

}

async function loadMoviePage() {
  const container = document.querySelector("#movie-detail");
  const id = new URLSearchParams(window.location.search).get("id");

  if (!container || !id) 
    return;
  
  
  let movie;

  try {

    if (API_KEY === "YOUR_TMDB_API_KEY") 
      movie = demoMovies.find((item) => String(item.id) === String(id));
    else {
      const response = await fetch(`https://api.themoviedb.org/3/movie/${id}?api_key=${API_KEY}&language=pt-BR`);
      movie = await response.json();
    }

    if (!movie || movie.success === false) 
      throw new Error("Filme não encontrado");

    container.innerHTML = `<div class="detail"><img src="${posterUrl(movie.poster_path)}" alt="Pôster de ${movie.title}
    "><div class="detail-copy"><p class="eyebrow">${year(movie.release_date)} · Catálogo TMDB</p><h1>${movie.title}</h1>
     <p>${movie.overview || "Sinopse indisponível."}</p><form class="rental-form"><label for="format">Formato</label><select id="format">
      <option>VHS</option><option>Betamax</option><option>LaserDisc</option><option>HD-DVD</option></select><label for="start">Data de início</label><input id="start" type="date" required>
      <label for="finish">Data de devolução</label><input id="finish" type="date" required><button>Alugar este filme</button></form></div></div>`;
    
    container.querySelector(".rental-form").addEventListener("submit", (event) => {
      event.preventDefault();
      const rentals = JSON.parse(localStorage.getItem("rentals") || "[]");

      rentals.push({ title: movie.title, format: container.querySelector("#format").value, 
        start: container.querySelector("#start").value, finish: container.querySelector("#finish").value });
      
      localStorage.setItem("rentals", JSON.stringify(rentals));
      window.location.href = "rentals.html";
    });
  } catch (error) { 
    container.innerHTML = "<p class='empty'>Não foi possível carregar este filme.</p>"; 
  }
}

function renderRentals() {
  const list = document.querySelector("#rentals-list");

  if (!list) 
    return;

  const rentals = JSON.parse(localStorage.getItem("rentals") || "[]");

  list.innerHTML = rentals.length ? rentals.map((rental) => `<div class="rental-item"><strong>${rental.title}</strong><span>${rental.format} · 
   ${rental.start} → ${rental.finish}</span></div>`).join("") : 
    "<p class='empty'>Sua estante está vazia. Encontre um filme no catálogo e alugue-o.</p>";
}

if (page === "home") loadCatalog(4);

if (page === "catalog") {
  loadCatalog(null, 2006);
  document.querySelector("#search-form").addEventListener("submit", (event) => 
    { event.preventDefault(); loadCatalog(); });
}

if (page === "movie") loadMoviePage();

if (page === "rentals") renderRentals();

updateRentalCount();
