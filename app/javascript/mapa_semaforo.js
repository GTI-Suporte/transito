const SUBTIPO_CONFIG = {
  "Analógico": {
    color: "#0ea5e9",
    icon: "fa-wave-square"
  },

  "Digital": {
    color: "#8b5cf6",
    icon: "fa-microchip"
  },

  "Adaptativo": {
    color: "#f59e0b",
    icon: "fa-arrows-to-circle"
  },

  "": {
    color: "#10b981",
    icon: "fa-traffic-light"
  }
};

let map = null;
let markerCluster = null;
let allMarkers = [];
let trafficData = [];

function initMap() {
  map = L.map("map", {
    zoomControl: false,
    attributionControl: true
  }).setView([-8.05, -34.9], 9);

  /*
   * Mantenha aqui a mesma chave CARTO que você já está usando.
   * Não compartilhe a chave publicamente.
   */
  const CARTO_API_KEY = "SUA_CHAVE_ATUAL_AQUI";

  L.tileLayer(
    `https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_4d1n_1_5bb6f5807e5909740feda6f7`,
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        '&copy; <a href="https://carto.com/attribution/">CARTO</a>',

      maxZoom: 20,

      /*
       * No zoom 20, reutiliza os tiles do 19 e amplia.
       * Evita perder o desenho das ruas ao chegar no limite.
       */
      maxNativeZoom: 19,

      detectRetina: true
    }
  ).addTo(map);

  L.control.zoom({
    position: "bottomright"
  }).addTo(map);

  markerCluster = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 40,
    disableClusteringAtZoom: 16
  });

  map.addLayer(markerCluster);
}

async function loadData() {
  const list =
    document.getElementById("results-list");

  try {
    const response =
      await fetch("/api/equipamentos", {
        headers: {
          Accept: "application/json"
        }
      });

    if (!response.ok) {
      throw new Error(
        `Falha ao carregar equipamentos: ${response.status}`
      );
    }

    const data =
      await response.json();

    trafficData = data
      .filter(
        (item) =>
          item.type === "Rede Semafórica"
      )
      .filter(
        (item) =>
          item.lat !== null &&
          item.lng !== null
      )
      .map((item) => ({
        id: String(item.id),
        address: item.address ?? "",
        lat: Number(item.lat),
        lng: Number(item.lng),
        type: item.type ?? "",
        subtipo: item.subtipo_semaforo ?? ""
      }));

    renderStats();
    renderPoints(trafficData);
    renderList(trafficData);

  } catch (error) {
    console.error(error);

    list.innerHTML =
      '<div class="loading">Não foi possível carregar os semáforos.</div>';
  }
}

