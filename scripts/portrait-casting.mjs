/**
 * What each of the forty people looks like, as parameters a drawing can use.
 *
 * Every row is a reading of that person's prompt in PORTRAIT_PROMPTS.md — the
 * same age, the same hair, the same hat, the same garment, the same place and
 * hour. That matters because these drawings are placeholders: the day a
 * photograph is generated from the prompt and dropped into `.portrait-src/`, it
 * replaces the drawing, and nobody should notice the person changed.
 *
 * `scene` and `light` are chosen from the prompt's own setting and working
 * hours, so a driver who starts at 04:30 is drawn before sunrise and the guide
 * at 七星潭 stands on grey cobbles under 清水斷崖 rather than on a beach.
 *
 * Fields:
 *   sex      f | m            — decides nothing but proportion and default hair
 *   age      20 | 30 | 40 | 50 | 60   — greying, hairline, jaw
 *   skin     0-4              — index into SKIN
 *   hair     style key, see HAIR in draw-portraits.mjs
 *   hairCol  key into HAIR_COLOUR
 *   hat      key into HATS, or null
 *   glasses  wire | thick | up | null
 *   face     stubble | moustache | null
 *   build    slim | medium | broad
 *   top      { kind, colour, accent } — kind decides the collar
 *   scene    key into SCENES
 *   light    key into SKIES
 */

