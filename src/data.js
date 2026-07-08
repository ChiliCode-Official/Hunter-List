// =====================================================
//  HUNTER LIST — Data & State Manager
//  Hector's Hunting Packing Checklist PWA
// =====================================================

// ── Default Checklist Data ──────────────────────────
const DEFAULT_ITEMS = {
  "Artículos de Tocador": {
    icon: "🪥",
    items: [
      "Bálsamo Labios", "Bloqueador", "Cepillo Dientes", "Crema Cabello",
      "Crema Cara", "Crema Cuerpo", "Crema Ojos", "Desodorante", "Esponja",
      "Espuma Afeitar", "Hilo Dental", "Jabón de Tocador", "Loción",
      "Pasta Dientes", "Rastrillo", "Shampoo", "Toallitas Cara"
    ]
  },
  "Gadgets": {
    icon: "⚡",
    items: [
      "Audífonos", "Baterías", "Bocina", "Cámara Fotográfica", "Cámara Video",
      "Cargador Celular", "Cargador iPad", "Cargador iPod", "Celulares",
      "Convertidores de Energía", "iPad", "iPod", "Lámpara", "Pilas"
    ]
  },
  "Documentos": {
    icon: "📋",
    items: [
      "Boleto Avión", "Contrato Cacería", "Efectivo", "Licencia",
      "Pasaporte", "Permisos", "Tarjeta de Crédito", "Visa"
    ]
  },
  "Equipaje": {
    icon: "🎒",
    items: ["Back Pack"]
  },
  "Equipo de Caza": {
    icon: "🎯",
    items: ["Arco", "Binoculares", "Flecha", "Rifle", "Tapones", "Tiros", "Lentes"]
  },
  "Ropa": {
    icon: "🧥",
    items: [
      "Botas Caminar", "Botas Nieve", "Boxers", "Bufanda", "Calcetines",
      "Calcetines Delgados", "Calcetines Gruesos", "Chamarra Aire", "Chamarra Frío",
      "Chamarra Nieve", "Cinturón", "Gorra", "Gorro Frío", "Guantes Aire",
      "Guantes Frío", "Pantalones Gruesos", "Pantalones Ligeros", "Pijama",
      "Playera Manga Corta", "Playera Manga Larga", "Playeras", "Rompe Vientos",
      "Ropa Nieve", "Ropa Térmica Gruesa", "Ropa Térmica Ligera", "Sudaderas", "Warmers"
    ]
  },
  "Medicinas": {
    icon: "💊",
    items: [
      "Antibióticos", "Neosporín / Antiséptico", "Avapena / Antihistamínico",
      "Curitas / Heridas", "Supradol / Dolor", "Motrin Normal / Dolor y Fiebre",
      "Motrin PM / Dolor y Fiebre", "Tempra / Dolor y Fiebre",
      "Gex Gel / Estómago", "Omeprazol / Estómago", "Omuro / Estómago",
      "Pemix / Estómago", "Pepto Bismol / Estómago", "Sal de Uvas / Estómago",
      "Treda / Estómago", "Pastillas Fuegos", "Pomada Fuegos",
      "Pastillas Garganta", "Pomada Hemorroides", "Dolor Muscular"
    ]
  },
  "Varios": {
    icon: "🔥",
    items: ["Encendedor", "Puros"]
  }
};

// ── Collections Config ──────────────────────────────
const DEFAULT_COLLECTIONS = [
  {
    id: "patos",
    name: "Patos",
    icon: "🦆",
    subtitle: "Cacería de Patos",
    color: "blue"
  },
  {
    id: "palomas",
    name: "Palomas",
    icon: "🐦",
    subtitle: "Cacería de Palomas",
    color: "blue"
  },
  {
    id: "venados",
    name: "Venados",
    icon: "🦌",
    subtitle: "Cacería de Venados",
    color: "green"
  },
  {
    id: "montana",
    name: "Montaña",
    icon: "🏔️",
    subtitle: "Cacería de Montaña",
    color: "green"
  },
  {
    id: "africa",
    name: "África",
    icon: "🐘",
    subtitle: "Safari en África",
    color: "gold"
  }
];

// ── Storage Key ─────────────────────────────────────
const STORAGE_KEY = "hunterlist_v3";

// ── Load State ──────────────────────────────────────
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        typeof parsed === "object" &&
        Array.isArray(parsed.collections) &&
        typeof parsed.data === "object" &&
        parsed.data !== null &&
        typeof parsed.activeCollection === "string"
      ) {
        return parsed;
      }
    }
  } catch (_) {}
  return buildDefaultState();
}

// ── Build Default State ─────────────────────────────
function buildDefaultState() {
  const data = {};
  for (const col of DEFAULT_COLLECTIONS) {
    data[col.id] = {};
    for (const [catName, catData] of Object.entries(DEFAULT_ITEMS)) {
      data[col.id][catName] = {
        icon: catData.icon,
        collapsed: true,
        items: catData.items.map((name, idx) => ({
          id: `${col.id}-${catName}-${idx}`,
          name,
          checked: false
        }))
      };
    }
  }
  return {
    collections: DEFAULT_COLLECTIONS,
    data,
    activeCollection: DEFAULT_COLLECTIONS[0].id
  };
}

// ── Save State ──────────────────────────────────────
function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn("Could not save to localStorage:", e);
  }
}

export { loadState, saveState, buildDefaultState, STORAGE_KEY };
