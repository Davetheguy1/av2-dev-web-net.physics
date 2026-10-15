const API_KEY = "3f197a5e6c35af045a738731078dbe50";
const IMAGE_URL = "https://image.tmdb.org/t/p/w500";
const grid = document.querySelector("#movie-grid");
const status = document.querySelector("#status");
const dialog = document.querySelector("#movie-dialog");

const demoMovies = [
  { id: 550, title: "Clube da Luta", release_date: "1999-10-15", poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg", overview: "Um trabalhador insone e um fabricante de sabonetes formam um clube de luta clandestino." },
  { id: 680, title: "Pulp Fiction", release_date: "1994-09-10", poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg", overview: "As vidas de dois assassinos, um boxeador, um gângster e sua esposa se entrelaçam." },
  { id: 13, title: "Forrest Gump", release_date: "1994-06-23", poster_path: "/arw2vcBveWOVZr6pxd9XTd1TdQa.jpg", overview: "Um homem com baixo QI conquista grandes feitos ao longo da vida." },
  { id: 155, title: "Batman: O Cavaleiro das Trevas", release_date: "2008-07-16", poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", overview: "Batman enfrenta um criminoso conhecido como Coringa, que mergulha Gotham no caos." }
];

function year(data) { return data ? data.slice(0, 4) : "—"; }

function renderMovies(movies) {
  grid.innerHTML = movies.map((movie) => `
    <article class="movie-card" data-id="${movie.id}">
      <img class="poster" src="${IMAGE_URL + movie.poster_path}" alt="Pôster de ${movie.title}">
      <h3>${movie.title}</h3>
      <span class="meta">${year(movie.release_date)} · 4 formatos disponíveis</span>
    </article>
  `).join("");
  document.querySelectorAll(".movie-card").forEach((card) => { card.onclick = () => openMovie(card.dataset.id); });
}

async function loadCatalog() {
  status.textContent = "Carregando o catálogo...";
  if (API_KEY === "3f197a5e6c35af045a738731078dbe50") {
    renderMovies(demoMovies);
    status.textContent = "Catálogo de demonstração · adicione sua chave TMDB em app.js para usar dados reais.";
    return;
  }
  const search = document.querySelector("#search-input").value;
  const url = search ? "https://api.themoviedb.org/3/search/movie?api_key=" + API_KEY + "&query=" + encodeURIComponent(search) : "https://api.themoviedb.org/3/movie/popular?api_key=" + API_KEY;
  const data = await fetch(url).then((response) => response.json());
  renderMovies(data.results);
  status.textContent = data.total_results + " filmes encontrados";
}

function openMovie(id) {
  const movie = demoMovies.find((item) => item.id == id);
  document.querySelector("#movie-detail").innerHTML = `
    <div class="detail">
      <img src="${IMAGE_URL + movie.poster_path}" alt="Pôster de ${movie.title}">
      <div class="detail-copy">
        <p class="eyebrow">${year(movie.release_date)} · Catálogo TMDB</p>
        <h2>${movie.title}</h2><p>${movie.overview}</p>
        <form class="rental-form">
          <label for="format">Formato</label><select id="format"><option>VHS</option><option>Betamax</option><option>LaserDisc</option><option>HD-DVD</option></select>
          <label for="start">Data de início</label><input id="start" type="date" required>
          <label for="finish">Data de devolução</label><input id="finish" type="date" required>
          <button>Alugar este filme</button>
        </form>
      </div>
    </div>`;
  dialog.showModal();
  document.querySelector(".rental-form").onsubmit = (event) => {
    event.preventDefault();
    const rentals = JSON.parse(localStorage.rentals || "[]");
    rentals.push({ title: movie.title, format: document.querySelector("#format").value, start: document.querySelector("#start").value, finish: document.querySelector("#finish").value });
    localStorage.rentals = JSON.stringify(rentals);
    dialog.close(); showRentals();
  };
}

function showRentals() {
  const rentals = JSON.parse(localStorage.rentals || "[]");
  document.querySelector("#rental-count").textContent = rentals.length;
  document.querySelector("#rentals-list").innerHTML = rentals.length ? rentals.map((rental) => `<div class="rental-item"><strong>${rental.title}</strong><span>${rental.format} · ${rental.start} → ${rental.finish}</span></div>`).join("") : "<p class='empty'>Sua estante está vazia. Encontre um filme e alugue-o.</p>";
}

document.querySelector("#search-form").onsubmit = (event) => { event.preventDefault(); loadCatalog(); };
document.querySelector(".close").onclick = () => dialog.close();
loadCatalog();
showRentals();