export const CASTING = [
  { id: "p-acheng", sex: "m", age: 50, skin: 2, hair: "crop-thin", hairCol: "salt", hat: null, glasses: null, face: null, build: "broad",
    top: { kind: "polo", colour: "#2C3E63", accent: "#22314F" }, scene: "hills", light: "overcast" },

  { id: "p-xiaofang", sex: "f", age: 50, skin: 2, hair: "plait-front", hairCol: "salt", hat: null, glasses: null, face: null, build: "medium",
    top: { kind: "apron", colour: "#C2306B", accent: "#B79A76" }, scene: "estuary", light: "overcast" },

  { id: "p-dabear", sex: "m", age: 40, skin: 3, hair: "buzz", hairCol: "black", hat: "cap", glasses: null, face: null, build: "broad",
    top: { kind: "windbreaker", colour: "#23262B", accent: "#C9C3BA" }, scene: "cliff", light: "midday" },

  { id: "p-fucheng-car", sex: "m", age: 60, skin: 1, hair: "sidepart", hairCol: "silver", hat: null, glasses: "wire", face: null, build: "medium",
    top: { kind: "button", colour: "#AFC6DA", accent: "#8FA9C0" }, scene: "oldstreet", light: "morning" },

  { id: "p-hualien-car", sex: "m", age: 20, skin: 3, hair: "tail-nape", hairCol: "black", hat: null, glasses: null, face: "moustache", build: "slim",
    top: { kind: "shirt", colour: "#9AA0A0", accent: "#E6E2DA" }, scene: "bay", light: "morning" },

  { id: "p-akai", sex: "m", age: 20, skin: 1, hair: "fringe", hairCol: "brown", hat: null, glasses: null, face: null, build: "slim",
    top: { kind: "hoodie", colour: "#1B1C20", accent: "#F2F0EC" }, scene: "city", light: "night" },

  { id: "p-xiaomi", sex: "f", age: 30, skin: 1, hair: "bob", hairCol: "black", hat: null, glasses: null, face: null, build: "slim",
    top: { kind: "shirt", colour: "#C8922F", accent: "#EDE7DC" }, scene: "oldstreet", light: "afternoon" },

  { id: "p-azhe", sex: "m", age: 40, skin: 1, hair: "receding", hairCol: "salt", hat: null, glasses: "wire", face: null, build: "medium",
    top: { kind: "gilet", colour: "#5E6647", accent: "#C7C0B2" }, scene: "oldstreet", light: "morning" },

  { id: "p-ada", sex: "f", age: 40, skin: 1, hair: "crop", hairCol: "silver", hat: null, glasses: null, face: null, build: "slim",
    top: { kind: "softshell", colour: "#26282C", accent: "#7C8288" }, scene: "city", light: "afternoon" },

  { id: "p-tainan-guide", sex: "f", age: 50, skin: 2, hair: "curls", hairCol: "salt", hat: null, glasses: null, face: null, build: "medium",
    top: { kind: "blouse", colour: "#D8E0D2", accent: "#B2543F" }, scene: "temple", light: "morning" },

  { id: "p-hualien-guide", sex: "f", age: 40, skin: 3, hair: "bun-low", hairCol: "black", hat: null, glasses: null, face: null, build: "medium",
    top: { kind: "field", colour: "#6C7455", accent: "#565D43" }, scene: "gorge", light: "morning" },

  { id: "p-ruifang-car", sex: "m", age: 50, skin: 2, hair: "crop", hairCol: "salt", hat: "cap", glasses: "wire", face: null, build: "medium",
    top: { kind: "polo", colour: "#7E8489", accent: "#666C70" }, scene: "yinyang", light: "overcast" },

  { id: "p-jiufen-guide", sex: "m", age: 60, skin: 2, hair: "crop", hairCol: "white", hat: null, glasses: "wire", face: null, build: "slim",
    top: { kind: "canvas", colour: "#7A5F44", accent: "#9E8563" }, scene: "hills", light: "dusk" },

  { id: "p-tamsui-car", sex: "m", age: 40, skin: 3, hair: "crop", hairCol: "black", hat: "bucket", glasses: null, face: null, build: "medium",
    top: { kind: "tee", colour: "#3E6E7A", accent: "#2F565F" }, scene: "coastrock", light: "midday" },

  { id: "p-tamsui-guide", sex: "f", age: 30, skin: 1, hair: "long-loose", hairCol: "dark", hat: "shades-up", glasses: null, face: null, build: "medium",
    top: { kind: "stripe", colour: "#2B3A63", accent: "#F0EFEA" }, scene: "fort", light: "afternoon" },

  { id: "p-taichung-car", sex: "m", age: 50, skin: 2, hair: "sidepart", hairCol: "grey", hat: null, glasses: "up", face: null, build: "broad",
    top: { kind: "uniform", colour: "#F1F0EC", accent: "#C3C6C9" }, scene: "forest", light: "morning" },

  { id: "p-taichung-guide", sex: "m", age: 20, skin: 1, hair: "curly", hairCol: "black", hat: null, glasses: "thick", face: null, build: "slim",
    top: { kind: "check", colour: "#7C9AA8", accent: "#E9E5DC" }, scene: "market", light: "morning" },

  { id: "p-kaohsiung-car", sex: "m", age: 60, skin: 3, hair: "crop", hairCol: "white", hat: "flatcap", glasses: null, face: null, build: "medium",
    top: { kind: "button", colour: "#93483C", accent: "#F2EFE8" }, scene: "harbour", light: "midday" },

  { id: "p-kaohsiung-guide", sex: "f", age: 50, skin: 2, hair: "crop", hairCol: "dark", hat: null, glasses: "up", face: null, build: "broad",
    top: { kind: "polo", colour: "#D5654C", accent: "#B94F39" }, scene: "warehouse", light: "afternoon" },

  { id: "p-jiaoxi-car", sex: "m", age: 40, skin: 2, hair: "crop-thin", hairCol: "salt", hat: null, glasses: null, face: null, build: "medium",
    top: { kind: "fleece", colour: "#C79A3C", accent: "#A97F2B" }, scene: "hills", light: "morning" },

  { id: "p-jiaoxi-guide", sex: "m", age: 30, skin: 3, hair: "crop", hairCol: "black", hat: "suncap", glasses: null, face: null, build: "slim",
    top: { kind: "tee", colour: "#DE7333", accent: "#BE5C22" }, scene: "trail", light: "morning" },

  { id: "p-luodong-guide", sex: "f", age: 20, skin: 1, hair: "ponytail", hairCol: "black", hat: null, glasses: null, face: null, build: "slim",
    top: { kind: "denim", colour: "#4A6C93", accent: "#1D1F23" }, scene: "nightmarket", light: "night" },

  { id: "p-taitung-car", sex: "m", age: 50, skin: 3, hair: "crop", hairCol: "salt", hat: null, glasses: null, face: null, build: "medium",
    top: { kind: "button", colour: "#6E8AA6", accent: "#5A7288" }, scene: "ricefield", light: "morning" },

  { id: "p-taitung-guide", sex: "m", age: 40, skin: 3, hair: "tail-nape", hairCol: "black", hat: null, glasses: null, face: "stubble", build: "slim",
    top: { kind: "henley", colour: "#3B3E44", accent: "#2B2E33" }, scene: "courtyard", light: "dusk" },

  { id: "p-hualien-city-guide", sex: "f", age: 30, skin: 2, hair: "braid", hairCol: "black", hat: null, glasses: null, face: null, build: "medium",
    top: { kind: "shirt", colour: "#9CC7AE", accent: "#7FAE92" }, scene: "nightmarket", light: "night" },

  { id: "p-chishang-car", sex: "m", age: 60, skin: 3, hair: "crop-thin", hairCol: "white", hat: "meshcap", glasses: null, face: null, build: "slim",
    top: { kind: "plaid", colour: "#8E6A54", accent: "#E4DACB" }, scene: "ricefield", light: "morning" },

  { id: "p-chishang-guide", sex: "f", age: 50, skin: 2, hair: "crop", hairCol: "grey", hat: "headscarf", glasses: null, face: null, build: "medium",
    top: { kind: "field", colour: "#8C9095", accent: "#71757A" }, scene: "wetland", light: "dawn" },

  { id: "p-chenggong-car", sex: "m", age: 40, skin: 3, hair: "spiky", hairCol: "brown", hat: "cap", glasses: "wire", face: null, build: "medium",
    top: { kind: "button", colour: "#2F4568", accent: "#243652" }, scene: "coastrock", light: "dawn" },

  { id: "p-chenggong-guide", sex: "f", age: 60, skin: 4, hair: "crop", hairCol: "grey", hat: "headcloth", glasses: null, face: null, build: "broad",
    top: { kind: "field", colour: "#A99C86", accent: "#8B806D" }, scene: "tidepool", light: "predawn" },

  { id: "p-guangfu-car", sex: "m", age: 30, skin: 3, hair: "fade", hairCol: "black", hat: null, glasses: null, face: null, build: "slim",
    top: { kind: "sunsleeve", colour: "#C1552B", accent: "#E8E4DC" }, scene: "flowerfield", light: "midday" },

  { id: "p-guangfu-guide", sex: "f", age: 30, skin: 3, hair: "bun-low", hairCol: "black", hat: null, glasses: null, face: null, build: "broad",
    top: { kind: "waders", colour: "#2F5A44", accent: "#E6E2D8" }, scene: "wetland", light: "morning" },

  { id: "p-taroko-car", sex: "m", age: 50, skin: 3, hair: "crop", hairCol: "grey", hat: null, glasses: null, face: null, build: "medium",
    top: { kind: "button", colour: "#C6B79C", accent: "#A99B81" }, scene: "gorge", light: "midday" },

  { id: "p-yehliu-car", sex: "f", age: 30, skin: 1, hair: "clipped-up", hairCol: "dark", hat: null, glasses: null, face: null, build: "medium",
    top: { kind: "button", colour: "#8FB6D4", accent: "#E9E6DE" }, scene: "arcade", light: "midday" },

  { id: "p-yehliu-guide", sex: "m", age: 40, skin: 2, hair: "crop", hairCol: "salt", hat: "widebrim", glasses: null, face: null, build: "broad",
    top: { kind: "vest", colour: "#9A9067", accent: "#7C7452" }, scene: "coastrock", light: "morning" },

  { id: "p-pingxi-guide", sex: "m", age: 50, skin: 2, hair: "crop", hairCol: "grey", hat: "cap", glasses: null, face: "moustache", build: "slim",
    top: { kind: "workjacket", colour: "#2E3E5C", accent: "#233149" }, scene: "railway", light: "afternoon" },

  { id: "p-qingshui-car", sex: "m", age: 30, skin: 2, hair: "crop", hairCol: "black", hat: null, glasses: null, face: null, build: "medium",
    top: { kind: "polo", colour: "#41454B", accent: "#33363B" }, scene: "harbour", light: "afternoon" },

  { id: "p-gaomei-guide", sex: "f", age: 40, skin: 2, hair: "ponytail", hairCol: "dark", hat: "visor", glasses: null, face: null, build: "medium",
    top: { kind: "sunshirt", colour: "#C4B6D6", accent: "#A99BBD" }, scene: "wetland", light: "dusk" },

  { id: "p-luodong-car", sex: "f", age: 40, skin: 2, hair: "crop", hairCol: "salt", hat: null, glasses: null, face: null, build: "medium",
    top: { kind: "polo", colour: "#F0EEE9", accent: "#CBC8C1" }, scene: "harbour", light: "dawn" },

  { id: "p-qixingtan-car", sex: "m", age: 60, skin: 3, hair: "crop", hairCol: "white", hat: "watchcap", glasses: "thick", face: "stubble", build: "slim",
    top: { kind: "quilted", colour: "#2B3550", accent: "#1F2740" }, scene: "church", light: "predawn" },

  { id: "p-qixingtan-guide", sex: "f", age: 40, skin: 2, hair: "crop", hairCol: "black", hat: "beanie", glasses: null, face: null, build: "medium",
    top: { kind: "windbreaker", colour: "#C63B31", accent: "#A62C24" }, scene: "pebble", light: "dawn" },
];
