/**
 * Vérifie que toutes les variables d'environnement requises sont définies.
 * À exécuter au démarrage en développement : `npx tsx scripts/check-env.ts`
 */

const REQUIRED_VARS = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'] as const

const missing: string[] = []

for (const varName of REQUIRED_VARS) {
  if (!process.env[varName]) {
    missing.push(varName)
  }
}

if (missing.length > 0) {
  console.error("\n❌ Variables d'environnement manquantes :\n")
  for (const varName of missing) {
    console.error(`   - ${varName}`)
  }
  console.error('\n📄 Voir .env.example pour la liste complète.\n')
  process.exit(1)
} else {
  console.log("✅ Toutes les variables d'environnement sont définies.\n")
}