function renderStats() {
  const total =
    trafficData.length;

  const analogico =
    trafficData.filter(
      (item) =>
        item.subtipo === "Analógico"
    ).length;

  const digital =
    trafficData.filter(
      (item) =>
        item.subtipo === "Digital"
    ).length;

  const adaptativo =
    trafficData.filter(
      (item) =>
        item.subtipo === "Adaptativo"
    ).length;

  document.getElementById(
    "semaforo-count"
  ).innerText = total;

  document.getElementById(
    "analogico-count"
  ).innerText = analogico;

  document.getElementById(
    "digital-count"
  ).innerText = digital;

  document.getElementById(
    "adaptativo-count"
  ).innerText = adaptativo;

  document.getElementById(
    "semaforo-filter-count"
  ).innerText = total;

  document.getElementById(
    "analogico-filter-count"
  ).innerText = analogico;

  document.getElementById(
    "digital-filter-count"
  ).innerText = digital;

  document.getElementById(
    "adaptativo-filter-count"
  ).innerText = adaptativo;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function renderPoints(data) {
  markerCluster.clearLayers();
  allMarkers = [];

  data.forEach((item) => {
    const conf =
      SUBTIPO_CONFIG[item.subtipo] ||
      SUBTIPO_CONFIG[""];

    const icon =
      L.divIcon({
        html: `
          <div style="
            background: ${conf.color};
            width: 30px;
            height: 30px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            border: 2px solid white;
            box-shadow: 0 4px 8px rgba(0,0,0,0.25);
            font-size: 13px;
          ">
            <i class="fas ${conf.icon}"></i>
          </div>
        `,

        className:
          "custom-div-icon",

        iconSize: [30, 30],

        iconAnchor: [15, 15],

        popupAnchor: [0, -15]
      });

    const marker =
      L.marker(
        [item.lat, item.lng],
        { icon }
      );

    const safeId =
      escapeHtml(item.id);

    const safeAddress =
      escapeHtml(item.address);

    const classificacao =
      item.subtipo ||
      "Ainda não classificada";

    const safeClassificacao =
      escapeHtml(classificacao);

    const popupContent = `
      <div
        class="popup-header"
        style="background: ${conf.color}">

        <i class="fas ${conf.icon}"></i>

        Semáforo ${safeClassificacao}
      </div>

      <div class="popup-body">

        <p>
          <strong>ID do Equipamento:</strong>
          ${safeId}
        </p>

        <p>
          <strong>Endereço:</strong><br>
          ${safeAddress}
        </p>

        <p>
          <strong>Coordenadas:</strong>
          ${Number(item.lat).toFixed(5)},
          ${Number(item.lng).toFixed(5)}
        </p>

        <p>
          <strong>Classificação:</strong>
          ${safeClassificacao}
        </p>

        <button
          class="popup-btn"
          onclick="window.open(
            'https://www.google.com/maps?q=${item.lat},${item.lng}',
            '_blank'
          )">

          <i class="fas fa-arrow-up-right-from-square"></i>
          Abrir no Google Maps
        </button>

      </div>
    `;

    marker.bindPopup(
      popupContent,
      {
        maxWidth: 300
      }
    );

    marker.itemData =
      item;

    markerCluster.addLayer(
      marker
    );

    allMarkers.push(marker);
  });

  if (data.length > 0) {
    const group =
      new L.featureGroup(
        allMarkers
      );

    map.fitBounds(
      group.getBounds().pad(0.1)
    );
  }
}

function renderList(data) {
  const list =
    document.getElementById(
      "results-list"
    );

  const countLabel =
    document.getElementById(
      "results-count"
    );

  list.innerHTML = "";

  countLabel.innerText =
    `${data.length} itens`;

  if (data.length === 0) {
    list.innerHTML =
      '<div class="loading">Nenhum semáforo encontrado.</div>';

    return;
  }

  data
    .slice(0, 100)
    .forEach((item) => {

      const conf =
        SUBTIPO_CONFIG[item.subtipo] ||
        SUBTIPO_CONFIG[""];

      const nomeTipo =
        item.subtipo ||
        "Sem classificação";

      const card =
        document.createElement(
          "div"
        );

      card.className =
        "result-card";

      card.innerHTML = `
        <div class="result-card-header">

          <h4>
            ${escapeHtml(item.id)}
          </h4>

          <span
            class="type-tag"
            style="
              background: ${conf.color}15;
              color: ${conf.color};
            ">

            <i class="fas ${conf.icon}"></i>

            ${escapeHtml(nomeTipo)}

          </span>

        </div>

        <p>
          ${escapeHtml(item.address)}
        </p>
      `;

      card.onclick = () => {

        const marker =
          allMarkers.find(
            (marker) =>
              marker.itemData.id ===
              item.id
          );

        if (marker) {
          map.setView(
            [
              item.lat,
              item.lng
            ],
            17
          );

          setTimeout(
            () =>
              marker.openPopup(),
            200
          );
        }
      };

      list.appendChild(
        card
      );
    });

  if (data.length > 100) {
    const more =
      document.createElement(
        "p"
      );

    more.style =
      "text-align:center;font-size:.72rem;padding:8px;color:var(--text-muted);";

    more.innerText =
      `Exibindo 100 de ${data.length} resultados...`;

    list.appendChild(
      more
    );
  }
}

function filterData() {
  const semaforoAtivo =
    document.getElementById(
      "filter-semaforo"
    ).checked;

  const searchTerm =
    document
      .getElementById(
        "search-input"
      )
      .value
      .toLowerCase()
      .trim();

  const subtiposAtivos =
    Array.from(
      document.querySelectorAll(
        ".filter-subtipo:checked"
      )
    ).map(
      (checkbox) =>
        checkbox.dataset.subtipo
    );

  const todosSubtiposAtivos =
    subtiposAtivos.length === 3;

  const filtered =
    trafficData.filter(
      (item) => {

        if (!semaforoAtivo) {
          return false;
        }

        /*
         * Quando os três subtipos estão marcados,
         * mostramos todos os semáforos, inclusive
         * os ainda não classificados.
         *
         * Quando somente alguns estão marcados,
         * mostramos apenas os classificados nesses tipos.
         */
        const matchesSubtype =
          todosSubtiposAtivos
            ? true
            : subtiposAtivos.includes(
                item.subtipo
              );

        const matchesSearch =
          !searchTerm ||
          item.address
            .toLowerCase()
            .includes(
              searchTerm
            ) ||
          item.id
            .toLowerCase()
            .includes(
              searchTerm
            );

        return (
          matchesSubtype &&
          matchesSearch
        );
      }
    );

  renderPoints(
    filtered
  );

  renderList(
    filtered
  );
}

function setupInfoButtons() {
  document
    .querySelectorAll(
      ".info-button"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          (event) => {

            event.stopPropagation();

            document
              .querySelectorAll(
                ".info-balloon"
              )
              .forEach(
                (balloon) =>
                  balloon.remove()
              );

            const balloon =
              document.createElement(
                "div"
              );

            balloon.className =
              "info-balloon";

            balloon.innerHTML = `
              <strong>
                Informação
              </strong>

              <p>
                ${escapeHtml(
                  button.dataset.info
                )}
              </p>
            `;

            button
              .closest(
                ".filter-subitem"
              )
              .appendChild(
                balloon
              );
          }
        );
      }
    );
}

