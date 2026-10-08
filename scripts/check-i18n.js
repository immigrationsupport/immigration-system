const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const enPath = path.join(projectRoot, 'messages/en.json');
const frPath = path.join(projectRoot, 'messages/fr.json');

const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));

function flattenKeys(obj, prefix = '') {
  let keys = {};
  for (const [k, v] of Object.entries(obj)) {
    const fullKey = prefix ? prefix + '.' + k : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(keys, flattenKeys(v, fullKey));
    } else {
      keys[fullKey] = v;
    }
  }
  return keys;
}

const enFlat = flattenKeys(en);
const frFlat = flattenKeys(fr);

const missingInFr = Object.keys(enFlat).filter(k => !(k in frFlat));
const missingInEn = Object.keys(frFlat).filter(k => !(k in enFlat));
const emptyInFr = Object.keys(frFlat).filter(k => frFlat[k] === '');
const emptyInEn = Object.keys(enFlat).filter(k => enFlat[k] === '');

console.log('=== RAPPORT DE TRADUCTION ===');
console.log(`- Clés totales : EN = ${Object.keys(enFlat).length}, FR = ${Object.keys(frFlat).length}`);
console.log(`- Clés manquantes en FR : ${missingInFr.length}`);
console.log(`- Clés manquantes en EN : ${missingInEn.length}`);
console.log(`- Clés vides en FR : ${emptyInFr.length}`);
console.log(`- Clés vides en EN : ${emptyInEn.length}`);

// Vérification de la cohérence des variables ICU
let placeholderErrors = 0;
for (const [k, enVal] of Object.entries(enFlat)) {
  const frVal = frFlat[k];
  if (typeof enVal !== 'string' || typeof frVal !== 'string') continue;
  const getVars = str => new Set((str.match(/\{([a-zA-Z0-9_]+)(?:,[^}]*)?\}/g) || []).map(s => s.replace(/[\{\}]/g, '').split(',')[0].trim()));
  const enVars = getVars(enVal);
  const frVars = getVars(frVal);
  for (const v of enVars) {
    if (!frVars.has(v)) {
      console.warn(`[ICU MISMATCH] Clé "${k}": variable {${v}} présente dans EN mais pas dans FR.`);
      placeholderErrors++;
    }
  }
  for (const v of frVars) {
    if (!enVars.has(v)) {
      console.warn(`[ICU MISMATCH] Clé "${k}": variable {${v}} présente dans FR mais pas dans EN.`);
      placeholderErrors++;
    }
  }
}

if (placeholderErrors === 0) {
  console.log('✅ Variables et interpolations ICU : 100% conformes entre EN et FR.');
}

if (missingInFr.length === 0 && missingInEn.length === 0 && emptyInFr.length === 0 && emptyInEn.length === 0 && placeholderErrors === 0) {
  console.log('✅ Toutes les traductions sont présentes et complètes !');
  process.exit(0);
} else {
  console.error('❌ Des incohérences ont été détectées.');
  process.exit(1);
}
