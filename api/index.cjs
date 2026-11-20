var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// vercel-entry.ts
var vercel_entry_exports = {};
__export(vercel_entry_exports, {
  default: () => handler
});
module.exports = __toCommonJS(vercel_entry_exports);

// serverApp.ts
var import_config = require("dotenv/config");
var import_genai = require("@google/genai");
var import_google_auth_library = require("google-auth-library");
var import_express = __toESM(require("express"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_http = __toESM(require("http"), 1);
var import_https = __toESM(require("https"), 1);
var import_path = __toESM(require("path"), 1);

// src/data/thailandHospitalData.ts
var THAILAND_REGIONS = {
  Central: {
    id: "Central",
    nameTh: "\u0E20\u0E32\u0E04\u0E01\u0E25\u0E32\u0E07 / \u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E2F \u0E41\u0E25\u0E30\u0E1B\u0E23\u0E34\u0E21\u0E13\u0E11\u0E25",
    nameEn: "Central & Bangkok",
    color: "#6366f1",
    // Indigo
    borderCol: "#4f46e5",
    bgBadge: "bg-indigo-50 border-indigo-200 text-indigo-700",
    textBadge: "text-indigo-700",
    center: [13.7563, 100.5018],
    zoom: 9
  },
  North: {
    id: "North",
    nameTh: "\u0E20\u0E32\u0E04\u0E40\u0E2B\u0E19\u0E37\u0E2D",
    nameEn: "Northern Thailand",
    color: "#10b981",
    // Emerald
    borderCol: "#059669",
    bgBadge: "bg-emerald-50 border-emerald-200 text-emerald-700",
    textBadge: "text-emerald-700",
    center: [18.7883, 98.9853],
    zoom: 8
  },
  Northeastern: {
    id: "Northeastern",
    nameTh: "\u0E20\u0E32\u0E04\u0E15\u0E30\u0E27\u0E31\u0E19\u0E2D\u0E2D\u0E01\u0E40\u0E09\u0E35\u0E22\u0E07\u0E40\u0E2B\u0E19\u0E37\u0E2D (\u0E2D\u0E35\u0E2A\u0E32\u0E19)",
    nameEn: "Northeastern (Isan)",
    color: "#f59e0b",
    // Amber
    borderCol: "#d97706",
    bgBadge: "bg-amber-50 border-amber-200 text-amber-700",
    textBadge: "text-amber-700",
    center: [16.4322, 102.8236],
    zoom: 7.5
  },
  Eastern: {
    id: "Eastern",
    nameTh: "\u0E20\u0E32\u0E04\u0E15\u0E30\u0E27\u0E31\u0E19\u0E2D\u0E2D\u0E01",
    nameEn: "Eastern Thailand",
    color: "#ec4899",
    // Pink / Rose
    borderCol: "#db2777",
    bgBadge: "bg-pink-50 border-pink-200 text-pink-700",
    textBadge: "text-pink-700",
    center: [13.15, 101.4],
    zoom: 8.5
  },
  Western: {
    id: "Western",
    nameTh: "\u0E20\u0E32\u0E04\u0E15\u0E30\u0E27\u0E31\u0E19\u0E15\u0E01",
    nameEn: "Western Thailand",
    color: "#14b8a6",
    // Teal
    borderCol: "#0d9488",
    bgBadge: "bg-teal-50 border-teal-200 text-teal-700",
    textBadge: "text-teal-700",
    center: [13.5386, 99.8167],
    zoom: 8.5
  },
  South: {
    id: "South",
    nameTh: "\u0E20\u0E32\u0E04\u0E43\u0E15\u0E49",
    nameEn: "Southern Thailand",
    color: "#0284c7",
    // Sky / Blue
    borderCol: "#0369a1",
    bgBadge: "bg-sky-50 border-sky-200 text-sky-700",
    textBadge: "text-sky-700",
    center: [7.8804, 99.5],
    zoom: 7.5
  }
};
var THAILAND_HOSPITALS_DATABASE = [
  // --- Central & Bangkok ---
  {
    id: "hosp-chula",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E08\u0E38\u0E2C\u0E32\u0E25\u0E07\u0E01\u0E23\u0E13\u0E4C \u0E2A\u0E20\u0E32\u0E01\u0E32\u0E0A\u0E32\u0E14\u0E44\u0E17\u0E22",
    nameEn: "Chulalongkorn Memorial Hospital",
    province: "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23",
    region: "Central",
    lat: 13.7329,
    lng: 100.5332,
    aliases: ["\u0E23\u0E1E.\u0E08\u0E38\u0E2C\u0E32", "\u0E08\u0E38\u0E2C\u0E32\u0E25\u0E07\u0E01\u0E23\u0E13\u0E4C", "chulalongkorn", "chula", "\u0E2A\u0E20\u0E32\u0E01\u0E32\u0E0A\u0E32\u0E14\u0E44\u0E17\u0E22"],
    type: "University"
  },
  {
    id: "hosp-siriraj",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E28\u0E34\u0E23\u0E34\u0E23\u0E32\u0E0A",
    nameEn: "Siriraj Hospital",
    province: "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23",
    region: "Central",
    lat: 13.7579,
    lng: 100.4856,
    aliases: ["\u0E23\u0E1E.\u0E28\u0E34\u0E23\u0E34\u0E23\u0E32\u0E0A", "\u0E28\u0E34\u0E23\u0E34\u0E23\u0E32\u0E0A", "siriraj", "siriraj hospital", "\u0E28\u0E34\u0E23\u0E34\u0E23\u0E32\u0E0A\u0E1B\u0E34\u0E22\u0E21\u0E2B\u0E32\u0E23\u0E32\u0E0A\u0E01\u0E32\u0E23\u0E38\u0E13\u0E22\u0E4C"],
    type: "University"
  },
  {
    id: "hosp-ramathibodi",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E23\u0E32\u0E21\u0E32\u0E18\u0E34\u0E1A\u0E14\u0E35",
    nameEn: "Ramathibodi Hospital",
    province: "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23",
    region: "Central",
    lat: 13.7668,
    lng: 100.5262,
    aliases: ["\u0E23\u0E1E.\u0E23\u0E32\u0E21\u0E32\u0E18\u0E34\u0E1A\u0E14\u0E35", "\u0E23\u0E32\u0E21\u0E32\u0E18\u0E34\u0E1A\u0E14\u0E35", "\u0E23\u0E32\u0E21\u0E32", "ramathibodi", "rama"],
    type: "University"
  },
  {
    id: "hosp-rajavithi",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E23\u0E32\u0E0A\u0E27\u0E34\u0E16\u0E35",
    nameEn: "Rajavithi Hospital",
    province: "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23",
    region: "Central",
    lat: 13.7656,
    lng: 100.5367,
    aliases: ["\u0E23\u0E1E.\u0E23\u0E32\u0E0A\u0E27\u0E34\u0E16\u0E35", "\u0E23\u0E32\u0E0A\u0E27\u0E34\u0E16\u0E35", "rajavithi"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-phramongkutklao",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E1E\u0E23\u0E30\u0E21\u0E07\u0E01\u0E38\u0E0E\u0E40\u0E01\u0E25\u0E49\u0E32",
    nameEn: "Phramongkutklao Hospital",
    province: "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23",
    region: "Central",
    lat: 13.7681,
    lng: 100.5358,
    aliases: ["\u0E23\u0E1E.\u0E1E\u0E23\u0E30\u0E21\u0E07\u0E01\u0E38\u0E0E\u0E40\u0E01\u0E25\u0E49\u0E32", "\u0E1E\u0E23\u0E30\u0E21\u0E07\u0E01\u0E38\u0E0E", "phramongkutklao"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-bumrungrad",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E1A\u0E33\u0E23\u0E38\u0E07\u0E23\u0E32\u0E29\u0E0E\u0E23\u0E4C \u0E2D\u0E34\u0E19\u0E40\u0E15\u0E2D\u0E23\u0E4C\u0E40\u0E19\u0E0A\u0E31\u0E48\u0E19\u0E41\u0E19\u0E25",
    nameEn: "Bumrungrad International Hospital",
    province: "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23",
    region: "Central",
    lat: 13.7466,
    lng: 100.5529,
    aliases: ["\u0E1A\u0E33\u0E23\u0E38\u0E07\u0E23\u0E32\u0E29\u0E0E\u0E23\u0E4C", "bumrungrad", "bumrungrad hospital"],
    type: "Private"
  },
  {
    id: "hosp-bangkok-hq",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E (\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E43\u0E2B\u0E0D\u0E48 \u0E0B\u0E2D\u0E22\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E27\u0E34\u0E08\u0E31\u0E22)",
    nameEn: "Bangkok Hospital (Headquarters)",
    province: "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23",
    region: "Central",
    lat: 13.7486,
    lng: 100.5833,
    aliases: ["\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E", "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E2A\u0E33\u0E19\u0E31\u0E01\u0E07\u0E32\u0E19\u0E43\u0E2B\u0E0D\u0E48", "bangkok hospital", "\u0E0B\u0E2D\u0E22\u0E28\u0E39\u0E19\u0E22\u0E4C\u0E27\u0E34\u0E08\u0E31\u0E22"],
    type: "Private"
  },
  {
    id: "hosp-samitivej-sukhumvit",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E2A\u0E21\u0E34\u0E15\u0E34\u0E40\u0E27\u0E0A \u0E2A\u0E38\u0E02\u0E38\u0E21\u0E27\u0E34\u0E17",
    nameEn: "Samitivej Sukhumvit Hospital",
    province: "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23",
    region: "Central",
    lat: 13.7371,
    lng: 100.5779,
    aliases: ["\u0E2A\u0E21\u0E34\u0E15\u0E34\u0E40\u0E27\u0E0A \u0E2A\u0E38\u0E02\u0E38\u0E21\u0E27\u0E34\u0E17", "\u0E2A\u0E21\u0E34\u0E15\u0E34\u0E40\u0E27\u0E0A", "samitivej"],
    type: "Private"
  },
  {
    id: "hosp-thammasat",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E18\u0E23\u0E23\u0E21\u0E28\u0E32\u0E2A\u0E15\u0E23\u0E4C\u0E40\u0E09\u0E25\u0E34\u0E21\u0E1E\u0E23\u0E30\u0E40\u0E01\u0E35\u0E22\u0E23\u0E15\u0E34",
    nameEn: "Thammasat University Hospital",
    province: "\u0E1B\u0E17\u0E38\u0E21\u0E18\u0E32\u0E19\u0E35",
    region: "Central",
    lat: 14.0747,
    lng: 100.6062,
    aliases: ["\u0E23\u0E1E.\u0E18\u0E23\u0E23\u0E21\u0E28\u0E32\u0E2A\u0E15\u0E23\u0E4C", "\u0E18\u0E23\u0E23\u0E21\u0E28\u0E32\u0E2A\u0E15\u0E23\u0E4C", "thammasat", "thammasart", "tu hospital", "thammasart university", "thammasat university"],
    type: "University"
  },
  {
    id: "hosp-angthong",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E2D\u0E48\u0E32\u0E07\u0E17\u0E2D\u0E07",
    nameEn: "Angthong Hospital",
    province: "\u0E2D\u0E48\u0E32\u0E07\u0E17\u0E2D\u0E07",
    region: "Central",
    lat: 14.5889,
    lng: 100.4578,
    aliases: ["\u0E2D\u0E48\u0E32\u0E07\u0E17\u0E2D\u0E07", "\u0E23\u0E1E.\u0E2D\u0E48\u0E32\u0E07\u0E17\u0E2D\u0E07", "angthong", "ang thong", "angthong hospital", "ang thong hospital"],
    type: "Public General"
  },
  {
    id: "hosp-somdet-phutthaloetla",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E2A\u0E21\u0E40\u0E14\u0E47\u0E08\u0E1E\u0E23\u0E30\u0E1E\u0E38\u0E17\u0E18\u0E40\u0E25\u0E34\u0E28\u0E2B\u0E25\u0E49\u0E32",
    nameEn: "Somdet Phra Phutthaloetla Hospital",
    province: "\u0E2A\u0E21\u0E38\u0E17\u0E23\u0E2A\u0E07\u0E04\u0E23\u0E32\u0E21",
    region: "Central",
    lat: 13.4144,
    lng: 99.9961,
    aliases: ["\u0E2A\u0E21\u0E40\u0E14\u0E47\u0E08\u0E1E\u0E23\u0E30\u0E1E\u0E38\u0E17\u0E18\u0E40\u0E25\u0E34\u0E28\u0E2B\u0E25\u0E49\u0E32", "somdetpraputthalertla", "somdetpraputthalertla hospital", "\u0E23\u0E1E.\u0E2A\u0E21\u0E40\u0E14\u0E47\u0E08\u0E1E\u0E23\u0E30\u0E1E\u0E38\u0E17\u0E18\u0E40\u0E25\u0E34\u0E28\u0E2B\u0E25\u0E49\u0E32", "somdet phra phutthaloetla", "somdet phutthaloetla"],
    type: "Public General"
  },
  {
    id: "hosp-vajira",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E27\u0E0A\u0E34\u0E23\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25",
    nameEn: "Vajira Hospital",
    province: "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23",
    region: "Central",
    lat: 13.7788,
    lng: 100.5058,
    aliases: ["\u0E27\u0E0A\u0E34\u0E23\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25", "\u0E27\u0E0A\u0E34\u0E23\u0E30", "vajira"],
    type: "University"
  },
  {
    id: "hosp-police",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E15\u0E33\u0E23\u0E27\u0E08",
    nameEn: "Police General Hospital",
    province: "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23",
    region: "Central",
    lat: 13.7439,
    lng: 100.5392,
    aliases: ["\u0E23\u0E1E.\u0E15\u0E33\u0E23\u0E27\u0E08", "\u0E15\u0E33\u0E23\u0E27\u0E08", "police general hospital"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-medpark",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E40\u0E21\u0E14\u0E1E\u0E32\u0E23\u0E4C\u0E04",
    nameEn: "MedPark Hospital",
    province: "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23",
    region: "Central",
    lat: 13.7197,
    lng: 100.5606,
    aliases: ["\u0E40\u0E21\u0E14\u0E1E\u0E32\u0E23\u0E4C\u0E04", "medpark"],
    type: "Private"
  },
  {
    id: "hosp-praram9",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E1E\u0E23\u0E30\u0E23\u0E32\u0E21\u0E40\u0E01\u0E49\u0E32",
    nameEn: "Praram 9 Hospital",
    province: "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23",
    region: "Central",
    lat: 13.7533,
    lng: 100.575,
    aliases: ["\u0E1E\u0E23\u0E30\u0E23\u0E32\u0E21\u0E40\u0E01\u0E49\u0E32", "praram 9", "praram9"],
    type: "Private"
  },
  {
    id: "hosp-chest",
    name: "\u0E2A\u0E16\u0E32\u0E1A\u0E31\u0E19\u0E42\u0E23\u0E04\u0E17\u0E23\u0E27\u0E07\u0E2D\u0E01",
    nameEn: "Central Chest Institute of Thailand",
    province: "\u0E19\u0E19\u0E17\u0E1A\u0E38\u0E23\u0E35",
    region: "Central",
    lat: 13.8617,
    lng: 100.5222,
    aliases: ["\u0E42\u0E23\u0E04\u0E17\u0E23\u0E27\u0E07\u0E2D\u0E01", "\u0E2A\u0E16\u0E32\u0E1A\u0E31\u0E19\u0E42\u0E23\u0E04\u0E17\u0E23\u0E27\u0E07\u0E2D\u0E01", "chest institute"],
    type: "Specialized"
  },
  {
    id: "hosp-cancer",
    name: "\u0E2A\u0E16\u0E32\u0E1A\u0E31\u0E19\u0E21\u0E30\u0E40\u0E23\u0E47\u0E07\u0E41\u0E2B\u0E48\u0E07\u0E0A\u0E32\u0E15\u0E34",
    nameEn: "National Cancer Institute",
    province: "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23",
    region: "Central",
    lat: 13.7699,
    lng: 100.5303,
    aliases: ["\u0E2A\u0E16\u0E32\u0E1A\u0E31\u0E19\u0E21\u0E30\u0E40\u0E23\u0E47\u0E07", "\u0E21\u0E30\u0E40\u0E23\u0E47\u0E07\u0E41\u0E2B\u0E48\u0E07\u0E0A\u0E32\u0E15\u0E34", "cancer institute", "nci"],
    type: "Specialized"
  },
  {
    id: "hosp-child",
    name: "\u0E2A\u0E16\u0E32\u0E1A\u0E31\u0E19\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E40\u0E14\u0E47\u0E01\u0E41\u0E2B\u0E48\u0E07\u0E0A\u0E32\u0E15\u0E34\u0E21\u0E2B\u0E32\u0E23\u0E32\u0E0A\u0E34\u0E19\u0E35",
    nameEn: "Queen Sirikit National Institute of Child Health (Children's Hospital)",
    province: "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23",
    region: "Central",
    lat: 13.7663,
    lng: 100.5377,
    aliases: ["\u0E23\u0E1E.\u0E40\u0E14\u0E47\u0E01", "\u0E2A\u0E16\u0E32\u0E1A\u0E31\u0E19\u0E2A\u0E38\u0E02\u0E20\u0E32\u0E1E\u0E40\u0E14\u0E47\u0E01", "children hospital"],
    type: "Specialized"
  },
  {
    id: "hosp-bhumibol",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E20\u0E39\u0E21\u0E34\u0E1E\u0E25\u0E2D\u0E14\u0E38\u0E25\u0E22\u0E40\u0E14\u0E0A \u0E01\u0E23\u0E21\u0E41\u0E1E\u0E17\u0E22\u0E4C\u0E17\u0E2B\u0E32\u0E23\u0E2D\u0E32\u0E01\u0E32\u0E28",
    nameEn: "Bhumibol Adulyadej Hospital",
    province: "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23",
    region: "Central",
    lat: 13.9108,
    lng: 100.6225,
    aliases: ["\u0E20\u0E39\u0E21\u0E34\u0E1E\u0E25", "\u0E20\u0E39\u0E21\u0E34\u0E1E\u0E25\u0E2D\u0E14\u0E38\u0E25\u0E22\u0E40\u0E14\u0E0A", "bhumibol"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-nopparat",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E19\u0E1E\u0E23\u0E31\u0E15\u0E19\u0E23\u0E32\u0E0A\u0E18\u0E32\u0E19\u0E35",
    nameEn: "Nopparat Rajathanee Hospital",
    province: "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23",
    region: "Central",
    lat: 13.8219,
    lng: 100.6908,
    aliases: ["\u0E19\u0E1E\u0E23\u0E31\u0E15\u0E19", "\u0E19\u0E1E\u0E23\u0E31\u0E15\u0E19\u0E4C", "nopparat"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-lerdsin",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E40\u0E25\u0E34\u0E14\u0E2A\u0E34\u0E19",
    nameEn: "Lerdsin Hospital",
    province: "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23",
    region: "Central",
    lat: 13.7208,
    lng: 100.5181,
    aliases: ["\u0E40\u0E25\u0E34\u0E14\u0E2A\u0E34\u0E19", "lerdsin"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-ayutthaya",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E1E\u0E23\u0E30\u0E19\u0E04\u0E23\u0E28\u0E23\u0E35\u0E2D\u0E22\u0E38\u0E18\u0E22\u0E32",
    nameEn: "Phra Nakhon Si Ayutthaya Hospital",
    province: "\u0E1E\u0E23\u0E30\u0E19\u0E04\u0E23\u0E28\u0E23\u0E35\u0E2D\u0E22\u0E38\u0E18\u0E22\u0E32",
    region: "Central",
    lat: 14.3486,
    lng: 100.5639,
    aliases: ["\u0E23\u0E1E.\u0E2D\u0E22\u0E38\u0E18\u0E22\u0E32", "\u0E2D\u0E22\u0E38\u0E18\u0E22\u0E32", "ayutthaya hospital", "\u0E1E\u0E23\u0E30\u0E19\u0E04\u0E23\u0E28\u0E23\u0E35\u0E2D\u0E22\u0E38\u0E18\u0E22\u0E32"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-saraburi",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E2A\u0E23\u0E30\u0E1A\u0E38\u0E23\u0E35",
    nameEn: "Saraburi Hospital",
    province: "\u0E2A\u0E23\u0E30\u0E1A\u0E38\u0E23\u0E35",
    region: "Central",
    lat: 14.5264,
    lng: 100.9169,
    aliases: ["\u0E23\u0E1E.\u0E2A\u0E23\u0E30\u0E1A\u0E38\u0E23\u0E35", "\u0E2A\u0E23\u0E30\u0E1A\u0E38\u0E23\u0E35", "saraburi hospital"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-lopburi",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E1E\u0E23\u0E30\u0E19\u0E32\u0E23\u0E32\u0E22\u0E13\u0E4C\u0E21\u0E2B\u0E32\u0E23\u0E32\u0E0A",
    nameEn: "King Narai Hospital (Lopburi)",
    province: "\u0E25\u0E1E\u0E1A\u0E38\u0E23\u0E35",
    region: "Central",
    lat: 14.8083,
    lng: 100.6653,
    aliases: ["\u0E1E\u0E23\u0E30\u0E19\u0E32\u0E23\u0E32\u0E22\u0E13\u0E4C\u0E21\u0E2B\u0E32\u0E23\u0E32\u0E0A", "\u0E23\u0E1E.\u0E25\u0E1E\u0E1A\u0E38\u0E23\u0E35", "\u0E25\u0E1E\u0E1A\u0E38\u0E23\u0E35", "king narai"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-nakhon-sawan",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E2A\u0E27\u0E23\u0E23\u0E04\u0E4C\u0E1B\u0E23\u0E30\u0E0A\u0E32\u0E23\u0E31\u0E01\u0E29\u0E4C",
    nameEn: "Sawanpracharak Hospital",
    province: "\u0E19\u0E04\u0E23\u0E2A\u0E27\u0E23\u0E23\u0E04\u0E4C",
    region: "Central",
    lat: 15.6989,
    lng: 100.1267,
    aliases: ["\u0E2A\u0E27\u0E23\u0E23\u0E04\u0E4C\u0E1B\u0E23\u0E30\u0E0A\u0E32\u0E23\u0E31\u0E01\u0E29\u0E4C", "\u0E23\u0E1E.\u0E19\u0E04\u0E23\u0E2A\u0E27\u0E23\u0E23\u0E04\u0E4C", "\u0E19\u0E04\u0E23\u0E2A\u0E27\u0E23\u0E23\u0E04\u0E4C", "sawanpracharak"],
    type: "Public Tertiary"
  },
  // --- North (ภาคเหนือ) ---
  {
    id: "hosp-cmu-suandok",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E21\u0E2B\u0E32\u0E23\u0E32\u0E0A\u0E19\u0E04\u0E23\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E43\u0E2B\u0E21\u0E48 (\u0E2A\u0E27\u0E19\u0E14\u0E2D\u0E01)",
    nameEn: "Maharaj Nakorn Chiang Mai Hospital",
    province: "\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E43\u0E2B\u0E21\u0E48",
    region: "North",
    lat: 18.7897,
    lng: 98.9744,
    aliases: ["\u0E21\u0E2B\u0E32\u0E23\u0E32\u0E0A\u0E19\u0E04\u0E23\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E43\u0E2B\u0E21\u0E48", "\u0E2A\u0E27\u0E19\u0E14\u0E2D\u0E01", "suan dok", "suandok", "cmu hospital", "\u0E23\u0E1E.\u0E2A\u0E27\u0E19\u0E14\u0E2D\u0E01"],
    type: "University"
  },
  {
    id: "hosp-nakornping",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E19\u0E04\u0E23\u0E1E\u0E34\u0E07\u0E04\u0E4C",
    nameEn: "Nakornping Hospital",
    province: "\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E43\u0E2B\u0E21\u0E48",
    region: "North",
    lat: 18.8475,
    lng: 98.9725,
    aliases: ["\u0E19\u0E04\u0E23\u0E1E\u0E34\u0E07\u0E04\u0E4C", "nakornping", "nakornping hospital"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-chiangrai",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E23\u0E32\u0E22\u0E1B\u0E23\u0E30\u0E0A\u0E32\u0E19\u0E38\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C",
    nameEn: "Chiangrai Prachanukroh Hospital",
    province: "\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E23\u0E32\u0E22",
    region: "North",
    lat: 19.9036,
    lng: 99.8322,
    aliases: ["\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E23\u0E32\u0E22\u0E1B\u0E23\u0E30\u0E0A\u0E32\u0E19\u0E38\u0E40\u0E04\u0E23\u0E32\u0E30\u0E2B\u0E4C", "\u0E23\u0E1E.\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E23\u0E32\u0E22", "\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E23\u0E32\u0E22", "chiangrai"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-lampang",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E25\u0E33\u0E1B\u0E32\u0E07",
    nameEn: "Lampang Hospital",
    province: "\u0E25\u0E33\u0E1B\u0E32\u0E07",
    region: "North",
    lat: 18.2917,
    lng: 99.5083,
    aliases: ["\u0E23\u0E1E.\u0E25\u0E33\u0E1B\u0E32\u0E07", "\u0E25\u0E33\u0E1B\u0E32\u0E07", "lampang hospital"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-phitsanulok",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E1E\u0E38\u0E17\u0E18\u0E0A\u0E34\u0E19\u0E23\u0E32\u0E0A \u0E1E\u0E34\u0E29\u0E13\u0E38\u0E42\u0E25\u0E01",
    nameEn: "Buddhachinaraj Hospital",
    province: "\u0E1E\u0E34\u0E29\u0E13\u0E38\u0E42\u0E25\u0E01",
    region: "North",
    lat: 16.8156,
    lng: 100.2639,
    aliases: ["\u0E1E\u0E38\u0E17\u0E18\u0E0A\u0E34\u0E19\u0E23\u0E32\u0E0A", "\u0E23\u0E1E.\u0E1E\u0E34\u0E29\u0E13\u0E38\u0E42\u0E25\u0E01", "\u0E1E\u0E34\u0E29\u0E13\u0E38\u0E42\u0E25\u0E01", "buddhachinaraj"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-lamphun",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E25\u0E33\u0E1E\u0E39\u0E19",
    nameEn: "Lamphun Hospital",
    province: "\u0E25\u0E33\u0E1E\u0E39\u0E19",
    region: "North",
    lat: 18.5744,
    lng: 99.0069,
    aliases: ["\u0E23\u0E1E.\u0E25\u0E33\u0E1E\u0E39\u0E19", "\u0E25\u0E33\u0E1E\u0E39\u0E19", "lamphun"],
    type: "Public General"
  },
  {
    id: "hosp-phrae",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E41\u0E1E\u0E23\u0E48",
    nameEn: "Phrae Hospital",
    province: "\u0E41\u0E1E\u0E23\u0E48",
    region: "North",
    lat: 18.1436,
    lng: 100.1417,
    aliases: ["\u0E23\u0E1E.\u0E41\u0E1E\u0E23\u0E48", "\u0E41\u0E1E\u0E23\u0E48", "phrae"],
    type: "Public General"
  },
  {
    id: "hosp-nan",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E19\u0E48\u0E32\u0E19",
    nameEn: "Nan Hospital",
    province: "\u0E19\u0E48\u0E32\u0E19",
    region: "North",
    lat: 18.785,
    lng: 100.7783,
    aliases: ["\u0E23\u0E1E.\u0E19\u0E48\u0E32\u0E19", "\u0E19\u0E48\u0E32\u0E19", "nan hospital"],
    type: "Public General"
  },
  {
    id: "hosp-phayao",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E1E\u0E30\u0E40\u0E22\u0E32",
    nameEn: "Phayao Hospital",
    province: "\u0E1E\u0E30\u0E40\u0E22\u0E32",
    region: "North",
    lat: 19.1678,
    lng: 99.9022,
    aliases: ["\u0E23\u0E1E.\u0E1E\u0E30\u0E40\u0E22\u0E32", "\u0E1E\u0E30\u0E40\u0E22\u0E32", "phayao"],
    type: "Public General"
  },
  {
    id: "hosp-overbrook",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E42\u0E2D\u0E40\u0E27\u0E2D\u0E23\u0E4C\u0E1A\u0E23\u0E38\u0E4A\u0E04",
    nameEn: "Overbrook Hospital",
    province: "\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E23\u0E32\u0E22",
    region: "North",
    lat: 19.9114,
    lng: 99.8327,
    aliases: ["\u0E42\u0E2D\u0E40\u0E27\u0E2D\u0E23\u0E4C\u0E1A\u0E23\u0E38\u0E4A\u0E04", "overbrook", "overbrook hospital", "\u0E23\u0E1E.\u0E42\u0E2D\u0E40\u0E27\u0E2D\u0E23\u0E4C\u0E1A\u0E23\u0E38\u0E4A\u0E04", "over brook"],
    type: "Private"
  },
  {
    id: "hosp-chomthong",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E08\u0E2D\u0E21\u0E17\u0E2D\u0E07",
    nameEn: "Chomthong Hospital",
    province: "\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E43\u0E2B\u0E21\u0E48",
    region: "North",
    lat: 18.4239,
    lng: 98.6811,
    aliases: ["\u0E08\u0E2D\u0E21\u0E17\u0E2D\u0E07", "\u0E23\u0E1E.\u0E08\u0E2D\u0E21\u0E17\u0E2D\u0E07", "chomthong", "chom thong", "chomthong hospital", "chom thong hospital"],
    type: "Public General"
  },
  {
    id: "hosp-maesot",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E41\u0E21\u0E48\u0E2A\u0E2D\u0E14",
    nameEn: "Mae Sot Hospital",
    province: "\u0E15\u0E32\u0E01",
    region: "North",
    lat: 16.7167,
    lng: 98.5744,
    aliases: ["\u0E41\u0E21\u0E48\u0E2A\u0E2D\u0E14", "\u0E23\u0E1E.\u0E41\u0E21\u0E48\u0E2A\u0E2D\u0E14", "mae sot", "maesot", "measot", "measot hospital", "maesot hospital", "mae sot hospital", "maesod", "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E41\u0E21\u0E48\u0E2A\u0E2D\u0E14"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-tak",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E2A\u0E21\u0E40\u0E14\u0E47\u0E08\u0E1E\u0E23\u0E30\u0E40\u0E08\u0E49\u0E32\u0E15\u0E32\u0E01\u0E2A\u0E34\u0E19\u0E21\u0E2B\u0E32\u0E23\u0E32\u0E0A",
    nameEn: "Somdejphrachao Taksin Maharaj Hospital",
    province: "\u0E15\u0E32\u0E01",
    region: "North",
    lat: 16.8833,
    lng: 99.1239,
    aliases: ["\u0E2A\u0E21\u0E40\u0E14\u0E47\u0E08\u0E1E\u0E23\u0E30\u0E40\u0E08\u0E49\u0E32\u0E15\u0E32\u0E01\u0E2A\u0E34\u0E19\u0E21\u0E2B\u0E32\u0E23\u0E32\u0E0A", "\u0E23\u0E1E.\u0E15\u0E32\u0E01", "\u0E15\u0E32\u0E01"],
    type: "Public General"
  },
  {
    id: "hosp-uttaradit",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E2D\u0E38\u0E15\u0E23\u0E14\u0E34\u0E15\u0E16\u0E4C",
    nameEn: "Uttaradit Hospital",
    province: "\u0E2D\u0E38\u0E15\u0E23\u0E14\u0E34\u0E15\u0E16\u0E4C",
    region: "North",
    lat: 17.6256,
    lng: 100.0983,
    aliases: ["\u0E23\u0E1E.\u0E2D\u0E38\u0E15\u0E23\u0E14\u0E34\u0E15\u0E16\u0E4C", "\u0E2D\u0E38\u0E15\u0E23\u0E14\u0E34\u0E15\u0E16\u0E4C", "uttaradit"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-sukhothai",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E2A\u0E38\u0E42\u0E02\u0E17\u0E31\u0E22",
    nameEn: "Sukhothai Hospital",
    province: "\u0E2A\u0E38\u0E42\u0E02\u0E17\u0E31\u0E22",
    region: "North",
    lat: 17.0089,
    lng: 99.8244,
    aliases: ["\u0E23\u0E1E.\u0E2A\u0E38\u0E42\u0E02\u0E17\u0E31\u0E22", "\u0E2A\u0E38\u0E42\u0E02\u0E17\u0E31\u0E22", "sukhothai"],
    type: "Public General"
  },
  {
    id: "hosp-phetchabun",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E40\u0E1E\u0E0A\u0E23\u0E1A\u0E39\u0E23\u0E13\u0E4C",
    nameEn: "Phetchabun Hospital",
    province: "\u0E40\u0E1E\u0E0A\u0E23\u0E1A\u0E39\u0E23\u0E13\u0E4C",
    region: "North",
    lat: 16.425,
    lng: 101.1583,
    aliases: ["\u0E23\u0E1E.\u0E40\u0E1E\u0E0A\u0E23\u0E1A\u0E39\u0E23\u0E13\u0E4C", "\u0E40\u0E1E\u0E0A\u0E23\u0E1A\u0E39\u0E23\u0E13\u0E4C", "phetchabun"],
    type: "Public Tertiary"
  },
  // --- Northeastern (ภาคอีสาน) ---
  {
    id: "hosp-srinagarind",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E28\u0E23\u0E35\u0E19\u0E04\u0E23\u0E34\u0E19\u0E17\u0E23\u0E4C \u0E21\u0E2B\u0E32\u0E27\u0E34\u0E17\u0E22\u0E32\u0E25\u0E31\u0E22\u0E02\u0E2D\u0E19\u0E41\u0E01\u0E48\u0E19",
    nameEn: "Srinagarind Hospital (KKU)",
    province: "\u0E02\u0E2D\u0E19\u0E41\u0E01\u0E48\u0E19",
    region: "Northeastern",
    lat: 16.4678,
    lng: 102.8278,
    aliases: ["\u0E28\u0E23\u0E35\u0E19\u0E04\u0E23\u0E34\u0E19\u0E17\u0E23\u0E4C", "\u0E21\u0E02.", "kku", "srinagarind hospital", "\u0E21.\u0E02\u0E2D\u0E19\u0E41\u0E01\u0E48\u0E19", "\u0E23\u0E1E.\u0E28\u0E23\u0E35\u0E19\u0E04\u0E23\u0E34\u0E19\u0E17\u0E23\u0E4C"],
    type: "University"
  },
  {
    id: "hosp-khonkaen",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E02\u0E2D\u0E19\u0E41\u0E01\u0E48\u0E19",
    nameEn: "Khon Kaen Hospital",
    province: "\u0E02\u0E2D\u0E19\u0E41\u0E01\u0E48\u0E19",
    region: "Northeastern",
    lat: 16.4322,
    lng: 102.8433,
    aliases: ["\u0E23\u0E1E.\u0E02\u0E2D\u0E19\u0E41\u0E01\u0E48\u0E19", "\u0E02\u0E2D\u0E19\u0E41\u0E01\u0E48\u0E19", "khonkaen hospital", "khon kaen"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-korat-maharat",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E21\u0E2B\u0E32\u0E23\u0E32\u0E0A\u0E19\u0E04\u0E23\u0E23\u0E32\u0E0A\u0E2A\u0E35\u0E21\u0E32",
    nameEn: "Maharat Nakhon Ratchasima Hospital",
    province: "\u0E19\u0E04\u0E23\u0E23\u0E32\u0E0A\u0E2A\u0E35\u0E21\u0E32",
    region: "Northeastern",
    lat: 14.9819,
    lng: 102.1097,
    aliases: ["\u0E21\u0E2B\u0E32\u0E23\u0E32\u0E0A\u0E19\u0E04\u0E23\u0E23\u0E32\u0E0A\u0E2A\u0E35\u0E21\u0E32", "\u0E23\u0E1E.\u0E21\u0E2B\u0E32\u0E23\u0E32\u0E0A\u0E42\u0E04\u0E23\u0E32\u0E0A", "\u0E42\u0E04\u0E23\u0E32\u0E0A", "\u0E19\u0E04\u0E23\u0E23\u0E32\u0E0A\u0E2A\u0E35\u0E21\u0E32", "korat", "nakhon ratchasima"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-ubon",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E2A\u0E23\u0E23\u0E1E\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E1B\u0E23\u0E30\u0E2A\u0E07\u0E04\u0E4C \u0E2D\u0E38\u0E1A\u0E25\u0E23\u0E32\u0E0A\u0E18\u0E32\u0E19\u0E35",
    nameEn: "Sapphasitthiprasong Hospital",
    province: "\u0E2D\u0E38\u0E1A\u0E25\u0E23\u0E32\u0E0A\u0E18\u0E32\u0E19\u0E35",
    region: "Northeastern",
    lat: 15.2289,
    lng: 104.8583,
    aliases: ["\u0E2A\u0E23\u0E23\u0E1E\u0E2A\u0E34\u0E17\u0E18\u0E34\u0E1B\u0E23\u0E30\u0E2A\u0E07\u0E04\u0E4C", "\u0E23\u0E1E.\u0E2D\u0E38\u0E1A\u0E25", "\u0E2D\u0E38\u0E1A\u0E25\u0E23\u0E32\u0E0A\u0E18\u0E32\u0E19\u0E35", "ubon ratchathani", "ubon"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-kuchinarai",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E2A\u0E21\u0E40\u0E14\u0E47\u0E08\u0E1E\u0E23\u0E30\u0E22\u0E38\u0E1E\u0E23\u0E32\u0E0A\u0E01\u0E38\u0E09\u0E34\u0E19\u0E32\u0E23\u0E32\u0E22\u0E13\u0E4C",
    nameEn: "Kuchinarai Crown Prince Hospital",
    province: "\u0E01\u0E32\u0E2C\u0E2A\u0E34\u0E19\u0E18\u0E38\u0E4C",
    region: "Northeastern",
    lat: 16.5361,
    lng: 104.0531,
    aliases: ["\u0E01\u0E38\u0E09\u0E34\u0E19\u0E32\u0E23\u0E32\u0E22\u0E13\u0E4C", "\u0E23\u0E1E.\u0E01\u0E38\u0E09\u0E34\u0E19\u0E32\u0E23\u0E32\u0E22\u0E13\u0E4C", "kuchinarai", "kuchinarai crown prince", "kuchinarai crown prince hospital", "\u0E2A\u0E21\u0E40\u0E14\u0E47\u0E08\u0E1E\u0E23\u0E30\u0E22\u0E38\u0E1E\u0E23\u0E32\u0E0A\u0E01\u0E38\u0E09\u0E34\u0E19\u0E32\u0E23\u0E32\u0E22\u0E13\u0E4C"],
    type: "Public General"
  },
  {
    id: "hosp-udorn",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E2D\u0E38\u0E14\u0E23\u0E18\u0E32\u0E19\u0E35",
    nameEn: "Udon Thani Hospital",
    province: "\u0E2D\u0E38\u0E14\u0E23\u0E18\u0E32\u0E19\u0E35",
    region: "Northeastern",
    lat: 17.4103,
    lng: 102.7844,
    aliases: ["\u0E23\u0E1E.\u0E2D\u0E38\u0E14\u0E23\u0E18\u0E32\u0E19\u0E35", "\u0E2D\u0E38\u0E14\u0E23\u0E18\u0E32\u0E19\u0E35", "udon thani", "udon"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-roiet",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E23\u0E49\u0E2D\u0E22\u0E40\u0E2D\u0E47\u0E14",
    nameEn: "Roi Et Hospital",
    province: "\u0E23\u0E49\u0E2D\u0E22\u0E40\u0E2D\u0E47\u0E14",
    region: "Northeastern",
    lat: 16.0536,
    lng: 103.655,
    aliases: ["\u0E23\u0E1E.\u0E23\u0E49\u0E2D\u0E22\u0E40\u0E2D\u0E47\u0E14", "\u0E23\u0E49\u0E2D\u0E22\u0E40\u0E2D\u0E47\u0E14", "roi et"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-surin",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E2A\u0E38\u0E23\u0E34\u0E19\u0E17\u0E23\u0E4C",
    nameEn: "Surin Hospital",
    province: "\u0E2A\u0E38\u0E23\u0E34\u0E19\u0E17\u0E23\u0E4C",
    region: "Northeastern",
    lat: 14.8819,
    lng: 103.4936,
    aliases: ["\u0E23\u0E1E.\u0E2A\u0E38\u0E23\u0E34\u0E19\u0E17\u0E23\u0E4C", "\u0E2A\u0E38\u0E23\u0E34\u0E19\u0E17\u0E23\u0E4C", "surin hospital"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-buriram",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E1A\u0E38\u0E23\u0E35\u0E23\u0E31\u0E21\u0E22\u0E4C",
    nameEn: "Buriram Hospital",
    province: "\u0E1A\u0E38\u0E23\u0E35\u0E23\u0E31\u0E21\u0E22\u0E4C",
    region: "Northeastern",
    lat: 14.995,
    lng: 103.1039,
    aliases: ["\u0E23\u0E1E.\u0E1A\u0E38\u0E23\u0E35\u0E23\u0E31\u0E21\u0E22\u0E4C", "\u0E1A\u0E38\u0E23\u0E35\u0E23\u0E31\u0E21\u0E22\u0E4C", "buriram"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-sakonnakhon",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E2A\u0E01\u0E25\u0E19\u0E04\u0E23",
    nameEn: "Sakon Nakhon Hospital",
    province: "\u0E2A\u0E01\u0E25\u0E19\u0E04\u0E23",
    region: "Northeastern",
    lat: 17.1556,
    lng: 104.1486,
    aliases: ["\u0E23\u0E1E.\u0E2A\u0E01\u0E25\u0E19\u0E04\u0E23", "\u0E2A\u0E01\u0E25\u0E19\u0E04\u0E23", "sakon nakhon"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-nakhonphanom",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E19\u0E04\u0E23\u0E1E\u0E19\u0E21",
    nameEn: "Nakhon Phanom Hospital",
    province: "\u0E19\u0E04\u0E23\u0E1E\u0E19\u0E21",
    region: "Northeastern",
    lat: 17.3986,
    lng: 104.7833,
    aliases: ["\u0E23\u0E1E.\u0E19\u0E04\u0E23\u0E1E\u0E19\u0E21", "\u0E19\u0E04\u0E23\u0E1E\u0E19\u0E21", "nakhon phanom"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-chaiyaphum",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E0A\u0E31\u0E22\u0E20\u0E39\u0E21\u0E34",
    nameEn: "Chaiyaphum Hospital",
    province: "\u0E0A\u0E31\u0E22\u0E20\u0E39\u0E21\u0E34",
    region: "Northeastern",
    lat: 15.8064,
    lng: 102.0317,
    aliases: ["\u0E23\u0E1E.\u0E0A\u0E31\u0E22\u0E20\u0E39\u0E21\u0E34", "\u0E0A\u0E31\u0E22\u0E20\u0E39\u0E21\u0E34", "chaiyaphum"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-kalasin",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E01\u0E32\u0E2C\u0E2A\u0E34\u0E19\u0E18\u0E38\u0E4C",
    nameEn: "Kalasin Hospital",
    province: "\u0E01\u0E32\u0E2C\u0E2A\u0E34\u0E19\u0E18\u0E38\u0E4C",
    region: "Northeastern",
    lat: 16.4328,
    lng: 103.5067,
    aliases: ["\u0E23\u0E1E.\u0E01\u0E32\u0E2C\u0E2A\u0E34\u0E19\u0E18\u0E38\u0E4C", "\u0E01\u0E32\u0E2C\u0E2A\u0E34\u0E19\u0E18\u0E38\u0E4C", "kalasin"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-mahasarakham",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E21\u0E2B\u0E32\u0E2A\u0E32\u0E23\u0E04\u0E32\u0E21",
    nameEn: "Maha Sarakham Hospital",
    province: "\u0E21\u0E2B\u0E32\u0E2A\u0E32\u0E23\u0E04\u0E32\u0E21",
    region: "Northeastern",
    lat: 16.185,
    lng: 103.3006,
    aliases: ["\u0E23\u0E1E.\u0E21\u0E2B\u0E32\u0E2A\u0E32\u0E23\u0E04\u0E32\u0E21", "\u0E21\u0E2B\u0E32\u0E2A\u0E32\u0E23\u0E04\u0E32\u0E21", "maha sarakham"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-nongkhai",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E2B\u0E19\u0E2D\u0E07\u0E04\u0E32\u0E22",
    nameEn: "Nong Khai Hospital",
    province: "\u0E2B\u0E19\u0E2D\u0E07\u0E04\u0E32\u0E22",
    region: "Northeastern",
    lat: 17.8789,
    lng: 102.7417,
    aliases: ["\u0E23\u0E1E.\u0E2B\u0E19\u0E2D\u0E07\u0E04\u0E32\u0E22", "\u0E2B\u0E19\u0E2D\u0E07\u0E04\u0E32\u0E22", "nong khai"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-loei",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E40\u0E25\u0E22",
    nameEn: "Loei Hospital",
    province: "\u0E40\u0E25\u0E22",
    region: "Northeastern",
    lat: 17.4864,
    lng: 101.7283,
    aliases: ["\u0E23\u0E1E.\u0E40\u0E25\u0E22", "\u0E40\u0E25\u0E22", "loei"],
    type: "Public General"
  },
  {
    id: "hosp-sisaket",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E28\u0E23\u0E35\u0E2A\u0E30\u0E40\u0E01\u0E29",
    nameEn: "Sisaket Hospital",
    province: "\u0E28\u0E23\u0E35\u0E2A\u0E30\u0E40\u0E01\u0E29",
    region: "Northeastern",
    lat: 15.115,
    lng: 104.3256,
    aliases: ["\u0E23\u0E1E.\u0E28\u0E23\u0E35\u0E2A\u0E30\u0E40\u0E01\u0E29", "\u0E28\u0E23\u0E35\u0E2A\u0E30\u0E40\u0E01\u0E29", "sisaket"],
    type: "Public Tertiary"
  },
  // --- Eastern (ภาคตะวันออก) ---
  {
    id: "hosp-chonburi",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E0A\u0E25\u0E1A\u0E38\u0E23\u0E35",
    nameEn: "Chonburi Hospital",
    province: "\u0E0A\u0E25\u0E1A\u0E38\u0E23\u0E35",
    region: "Eastern",
    lat: 13.3517,
    lng: 100.9786,
    aliases: ["\u0E23\u0E1E.\u0E0A\u0E25\u0E1A\u0E38\u0E23\u0E35", "\u0E0A\u0E25\u0E1A\u0E38\u0E23\u0E35", "chonburi"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-sriracha-queen",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E2A\u0E21\u0E40\u0E14\u0E47\u0E08\u0E1E\u0E23\u0E30\u0E1A\u0E23\u0E21\u0E23\u0E32\u0E0A\u0E40\u0E17\u0E27\u0E35 \u0E13 \u0E28\u0E23\u0E35\u0E23\u0E32\u0E0A\u0E32",
    nameEn: "Queen Savang Vadhana Memorial Hospital (Sriracha)",
    province: "\u0E0A\u0E25\u0E1A\u0E38\u0E23\u0E35",
    region: "Eastern",
    lat: 13.1678,
    lng: 100.9256,
    aliases: ["\u0E2A\u0E21\u0E40\u0E14\u0E47\u0E08 \u0E13 \u0E28\u0E23\u0E35\u0E23\u0E32\u0E0A\u0E32", "\u0E23\u0E1E.\u0E2A\u0E21\u0E40\u0E14\u0E47\u0E08\u0E28\u0E23\u0E35\u0E23\u0E32\u0E0A\u0E32", "\u0E28\u0E23\u0E35\u0E23\u0E32\u0E0A\u0E32", "sriracha", "queen savang", "queen savang vadhana", "queen savang vadhana memorial hospital", "queen savang vadhana memorial", "savang vadhana"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-somdej-sirikit",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E2A\u0E21\u0E40\u0E14\u0E47\u0E08\u0E1E\u0E23\u0E30\u0E19\u0E32\u0E07\u0E40\u0E08\u0E49\u0E32\u0E2A\u0E34\u0E23\u0E34\u0E01\u0E34\u0E15\u0E34\u0E4C \u0E01\u0E23\u0E21\u0E41\u0E1E\u0E17\u0E22\u0E4C\u0E17\u0E2B\u0E32\u0E23\u0E40\u0E23\u0E37\u0E2D",
    nameEn: "Somdej Phra Nang Chao Sirikit Hospital",
    province: "\u0E0A\u0E25\u0E1A\u0E38\u0E23\u0E35",
    region: "Eastern",
    lat: 12.6975,
    lng: 100.9986,
    aliases: ["\u0E2A\u0E21\u0E40\u0E14\u0E47\u0E08\u0E1E\u0E23\u0E30\u0E19\u0E32\u0E07\u0E40\u0E08\u0E49\u0E32\u0E2A\u0E34\u0E23\u0E34\u0E01\u0E34\u0E15\u0E34\u0E4C", "somdejpranangchaosirikit", "somdej sirikit", "sirikit hospital sattahip", "\u0E2A\u0E31\u0E15\u0E2B\u0E35\u0E1A", "somdejpranangchaosirikit hospital", "sirikit sattahip", "somdej phra nang chao sirikit"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-rayong",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E23\u0E30\u0E22\u0E2D\u0E07",
    nameEn: "Rayong Hospital",
    province: "\u0E23\u0E30\u0E22\u0E2D\u0E07",
    region: "Eastern",
    lat: 12.6819,
    lng: 101.275,
    aliases: ["\u0E23\u0E1E.\u0E23\u0E30\u0E22\u0E2D\u0E07", "\u0E23\u0E30\u0E22\u0E2D\u0E07", "rayong"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-chanthaburi",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E1E\u0E23\u0E30\u0E1B\u0E01\u0E40\u0E01\u0E25\u0E49\u0E32 \u0E08\u0E31\u0E19\u0E17\u0E1A\u0E38\u0E23\u0E35",
    nameEn: "Phra Pokklao Hospital",
    province: "\u0E08\u0E31\u0E19\u0E17\u0E1A\u0E38\u0E23\u0E35",
    region: "Eastern",
    lat: 12.6083,
    lng: 102.1083,
    aliases: ["\u0E1E\u0E23\u0E30\u0E1B\u0E01\u0E40\u0E01\u0E25\u0E49\u0E32", "\u0E23\u0E1E.\u0E08\u0E31\u0E19\u0E17\u0E1A\u0E38\u0E23\u0E35", "\u0E08\u0E31\u0E19\u0E17\u0E1A\u0E38\u0E23\u0E35", "chanthaburi"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-prachinburi",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E40\u0E08\u0E49\u0E32\u0E1E\u0E23\u0E30\u0E22\u0E32\u0E2D\u0E20\u0E31\u0E22\u0E20\u0E39\u0E40\u0E1A\u0E28\u0E23",
    nameEn: "Chaophraya Abhaibhubejhr Hospital",
    province: "\u0E1B\u0E23\u0E32\u0E08\u0E35\u0E19\u0E1A\u0E38\u0E23\u0E35",
    region: "Eastern",
    lat: 14.0533,
    lng: 101.3739,
    aliases: ["\u0E2D\u0E20\u0E31\u0E22\u0E20\u0E39\u0E40\u0E1A\u0E28\u0E23", "\u0E23\u0E1E.\u0E1B\u0E23\u0E32\u0E08\u0E35\u0E19\u0E1A\u0E38\u0E23\u0E35", "\u0E1B\u0E23\u0E32\u0E08\u0E35\u0E19\u0E1A\u0E38\u0E23\u0E35", "abhaibhubejhr"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-chachoengsao",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E1E\u0E38\u0E17\u0E18\u0E42\u0E2A\u0E18\u0E23",
    nameEn: "Buddhasothorn Hospital",
    province: "\u0E09\u0E30\u0E40\u0E0A\u0E34\u0E07\u0E40\u0E17\u0E23\u0E32",
    region: "Eastern",
    lat: 13.6869,
    lng: 101.0717,
    aliases: ["\u0E1E\u0E38\u0E17\u0E18\u0E42\u0E2A\u0E18\u0E23", "\u0E23\u0E1E.\u0E09\u0E30\u0E40\u0E0A\u0E34\u0E07\u0E40\u0E17\u0E23\u0E32", "\u0E09\u0E30\u0E40\u0E0A\u0E34\u0E07\u0E40\u0E17\u0E23\u0E32", "\u0E41\u0E1B\u0E14\u0E23\u0E34\u0E49\u0E27", "chachoengsao"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-trat",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E15\u0E23\u0E32\u0E14",
    nameEn: "Trat Hospital",
    province: "\u0E15\u0E23\u0E32\u0E14",
    region: "Eastern",
    lat: 12.2436,
    lng: 102.515,
    aliases: ["\u0E23\u0E1E.\u0E15\u0E23\u0E32\u0E14", "\u0E15\u0E23\u0E32\u0E14", "trat"],
    type: "Public General"
  },
  {
    id: "hosp-sakaeo",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E2A\u0E21\u0E40\u0E14\u0E47\u0E08\u0E1E\u0E23\u0E30\u0E22\u0E38\u0E1E\u0E23\u0E32\u0E0A\u0E2A\u0E23\u0E30\u0E41\u0E01\u0E49\u0E27",
    nameEn: "Somdejphrayupparaj Sa Kaeo Hospital",
    province: "\u0E2A\u0E23\u0E30\u0E41\u0E01\u0E49\u0E27",
    region: "Eastern",
    lat: 13.8183,
    lng: 102.0667,
    aliases: ["\u0E2A\u0E21\u0E40\u0E14\u0E47\u0E08\u0E1E\u0E23\u0E30\u0E22\u0E38\u0E1E\u0E23\u0E32\u0E0A\u0E2A\u0E23\u0E30\u0E41\u0E01\u0E49\u0E27", "\u0E23\u0E1E.\u0E2A\u0E23\u0E30\u0E41\u0E01\u0E49\u0E27", "\u0E2A\u0E23\u0E30\u0E41\u0E01\u0E49\u0E27", "sa kaeo", "sakaeo", "sakaeo crown prince", "sakaeo crown prince hospital", "sa kaeo crown prince hospital", "somdejphrayupparaj sakaeo"],
    type: "Public General"
  },
  {
    id: "hosp-pattaya-bangkok",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E1E\u0E31\u0E17\u0E22\u0E32",
    nameEn: "Bangkok Hospital Pattaya",
    province: "\u0E0A\u0E25\u0E1A\u0E38\u0E23\u0E35",
    region: "Eastern",
    lat: 12.9519,
    lng: 100.9069,
    aliases: ["\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E1E\u0E31\u0E17\u0E22\u0E32", "bangkok hospital pattaya", "\u0E1E\u0E31\u0E17\u0E22\u0E32"],
    type: "Private"
  },
  // --- Western (ภาคตะวันตก) ---
  {
    id: "hosp-ratchaburi",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E23\u0E32\u0E0A\u0E1A\u0E38\u0E23\u0E35",
    nameEn: "Ratchaburi Hospital",
    province: "\u0E23\u0E32\u0E0A\u0E1A\u0E38\u0E23\u0E35",
    region: "Western",
    lat: 13.5386,
    lng: 99.8167,
    aliases: ["\u0E23\u0E1E.\u0E23\u0E32\u0E0A\u0E1A\u0E38\u0E23\u0E35", "\u0E23\u0E32\u0E0A\u0E1A\u0E38\u0E23\u0E35", "ratchaburi"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-kanchanaburi",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E1E\u0E2B\u0E25\u0E1E\u0E25\u0E1E\u0E22\u0E38\u0E2B\u0E40\u0E2A\u0E19\u0E32",
    nameEn: "Phaholpolpayuhasena Hospital",
    province: "\u0E01\u0E32\u0E0D\u0E08\u0E19\u0E1A\u0E38\u0E23\u0E35",
    region: "Western",
    lat: 14.0208,
    lng: 99.5392,
    aliases: ["\u0E1E\u0E2B\u0E25\u0E1E\u0E25\u0E1E\u0E22\u0E38\u0E2B\u0E40\u0E2A\u0E19\u0E32", "\u0E23\u0E1E.\u0E01\u0E32\u0E0D\u0E08\u0E19\u0E1A\u0E38\u0E23\u0E35", "\u0E01\u0E32\u0E0D\u0E08\u0E19\u0E1A\u0E38\u0E23\u0E35", "kanchanaburi"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-phetchaburi",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E1E\u0E23\u0E30\u0E08\u0E2D\u0E21\u0E40\u0E01\u0E25\u0E49\u0E32 \u0E08\u0E31\u0E07\u0E2B\u0E27\u0E31\u0E14\u0E40\u0E1E\u0E0A\u0E23\u0E1A\u0E38\u0E23\u0E35",
    nameEn: "Phra Chom Klao Hospital",
    province: "\u0E40\u0E1E\u0E0A\u0E23\u0E1A\u0E38\u0E23\u0E35",
    region: "Western",
    lat: 13.1119,
    lng: 99.9444,
    aliases: ["\u0E1E\u0E23\u0E30\u0E08\u0E2D\u0E21\u0E40\u0E01\u0E25\u0E49\u0E32", "\u0E23\u0E1E.\u0E40\u0E1E\u0E0A\u0E23\u0E1A\u0E38\u0E23\u0E35", "\u0E40\u0E1E\u0E0A\u0E23\u0E1A\u0E38\u0E23\u0E35", "phetchaburi"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-prachuap",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E1B\u0E23\u0E30\u0E08\u0E27\u0E1A\u0E04\u0E35\u0E23\u0E35\u0E02\u0E31\u0E19\u0E18\u0E4C",
    nameEn: "Prachuap Khiri Khan Hospital",
    province: "\u0E1B\u0E23\u0E30\u0E08\u0E27\u0E1A\u0E04\u0E35\u0E23\u0E35\u0E02\u0E31\u0E19\u0E18\u0E4C",
    region: "Western",
    lat: 11.8089,
    lng: 99.7967,
    aliases: ["\u0E23\u0E1E.\u0E1B\u0E23\u0E30\u0E08\u0E27\u0E1A", "\u0E1B\u0E23\u0E30\u0E08\u0E27\u0E1A\u0E04\u0E35\u0E23\u0E35\u0E02\u0E31\u0E19\u0E18\u0E4C", "prachuap khiri khan"],
    type: "Public General"
  },
  {
    id: "hosp-huahin",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E2B\u0E31\u0E27\u0E2B\u0E34\u0E19",
    nameEn: "Hua Hin Hospital",
    province: "\u0E1B\u0E23\u0E30\u0E08\u0E27\u0E1A\u0E04\u0E35\u0E23\u0E35\u0E02\u0E31\u0E19\u0E18\u0E4C",
    region: "Western",
    lat: 12.6108,
    lng: 99.9519,
    aliases: ["\u0E23\u0E1E.\u0E2B\u0E31\u0E27\u0E2B\u0E34\u0E19", "\u0E2B\u0E31\u0E27\u0E2B\u0E34\u0E19", "hua hin"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-banpong",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E1A\u0E49\u0E32\u0E19\u0E42\u0E1B\u0E48\u0E07",
    nameEn: "Ban Pong Hospital",
    province: "\u0E23\u0E32\u0E0A\u0E1A\u0E38\u0E23\u0E35",
    region: "Western",
    lat: 13.8119,
    lng: 99.8778,
    aliases: ["\u0E1A\u0E49\u0E32\u0E19\u0E42\u0E1B\u0E48\u0E07", "ban pong"],
    type: "Public General"
  },
  // --- South (ภาคใต้) ---
  {
    id: "hosp-psu-songkla",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E2A\u0E07\u0E02\u0E25\u0E32\u0E19\u0E04\u0E23\u0E34\u0E19\u0E17\u0E23\u0E4C (\u0E21\u0E2D.\u0E2B\u0E32\u0E14\u0E43\u0E2B\u0E0D\u0E48)",
    nameEn: "Songklanagarind Hospital (PSU)",
    province: "\u0E2A\u0E07\u0E02\u0E25\u0E32",
    region: "South",
    lat: 7.0086,
    lng: 100.4986,
    aliases: ["\u0E2A\u0E07\u0E02\u0E25\u0E32\u0E19\u0E04\u0E23\u0E34\u0E19\u0E17\u0E23\u0E4C", "\u0E21\u0E2D.", "psu", "\u0E21\u0E2D.\u0E2B\u0E32\u0E14\u0E43\u0E2B\u0E0D\u0E48", "songklanagarind", "\u0E23\u0E1E.\u0E21\u0E2D."],
    type: "University"
  },
  {
    id: "hosp-hatyai",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E2B\u0E32\u0E14\u0E43\u0E2B\u0E0D\u0E48",
    nameEn: "Hat Yai Hospital",
    province: "\u0E2A\u0E07\u0E02\u0E25\u0E32",
    region: "South",
    lat: 7.0147,
    lng: 100.4686,
    aliases: ["\u0E23\u0E1E.\u0E2B\u0E32\u0E14\u0E43\u0E2B\u0E0D\u0E48", "\u0E2B\u0E32\u0E14\u0E43\u0E2B\u0E0D\u0E48", "hat yai", "hatyai"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-vachira-phuket",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E27\u0E0A\u0E34\u0E23\u0E30\u0E20\u0E39\u0E40\u0E01\u0E47\u0E15",
    nameEn: "Vachira Phuket Hospital",
    province: "\u0E20\u0E39\u0E40\u0E01\u0E47\u0E15",
    region: "South",
    lat: 7.8967,
    lng: 98.3844,
    aliases: ["\u0E27\u0E0A\u0E34\u0E23\u0E30\u0E20\u0E39\u0E40\u0E01\u0E47\u0E15", "\u0E23\u0E1E.\u0E20\u0E39\u0E40\u0E01\u0E47\u0E15", "\u0E20\u0E39\u0E40\u0E01\u0E47\u0E15", "phuket", "vachira phuket"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-surat-thani",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E2A\u0E38\u0E23\u0E32\u0E29\u0E0E\u0E23\u0E4C\u0E18\u0E32\u0E19\u0E35",
    nameEn: "Surat Thani Hospital",
    province: "\u0E2A\u0E38\u0E23\u0E32\u0E29\u0E0E\u0E23\u0E4C\u0E18\u0E32\u0E19\u0E35",
    region: "South",
    lat: 9.1239,
    lng: 99.3197,
    aliases: ["\u0E23\u0E1E.\u0E2A\u0E38\u0E23\u0E32\u0E29\u0E0E\u0E23\u0E4C\u0E18\u0E32\u0E19\u0E35", "\u0E2A\u0E38\u0E23\u0E32\u0E29\u0E0E\u0E23\u0E4C\u0E18\u0E32\u0E19\u0E35", "surat thani", "surat"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-thaksin",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E17\u0E31\u0E01\u0E29\u0E34\u0E13",
    nameEn: "Thaksin Hospital",
    province: "\u0E2A\u0E38\u0E23\u0E32\u0E29\u0E0E\u0E23\u0E4C\u0E18\u0E32\u0E19\u0E35",
    region: "South",
    lat: 9.1417,
    lng: 99.3333,
    aliases: ["\u0E17\u0E31\u0E01\u0E29\u0E34\u0E13", "\u0E23\u0E1E.\u0E17\u0E31\u0E01\u0E29\u0E34\u0E13", "thaksin", "thaksin hospital"],
    type: "Private"
  },
  {
    id: "hosp-nakhon-si-thammarat",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E21\u0E2B\u0E32\u0E23\u0E32\u0E0A\u0E19\u0E04\u0E23\u0E28\u0E23\u0E35\u0E18\u0E23\u0E23\u0E21\u0E23\u0E32\u0E0A",
    nameEn: "Maharaj Nakhon Si Thammarat Hospital",
    province: "\u0E19\u0E04\u0E23\u0E28\u0E23\u0E35\u0E18\u0E23\u0E23\u0E21\u0E23\u0E32\u0E0A",
    region: "South",
    lat: 8.4117,
    lng: 99.965,
    aliases: ["\u0E21\u0E2B\u0E32\u0E23\u0E32\u0E0A\u0E19\u0E04\u0E23\u0E28\u0E23\u0E35\u0E18\u0E23\u0E23\u0E21\u0E23\u0E32\u0E0A", "\u0E23\u0E1E.\u0E19\u0E04\u0E23\u0E28\u0E23\u0E35\u0E18\u0E23\u0E23\u0E21\u0E23\u0E32\u0E0A", "\u0E19\u0E04\u0E23\u0E28\u0E23\u0E35\u0E18\u0E23\u0E23\u0E21\u0E23\u0E32\u0E0A", "nakhon si thammarat"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-trang",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E15\u0E23\u0E31\u0E07",
    nameEn: "Trang Hospital",
    province: "\u0E15\u0E23\u0E31\u0E07",
    region: "South",
    lat: 7.5583,
    lng: 99.6108,
    aliases: ["\u0E23\u0E1E.\u0E15\u0E23\u0E31\u0E07", "\u0E15\u0E23\u0E31\u0E07", "trang"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-krabi",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E01\u0E23\u0E30\u0E1A\u0E35\u0E48",
    nameEn: "Krabi Hospital",
    province: "\u0E01\u0E23\u0E30\u0E1A\u0E35\u0E48",
    region: "South",
    lat: 8.0725,
    lng: 98.91,
    aliases: ["\u0E23\u0E1E.\u0E01\u0E23\u0E30\u0E1A\u0E35\u0E48", "\u0E01\u0E23\u0E30\u0E1A\u0E35\u0E48", "krabi"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-chumphon",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E0A\u0E38\u0E21\u0E1E\u0E23\u0E40\u0E02\u0E15\u0E23\u0E2D\u0E38\u0E14\u0E21\u0E28\u0E31\u0E01\u0E14\u0E34\u0E4C",
    nameEn: "Chumphon Khet Udomsak Hospital",
    province: "\u0E0A\u0E38\u0E21\u0E1E\u0E23",
    region: "South",
    lat: 10.4939,
    lng: 99.1764,
    aliases: ["\u0E0A\u0E38\u0E21\u0E1E\u0E23\u0E40\u0E02\u0E15\u0E23\u0E2D\u0E38\u0E14\u0E21\u0E28\u0E31\u0E01\u0E14\u0E34\u0E4C", "\u0E23\u0E1E.\u0E0A\u0E38\u0E21\u0E1E\u0E23", "\u0E0A\u0E38\u0E21\u0E1E\u0E23", "chumphon"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-yala",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E22\u0E30\u0E25\u0E32",
    nameEn: "Yala Hospital",
    province: "\u0E22\u0E30\u0E25\u0E32",
    region: "South",
    lat: 6.5414,
    lng: 101.2828,
    aliases: ["\u0E23\u0E1E.\u0E22\u0E30\u0E25\u0E32", "\u0E22\u0E30\u0E25\u0E32", "yala"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-pattani",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E1B\u0E31\u0E15\u0E15\u0E32\u0E19\u0E35",
    nameEn: "Pattani Hospital",
    province: "\u0E1B\u0E31\u0E15\u0E15\u0E32\u0E19\u0E35",
    region: "South",
    lat: 6.8683,
    lng: 101.2508,
    aliases: ["\u0E23\u0E1E.\u0E1B\u0E31\u0E15\u0E15\u0E32\u0E19\u0E35", "\u0E1B\u0E31\u0E15\u0E15\u0E32\u0E19\u0E35", "pattani"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-narathiwat",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E19\u0E23\u0E32\u0E18\u0E34\u0E27\u0E32\u0E2A\u0E23\u0E32\u0E0A\u0E19\u0E04\u0E23\u0E34\u0E19\u0E17\u0E23\u0E4C",
    nameEn: "Naradhiwas Rajanagarindra Hospital",
    province: "\u0E19\u0E23\u0E32\u0E18\u0E34\u0E27\u0E32\u0E2A",
    region: "South",
    lat: 6.4258,
    lng: 101.8239,
    aliases: ["\u0E19\u0E23\u0E32\u0E18\u0E34\u0E27\u0E32\u0E2A\u0E23\u0E32\u0E0A\u0E19\u0E04\u0E23\u0E34\u0E19\u0E17\u0E23\u0E4C", "\u0E23\u0E1E.\u0E19\u0E23\u0E32\u0E18\u0E34\u0E27\u0E32\u0E2A", "\u0E19\u0E23\u0E32\u0E18\u0E34\u0E27\u0E32\u0E2A", "narathiwat"],
    type: "Public Tertiary"
  },
  {
    id: "hosp-phatthalung",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E1E\u0E31\u0E17\u0E25\u0E38\u0E07",
    nameEn: "Phatthalung Hospital",
    province: "\u0E1E\u0E31\u0E17\u0E25\u0E38\u0E07",
    region: "South",
    lat: 7.6186,
    lng: 100.0767,
    aliases: ["\u0E23\u0E1E.\u0E1E\u0E31\u0E17\u0E25\u0E38\u0E07", "\u0E1E\u0E31\u0E17\u0E25\u0E38\u0E07", "phatthalung"],
    type: "Public General"
  },
  {
    id: "hosp-satun",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E2A\u0E15\u0E39\u0E25",
    nameEn: "Satun Hospital",
    province: "\u0E2A\u0E15\u0E39\u0E25",
    region: "South",
    lat: 6.6189,
    lng: 100.0658,
    aliases: ["\u0E23\u0E1E.\u0E2A\u0E15\u0E39\u0E25", "\u0E2A\u0E15\u0E39\u0E25", "satun"],
    type: "Public General"
  },
  {
    id: "hosp-phangnga",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E1E\u0E31\u0E07\u0E07\u0E32",
    nameEn: "Phang Nga Hospital",
    province: "\u0E1E\u0E31\u0E07\u0E07\u0E32",
    region: "South",
    lat: 8.4489,
    lng: 98.5283,
    aliases: ["\u0E23\u0E1E.\u0E1E\u0E31\u0E07\u0E07\u0E32", "\u0E1E\u0E31\u0E07\u0E07\u0E32", "phangnga"],
    type: "Public General"
  },
  {
    id: "hosp-ranong",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E23\u0E30\u0E19\u0E2D\u0E07",
    nameEn: "Ranong Hospital",
    province: "\u0E23\u0E30\u0E19\u0E2D\u0E07",
    region: "South",
    lat: 9.9639,
    lng: 98.6367,
    aliases: ["\u0E23\u0E1E.\u0E23\u0E30\u0E19\u0E2D\u0E07", "\u0E23\u0E30\u0E19\u0E2D\u0E07", "ranong"],
    type: "Public General"
  },
  {
    id: "hosp-bangkok-phuket",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E20\u0E39\u0E40\u0E01\u0E47\u0E15",
    nameEn: "Bangkok Hospital Phuket",
    province: "\u0E20\u0E39\u0E40\u0E01\u0E47\u0E15",
    region: "South",
    lat: 7.8978,
    lng: 98.3686,
    aliases: ["\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E20\u0E39\u0E40\u0E01\u0E47\u0E15", "bangkok hospital phuket"],
    type: "Private"
  },
  {
    id: "hosp-bangkok-hatyai",
    name: "\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E2B\u0E32\u0E14\u0E43\u0E2B\u0E0D\u0E48",
    nameEn: "Bangkok Hospital Hat Yai",
    province: "\u0E2A\u0E07\u0E02\u0E25\u0E32",
    region: "South",
    lat: 7.0097,
    lng: 100.4853,
    aliases: ["\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E2B\u0E32\u0E14\u0E43\u0E2B\u0E0D\u0E48", "bangkok hospital hatyai"],
    type: "Private"
  }
];
var PROVINCE_COORDINATES = {
  // Central & Bangkok Metropolitan
  "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23": { lat: 13.7563, lng: 100.5018, region: "Central", provinceTh: "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23" },
  "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E": { lat: 13.7563, lng: 100.5018, region: "Central", provinceTh: "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23" },
  "bangkok": { lat: 13.7563, lng: 100.5018, region: "Central", provinceTh: "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23" },
  "bkk": { lat: 13.7563, lng: 100.5018, region: "Central", provinceTh: "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23" },
  "\u0E19\u0E19\u0E17\u0E1A\u0E38\u0E23\u0E35": { lat: 13.8591, lng: 100.5217, region: "Central", provinceTh: "\u0E19\u0E19\u0E17\u0E1A\u0E38\u0E23\u0E35" },
  "nonthaburi": { lat: 13.8591, lng: 100.5217, region: "Central", provinceTh: "\u0E19\u0E19\u0E17\u0E1A\u0E38\u0E23\u0E35" },
  "\u0E1B\u0E17\u0E38\u0E21\u0E18\u0E32\u0E19\u0E35": { lat: 14.0208, lng: 100.525, region: "Central", provinceTh: "\u0E1B\u0E17\u0E38\u0E21\u0E18\u0E32\u0E19\u0E35" },
  "pathum thani": { lat: 14.0208, lng: 100.525, region: "Central", provinceTh: "\u0E1B\u0E17\u0E38\u0E21\u0E18\u0E32\u0E19\u0E35" },
  "pathumthani": { lat: 14.0208, lng: 100.525, region: "Central", provinceTh: "\u0E1B\u0E17\u0E38\u0E21\u0E18\u0E32\u0E19\u0E35" },
  "\u0E23\u0E31\u0E07\u0E2A\u0E34\u0E15": { lat: 13.9892, lng: 100.6178, region: "Central", provinceTh: "\u0E1B\u0E17\u0E38\u0E21\u0E18\u0E32\u0E19\u0E35" },
  "rangsit": { lat: 13.9892, lng: 100.6178, region: "Central", provinceTh: "\u0E1B\u0E17\u0E38\u0E21\u0E18\u0E32\u0E19\u0E35" },
  "\u0E2A\u0E21\u0E38\u0E17\u0E23\u0E1B\u0E23\u0E32\u0E01\u0E32\u0E23": { lat: 13.5991, lng: 100.5967, region: "Central", provinceTh: "\u0E2A\u0E21\u0E38\u0E17\u0E23\u0E1B\u0E23\u0E32\u0E01\u0E32\u0E23" },
  "samut prakan": { lat: 13.5991, lng: 100.5967, region: "Central", provinceTh: "\u0E2A\u0E21\u0E38\u0E17\u0E23\u0E1B\u0E23\u0E32\u0E01\u0E32\u0E23" },
  "samutprakan": { lat: 13.5991, lng: 100.5967, region: "Central", provinceTh: "\u0E2A\u0E21\u0E38\u0E17\u0E23\u0E1B\u0E23\u0E32\u0E01\u0E32\u0E23" },
  "\u0E2A\u0E21\u0E38\u0E17\u0E23\u0E2A\u0E32\u0E04\u0E23": { lat: 13.5475, lng: 100.2742, region: "Central", provinceTh: "\u0E2A\u0E21\u0E38\u0E17\u0E23\u0E2A\u0E32\u0E04\u0E23" },
  "samut sakhon": { lat: 13.5475, lng: 100.2742, region: "Central", provinceTh: "\u0E2A\u0E21\u0E38\u0E17\u0E23\u0E2A\u0E32\u0E04\u0E23" },
  "samutsakhon": { lat: 13.5475, lng: 100.2742, region: "Central", provinceTh: "\u0E2A\u0E21\u0E38\u0E17\u0E23\u0E2A\u0E32\u0E04\u0E23" },
  "\u0E2A\u0E21\u0E38\u0E17\u0E23\u0E2A\u0E07\u0E04\u0E23\u0E32\u0E21": { lat: 13.4111, lng: 99.9989, region: "Central", provinceTh: "\u0E2A\u0E21\u0E38\u0E17\u0E23\u0E2A\u0E07\u0E04\u0E23\u0E32\u0E21" },
  "samut songkhram": { lat: 13.4111, lng: 99.9989, region: "Central", provinceTh: "\u0E2A\u0E21\u0E38\u0E17\u0E23\u0E2A\u0E07\u0E04\u0E23\u0E32\u0E21" },
  "samutsongkhram": { lat: 13.4111, lng: 99.9989, region: "Central", provinceTh: "\u0E2A\u0E21\u0E38\u0E17\u0E23\u0E2A\u0E07\u0E04\u0E23\u0E32\u0E21" },
  "\u0E19\u0E04\u0E23\u0E1B\u0E10\u0E21": { lat: 13.8196, lng: 100.0601, region: "Central", provinceTh: "\u0E19\u0E04\u0E23\u0E1B\u0E10\u0E21" },
  "nakhon pathom": { lat: 13.8196, lng: 100.0601, region: "Central", provinceTh: "\u0E19\u0E04\u0E23\u0E1B\u0E10\u0E21" },
  "nakhonpathom": { lat: 13.8196, lng: 100.0601, region: "Central", provinceTh: "\u0E19\u0E04\u0E23\u0E1B\u0E10\u0E21" },
  "\u0E1E\u0E23\u0E30\u0E19\u0E04\u0E23\u0E28\u0E23\u0E35\u0E2D\u0E22\u0E38\u0E18\u0E22\u0E32": { lat: 14.3532, lng: 100.5684, region: "Central", provinceTh: "\u0E1E\u0E23\u0E30\u0E19\u0E04\u0E23\u0E28\u0E23\u0E35\u0E2D\u0E22\u0E38\u0E18\u0E22\u0E32" },
  "\u0E2D\u0E22\u0E38\u0E18\u0E22\u0E32": { lat: 14.3532, lng: 100.5684, region: "Central", provinceTh: "\u0E1E\u0E23\u0E30\u0E19\u0E04\u0E23\u0E28\u0E23\u0E35\u0E2D\u0E22\u0E38\u0E18\u0E22\u0E32" },
  "ayutthaya": { lat: 14.3532, lng: 100.5684, region: "Central", provinceTh: "\u0E1E\u0E23\u0E30\u0E19\u0E04\u0E23\u0E28\u0E23\u0E35\u0E2D\u0E22\u0E38\u0E18\u0E22\u0E32" },
  "\u0E2D\u0E48\u0E32\u0E07\u0E17\u0E2D\u0E07": { lat: 14.5889, lng: 100.4578, region: "Central", provinceTh: "\u0E2D\u0E48\u0E32\u0E07\u0E17\u0E2D\u0E07" },
  "ang thong": { lat: 14.5889, lng: 100.4578, region: "Central", provinceTh: "\u0E2D\u0E48\u0E32\u0E07\u0E17\u0E2D\u0E07" },
  "angthong": { lat: 14.5889, lng: 100.4578, region: "Central", provinceTh: "\u0E2D\u0E48\u0E32\u0E07\u0E17\u0E2D\u0E07" },
  "\u0E2A\u0E34\u0E07\u0E2B\u0E4C\u0E1A\u0E38\u0E23\u0E35": { lat: 14.8906, lng: 100.3986, region: "Central", provinceTh: "\u0E2A\u0E34\u0E07\u0E2B\u0E4C\u0E1A\u0E38\u0E23\u0E35" },
  "sing buri": { lat: 14.8906, lng: 100.3986, region: "Central", provinceTh: "\u0E2A\u0E34\u0E07\u0E2B\u0E4C\u0E1A\u0E38\u0E23\u0E35" },
  "singburi": { lat: 14.8906, lng: 100.3986, region: "Central", provinceTh: "\u0E2A\u0E34\u0E07\u0E2B\u0E4C\u0E1A\u0E38\u0E23\u0E35" },
  "\u0E0A\u0E31\u0E22\u0E19\u0E32\u0E17": { lat: 15.1856, lng: 100.1283, region: "Central", provinceTh: "\u0E0A\u0E31\u0E22\u0E19\u0E32\u0E17" },
  "chainat": { lat: 15.1856, lng: 100.1283, region: "Central", provinceTh: "\u0E0A\u0E31\u0E22\u0E19\u0E32\u0E17" },
  "chai nat": { lat: 15.1856, lng: 100.1283, region: "Central", provinceTh: "\u0E0A\u0E31\u0E22\u0E19\u0E32\u0E17" },
  "\u0E25\u0E1E\u0E1A\u0E38\u0E23\u0E35": { lat: 14.8083, lng: 100.6653, region: "Central", provinceTh: "\u0E25\u0E1E\u0E1A\u0E38\u0E23\u0E35" },
  "lopburi": { lat: 14.8083, lng: 100.6653, region: "Central", provinceTh: "\u0E25\u0E1E\u0E1A\u0E38\u0E23\u0E35" },
  "lop buri": { lat: 14.8083, lng: 100.6653, region: "Central", provinceTh: "\u0E25\u0E1E\u0E1A\u0E38\u0E23\u0E35" },
  "\u0E2A\u0E23\u0E30\u0E1A\u0E38\u0E23\u0E35": { lat: 14.5264, lng: 100.9169, region: "Central", provinceTh: "\u0E2A\u0E23\u0E30\u0E1A\u0E38\u0E23\u0E35" },
  "saraburi": { lat: 14.5264, lng: 100.9169, region: "Central", provinceTh: "\u0E2A\u0E23\u0E30\u0E1A\u0E38\u0E23\u0E35" },
  "\u0E19\u0E04\u0E23\u0E19\u0E32\u0E22\u0E01": { lat: 14.2069, lng: 101.2131, region: "Central", provinceTh: "\u0E19\u0E04\u0E23\u0E19\u0E32\u0E22\u0E01" },
  "nakhon nayok": { lat: 14.2069, lng: 101.2131, region: "Central", provinceTh: "\u0E19\u0E04\u0E23\u0E19\u0E32\u0E22\u0E01" },
  "\u0E2A\u0E38\u0E1E\u0E23\u0E23\u0E13\u0E1A\u0E38\u0E23\u0E35": { lat: 14.4744, lng: 100.1178, region: "Central", provinceTh: "\u0E2A\u0E38\u0E1E\u0E23\u0E23\u0E13\u0E1A\u0E38\u0E23\u0E35" },
  "suphan buri": { lat: 14.4744, lng: 100.1178, region: "Central", provinceTh: "\u0E2A\u0E38\u0E1E\u0E23\u0E23\u0E13\u0E1A\u0E38\u0E23\u0E35" },
  "suphanburi": { lat: 14.4744, lng: 100.1178, region: "Central", provinceTh: "\u0E2A\u0E38\u0E1E\u0E23\u0E23\u0E13\u0E1A\u0E38\u0E23\u0E35" },
  "\u0E19\u0E04\u0E23\u0E2A\u0E27\u0E23\u0E23\u0E04\u0E4C": { lat: 15.6989, lng: 100.1267, region: "Central", provinceTh: "\u0E19\u0E04\u0E23\u0E2A\u0E27\u0E23\u0E23\u0E04\u0E4C" },
  "nakhon sawan": { lat: 15.6989, lng: 100.1267, region: "Central", provinceTh: "\u0E19\u0E04\u0E23\u0E2A\u0E27\u0E23\u0E23\u0E04\u0E4C" },
  "nakhonsawan": { lat: 15.6989, lng: 100.1267, region: "Central", provinceTh: "\u0E19\u0E04\u0E23\u0E2A\u0E27\u0E23\u0E23\u0E04\u0E4C" },
  "\u0E2D\u0E38\u0E17\u0E31\u0E22\u0E18\u0E32\u0E19\u0E35": { lat: 15.38, lng: 100.0272, region: "Central", provinceTh: "\u0E2D\u0E38\u0E17\u0E31\u0E22\u0E18\u0E32\u0E19\u0E35" },
  "uthai thani": { lat: 15.38, lng: 100.0272, region: "Central", provinceTh: "\u0E2D\u0E38\u0E17\u0E31\u0E22\u0E18\u0E32\u0E19\u0E35" },
  // North
  "\u0E41\u0E21\u0E48\u0E2A\u0E2D\u0E14": { lat: 16.7167, lng: 98.5744, region: "North", provinceTh: "\u0E15\u0E32\u0E01" },
  "mae sot": { lat: 16.7167, lng: 98.5744, region: "North", provinceTh: "\u0E15\u0E32\u0E01" },
  "maesot": { lat: 16.7167, lng: 98.5744, region: "North", provinceTh: "\u0E15\u0E32\u0E01" },
  "measot": { lat: 16.7167, lng: 98.5744, region: "North", provinceTh: "\u0E15\u0E32\u0E01" },
  "\u0E15\u0E32\u0E01": { lat: 16.8833, lng: 99.1239, region: "North", provinceTh: "\u0E15\u0E32\u0E01" },
  "tak": { lat: 16.8833, lng: 99.1239, region: "North", provinceTh: "\u0E15\u0E32\u0E01" },
  "\u0E08\u0E2D\u0E21\u0E17\u0E2D\u0E07": { lat: 18.4239, lng: 98.6811, region: "North", provinceTh: "\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E43\u0E2B\u0E21\u0E48" },
  "chomthong": { lat: 18.4239, lng: 98.6811, region: "North", provinceTh: "\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E43\u0E2B\u0E21\u0E48" },
  "chom thong": { lat: 18.4239, lng: 98.6811, region: "North", provinceTh: "\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E43\u0E2B\u0E21\u0E48" },
  "\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E43\u0E2B\u0E21\u0E48": { lat: 18.7883, lng: 98.9853, region: "North", provinceTh: "\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E43\u0E2B\u0E21\u0E48" },
  "chiang mai": { lat: 18.7883, lng: 98.9853, region: "North", provinceTh: "\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E43\u0E2B\u0E21\u0E48" },
  "chiangmai": { lat: 18.7883, lng: 98.9853, region: "North", provinceTh: "\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E43\u0E2B\u0E21\u0E48" },
  "\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E23\u0E32\u0E22": { lat: 19.9105, lng: 99.8406, region: "North", provinceTh: "\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E23\u0E32\u0E22" },
  "chiang rai": { lat: 19.9105, lng: 99.8406, region: "North", provinceTh: "\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E23\u0E32\u0E22" },
  "chiangrai": { lat: 19.9105, lng: 99.8406, region: "North", provinceTh: "\u0E40\u0E0A\u0E35\u0E22\u0E07\u0E23\u0E32\u0E22" },
  "\u0E25\u0E33\u0E1B\u0E32\u0E07": { lat: 18.2917, lng: 99.5083, region: "North", provinceTh: "\u0E25\u0E33\u0E1B\u0E32\u0E07" },
  "lampang": { lat: 18.2917, lng: 99.5083, region: "North", provinceTh: "\u0E25\u0E33\u0E1B\u0E32\u0E07" },
  "\u0E25\u0E33\u0E1E\u0E39\u0E19": { lat: 18.5744, lng: 99.0069, region: "North", provinceTh: "\u0E25\u0E33\u0E1E\u0E39\u0E19" },
  "lamphun": { lat: 18.5744, lng: 99.0069, region: "North", provinceTh: "\u0E25\u0E33\u0E1E\u0E39\u0E19" },
  "\u0E41\u0E21\u0E48\u0E2E\u0E48\u0E2D\u0E07\u0E2A\u0E2D\u0E19": { lat: 19.3006, lng: 97.9656, region: "North", provinceTh: "\u0E41\u0E21\u0E48\u0E2E\u0E48\u0E2D\u0E07\u0E2A\u0E2D\u0E19" },
  "mae hong son": { lat: 19.3006, lng: 97.9656, region: "North", provinceTh: "\u0E41\u0E21\u0E48\u0E2E\u0E48\u0E2D\u0E07\u0E2A\u0E2D\u0E19" },
  "\u0E19\u0E48\u0E32\u0E19": { lat: 18.785, lng: 100.7783, region: "North", provinceTh: "\u0E19\u0E48\u0E32\u0E19" },
  "nan": { lat: 18.785, lng: 100.7783, region: "North", provinceTh: "\u0E19\u0E48\u0E32\u0E19" },
  "\u0E1E\u0E30\u0E40\u0E22\u0E32": { lat: 19.1678, lng: 99.9022, region: "North", provinceTh: "\u0E1E\u0E30\u0E40\u0E22\u0E32" },
  "phayao": { lat: 19.1678, lng: 99.9022, region: "North", provinceTh: "\u0E1E\u0E30\u0E40\u0E22\u0E32" },
  "\u0E41\u0E1E\u0E23\u0E48": { lat: 18.1436, lng: 100.1417, region: "North", provinceTh: "\u0E41\u0E1E\u0E23\u0E48" },
  "phrae": { lat: 18.1436, lng: 100.1417, region: "North", provinceTh: "\u0E41\u0E1E\u0E23\u0E48" },
  "\u0E2D\u0E38\u0E15\u0E23\u0E14\u0E34\u0E15\u0E16\u0E4C": { lat: 17.6256, lng: 100.0983, region: "North", provinceTh: "\u0E2D\u0E38\u0E15\u0E23\u0E14\u0E34\u0E15\u0E16\u0E4C" },
  "uttaradit": { lat: 17.6256, lng: 100.0983, region: "North", provinceTh: "\u0E2D\u0E38\u0E15\u0E23\u0E14\u0E34\u0E15\u0E16\u0E4C" },
  "\u0E2A\u0E38\u0E42\u0E02\u0E17\u0E31\u0E22": { lat: 17.0089, lng: 99.8244, region: "North", provinceTh: "\u0E2A\u0E38\u0E42\u0E02\u0E17\u0E31\u0E22" },
  "sukhothai": { lat: 17.0089, lng: 99.8244, region: "North", provinceTh: "\u0E2A\u0E38\u0E42\u0E02\u0E17\u0E31\u0E22" },
  "\u0E1E\u0E34\u0E29\u0E13\u0E38\u0E42\u0E25\u0E01": { lat: 16.8156, lng: 100.2639, region: "North", provinceTh: "\u0E1E\u0E34\u0E29\u0E13\u0E38\u0E42\u0E25\u0E01" },
  "phitsanulok": { lat: 16.8156, lng: 100.2639, region: "North", provinceTh: "\u0E1E\u0E34\u0E29\u0E13\u0E38\u0E42\u0E25\u0E01" },
  "\u0E1E\u0E34\u0E08\u0E34\u0E15\u0E23": { lat: 16.4417, lng: 100.3472, region: "North", provinceTh: "\u0E1E\u0E34\u0E08\u0E34\u0E15\u0E23" },
  "phichit": { lat: 16.4417, lng: 100.3472, region: "North", provinceTh: "\u0E1E\u0E34\u0E08\u0E34\u0E15\u0E23" },
  "\u0E40\u0E1E\u0E0A\u0E23\u0E1A\u0E39\u0E23\u0E13\u0E4C": { lat: 16.425, lng: 101.1583, region: "North", provinceTh: "\u0E40\u0E1E\u0E0A\u0E23\u0E1A\u0E39\u0E23\u0E13\u0E4C" },
  "phetchabun": { lat: 16.425, lng: 101.1583, region: "North", provinceTh: "\u0E40\u0E1E\u0E0A\u0E23\u0E1A\u0E39\u0E23\u0E13\u0E4C" },
  // Isan (Northeastern)
  "\u0E02\u0E2D\u0E19\u0E41\u0E01\u0E48\u0E19": { lat: 16.4322, lng: 102.8236, region: "Northeastern", provinceTh: "\u0E02\u0E2D\u0E19\u0E41\u0E01\u0E48\u0E19" },
  "khon kaen": { lat: 16.4322, lng: 102.8236, region: "Northeastern", provinceTh: "\u0E02\u0E2D\u0E19\u0E41\u0E01\u0E48\u0E19" },
  "khonkaen": { lat: 16.4322, lng: 102.8236, region: "Northeastern", provinceTh: "\u0E02\u0E2D\u0E19\u0E41\u0E01\u0E48\u0E19" },
  "\u0E19\u0E04\u0E23\u0E23\u0E32\u0E0A\u0E2A\u0E35\u0E21\u0E32": { lat: 14.9799, lng: 102.0978, region: "Northeastern", provinceTh: "\u0E19\u0E04\u0E23\u0E23\u0E32\u0E0A\u0E2A\u0E35\u0E21\u0E32" },
  "\u0E42\u0E04\u0E23\u0E32\u0E0A": { lat: 14.9799, lng: 102.0978, region: "Northeastern", provinceTh: "\u0E19\u0E04\u0E23\u0E23\u0E32\u0E0A\u0E2A\u0E35\u0E21\u0E32" },
  "korat": { lat: 14.9799, lng: 102.0978, region: "Northeastern", provinceTh: "\u0E19\u0E04\u0E23\u0E23\u0E32\u0E0A\u0E2A\u0E35\u0E21\u0E32" },
  "nakhon ratchasima": { lat: 14.9799, lng: 102.0978, region: "Northeastern", provinceTh: "\u0E19\u0E04\u0E23\u0E23\u0E32\u0E0A\u0E2A\u0E35\u0E21\u0E32" },
  "\u0E2D\u0E38\u0E14\u0E23\u0E18\u0E32\u0E19\u0E35": { lat: 17.4103, lng: 102.7844, region: "Northeastern", provinceTh: "\u0E2D\u0E38\u0E14\u0E23\u0E18\u0E32\u0E19\u0E35" },
  "udon thani": { lat: 17.4103, lng: 102.7844, region: "Northeastern", provinceTh: "\u0E2D\u0E38\u0E14\u0E23\u0E18\u0E32\u0E19\u0E35" },
  "udon": { lat: 17.4103, lng: 102.7844, region: "Northeastern", provinceTh: "\u0E2D\u0E38\u0E14\u0E23\u0E18\u0E32\u0E19\u0E35" },
  "\u0E2D\u0E38\u0E1A\u0E25\u0E23\u0E32\u0E0A\u0E18\u0E32\u0E19\u0E35": { lat: 15.2289, lng: 104.8583, region: "Northeastern", provinceTh: "\u0E2D\u0E38\u0E1A\u0E25\u0E23\u0E32\u0E0A\u0E18\u0E32\u0E19\u0E35" },
  "ubon ratchathani": { lat: 15.2289, lng: 104.8583, region: "Northeastern", provinceTh: "\u0E2D\u0E38\u0E1A\u0E25\u0E23\u0E32\u0E0A\u0E18\u0E32\u0E19\u0E35" },
  "ubon": { lat: 15.2289, lng: 104.8583, region: "Northeastern", provinceTh: "\u0E2D\u0E38\u0E1A\u0E25\u0E23\u0E32\u0E0A\u0E18\u0E32\u0E19\u0E35" },
  "\u0E23\u0E49\u0E2D\u0E22\u0E40\u0E2D\u0E47\u0E14": { lat: 16.0536, lng: 103.655, region: "Northeastern", provinceTh: "\u0E23\u0E49\u0E2D\u0E22\u0E40\u0E2D\u0E47\u0E14" },
  "roi et": { lat: 16.0536, lng: 103.655, region: "Northeastern", provinceTh: "\u0E23\u0E49\u0E2D\u0E22\u0E40\u0E2D\u0E47\u0E14" },
  "\u0E2A\u0E38\u0E23\u0E34\u0E19\u0E17\u0E23\u0E4C": { lat: 14.8819, lng: 103.4936, region: "Northeastern", provinceTh: "\u0E2A\u0E38\u0E23\u0E34\u0E19\u0E17\u0E23\u0E4C" },
  "surin": { lat: 14.8819, lng: 103.4936, region: "Northeastern", provinceTh: "\u0E2A\u0E38\u0E23\u0E34\u0E19\u0E17\u0E23\u0E4C" },
  "\u0E1A\u0E38\u0E23\u0E35\u0E23\u0E31\u0E21\u0E22\u0E4C": { lat: 14.995, lng: 103.1039, region: "Northeastern", provinceTh: "\u0E1A\u0E38\u0E23\u0E35\u0E23\u0E31\u0E21\u0E22\u0E4C" },
  "buriram": { lat: 14.995, lng: 103.1039, region: "Northeastern", provinceTh: "\u0E1A\u0E38\u0E23\u0E35\u0E23\u0E31\u0E21\u0E22\u0E4C" },
  "\u0E28\u0E23\u0E35\u0E2A\u0E30\u0E40\u0E01\u0E29": { lat: 15.115, lng: 104.3256, region: "Northeastern", provinceTh: "\u0E28\u0E23\u0E35\u0E2A\u0E30\u0E40\u0E01\u0E29" },
  "sisaket": { lat: 15.115, lng: 104.3256, region: "Northeastern", provinceTh: "\u0E28\u0E23\u0E35\u0E2A\u0E30\u0E40\u0E01\u0E29" },
  "\u0E2A\u0E01\u0E25\u0E19\u0E04\u0E23": { lat: 17.1556, lng: 104.1486, region: "Northeastern", provinceTh: "\u0E2A\u0E01\u0E25\u0E19\u0E04\u0E23" },
  "sakon nakhon": { lat: 17.1556, lng: 104.1486, region: "Northeastern", provinceTh: "\u0E2A\u0E01\u0E25\u0E19\u0E04\u0E23" },
  "\u0E19\u0E04\u0E23\u0E1E\u0E19\u0E21": { lat: 17.3986, lng: 104.7833, region: "Northeastern", provinceTh: "\u0E19\u0E04\u0E23\u0E1E\u0E19\u0E21" },
  "nakhon phanom": { lat: 17.3986, lng: 104.7833, region: "Northeastern", provinceTh: "\u0E19\u0E04\u0E23\u0E1E\u0E19\u0E21" },
  "\u0E2B\u0E19\u0E2D\u0E07\u0E04\u0E32\u0E22": { lat: 17.8789, lng: 102.7417, region: "Northeastern", provinceTh: "\u0E2B\u0E19\u0E2D\u0E07\u0E04\u0E32\u0E22" },
  "nong khai": { lat: 17.8789, lng: 102.7417, region: "Northeastern", provinceTh: "\u0E2B\u0E19\u0E2D\u0E07\u0E04\u0E32\u0E22" },
  "\u0E2B\u0E19\u0E2D\u0E07\u0E1A\u0E31\u0E27\u0E25\u0E33\u0E20\u0E39": { lat: 17.2036, lng: 102.4411, region: "Northeastern", provinceTh: "\u0E2B\u0E19\u0E2D\u0E07\u0E1A\u0E31\u0E27\u0E25\u0E33\u0E20\u0E39" },
  "nong bua lamphu": { lat: 17.2036, lng: 102.4411, region: "Northeastern", provinceTh: "\u0E2B\u0E19\u0E2D\u0E07\u0E1A\u0E31\u0E27\u0E25\u0E33\u0E20\u0E39" },
  "\u0E40\u0E25\u0E22": { lat: 17.4864, lng: 101.7283, region: "Northeastern", provinceTh: "\u0E40\u0E25\u0E22" },
  "loei": { lat: 17.4864, lng: 101.7283, region: "Northeastern", provinceTh: "\u0E40\u0E25\u0E22" },
  "\u0E01\u0E32\u0E2C\u0E2A\u0E34\u0E19\u0E18\u0E38\u0E4C": { lat: 16.4328, lng: 103.5067, region: "Northeastern", provinceTh: "\u0E01\u0E32\u0E2C\u0E2A\u0E34\u0E19\u0E18\u0E38\u0E4C" },
  "kalasin": { lat: 16.4328, lng: 103.5067, region: "Northeastern", provinceTh: "\u0E01\u0E32\u0E2C\u0E2A\u0E34\u0E19\u0E18\u0E38\u0E4C" },
  "\u0E01\u0E38\u0E09\u0E34\u0E19\u0E32\u0E23\u0E32\u0E22\u0E13\u0E4C": { lat: 16.5361, lng: 104.0531, region: "Northeastern", provinceTh: "\u0E01\u0E32\u0E2C\u0E2A\u0E34\u0E19\u0E18\u0E38\u0E4C" },
  "kuchinarai": { lat: 16.5361, lng: 104.0531, region: "Northeastern", provinceTh: "\u0E01\u0E32\u0E2C\u0E2A\u0E34\u0E19\u0E18\u0E38\u0E4C" },
  "\u0E21\u0E2B\u0E32\u0E2A\u0E32\u0E23\u0E04\u0E32\u0E21": { lat: 16.185, lng: 103.3006, region: "Northeastern", provinceTh: "\u0E21\u0E2B\u0E32\u0E2A\u0E32\u0E23\u0E04\u0E32\u0E21" },
  "mahasarakham": { lat: 16.185, lng: 103.3006, region: "Northeastern", provinceTh: "\u0E21\u0E2B\u0E32\u0E2A\u0E32\u0E23\u0E04\u0E32\u0E21" },
  "\u0E0A\u0E31\u0E22\u0E20\u0E39\u0E21\u0E34": { lat: 15.8064, lng: 102.0317, region: "Northeastern", provinceTh: "\u0E0A\u0E31\u0E22\u0E20\u0E39\u0E21\u0E34" },
  "chaiyaphum": { lat: 15.8064, lng: 102.0317, region: "Northeastern", provinceTh: "\u0E0A\u0E31\u0E22\u0E20\u0E39\u0E21\u0E34" },
  "\u0E22\u0E42\u0E2A\u0E18\u0E23": { lat: 15.7925, lng: 104.145, region: "Northeastern", provinceTh: "\u0E22\u0E42\u0E2A\u0E18\u0E23" },
  "yasothon": { lat: 15.7925, lng: 104.145, region: "Northeastern", provinceTh: "\u0E22\u0E42\u0E2A\u0E18\u0E23" },
  "\u0E2D\u0E33\u0E19\u0E32\u0E08\u0E40\u0E08\u0E23\u0E34\u0E0D": { lat: 15.8589, lng: 104.6297, region: "Northeastern", provinceTh: "\u0E2D\u0E33\u0E19\u0E32\u0E08\u0E40\u0E08\u0E23\u0E34\u0E0D" },
  "amnat charoen": { lat: 15.8589, lng: 104.6297, region: "Northeastern", provinceTh: "\u0E2D\u0E33\u0E19\u0E32\u0E08\u0E40\u0E08\u0E23\u0E34\u0E0D" },
  "\u0E21\u0E38\u0E01\u0E14\u0E32\u0E2B\u0E32\u0E23": { lat: 16.5433, lng: 104.7233, region: "Northeastern", provinceTh: "\u0E21\u0E38\u0E01\u0E14\u0E32\u0E2B\u0E32\u0E23" },
  "mukdahan": { lat: 16.5433, lng: 104.7233, region: "Northeastern", provinceTh: "\u0E21\u0E38\u0E01\u0E14\u0E32\u0E2B\u0E32\u0E23" },
  "\u0E1A\u0E36\u0E07\u0E01\u0E32\u0E2C": { lat: 18.3619, lng: 103.6533, region: "Northeastern", provinceTh: "\u0E1A\u0E36\u0E07\u0E01\u0E32\u0E2C" },
  "bueng kan": { lat: 18.3619, lng: 103.6533, region: "Northeastern", provinceTh: "\u0E1A\u0E36\u0E07\u0E01\u0E32\u0E2C" },
  // Eastern
  "\u0E28\u0E23\u0E35\u0E23\u0E32\u0E0A\u0E32": { lat: 13.1678, lng: 100.9236, region: "Eastern", provinceTh: "\u0E0A\u0E25\u0E1A\u0E38\u0E23\u0E35" },
  "sriracha": { lat: 13.1678, lng: 100.9236, region: "Eastern", provinceTh: "\u0E0A\u0E25\u0E1A\u0E38\u0E23\u0E35" },
  "si racha": { lat: 13.1678, lng: 100.9236, region: "Eastern", provinceTh: "\u0E0A\u0E25\u0E1A\u0E38\u0E23\u0E35" },
  "\u0E2A\u0E31\u0E15\u0E2B\u0E35\u0E1A": { lat: 12.6975, lng: 100.9986, region: "Eastern", provinceTh: "\u0E0A\u0E25\u0E1A\u0E38\u0E23\u0E35" },
  "sattahip": { lat: 12.6975, lng: 100.9986, region: "Eastern", provinceTh: "\u0E0A\u0E25\u0E1A\u0E38\u0E23\u0E35" },
  "\u0E1E\u0E31\u0E17\u0E22\u0E32": { lat: 12.9276, lng: 100.8771, region: "Eastern", provinceTh: "\u0E0A\u0E25\u0E1A\u0E38\u0E23\u0E35" },
  "pattaya": { lat: 12.9276, lng: 100.8771, region: "Eastern", provinceTh: "\u0E0A\u0E25\u0E1A\u0E38\u0E23\u0E35" },
  "\u0E0A\u0E25\u0E1A\u0E38\u0E23\u0E35": { lat: 13.3611, lng: 100.9847, region: "Eastern", provinceTh: "\u0E0A\u0E25\u0E1A\u0E38\u0E23\u0E35" },
  "chonburi": { lat: 13.3611, lng: 100.9847, region: "Eastern", provinceTh: "\u0E0A\u0E25\u0E1A\u0E38\u0E23\u0E35" },
  "chon buri": { lat: 13.3611, lng: 100.9847, region: "Eastern", provinceTh: "\u0E0A\u0E25\u0E1A\u0E38\u0E23\u0E35" },
  "\u0E23\u0E30\u0E22\u0E2D\u0E07": { lat: 12.6819, lng: 101.275, region: "Eastern", provinceTh: "\u0E23\u0E30\u0E22\u0E2D\u0E07" },
  "rayong": { lat: 12.6819, lng: 101.275, region: "Eastern", provinceTh: "\u0E23\u0E30\u0E22\u0E2D\u0E07" },
  "\u0E08\u0E31\u0E19\u0E17\u0E1A\u0E38\u0E23\u0E35": { lat: 12.6083, lng: 102.1083, region: "Eastern", provinceTh: "\u0E08\u0E31\u0E19\u0E17\u0E1A\u0E38\u0E23\u0E35" },
  "chanthaburi": { lat: 12.6083, lng: 102.1083, region: "Eastern", provinceTh: "\u0E08\u0E31\u0E19\u0E17\u0E1A\u0E38\u0E23\u0E35" },
  "\u0E15\u0E23\u0E32\u0E14": { lat: 12.2436, lng: 102.515, region: "Eastern", provinceTh: "\u0E15\u0E23\u0E32\u0E14" },
  "trat": { lat: 12.2436, lng: 102.515, region: "Eastern", provinceTh: "\u0E15\u0E23\u0E32\u0E14" },
  "\u0E09\u0E30\u0E40\u0E0A\u0E34\u0E07\u0E40\u0E17\u0E23\u0E32": { lat: 13.6869, lng: 101.0717, region: "Eastern", provinceTh: "\u0E09\u0E30\u0E40\u0E0A\u0E34\u0E07\u0E40\u0E17\u0E23\u0E32" },
  "\u0E41\u0E1B\u0E14\u0E23\u0E34\u0E49\u0E27": { lat: 13.6869, lng: 101.0717, region: "Eastern", provinceTh: "\u0E09\u0E30\u0E40\u0E0A\u0E34\u0E07\u0E40\u0E17\u0E23\u0E32" },
  "chachoengsao": { lat: 13.6869, lng: 101.0717, region: "Eastern", provinceTh: "\u0E09\u0E30\u0E40\u0E0A\u0E34\u0E07\u0E40\u0E17\u0E23\u0E32" },
  "\u0E1B\u0E23\u0E32\u0E08\u0E35\u0E19\u0E1A\u0E38\u0E23\u0E35": { lat: 14.0533, lng: 101.3739, region: "Eastern", provinceTh: "\u0E1B\u0E23\u0E32\u0E08\u0E35\u0E19\u0E1A\u0E38\u0E23\u0E35" },
  "prachinburi": { lat: 14.0533, lng: 101.3739, region: "Eastern", provinceTh: "\u0E1B\u0E23\u0E32\u0E08\u0E35\u0E19\u0E1A\u0E38\u0E23\u0E35" },
  "\u0E2A\u0E23\u0E30\u0E41\u0E01\u0E49\u0E27": { lat: 13.8183, lng: 102.0667, region: "Eastern", provinceTh: "\u0E2A\u0E23\u0E30\u0E41\u0E01\u0E49\u0E27" },
  "sakaeo": { lat: 13.8183, lng: 102.0667, region: "Eastern", provinceTh: "\u0E2A\u0E23\u0E30\u0E41\u0E01\u0E49\u0E27" },
  "sa kaeo": { lat: 13.8183, lng: 102.0667, region: "Eastern", provinceTh: "\u0E2A\u0E23\u0E30\u0E41\u0E01\u0E49\u0E27" },
  // Western
  "\u0E23\u0E32\u0E0A\u0E1A\u0E38\u0E23\u0E35": { lat: 13.5386, lng: 99.8167, region: "Western", provinceTh: "\u0E23\u0E32\u0E0A\u0E1A\u0E38\u0E23\u0E35" },
  "ratchaburi": { lat: 13.5386, lng: 99.8167, region: "Western", provinceTh: "\u0E23\u0E32\u0E0A\u0E1A\u0E38\u0E23\u0E35" },
  "\u0E01\u0E32\u0E0D\u0E08\u0E19\u0E1A\u0E38\u0E23\u0E35": { lat: 14.0208, lng: 99.5392, region: "Western", provinceTh: "\u0E01\u0E32\u0E0D\u0E08\u0E19\u0E1A\u0E38\u0E23\u0E35" },
  "kanchanaburi": { lat: 14.0208, lng: 99.5392, region: "Western", provinceTh: "\u0E01\u0E32\u0E0D\u0E08\u0E19\u0E1A\u0E38\u0E23\u0E35" },
  "\u0E40\u0E1E\u0E0A\u0E23\u0E1A\u0E38\u0E23\u0E35": { lat: 13.1119, lng: 99.9444, region: "Western", provinceTh: "\u0E40\u0E1E\u0E0A\u0E23\u0E1A\u0E38\u0E23\u0E35" },
  "phetchaburi": { lat: 13.1119, lng: 99.9444, region: "Western", provinceTh: "\u0E40\u0E1E\u0E0A\u0E23\u0E1A\u0E38\u0E23\u0E35" },
  "\u0E1B\u0E23\u0E30\u0E08\u0E27\u0E1A\u0E04\u0E35\u0E23\u0E35\u0E02\u0E31\u0E19\u0E18\u0E4C": { lat: 11.8089, lng: 99.7967, region: "Western", provinceTh: "\u0E1B\u0E23\u0E30\u0E08\u0E27\u0E1A\u0E04\u0E35\u0E23\u0E35\u0E02\u0E31\u0E19\u0E18\u0E4C" },
  "\u0E1B\u0E23\u0E30\u0E08\u0E27\u0E1A": { lat: 11.8089, lng: 99.7967, region: "Western", provinceTh: "\u0E1B\u0E23\u0E30\u0E08\u0E27\u0E1A\u0E04\u0E35\u0E23\u0E35\u0E02\u0E31\u0E19\u0E18\u0E4C" },
  "prachuap": { lat: 11.8089, lng: 99.7967, region: "Western", provinceTh: "\u0E1B\u0E23\u0E30\u0E08\u0E27\u0E1A\u0E04\u0E35\u0E23\u0E35\u0E02\u0E31\u0E19\u0E18\u0E4C" },
  "\u0E2B\u0E31\u0E27\u0E2B\u0E34\u0E19": { lat: 12.5684, lng: 99.9576, region: "Western", provinceTh: "\u0E1B\u0E23\u0E30\u0E08\u0E27\u0E1A\u0E04\u0E35\u0E23\u0E35\u0E02\u0E31\u0E19\u0E18\u0E4C" },
  "hua hin": { lat: 12.5684, lng: 99.9576, region: "Western", provinceTh: "\u0E1B\u0E23\u0E30\u0E08\u0E27\u0E1A\u0E04\u0E35\u0E23\u0E35\u0E02\u0E31\u0E19\u0E18\u0E4C" },
  "huahin": { lat: 12.5684, lng: 99.9576, region: "Western", provinceTh: "\u0E1B\u0E23\u0E30\u0E08\u0E27\u0E1A\u0E04\u0E35\u0E23\u0E35\u0E02\u0E31\u0E19\u0E18\u0E4C" },
  // Southern
  "\u0E2B\u0E32\u0E14\u0E43\u0E2B\u0E0D\u0E48": { lat: 7.0083, lng: 100.4767, region: "South", provinceTh: "\u0E2A\u0E07\u0E02\u0E25\u0E32" },
  "hat yai": { lat: 7.0083, lng: 100.4767, region: "South", provinceTh: "\u0E2A\u0E07\u0E02\u0E25\u0E32" },
  "hatyai": { lat: 7.0083, lng: 100.4767, region: "South", provinceTh: "\u0E2A\u0E07\u0E02\u0E25\u0E32" },
  "\u0E2A\u0E07\u0E02\u0E25\u0E32": { lat: 7.1897, lng: 100.5954, region: "South", provinceTh: "\u0E2A\u0E07\u0E02\u0E25\u0E32" },
  "songkhla": { lat: 7.1897, lng: 100.5954, region: "South", provinceTh: "\u0E2A\u0E07\u0E02\u0E25\u0E32" },
  "\u0E20\u0E39\u0E40\u0E01\u0E47\u0E15": { lat: 7.8804, lng: 98.3923, region: "South", provinceTh: "\u0E20\u0E39\u0E40\u0E01\u0E47\u0E15" },
  "phuket": { lat: 7.8804, lng: 98.3923, region: "South", provinceTh: "\u0E20\u0E39\u0E40\u0E01\u0E47\u0E15" },
  "\u0E2A\u0E21\u0E38\u0E22": { lat: 9.5357, lng: 100.0633, region: "South", provinceTh: "\u0E2A\u0E38\u0E23\u0E32\u0E29\u0E0E\u0E23\u0E4C\u0E18\u0E32\u0E19\u0E35" },
  "samui": { lat: 9.5357, lng: 100.0633, region: "South", provinceTh: "\u0E2A\u0E38\u0E23\u0E32\u0E29\u0E0E\u0E23\u0E4C\u0E18\u0E32\u0E19\u0E35" },
  "\u0E2A\u0E38\u0E23\u0E32\u0E29\u0E0E\u0E23\u0E4C\u0E18\u0E32\u0E19\u0E35": { lat: 9.1239, lng: 99.3197, region: "South", provinceTh: "\u0E2A\u0E38\u0E23\u0E32\u0E29\u0E0E\u0E23\u0E4C\u0E18\u0E32\u0E19\u0E35" },
  "surat thani": { lat: 9.1239, lng: 99.3197, region: "South", provinceTh: "\u0E2A\u0E38\u0E23\u0E32\u0E29\u0E0E\u0E23\u0E4C\u0E18\u0E32\u0E19\u0E35" },
  "surat": { lat: 9.1239, lng: 99.3197, region: "South", provinceTh: "\u0E2A\u0E38\u0E23\u0E32\u0E29\u0E0E\u0E23\u0E4C\u0E18\u0E32\u0E19\u0E35" },
  "\u0E19\u0E04\u0E23\u0E28\u0E23\u0E35\u0E18\u0E23\u0E23\u0E21\u0E23\u0E32\u0E0A": { lat: 8.4117, lng: 99.965, region: "South", provinceTh: "\u0E19\u0E04\u0E23\u0E28\u0E23\u0E35\u0E18\u0E23\u0E23\u0E21\u0E23\u0E32\u0E0A" },
  "nakhon si thammarat": { lat: 8.4117, lng: 99.965, region: "South", provinceTh: "\u0E19\u0E04\u0E23\u0E28\u0E23\u0E35\u0E18\u0E23\u0E23\u0E21\u0E23\u0E32\u0E0A" },
  "\u0E15\u0E23\u0E31\u0E07": { lat: 7.5583, lng: 99.6108, region: "South", provinceTh: "\u0E15\u0E23\u0E31\u0E07" },
  "trang": { lat: 7.5583, lng: 99.6108, region: "South", provinceTh: "\u0E15\u0E23\u0E31\u0E07" },
  "\u0E01\u0E23\u0E30\u0E1A\u0E35\u0E48": { lat: 8.0725, lng: 98.91, region: "South", provinceTh: "\u0E01\u0E23\u0E30\u0E1A\u0E35\u0E48" },
  "krabi": { lat: 8.0725, lng: 98.91, region: "South", provinceTh: "\u0E01\u0E23\u0E30\u0E1A\u0E35\u0E48" },
  "\u0E0A\u0E38\u0E21\u0E1E\u0E23": { lat: 10.4939, lng: 99.1764, region: "South", provinceTh: "\u0E0A\u0E38\u0E21\u0E1E\u0E23" },
  "chumphon": { lat: 10.4939, lng: 99.1764, region: "South", provinceTh: "\u0E0A\u0E38\u0E21\u0E1E\u0E23" },
  "\u0E1E\u0E31\u0E07\u0E07\u0E32": { lat: 8.4489, lng: 98.5283, region: "South", provinceTh: "\u0E1E\u0E31\u0E07\u0E07\u0E32" },
  "phang nga": { lat: 8.4489, lng: 98.5283, region: "South", provinceTh: "\u0E1E\u0E31\u0E07\u0E07\u0E32" },
  "phangnga": { lat: 8.4489, lng: 98.5283, region: "South", provinceTh: "\u0E1E\u0E31\u0E07\u0E07\u0E32" },
  "\u0E23\u0E30\u0E19\u0E2D\u0E07": { lat: 9.9639, lng: 98.6367, region: "South", provinceTh: "\u0E23\u0E30\u0E19\u0E2D\u0E07" },
  "ranong": { lat: 9.9639, lng: 98.6367, region: "South", provinceTh: "\u0E23\u0E30\u0E19\u0E2D\u0E07" },
  "\u0E1E\u0E31\u0E17\u0E25\u0E38\u0E07": { lat: 7.6186, lng: 100.0767, region: "South", provinceTh: "\u0E1E\u0E31\u0E17\u0E25\u0E38\u0E07" },
  "phatthalung": { lat: 7.6186, lng: 100.0767, region: "South", provinceTh: "\u0E1E\u0E31\u0E17\u0E25\u0E38\u0E07" },
  "\u0E2A\u0E15\u0E39\u0E25": { lat: 6.6189, lng: 100.0658, region: "South", provinceTh: "\u0E2A\u0E15\u0E39\u0E25" },
  "satun": { lat: 6.6189, lng: 100.0658, region: "South", provinceTh: "\u0E2A\u0E15\u0E39\u0E25" },
  "\u0E1B\u0E31\u0E15\u0E15\u0E32\u0E19\u0E35": { lat: 6.8683, lng: 101.2508, region: "South", provinceTh: "\u0E1B\u0E31\u0E15\u0E15\u0E32\u0E19\u0E35" },
  "pattani": { lat: 6.8683, lng: 101.2508, region: "South", provinceTh: "\u0E1B\u0E31\u0E15\u0E15\u0E32\u0E19\u0E35" },
  "\u0E22\u0E30\u0E25\u0E32": { lat: 6.5414, lng: 101.2828, region: "South", provinceTh: "\u0E22\u0E30\u0E25\u0E32" },
  "yala": { lat: 6.5414, lng: 101.2828, region: "South", provinceTh: "\u0E22\u0E30\u0E25\u0E32" },
  "\u0E19\u0E23\u0E32\u0E18\u0E34\u0E27\u0E32\u0E2A": { lat: 6.4258, lng: 101.8239, region: "South", provinceTh: "\u0E19\u0E23\u0E32\u0E18\u0E34\u0E27\u0E32\u0E2A" },
  "narathiwat": { lat: 6.4258, lng: 101.8239, region: "South", provinceTh: "\u0E19\u0E23\u0E32\u0E18\u0E34\u0E27\u0E32\u0E2A" }
};
function getHashOffset(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const factorX = hash % 100 / 100 - 0.5;
  const factorY = (hash >> 8) % 100 / 100 - 0.5;
  return {
    dLat: factorX * 0.035,
    // ~3-4 km spread max
    dLng: factorY * 0.035
  };
}
function generateUniqueHospitalSlug(prefix, name) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash << 5) - hash + name.charCodeAt(i) | 0;
  }
  const clean = name.toLowerCase().replace(/[^a-z0-9\u0E00-\u0E7F]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 45);
  return `${prefix}-${clean || "hosp"}-${Math.abs(hash).toString(36)}`;
}
function normalizeHospitalSearchText(str) {
  return str.toLowerCase().replace(/measot/g, "maesot").replace(/mae\s*sot/g, "maesot").replace(/thammasart/g, "thammasat").replace(/somdej/g, "somdet").replace(/praputthalertla/g, "phutthaloetla").replace(/sakaeo/g, "sakaeo").replace(/crown\s*prince/g, "yupparaj").replace(/\b(hospital|hosp|centre|center|rph|รพ\.|โรงพยาบาล)\b/gi, "").replace(/[^a-z0-9\u0E00-\u0E7F]/g, "").trim();
}
function resolveHospitalLocation(hospitalName, hintRegion) {
  const cleanName = hospitalName.trim();
  const lowerName = cleanName.toLowerCase();
  const normalizedInput = normalizeHospitalSearchText(cleanName);
  for (const h of THAILAND_HOSPITALS_DATABASE) {
    if (h.name.toLowerCase() === lowerName || h.nameEn && h.nameEn.toLowerCase() === lowerName) {
      return h;
    }
    if (h.aliases) {
      for (const a of h.aliases) {
        const lowerAlias = a.toLowerCase();
        if (lowerName === lowerAlias || lowerName.includes(lowerAlias) || lowerAlias.includes(lowerName)) {
          return h;
        }
      }
    }
  }
  if (normalizedInput.length >= 3) {
    for (const h of THAILAND_HOSPITALS_DATABASE) {
      const normName = normalizeHospitalSearchText(h.name);
      const normEn = h.nameEn ? normalizeHospitalSearchText(h.nameEn) : "";
      if (normName && (normName === normalizedInput || normName.length >= 4 && (normalizedInput.includes(normName) || normName.includes(normalizedInput))) || normEn && (normEn === normalizedInput || normEn.length >= 4 && (normalizedInput.includes(normEn) || normEn.includes(normalizedInput)))) {
        return h;
      }
      if (h.aliases) {
        for (const a of h.aliases) {
          const normAlias = normalizeHospitalSearchText(a);
          if (normAlias && normAlias.length >= 4 && (normAlias === normalizedInput || normalizedInput.includes(normAlias) || normAlias.includes(normalizedInput))) {
            return h;
          }
        }
      }
    }
  }
  const sortedProvinceKeys = Object.keys(PROVINCE_COORDINATES).sort((a, b) => b.length - a.length);
  for (const provKey of sortedProvinceKeys) {
    const provLower = provKey.toLowerCase();
    if (lowerName.includes(provLower) || normalizedInput.length >= 4 && normalizedInput.includes(provLower.replace(/[^a-z0-9\u0E00-\u0E7F]/g, ""))) {
      const info = PROVINCE_COORDINATES[provKey];
      const offset2 = getHashOffset(cleanName);
      return {
        id: generateUniqueHospitalSlug(`hosp-prov-${info.provinceTh || provKey}`, cleanName),
        name: cleanName,
        province: info.provinceTh || provKey,
        region: hintRegion || info.region,
        lat: Number((info.lat + offset2.dLat).toFixed(5)),
        lng: Number((info.lng + offset2.dLng).toFixed(5)),
        type: "Public General"
      };
    }
  }
  let regionKey = "Central";
  if (hintRegion) {
    const norm = hintRegion.toLowerCase().trim();
    if (norm.includes("north") && !norm.includes("east")) regionKey = "North";
    else if (norm.includes("northeast") || norm.includes("isan") || norm.includes("\u0E2D\u0E35\u0E2A\u0E32\u0E19")) regionKey = "Northeastern";
    else if (norm.includes("south") || norm.includes("\u0E43\u0E15\u0E49")) regionKey = "South";
    else if (norm.includes("east") && !norm.includes("north")) regionKey = "Eastern";
    else if (norm.includes("west") || norm.includes("\u0E15\u0E01")) regionKey = "Western";
    else regionKey = "Central";
  }
  const regionInfo = THAILAND_REGIONS[regionKey] || THAILAND_REGIONS.Central;
  const offset = getHashOffset(cleanName);
  return {
    id: generateUniqueHospitalSlug("hosp-auto", cleanName),
    name: cleanName,
    province: regionKey === "Central" ? "\u0E01\u0E23\u0E38\u0E07\u0E40\u0E17\u0E1E\u0E21\u0E2B\u0E32\u0E19\u0E04\u0E23" : regionInfo.nameTh,
    region: regionKey,
    lat: Number((regionInfo.center[0] + offset.dLat * 1.5).toFixed(5)),
    lng: Number((regionInfo.center[1] + offset.dLng * 1.5).toFixed(5)),
    type: "Public General"
  };
}

// serverApp.ts
var IS_VERCEL = Boolean(process.env.VERCEL);
var BRIDGE_CONFIG_FILE = IS_VERCEL ? import_path.default.join("/tmp", ".bridge-config.json") : import_path.default.join(process.cwd(), ".bridge-config.json");
var EMBEDDED_SPREADSHEET_ID = "1s2VkerbQ7y0BeHBcdtzkXtsxzn-VR6ZMw2l0p9NCiP8";
var EMBEDDED_PM_SPREADSHEET_ID = "1wBbN1127iViI_0pXZU2RUoVeuSxQfZsI0qoIgxaaO4s";
var EMBEDDED_CM_ONCALL_SPREADSHEET_ID = "19c9vJhO4qMdCP1O7rwWP_aUZyTqQrTwnzWWxtH7zDdE";
var EMBEDDED_SERVICE_ACCOUNT = {
  project_id: "gen-lang-client-0960472031",
  client_email: "serviceiis@gen-lang-client-0960472031.iam.gserviceaccount.com",
  private_key: [
    "-----BEGIN PRIVATE KEY-----",
    "MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQC154xi1HUjX/X+",
    "1o+CRqRH4E+SnzqGB4IAOS4bE133HovkgRg1QHp14Fhd3fFHEoO70qCc//4NtA6s",
    "9oBHsgFEkNWeVshGOnoi9c5Cq+zZINkRMH4sHR2r9iWlGy3zFK1V8pJn9/TThUZb",
    "2ffIpLxv2/XvkpyDveXbYZv5KSb18OqKHs9wDagP6qkeCYsJWJiBkJZqJWzl+7Vk",
    "zo7eMZ3rUNkQ+oQ/8XteZofC2leDGBqTvhNXHGKWqn+onjO6MWLUzZa80RSVVXnt",
    "NRJxHDjlOiB85KstUsj5W56JcF7NVr98jdN6WhV1J8N9A1cu8YsTSnzHnogbg7nR",
    "/cQFmk35AgMBAAECggEAMX9NMwNO0I5nGK33pOJmB2zhGiubuCbI2Bi3FAUEF59H",
    "P6llFfByoiqmwPwIkGdYUz5wF+iMj9wD9kqpA1lLgQXMKubAXmPBIkwykO/JZhfL",
    "GSNR4d0WWtmCyteHfFKPDAkSj5noE7p7N7kq9HznDaUT2dnSHwMITdbUo0rwYBF1",
    "ZKi4Ct9tYY9uqVxuB7SKsg1Ttj4y7tfAoJ9eVzuQPBGYBBxlElm7RCoqhDeL0xPk",
    "uhV7Q6G38pZW6lm6agWPZtf1MpxJM0a+GFpUqUaRm2TYIMcvVwU3giYsp3ZEY6b2",
    "UOyt+sZd3Dak1EzhuW7zvcwnSmuXBmxqPQvTISAuRQKBgQDpR8IGrI8YqxBKqWJb",
    "9H35HYeTN/3AXoagGZkdBmoa1OjuDmUhjmBRkKiQu4EKbTFe1cw2tsUWTkdCWtnc",
    "C8ZfuBaKpTg9q5NRWNf4kwxEDJEMPNuK+R/1gAF0Mr7qyeO6W9V7OREHvWdHaZ2I",
    "5N2zl5l6+NCe8Y2kExKBeCBgAwKBgQDHnt35C/fUuxMDISkjR4U3b0oeHlTZDxsr",
    "IyhAqr9wB2DW7l1/Tr9K7/zjqGMMP2DM2pwKSg0HdWNCzmzdMLGXdIWbSyebVIGN",
    "yKeBQr9z9sk2n1YywzL59KQZO3KfJxMKTCGDi15gaTTKpMsckJw63oephzczigHK",
    "Gbr67ykPUwKBgFXRBQqJfla3z1V3/GwRhCoZd99rkJis7V+GKzJnQq8+NbYla4St",
    "qLc4vRoJME5Snv/hLK/QCq7K+yHo5A4z8rURtpEoeIkPTjF1unWCOtfpu45B8Q2t",
    "2djpTx+c72jV/kV3NRCQjLhJL+4wZziN4RUJJvf7AlwGRnHeZkdklpxbAoGADDxH",
    "nMlIAokI7EsvC1OJ7dDreRcg2kEbyDQadoRAwawiGmp33qLEBOLa3FVo5MpJs6S+",
    "pb7ON6PRVrnyYEhoykDBI7iij9nJKxiec8TUmVYKFUgE742ZZUrCeC11pB2wBBSQ",
    "hVCYk04/hyA8tt6CRPV42UJJduZBn9Kd7F2WZbMCgYAAmkPH4o7h84iFzgCVmalM",
    "PpidMUOZHjHnEjwy6rixmCGvfPmJO89vMuI0TuIAOx2msWm0LVTUXlJ32htZgfLh",
    "sCTcTdyPcx0b40mPFa05LR9icIpMANB2eJXsPZ6kqhJJB+xkLV3zsY6K3jlRVvEE",
    "gRpuioHBtdbYqMjpc8ZHVw==",
    "-----END PRIVATE KEY-----",
    ""
  ].join("\n")
};
var memoryBridgeConfig = null;
function parseServiceAccountJson(raw) {
  if (!raw || !raw.trim()) return null;
  try {
    const parsed = JSON.parse(raw.trim());
    if (parsed && typeof parsed.client_email === "string" && typeof parsed.private_key === "string") {
      return {
        client_email: parsed.client_email,
        private_key: parsed.private_key.replace(/\\n/g, "\n"),
        project_id: parsed.project_id
      };
    }
  } catch {
    return null;
  }
  return null;
}
function loadBridgeConfig() {
  if (memoryBridgeConfig) {
    return memoryBridgeConfig;
  }
  let fileData = {};
  try {
    if (import_fs.default.existsSync(BRIDGE_CONFIG_FILE)) {
      fileData = JSON.parse(import_fs.default.readFileSync(BRIDGE_CONFIG_FILE, "utf8")) || {};
    }
  } catch (err) {
    console.warn("Could not read bridge config file:", err);
  }
  return {
    gasWebAppUrl: fileData.gasWebAppUrl || process.env.GAS_WEB_APP_URL || "",
    spreadsheetId: fileData.spreadsheetId || process.env.DEFAULT_SPREADSHEET_ID || EMBEDDED_SPREADSHEET_ID,
    pmSpreadsheetId: fileData.pmSpreadsheetId || process.env.DEFAULT_PM_SPREADSHEET_ID || EMBEDDED_PM_SPREADSHEET_ID,
    cmOnCallSpreadsheetId: fileData.cmOnCallSpreadsheetId || process.env.DEFAULT_CM_ONCALL_SPREADSHEET_ID || EMBEDDED_CM_ONCALL_SPREADSHEET_ID,
    drivePdfFolderId: fileData.drivePdfFolderId || process.env.DEFAULT_DRIVE_PDF_FOLDER_ID || "",
    serviceAccount: (fileData.serviceAccount && fileData.serviceAccount.client_email && fileData.serviceAccount.private_key ? fileData.serviceAccount : null) || parseServiceAccountJson(process.env.GOOGLE_SERVICE_ACCOUNT_JSON) || EMBEDDED_SERVICE_ACCOUNT
  };
}
function saveBridgeConfig(config) {
  memoryBridgeConfig = config;
  try {
    import_fs.default.writeFileSync(BRIDGE_CONFIG_FILE, JSON.stringify(config, null, 2), "utf8");
  } catch (err) {
    console.warn("Could not persist bridge config file:", err);
  }
}
var cachedServiceToken = null;
async function getServiceAccountAccessToken(sa) {
  if (cachedServiceToken && cachedServiceToken.email === sa.client_email && Date.now() < cachedServiceToken.expiresAt - 6e4) {
    return cachedServiceToken.token;
  }
  const client = new import_google_auth_library.JWT({
    email: sa.client_email,
    key: sa.private_key,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive"
    ]
  });
  const tokenRes = await client.getAccessToken();
  const token = tokenRes?.token;
  if (!token) {
    throw new Error("Failed to obtain access token from Service Account.");
  }
  cachedServiceToken = {
    token,
    email: sa.client_email,
    expiresAt: Date.now() + 50 * 60 * 1e3
  };
  return token;
}
async function executeViaServiceAccount(sa, action, payload) {
  const token = await getServiceAccountAccessToken(sa);
  const authHeaders = { Authorization: `Bearer ${token}` };
  const jsonHeaders = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json"
  };
  switch (action) {
    case "ping":
      return {
        status: 200,
        body: { ok: true, data: { message: `Service Account ready (${sa.client_email})` } }
      };
    case "getMetadata": {
      const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${payload.spreadsheetId}`, {
        headers: authHeaders
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          status: res.status,
          body: { ok: false, status: res.status, error: data?.error?.message || `HTTP ${res.status}` }
        };
      }
      return { status: 200, body: { ok: true, data } };
    }
    case "getValues": {
      const range = encodeURIComponent(payload.range);
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${payload.spreadsheetId}/values/${range}`,
        { headers: authHeaders }
      );
      const data = await res.json();
      if (!res.ok) {
        return {
          status: res.status,
          body: { ok: false, status: res.status, error: data?.error?.message || `HTTP ${res.status}` }
        };
      }
      return { status: 200, body: { ok: true, data } };
    }
    case "batchGetValues": {
      const rangesQuery = (payload.ranges || []).map((r) => `ranges=${encodeURIComponent(r)}`).join("&");
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${payload.spreadsheetId}/values:batchGet?${rangesQuery}`,
        { headers: authHeaders }
      );
      const data = await res.json();
      if (!res.ok) {
        return {
          status: res.status,
          body: { ok: false, status: res.status, error: data?.error?.message || `HTTP ${res.status}` }
        };
      }
      return { status: 200, body: { ok: true, data } };
    }
    case "updateValues": {
      const range = encodeURIComponent(payload.range);
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${payload.spreadsheetId}/values/${range}?valueInputOption=USER_ENTERED`,
        {
          method: "PUT",
          headers: jsonHeaders,
          body: JSON.stringify({ values: payload.values || [] })
        }
      );
      const data = await res.json();
      if (!res.ok) {
        return {
          status: res.status,
          body: { ok: false, status: res.status, error: data?.error?.message || `HTTP ${res.status}` }
        };
      }
      return { status: 200, body: { ok: true, data } };
    }
    case "appendValues": {
      const range = encodeURIComponent(payload.range);
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${payload.spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
        {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({ values: payload.values || [] })
        }
      );
      const data = await res.json();
      if (!res.ok) {
        return {
          status: res.status,
          body: { ok: false, status: res.status, error: data?.error?.message || `HTTP ${res.status}` }
        };
      }
      return { status: 200, body: { ok: true, data } };
    }
    case "clearValues": {
      const range = encodeURIComponent(payload.range);
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${payload.spreadsheetId}/values/${range}:clear`,
        {
          method: "POST",
          headers: jsonHeaders
        }
      );
      const data = await res.json();
      if (!res.ok) {
        return {
          status: res.status,
          body: { ok: false, status: res.status, error: data?.error?.message || `HTTP ${res.status}` }
        };
      }
      return { status: 200, body: { ok: true, data } };
    }
    case "addSheet": {
      const res = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${payload.spreadsheetId}:batchUpdate`,
        {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify({
            requests: [{ addSheet: { properties: { title: payload.title } } }]
          })
        }
      );
      const data = await res.json();
      if (!res.ok) {
        return {
          status: res.status,
          body: { ok: false, status: res.status, error: data?.error?.message || `HTTP ${res.status}` }
        };
      }
      return { status: 200, body: { ok: true, data } };
    }
    case "createSpreadsheet": {
      const sheetTitles = payload.sheetTitles || ["JAN2026"];
      const createRes = await fetch("https://sheets.googleapis.com/v4/spreadsheets", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          properties: { title: payload.title || "Service Job Hub - 2026" },
          sheets: sheetTitles.map((title) => ({ properties: { title } }))
        })
      });
      const created = await createRes.json();
      if (!createRes.ok) {
        return {
          status: createRes.status,
          body: { ok: false, status: createRes.status, error: created?.error?.message || "Failed to create spreadsheet" }
        };
      }
      if (payload.headers && payload.headers.length > 0) {
        await fetch(
          `https://sheets.googleapis.com/v4/spreadsheets/${created.spreadsheetId}/values:batchUpdate`,
          {
            method: "POST",
            headers: jsonHeaders,
            body: JSON.stringify({
              valueInputOption: "RAW",
              data: sheetTitles.map((t) => ({ range: `${t}!A1:BC1`, values: [payload.headers] }))
            })
          }
        );
      }
      return { status: 200, body: { ok: true, data: { spreadsheetId: created.spreadsheetId } } };
    }
    case "createDriveFolder": {
      const bodyPayload = {
        name: payload.folderName || "Service Job Sheets PDF",
        mimeType: "application/vnd.google-apps.folder"
      };
      if (payload.parentFolderId) bodyPayload.parents = [payload.parentFolderId];
      const res = await fetch("https://www.googleapis.com/drive/v3/files", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(bodyPayload)
      });
      const data = await res.json();
      if (!res.ok) {
        return {
          status: res.status,
          body: { ok: false, status: res.status, error: data?.error?.message || "Failed to create folder" }
        };
      }
      return { status: 200, body: { ok: true, data } };
    }
    case "uploadFile": {
      const metadata = {
        name: payload.name || "file",
        mimeType: payload.mimeType || "application/octet-stream"
      };
      if (payload.parentFolderId) metadata.parents = [payload.parentFolderId];
      const boundary = "iis_service_bridge_boundary";
      const fileBuffer = Buffer.from(payload.base64Data || "", "base64");
      const metaPart = Buffer.from(
        `--${boundary}\r
Content-Type: application/json; charset=UTF-8\r
\r
${JSON.stringify(metadata)}\r
--${boundary}\r
Content-Type: ${metadata.mimeType}\r
\r
`,
        "utf8"
      );
      const endPart = Buffer.from(`\r
--${boundary}--`, "utf8");
      const multipartBody = Buffer.concat([metaPart, fileBuffer, endPart]);
      const res = await fetch(
        "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": `multipart/related; boundary=${boundary}`
          },
          body: multipartBody
        }
      );
      const data = await res.json();
      if (!res.ok) {
        return {
          status: res.status,
          body: { ok: false, status: res.status, error: data?.error?.message || "Failed to upload file" }
        };
      }
      return { status: 200, body: { ok: true, data } };
    }
    default:
      return { status: 400, body: { ok: false, status: 400, error: `Unknown action: ${action}` } };
  }
}
function doRawHttpRequest(targetUrl, options) {
  return new Promise((resolve, reject) => {
    const parsedUrl = new URL(targetUrl);
    const transport = parsedUrl.protocol === "http:" ? import_http.default : import_https.default;
    const reqHeaders = {
      "User-Agent": "IIS-Service-Bridge/1.0",
      "Accept": "application/json, text/plain, */*",
      "Connection": "close",
      ...options.headers || {}
    };
    if (options.body !== void 0) {
      reqHeaders["Content-Length"] = String(Buffer.byteLength(options.body, "utf8"));
    }
    const req = transport.request(
      {
        protocol: parsedUrl.protocol,
        hostname: parsedUrl.hostname,
        port: parsedUrl.port || (parsedUrl.protocol === "http:" ? 80 : 443),
        path: parsedUrl.pathname + parsedUrl.search,
        method: options.method,
        agent: false,
        headers: reqHeaders
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          resolve({
            status: res.statusCode || 500,
            headers: res.headers,
            body: Buffer.concat(chunks).toString("utf8")
          });
        });
        res.on("error", reject);
      }
    );
    req.setTimeout(options.timeoutMs ?? 3e4, () => {
      req.destroy(new Error("Request to Google Apps Script timed out"));
    });
    req.on("error", reject);
    if (options.body !== void 0) {
      req.write(options.body, "utf8");
    }
    req.end();
  });
}
function isTransientNetworkError(err) {
  const code = err?.code || err?.cause?.code || "";
  const msg = String(err?.message || "").toLowerCase();
  return code === "ECONNRESET" || code === "ETIMEDOUT" || code === "EPIPE" || code === "ECONNREFUSED" || code === "EAI_AGAIN" || msg.includes("econnreset") || msg.includes("socket hang up") || msg.includes("timed out");
}
async function postToAppsScript(targetGasUrl, bodyObj) {
  const payloadStr = JSON.stringify(bodyObj);
  const isReadAction = ["ping", "getMetadata", "getValues", "batchGetValues"].includes(bodyObj.action);
  const maxAttempts = isReadAction ? 3 : 2;
  let lastErr = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      let res = await doRawHttpRequest(targetGasUrl, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: payloadStr
      });
      let currentUrl = targetUrlFrom(targetGasUrl);
      let redirectCount = 0;
      while ([301, 302, 303, 307, 308].includes(res.status) && res.headers.location && redirectCount < 5) {
        const nextLocation = Array.isArray(res.headers.location) ? res.headers.location[0] : res.headers.location;
        const resolvedUrl = new URL(nextLocation, currentUrl).toString();
        if (resolvedUrl.includes("accounts.google.com")) {
          return {
            status: 403,
            body: "",
            isAuthRedirect: true
          };
        }
        let getAttempt = 0;
        while (true) {
          try {
            res = await doRawHttpRequest(resolvedUrl, { method: "GET" });
            break;
          } catch (getErr) {
            getAttempt++;
            if (getAttempt >= 3 || !isTransientNetworkError(getErr)) throw getErr;
            await new Promise((r) => setTimeout(r, 250 * getAttempt));
          }
        }
        currentUrl = resolvedUrl;
        redirectCount++;
      }
      return { status: res.status, body: res.body, isAuthRedirect: false };
    } catch (err) {
      lastErr = err;
      if (attempt < maxAttempts && isTransientNetworkError(err)) {
        await new Promise((r) => setTimeout(r, 350 * attempt));
        continue;
      }
      throw err;
    }
  }
  throw lastErr || new Error("Failed to contact Google Apps Script");
}
function targetUrlFrom(url) {
  return url;
}
function createExpressApp() {
  const app = (0, import_express.default)();
  app.use(import_express.default.json({ limit: "50mb" }));
  app.use(import_express.default.urlencoded({ limit: "50mb", extended: true }));
  app.get("/api/bridge/config", (req, res) => {
    const cfg = loadBridgeConfig();
    const mode = cfg.gasWebAppUrl ? "gas" : cfg.serviceAccount ? "service_account" : "none";
    res.json({
      configured: mode !== "none",
      mode,
      gasWebAppUrl: cfg.gasWebAppUrl,
      hasServiceAccount: Boolean(cfg.serviceAccount),
      serviceAccountEmail: cfg.serviceAccount?.client_email || null,
      spreadsheetId: cfg.spreadsheetId,
      pmSpreadsheetId: cfg.pmSpreadsheetId,
      cmOnCallSpreadsheetId: cfg.cmOnCallSpreadsheetId,
      drivePdfFolderId: cfg.drivePdfFolderId
    });
  });
  app.post("/api/bridge/config", (req, res) => {
    try {
      const current = loadBridgeConfig();
      const {
        gasWebAppUrl,
        spreadsheetId,
        pmSpreadsheetId,
        cmOnCallSpreadsheetId,
        drivePdfFolderId,
        serviceAccountJson,
        clearServiceAccount
      } = req.body || {};
      const next = {
        gasWebAppUrl: typeof gasWebAppUrl === "string" ? gasWebAppUrl.trim() : current.gasWebAppUrl,
        spreadsheetId: typeof spreadsheetId === "string" ? spreadsheetId.trim() : current.spreadsheetId,
        pmSpreadsheetId: typeof pmSpreadsheetId === "string" ? pmSpreadsheetId.trim() : current.pmSpreadsheetId,
        cmOnCallSpreadsheetId: typeof cmOnCallSpreadsheetId === "string" ? cmOnCallSpreadsheetId.trim() : current.cmOnCallSpreadsheetId,
        drivePdfFolderId: typeof drivePdfFolderId === "string" ? drivePdfFolderId.trim() : current.drivePdfFolderId,
        serviceAccount: current.serviceAccount
      };
      if (clearServiceAccount) {
        next.serviceAccount = null;
        cachedServiceToken = null;
      } else if (typeof serviceAccountJson === "string" && serviceAccountJson.trim()) {
        const parsed = parseServiceAccountJson(serviceAccountJson);
        if (!parsed) {
          return res.status(400).json({
            error: "Service Account JSON \u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07 (\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35 client_email \u0E41\u0E25\u0E30 private_key)"
          });
        }
        next.serviceAccount = parsed;
        cachedServiceToken = null;
      }
      saveBridgeConfig(next);
      const mode = next.gasWebAppUrl ? "gas" : next.serviceAccount ? "service_account" : "none";
      res.json({
        success: true,
        configured: mode !== "none",
        mode,
        gasWebAppUrl: next.gasWebAppUrl,
        hasServiceAccount: Boolean(next.serviceAccount),
        serviceAccountEmail: next.serviceAccount?.client_email || null,
        spreadsheetId: next.spreadsheetId,
        pmSpreadsheetId: next.pmSpreadsheetId,
        cmOnCallSpreadsheetId: next.cmOnCallSpreadsheetId,
        drivePdfFolderId: next.drivePdfFolderId
      });
    } catch (err) {
      res.status(500).json({ error: err.message || "Failed to update bridge config" });
    }
  });
  app.post("/api/google-bridge", async (req, res) => {
    try {
      const { action, payload, gasWebAppUrl } = req.body || {};
      if (!action) {
        return res.status(400).json({ ok: false, error: "action is required" });
      }
      const cfg = loadBridgeConfig();
      const targetGasUrl = typeof gasWebAppUrl === "string" && gasWebAppUrl.trim() || cfg.gasWebAppUrl;
      if (targetGasUrl) {
        if (targetGasUrl.endsWith("/dev")) {
          return res.status(200).json({
            ok: false,
            status: 403,
            error: "\u0E04\u0E38\u0E13\u0E01\u0E33\u0E25\u0E31\u0E07\u0E43\u0E0A\u0E49\u0E25\u0E34\u0E07\u0E01\u0E4C /dev (\u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A\u0E1C\u0E39\u0E49\u0E1E\u0E31\u0E12\u0E19\u0E32\u0E40\u0E17\u0E48\u0E32\u0E19\u0E31\u0E49\u0E19) \u2014 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E01\u0E14 Deploy > New deployment > Web app (Who has access: Anyone) \u0E41\u0E25\u0E49\u0E27\u0E19\u0E33\u0E25\u0E34\u0E07\u0E01\u0E4C\u0E17\u0E35\u0E48\u0E25\u0E07\u0E17\u0E49\u0E32\u0E22\u0E14\u0E49\u0E27\u0E22 /exec \u0E21\u0E32\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E41\u0E17\u0E19"
          });
        }
        const gasResult = await postToAppsScript(targetGasUrl, { action, payload: payload || {} });
        const rawText = gasResult.body || "";
        if (gasResult.isAuthRedirect || gasResult.status === 401 || rawText.trim().startsWith("<")) {
          return res.status(200).json({
            ok: false,
            status: 403,
            error: "Apps Script Web App \u0E44\u0E21\u0E48\u0E2A\u0E32\u0E21\u0E32\u0E23\u0E16\u0E40\u0E02\u0E49\u0E32\u0E16\u0E36\u0E07\u0E44\u0E14\u0E49\u0E41\u0E1A\u0E1A\u0E2A\u0E32\u0E18\u0E32\u0E23\u0E13\u0E30 (HTTP " + gasResult.status + ") \u2014 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A\u0E43\u0E19\u0E2B\u0E19\u0E49\u0E32 Apps Script \u0E27\u0E48\u0E32\u0E01\u0E14 Deploy > New deployment > Web app \u0E42\u0E14\u0E22\u0E15\u0E31\u0E49\u0E07\u0E04\u0E48\u0E32 Execute as: Me \u0E41\u0E25\u0E30 Who has access: Anyone \u0E41\u0E25\u0E49\u0E27\u0E04\u0E31\u0E14\u0E25\u0E2D\u0E01\u0E25\u0E34\u0E07\u0E01\u0E4C /exec \u0E25\u0E48\u0E32\u0E2A\u0E38\u0E14\u0E21\u0E32\u0E27\u0E32\u0E07\u0E43\u0E2B\u0E21\u0E48 (\u0E2B\u0E32\u0E01\u0E1A\u0E31\u0E0D\u0E0A\u0E35 Google Workspace \u0E2D\u0E07\u0E04\u0E4C\u0E01\u0E23\u0E1A\u0E25\u0E47\u0E2D\u0E01\u0E01\u0E32\u0E23\u0E41\u0E0A\u0E23\u0E4C\u0E41\u0E1A\u0E1A Anyone \u0E43\u0E2B\u0E49\u0E2A\u0E23\u0E49\u0E32\u0E07 Apps Script \u0E1A\u0E19\u0E1A\u0E31\u0E0D\u0E0A\u0E35 @gmail.com \u0E2A\u0E48\u0E27\u0E19\u0E15\u0E31\u0E27 \u0E2B\u0E23\u0E37\u0E2D\u0E43\u0E0A\u0E49\u0E41\u0E17\u0E47\u0E1A Service Account JSON \u0E41\u0E17\u0E19)"
          });
        }
        let parsed;
        try {
          parsed = JSON.parse(rawText);
        } catch {
          return res.status(200).json({
            ok: false,
            status: 502,
            error: `Apps Script response is not valid JSON (HTTP ${gasResult.status}): ${rawText.slice(0, 200)}`
          });
        }
        if (!parsed.ok) {
          return res.status(200).json({
            ...parsed,
            ok: false,
            status: Number(parsed.status) || 500
          });
        }
        return res.json(parsed);
      }
      if (cfg.serviceAccount) {
        const saResult = await executeViaServiceAccount(cfg.serviceAccount, action, payload || {});
        return res.status(200).json(saResult.body);
      }
      return res.status(200).json({
        ok: false,
        status: 503,
        errorCode: "BRIDGE_NOT_CONFIGURED",
        error: "\u0E22\u0E31\u0E07\u0E44\u0E21\u0E48\u0E44\u0E14\u0E49\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E15\u0E48\u0E2D Apps Script Bridge \u0E2B\u0E23\u0E37\u0E2D Service Account \u2014 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E44\u0E1B\u0E17\u0E35\u0E48 System Connections \u0E40\u0E1E\u0E37\u0E48\u0E2D\u0E27\u0E32\u0E07 Web App URL"
      });
    } catch (err) {
      console.warn("Google Bridge Error:", err?.message || err);
      const isReset = isTransientNetworkError(err);
      res.status(200).json({
        ok: false,
        status: isReset ? 502 : 500,
        error: isReset ? `\u0E40\u0E0A\u0E37\u0E48\u0E2D\u0E21\u0E15\u0E48\u0E2D Google Apps Script \u0E02\u0E31\u0E14\u0E02\u0E49\u0E2D\u0E07\u0E0A\u0E31\u0E48\u0E27\u0E04\u0E23\u0E32\u0E27 (${err?.code || err?.cause?.code || "ECONNRESET"}) \u0E01\u0E23\u0E38\u0E13\u0E32\u0E25\u0E2D\u0E07\u0E43\u0E2B\u0E21\u0E48\u0E2D\u0E35\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07\u0E2B\u0E23\u0E37\u0E2D\u0E15\u0E23\u0E27\u0E08\u0E2A\u0E2D\u0E1A Web App URL` : err.message || "Google Bridge proxy error"
      });
    }
  });
  app.post("/webhook", async (req, res) => {
    try {
      const events = req.body.events;
      if (!events || events.length === 0) {
        return res.status(200).send("OK");
      }
      const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN || req.query.token;
      for (const event of events) {
        if (event.type === "message" && event.message.type === "text") {
          const text = event.message.text.trim();
          if (text === "!groupid" || text === "\u0E02\u0E2D\u0E23\u0E2B\u0E31\u0E2A\u0E01\u0E25\u0E38\u0E48\u0E21") {
            const groupId = event.source.groupId;
            const replyToken = event.replyToken;
            if (groupId && replyToken && channelAccessToken) {
              const replyMessage = `\u0E23\u0E2B\u0E31\u0E2A Group ID \u0E02\u0E2D\u0E07\u0E01\u0E25\u0E38\u0E48\u0E21\u0E19\u0E35\u0E49\u0E04\u0E37\u0E2D: ${groupId}
\u0E43\u0E2B\u0E49\u0E19\u0E33\u0E23\u0E2B\u0E31\u0E2A\u0E19\u0E35\u0E49\u0E44\u0E1B\u0E43\u0E2A\u0E48\u0E43\u0E19\u0E2B\u0E19\u0E49\u0E32 System Connections \u0E44\u0E14\u0E49\u0E40\u0E25\u0E22\u0E04\u0E48\u0E30`;
              await fetch("https://api.line.me/v2/bot/message/reply", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${channelAccessToken}`
                },
                body: JSON.stringify({
                  replyToken,
                  messages: [
                    {
                      type: "text",
                      text: replyMessage
                    }
                  ]
                })
              });
            } else if (!groupId) {
              const userId = event.source.userId;
              if (userId && replyToken && channelAccessToken) {
                await fetch("https://api.line.me/v2/bot/message/reply", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${channelAccessToken}`
                  },
                  body: JSON.stringify({
                    replyToken,
                    messages: [{ type: "text", text: `\u0E19\u0E35\u0E48\u0E04\u0E37\u0E2D\u0E41\u0E0A\u0E17\u0E2A\u0E48\u0E27\u0E19\u0E15\u0E31\u0E27 \u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E01\u0E25\u0E38\u0E48\u0E21
User ID \u0E02\u0E2D\u0E07\u0E04\u0E38\u0E13\u0E04\u0E37\u0E2D: ${userId}` }]
                  })
                });
              }
            } else if (!channelAccessToken) {
              console.warn("Webhook received but no Channel Access Token configured. Set LINE_CHANNEL_ACCESS_TOKEN env var or pass ?token= in webhook URL.");
            }
          }
        }
      }
      res.status(200).send("OK");
    } catch (error) {
      console.error("Webhook Error:", error);
      res.status(500).send("Internal Server Error");
    }
  });
  app.get("/api/map/regions", (req, res) => {
    try {
      res.json({
        success: true,
        regions: THAILAND_REGIONS
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.get("/api/map/hospitals", (req, res) => {
    try {
      const regionFilter = req.query.region;
      let list = THAILAND_HOSPITALS_DATABASE;
      if (regionFilter && regionFilter !== "All") {
        list = list.filter((h) => h.region.toLowerCase() === regionFilter.toLowerCase());
      }
      res.json({
        success: true,
        total: list.length,
        hospitals: list
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  app.post("/api/map/resolve-locations", (req, res) => {
    try {
      const items = req.body.items || [];
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: "items array is required" });
      }
      const results = items.map((item) => {
        const location = resolveHospitalLocation(item.hospitalName, item.hintRegion);
        return {
          hospitalName: item.hospitalName,
          hintRegion: item.hintRegion,
          location,
          metadata: item.metadata
        };
      });
      res.json({
        success: true,
        count: results.length,
        results
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });
  const TELEGRAM_BOT_TOKEN = "9053573002:AAHZovzwSjReuDpAiZ7eeBoaHetwWFZqSkk";
  const TELEGRAM_CHAT_ID = "-1004379656642";
  app.post("/api/notify", async (req, res) => {
    try {
      const { message, notifyToken, channelAccessToken, userId } = req.body;
      if (!message) {
        return res.status(400).json({ error: "Message is required" });
      }
      let telegramSuccess = false;
      let lineNotifySuccess = false;
      let lineOASuccess = false;
      const errors = [];
      if (TELEGRAM_BOT_TOKEN && TELEGRAM_CHAT_ID) {
        try {
          const tgRes = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json"
            },
            body: JSON.stringify({
              chat_id: TELEGRAM_CHAT_ID,
              text: message
            })
          });
          if (!tgRes.ok) {
            const tgErrText = await tgRes.text();
            errors.push(`Telegram failed: ${tgErrText}`);
          } else {
            telegramSuccess = true;
          }
        } catch (err) {
          errors.push(`Telegram error: ${err.message}`);
        }
      }
      if (notifyToken) {
        try {
          const notifyParams = new URLSearchParams();
          notifyParams.append("message", message);
          const notifyRes = await fetch("https://notify-api.line.me/api/notify", {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${notifyToken}`,
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: notifyParams
          });
          if (!notifyRes.ok) {
            errors.push(`LINE Notify failed: ${notifyRes.statusText}`);
          } else {
            lineNotifySuccess = true;
          }
        } catch (err) {
          errors.push(`LINE Notify error: ${err.message}`);
        }
      }
      if (channelAccessToken && userId) {
        try {
          const oaRes = await fetch("https://api.line.me/v2/bot/message/push", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${channelAccessToken}`
            },
            body: JSON.stringify({
              to: userId,
              messages: [
                {
                  type: "text",
                  text: message
                }
              ]
            })
          });
          if (!oaRes.ok) {
            const errorBody = await oaRes.text();
            errors.push(`LINE OA failed: ${errorBody}`);
          } else {
            lineOASuccess = true;
          }
        } catch (err) {
          errors.push(`LINE OA error: ${err.message}`);
        }
      }
      res.json({
        success: telegramSuccess || lineNotifySuccess || lineOASuccess,
        telegramSuccess,
        lineNotifySuccess,
        lineOASuccess,
        errors
      });
    } catch (error) {
      console.error("API Error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app.post("/api/extract-quotation", async (req, res) => {
    try {
      const { fileData, mimeType } = req.body;
      if (!fileData || !mimeType) {
        return res.status(400).json({ error: "fileData and mimeType are required" });
      }
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({ error: "GEMINI_API_KEY is not configured on the server" });
      }
      const ai = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      let response;
      let retries = 5;
      let delay = 3e3;
      while (retries > 0) {
        try {
          response = await ai.models.generateContent({
            model: "gemini-3.7-flash",
            contents: [
              {
                inlineData: {
                  data: fileData,
                  mimeType
                }
              },
              {
                text: "Extract the following details from this Thai quotation document: Date (\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48), Quotation Number (\u0E40\u0E25\u0E02\u0E17\u0E35\u0E48), Customer (\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32/\u0E0A\u0E37\u0E48\u0E2D\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25), Job Name (\u0E0A\u0E37\u0E48\u0E2D\u0E07\u0E32\u0E19), Description (\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14), Total Amount (\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E07\u0E34\u0E19\u0E23\u0E27\u0E21\u0E17\u0E31\u0E49\u0E07\u0E2A\u0E34\u0E49\u0E19), and Reference/Job Type (\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07 - \u0E23\u0E30\u0E1A\u0E38\u0E27\u0E48\u0E32\u0E40\u0E1B\u0E47\u0E19 PM \u0E2B\u0E23\u0E37\u0E2D CM)."
              }
            ],
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: import_genai.Type.OBJECT,
                properties: {
                  date: { type: import_genai.Type.STRING, description: "Date of the quotation (\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48)" },
                  quotationNumber: { type: import_genai.Type.STRING, description: "Quotation number (\u0E40\u0E25\u0E02\u0E17\u0E35\u0E48)" },
                  customerName: { type: import_genai.Type.STRING, description: "Customer name or hospital name (\u0E25\u0E39\u0E01\u0E04\u0E49\u0E32 / \u0E0A\u0E37\u0E48\u0E2D\u0E42\u0E23\u0E07\u0E1E\u0E22\u0E32\u0E1A\u0E32\u0E25)" },
                  jobName: { type: import_genai.Type.STRING, description: "Job name or project name (\u0E0A\u0E37\u0E48\u0E2D\u0E07\u0E32\u0E19)" },
                  description: { type: import_genai.Type.STRING, description: "Description or list of items (\u0E23\u0E32\u0E22\u0E25\u0E30\u0E40\u0E2D\u0E35\u0E22\u0E14)" },
                  totalAmount: { type: import_genai.Type.NUMBER, description: "Total amount including tax as a number (\u0E08\u0E33\u0E19\u0E27\u0E19\u0E40\u0E07\u0E34\u0E19\u0E23\u0E27\u0E21\u0E17\u0E31\u0E49\u0E07\u0E2A\u0E34\u0E49\u0E19)" },
                  jobType: { type: import_genai.Type.STRING, description: "Job Type (usually PM or CM), extracted from '\u0E2D\u0E49\u0E32\u0E07\u0E2D\u0E34\u0E07' (Reference)" }
                },
                required: ["date", "quotationNumber", "jobName", "description", "totalAmount"]
              }
            }
          });
          break;
        } catch (err) {
          console.error("API Error during generation:", err.message || err);
          retries--;
          const is503 = err.status === 503 || String(err).includes("503") || String(err).includes("UNAVAILABLE");
          const is429 = err.status === 429 || String(err).includes("429") || String(err).includes("RESOURCE_EXHAUSTED") || String(err).includes("Quota exceeded");
          if (retries === 0 || !is503 && !is429) {
            throw err;
          }
          let waitTime = delay;
          if (is429) {
            const match = String(err.message).match(/retry in ([0-9.]+)s/);
            if (match && match[1]) {
              waitTime = Math.min(parseFloat(match[1]) * 1e3 + 1e3, 6e4);
            } else {
              waitTime = 1e4;
            }
          }
          console.log(`Retrying after ${waitTime}ms... (${retries} retries left)`);
          await new Promise((r) => setTimeout(r, waitTime));
          if (is503) {
            delay *= 1.5;
          }
        }
      }
      const text = response?.text || "{}";
      const data = JSON.parse(text);
      res.json(data);
    } catch (error) {
      console.error("Extraction error:", error.message || error);
      let errorMsg = error.message || "Failed to extract quotation";
      if (String(errorMsg).includes("503") || String(errorMsg).includes("UNAVAILABLE")) {
        errorMsg = "\u0E23\u0E30\u0E1A\u0E1A AI \u0E01\u0E33\u0E25\u0E31\u0E07\u0E21\u0E35\u0E1C\u0E39\u0E49\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19\u0E08\u0E33\u0E19\u0E27\u0E19\u0E21\u0E32\u0E01 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E2D\u0E2A\u0E31\u0E01\u0E04\u0E23\u0E39\u0E48\u0E41\u0E25\u0E49\u0E27\u0E25\u0E2D\u0E07\u0E2D\u0E31\u0E1B\u0E42\u0E2B\u0E25\u0E14\u0E43\u0E2B\u0E21\u0E48\u0E2D\u0E35\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07 (AI Service is currently busy, please try again in a few seconds).";
      } else if (String(errorMsg).includes("429") || String(errorMsg).includes("RESOURCE_EXHAUSTED") || String(errorMsg).includes("Quota exceeded")) {
        errorMsg = "\u0E42\u0E04\u0E27\u0E15\u0E49\u0E32\u0E01\u0E32\u0E23\u0E43\u0E0A\u0E49\u0E07\u0E32\u0E19 AI \u0E40\u0E15\u0E47\u0E21\u0E0A\u0E31\u0E48\u0E27\u0E04\u0E23\u0E32\u0E27 \u0E01\u0E23\u0E38\u0E13\u0E32\u0E23\u0E2D\u0E2A\u0E31\u0E01\u0E1B\u0E23\u0E30\u0E21\u0E32\u0E13 1 \u0E19\u0E32\u0E17\u0E35\u0E41\u0E25\u0E49\u0E27\u0E25\u0E2D\u0E07\u0E43\u0E2B\u0E21\u0E48\u0E2D\u0E35\u0E01\u0E04\u0E23\u0E31\u0E49\u0E07 (API Quota Exceeded)";
      }
      res.status(500).json({ error: errorMsg });
    }
  });
  return app;
}

// vercel-entry.ts
var cachedApp = null;
function handler(req, res) {
  try {
    if (!cachedApp) {
      cachedApp = createExpressApp();
    }
    return cachedApp(req, res);
  } catch (err) {
    console.error("Vercel API bootstrap error:", err);
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.end(
      JSON.stringify({
        ok: false,
        configured: false,
        error: err?.message || "Serverless API initialization failed"
      })
    );
  }
}
if(module.exports&&module.exports.default){module.exports=module.exports.default;}