document.addEventListener(
  "click",
  (event) => {

    if (
      !event.target.closest(
        ".info-button"
      ) &&
      !event.target.closest(
        ".info-balloon"
      )
    ) {

      document
        .querySelectorAll(
          ".info-balloon"
        )
        .forEach(
          (balloon) =>
            balloon.remove()
        );
    }
  }
);

function setupFilters() {
  const mainFilter =
    document.getElementById(
      "filter-semaforo"
    );

  const subtypeFilters =
    document.querySelectorAll(
      ".filter-subtipo"
    );

  mainFilter.addEventListener(
    "change",
    () => {

      subtypeFilters.forEach(
        (checkbox) => {
          checkbox.checked =
            mainFilter.checked;
        }
      );

      filterData();
    }
  );

  subtypeFilters.forEach(
    (checkbox) => {

      checkbox.addEventListener(
        "change",
        () => {

          const algumAtivo =
            Array.from(
              subtypeFilters
            ).some(
              (item) =>
                item.checked
            );

          mainFilter.checked =
            algumAtivo;

          filterData();
        }
      );
    }
  );
}

function bootMapaSemaforo() {
  const mapElement =
    document.getElementById(
      "map"
    );

  if (
    !mapElement ||
    mapElement.dataset.initialized ===
      "true"
  ) {
    return;
  }

  mapElement.dataset.initialized =
    "true";

  const searchInput =
    document.getElementById(
      "search-input"
    );

  if (searchInput) {
    searchInput.addEventListener(
      "input",
      filterData
    );
  }

  setupFilters();

  setupInfoButtons();

  initMap();

  loadData();
}

document.addEventListener(
  "DOMContentLoaded",
  bootMapaSemaforo,
  { once: true }
);

document.addEventListener(
  "turbo:load",
  bootMapaSemaforo
);

document.addEventListener(
  "turbo:before-cache",
  () => {

    if (map) {
      map.remove();
      map = null;
    }

    markerCluster = null;

    allMarkers = [];

    trafficData = [];

    const mapElement =
      document.getElementById(
        "map"
      );

    if (mapElement) {
      delete mapElement.dataset.initialized;
    }
  }
);