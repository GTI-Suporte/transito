const config = {
  "Lombada Eletrônica": { color: "#3b82f6", icon: "fa-gauge-high" },
  "Equipamento Misto": { color: "#f59e0b", icon: "fa-video" },
  "Câmera Dome": { color: "#ef4444", icon: "fa-camera" },
  "Rede Semafórica": { color: "#10b981", icon: "fa-traffic-light" }
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

  L.tileLayer(
    "https://basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png?key=cb1_4d1n_1_5bb6f5807e5909740feda6f7",
    {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 20
    }
  ).addTo(map);

  L.control.zoom({ position: "bottomright" }).addTo(map);

  markerCluster = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 40,
    disableClusteringAtZoom: 16
  });

  map.addLayer(markerCluster);
}

async function loadData() {
  const list = document.getElementById("results-list");

  try {
    const response = await fetch("/api/equipamentos", {
      headers: { Accept: "application/json" }
    });

    if (!response.ok) {
      throw new Error(`Falha ao carregar equipamentos: ${response.status}`);
    }

    const data = await response.json();

    trafficData = data
      .filter((item) => item.lat !== null && item.lng !== null)
      .map((item) => ({
        id: String(item.id),
        address: item.address ?? "",
        lat: Number(item.lat),
        lng: Number(item.lng),
        type: item.type ?? ""
      }));

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
  document.getElementById("total-count").innerText = trafficData.length;
  document.getElementById("dome-count").innerText = trafficData.filter(
    (d) => d.type === "Câmera Dome"
  ).length;
  document.getElementById("misto-count").innerText = trafficData.filter(
    (d) => d.type === "Equipamento Misto"
  ).length;
  document.getElementById("semaforo-count").innerText = trafficData.filter(
    (d) => d.type === "Rede Semafórica"
  ).length;
}

function renderFilters() {
  const container = document.getElementById("category-filters");
  container.innerHTML = "";

  Object.keys(config).forEach((type) => {
    const div = document.createElement("div");
    div.className = "filter-item";
    div.innerHTML = `
      <label>
        <input type="checkbox" checked value="${type}" id="filter-${type}">
        <span class="filter-badge" style="background: ${config[type].color}"></span>
        <span>${type}</span>
      </label>
    `;

    div.querySelector("input").addEventListener("change", filterData);
    container.appendChild(div);
  });
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
      config[item.type] || { color: "#64748b", icon: "fa-location-dot" };

    const icon = L.divIcon({
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
      className: "custom-div-icon",
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    const marker = L.marker([item.lat, item.lng], { icon });

    const safeId = escapeHtml(item.id);
    const safeAddress = escapeHtml(item.address);
    const safeType = escapeHtml(item.type);

    const popupContent = `
      <div class="popup-header" style="background: ${conf.color}">
        <i class="fas ${conf.icon}"></i> ${safeType}
      </div>
      <div class="popup-body">
        <p><strong>ID do Equipamento:</strong> ${safeId}</p>
        <p><strong>Endereço:</strong><br>${safeAddress}</p>
        <p><strong>Coordenadas:</strong> ${Number(item.lat).toFixed(5)}, ${Number(
      item.lng
    ).toFixed(5)}</p>
        <button class="popup-btn" onclick="window.open('https://www.google.com/maps?q=${item.lat},${item.lng}', '_blank')">
          <i class="fas fa-arrow-up-right-from-square"></i> Abrir no Google Maps
        </button>
      </div>
    `;

    marker.bindPopup(popupContent, { maxWidth: 300 });
    marker.itemData = item;
    markerCluster.addLayer(marker);
    allMarkers.push(marker);
  });

  if (data.length > 0) {
    const group = new L.featureGroup(allMarkers);
    map.fitBounds(group.getBounds().pad(0.1));
  }
}

function renderList(data) {
  const list = document.getElementById("results-list");
  const countLabel = document.getElementById("results-count");

  list.innerHTML = "";
  countLabel.innerText = `${data.length} itens`;

  if (data.length === 0) {
    list.innerHTML = '<div class="loading">Nenhum registro encontrado.</div>';
    return;
  }

  data.slice(0, 100).forEach((item) => {
    const conf =
      config[item.type] || { color: "#64748b", icon: "fa-location-dot" };

    const card = document.createElement("div");
    card.className = "result-card";
    const safeId = escapeHtml(item.id);
    const safeAddress = escapeHtml(item.address);
    const safeType = escapeHtml(item.type);

    card.innerHTML = `
      <div class="result-card-header">
        <h4>${safeId}</h4>
        <span class="type-tag" style="background: ${conf.color}15; color: ${conf.color}">
          <i class="fas ${conf.icon}"></i> ${safeType}
        </span>
      </div>
      <p>${safeAddress}</p>
    `;

    card.onclick = () => {
      const marker = allMarkers.find((m) => m.itemData.id === item.id);

      if (marker) {
        map.setView([item.lat, item.lng], 17);
        setTimeout(() => marker.openPopup(), 200);
      }
    };

    list.appendChild(card);
  });

  if (data.length > 100) {
    const more = document.createElement("p");
    more.style =
      "text-align: center; font-size: 0.72rem; padding: 8px; color: var(--text-muted);";
    more.innerText = `Exibindo 100 de ${data.length} resultados...`;
    list.appendChild(more);
  }
}

function filterData() {
  const activeTypes = Array.from(
    document.querySelectorAll("#category-filters input:checked")
  ).map((input) => input.value);

  const searchTerm = document
    .getElementById("search-input")
    .value.toLowerCase()
    .trim();

  const filtered = trafficData.filter((item) => {
    const matchesType = activeTypes.includes(item.type);
    const matchesSearch =
      !searchTerm ||
      item.address.toLowerCase().includes(searchTerm) ||
      item.id.toLowerCase().includes(searchTerm);

    return matchesType && matchesSearch;
  });

  renderPoints(filtered);
  renderList(filtered);
}

function bootDashboard() {
  const mapElement = document.getElementById("map");
  if (!mapElement || mapElement.dataset.initialized === "true") return;

  mapElement.dataset.initialized = "true";
  document
    .getElementById("search-input")
    .addEventListener("input", filterData);

  initMap();
  loadData();
}

document.addEventListener("DOMContentLoaded", bootDashboard, { once: true });
document.addEventListener("turbo:load", bootDashboard);

document.addEventListener("turbo:before-cache", () => {
  if (map) {
    map.remove();
    map = null;
  }

  markerCluster = null;
  allMarkers = [];
  trafficData = [];

  const mapElement = document.getElementById("map");
  if (mapElement) delete mapElement.dataset.initialized;
});
