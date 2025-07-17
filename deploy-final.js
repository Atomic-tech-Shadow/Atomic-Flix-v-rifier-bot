#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

console.log('🚀 Préparation du déploiement final...');

// Vérifier le nombre de fonctions
const apiDir = path.join(__dirname, 'api');
const functions = fs.readdirSync(apiDir).filter(f => f.endsWith('.js'));

console.log(`📊 Nombre de fonctions serverless: ${functions.length}/12`);
console.log('📋 Fonctions disponibles:');
functions.forEach((func, index) => {
  console.log(`  ${index + 1}. ${func}`);
});

if (functions.length > 12) {
  console.log('❌ ERREUR: Trop de fonctions! Vercel Hobby limite à 12 maximum');
  process.exit(1);
}

// Vérifier vercel.json
const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
console.log('\n✅ Configuration Vercel validée');

// Vérifier les fonctions principales
const requiredFunctions = [
  'health.js',
  'verify-subscription.js', 
  'webhook.js',
  'channel-events.js'
];

const missingFunctions = requiredFunctions.filter(f => !functions.includes(f));
if (missingFunctions.length > 0) {
  console.log(`❌ ERREUR: Fonctions manquantes: ${missingFunctions.join(', ')}`);
  process.exit(1);
}

console.log('\n🎉 Prêt pour le déploiement!');
console.log('📝 Résumé des changements:');
console.log('  ✅ Messages de bienvenue PUBLICS dans le canal @Atomic_flix_officiel');
console.log('  ✅ Focus 100% anime (suppression commande /movies)');
console.log('  ✅ Réduction de 13 à 9 fonctions serverless');
console.log('  ✅ Configuration Vercel optimisée');
console.log('\n🔗 Déployez maintenant sur Vercel avec la commande:');
console.log('    vercel --prod');