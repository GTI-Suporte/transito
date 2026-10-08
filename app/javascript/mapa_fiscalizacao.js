const config = {
  "Lombada Eletrônica": {
    color: "#3b82f6",
    icon: "fa-gauge-high",
    label: "Lombada Eletrônica",
    info: "Equipamento utilizado para controle e fiscalização eletrônica da velocidade dos veículos."
  },

  "Equipamento Misto": {
    color: "#f59e0b",
    icon: "fa-video",
    label: "Semáforo com Fiscalização Integrada",
    info: "Semáforo equipado com câmera de fiscalização integrada, capaz de registrar avanço de sinal e parada sobre a faixa."
  },

  "Câmera Dome": {
    color: "#ef4444",
    icon: "fa-camera",
    label: "Vídeo Monitoramento",
    info: "Câmera utilizada para monitoramento visual do trânsito e apoio à fiscalização."
  }
};

function normalizeSearch(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function debounce(fn, delay = 100) {
  let timer = null;

  return (...args) => {
    clearTimeout(timer);

    timer = setTimeout(() => {
      fn(...args);
    }, delay);
  };
}

let map = null;
let markerCluster = null;
let allMarkers = [];
let trafficData = [];

function initMap() {
  map = L.map("map", {
    zoomControl: false,
    attributionControl: true
  }).setView([-8.05, -34.9], 9);

  L.tileLayer(
    "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_2o0n_1_c5818ab1a5c032068d0bbee4",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
        '&copy; <a href="https://carto.com/attribution/">CARTO</a>',

      maxZoom: 20,
      maxNativeZoom: 20,
      detectRetina: false,
      keepBuffer: 3
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
          item.type !== "Rede Semafórica"
      )
      .filter(
        (item) =>
          item.lat !== null &&
          item.lng !== null
      )
      .map((item) => {
        const type =
          item.type ?? "";

        const address =
          item.address ?? "";

        const label =
          config[type]?.label ?? type;

        return {
          id: String(item.id),
          address,
          lat: Number(item.lat),
          lng: Number(item.lng),
          type,
          label,
          searchText: normalizeSearch(
            `${item.id} ${address} ${type} ${label}`
          )
        };
      });

    renderStats();
    renderFilters();
    renderPoints(trafficData);
    renderList(trafficData);

  } catch (error) {
    console.error(error);

    list.innerHTML =
      '<div class="loading">Não foi possível carregar os equipamentos.</div>';
  }
}

function renderStats() {
  document.getElementById(
    "total-count"
  ).innerText =
    trafficData.length;

  document.getElementById(
    "lombada-count"
  ).innerText =
    trafficData.filter(
      (item) =>
        item.type ===
        "Lombada Eletrônica"
    ).length;

  document.getElementById(
    "misto-count"
  ).innerText =
    trafficData.filter(
      (item) =>
        item.type ===
        "Equipamento Misto"
    ).length;

  document.getElementById(
    "dome-count"
  ).innerText =
    trafficData.filter(
      (item) =>
        item.type ===
        "Câmera Dome"
    ).length;
}

function renderFilters() {
  const container =
    document.getElementById(
      "category-filters"
    );

  container.innerHTML = "";

  Object.keys(config).forEach(
    (type) => {
      const meta =
        config[type];

      const count =
        trafficData.filter(
          (item) =>
            item.type === type
        ).length;

      const div =
        document.createElement(
          "div"
        );

      div.className =
        "filter-item has-count";

      div.innerHTML = `
        <label>
          <input
            type="checkbox"
            checked
            value="${escapeHtml(type)}"
          >

          <span
            class="filter-badge"
            style="background: ${meta.color}">
          </span>

          <span>
            ${escapeHtml(meta.label)}
          </span>
        </label>

        <div class="filter-actions">

          <span class="filter-count">
            ${count}
          </span>

          <button
            type="button"
            class="info-button"
            data-info="${escapeHtml(meta.info)}"
            aria-label="Informações sobre ${escapeHtml(meta.label)}">
            i
          </button>

        </div>
      `;

      div
        .querySelector("input")
        .addEventListener(
          "change",
          filterData
        );

      container.appendChild(div);
    }
  );

  setupInfoButtons();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function setupInfoButtons() {
  document
    .querySelectorAll(
      "#category-filters .info-button"
    )
    .forEach(
      (button) => {
        if (
          button.dataset.infoBound ===
          "true"
        ) {
          return;
        }

        button.dataset.infoBound =
          "true";

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
              .closest(".filter-item")
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

function renderPoints(data) {
  markerCluster.clearLayers();
  allMarkers = [];

  data.forEach((item) => {
    const conf =
      config[item.type] || {
        color: "#64748b",
        icon: "fa-location-dot",
        label: item.type
      };

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

    const safeType =
      escapeHtml(conf.label);

    const popupContent = `
      <div
        class="popup-header"
        style="background: ${conf.color}">

        <i class="fas ${conf.icon}"></i>

        ${safeType}

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

    allMarkers.push(
      marker
    );
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
      '<div class="loading">Nenhum registro encontrado.</div>';

    return;
  }

  data.forEach(
    (item) => {
      const conf =
        config[item.type] || {
          color: "#64748b",
          icon: "fa-location-dot",
          label: item.type
        };

      const card =
        document.createElement(
          "div"
        );

      card.className =
        "result-card";

      card.innerHTML = `
        <div
          class="result-card-header">

          <h4>
            ${escapeHtml(item.id)}
          </h4>

          <span
            class="type-tag"
            style="
              background: ${conf.color}15;
              color: ${conf.color}
            ">

            <i
              class="fas ${conf.icon}">
            </i>

            ${escapeHtml(conf.label)}

          </span>

        </div>

        <p>
          ${escapeHtml(item.address)}
        </p>
      `;

      card.onclick = () => {
        const marker =
          allMarkers.find(
            (currentMarker) =>
              currentMarker.itemData.id ===
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

      list.appendChild(card);
    }
  );
}

function filterData() {
  const activeTypes =
    Array.from(
      document.querySelectorAll(
        "#category-filters input:checked"
      )
    ).map(
      (input) =>
        input.value
    );

  const searchTerm =
    normalizeSearch(
      document.getElementById(
        "search-input"
      )?.value
    );

  const searchTerms =
    searchTerm
      ? searchTerm
          .split(/\s+/)
          .filter(Boolean)
      : [];

  const filtered =
    trafficData.filter(
      (item) => {
        const matchesType =
          activeTypes.includes(
            item.type
          );

        const matchesSearch =
          searchTerms.length === 0 ||
          searchTerms.every(
            (term) =>
              item.searchText.includes(
                term
              )
          );

        return (
          matchesType &&
          matchesSearch
        );
      }
    );

  renderPoints(filtered);
  renderList(filtered);
}

const applyFiscalizacaoFilter =
  debounce(
    filterData,
    100
  );

function bootMapaFiscalizacao() {
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
      applyFiscalizacaoFilter
    );
  }

  initMap();
  loadData();
}

document.addEventListener(
  "DOMContentLoaded",
  bootMapaFiscalizacao,
  { once: true }
);

document.addEventListener(
  "turbo:load",
  bootMapaFiscalizacao
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