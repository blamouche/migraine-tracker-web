import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useCrisisStore } from '@/stores/crisisStore'
import { useFoodStore } from '@/stores/foodStore'
import { exportCrisesCsv, exportFoodCsv, exportDailyFactorsCsv } from '@/lib/export/csv'
import { exportVaultZip } from '@/lib/export/zip'

export function ExportPage() {
  const navigate = useNavigate()
  const crises = useCrisisStore((s) => s.crises)
  const foodEntries = useFoodStore((s) => s.entries)
  const dailyFactors = useFoodStore((s) => s.dailyFactors)
  const [zipExporting, setZipExporting] = useState(false)
  const [zipError, setZipError] = useState<string | null>(null)

  async function handleZipExport() {
    setZipExporting(true)
    setZipError(null)
    try {
      await exportVaultZip()
    } catch (err) {
      setZipError(err instanceof Error ? err.message : "Erreur lors de l'export")
    } finally {
      setZipExporting(false)
    }
  }

  const exports = [
    {
      title: 'Crises — CSV',
      description: 'Une ligne par crise avec tous les champs : date, intensité, traitements, symptômes, déclencheurs, score HIT-6.',
      count: crises.length,
      countLabel: 'crises',
      action: () => exportCrisesCsv(crises),
      disabled: crises.length === 0,
    },
    {
      title: 'Journal alimentaire — CSV',
      description: 'Une ligne par repas avec date, type de repas, aliments, et notes.',
      count: foodEntries.length,
      countLabel: 'entrées',
      action: () => exportFoodCsv(foodEntries),
      disabled: foodEntries.length === 0,
    },
    {
      title: 'Facteurs quotidiens — CSV',
      description: 'Une ligne par jour avec stress, qualité du sommeil, et hydratation.',
      count: dailyFactors.length,
      countLabel: 'jours',
      action: () => exportDailyFactorsCsv(dailyFactors),
      disabled: dailyFactors.length === 0,
    },
  ]

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-[800px] px-8 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Exporter mes données</h1>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="text-sm text-(--color-text-secondary) hover:text-(--color-text-primary)"
          >
            Accueil
          </button>
        </div>

        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Tous les exports sont générés sur votre appareil. Aucune donnée n'est transmise à un
          serveur.
        </p>

        {/* CSV exports */}
        <section className="mt-8 space-y-4">
          <h2 className="text-sm font-semibold text-(--color-text-primary)">Exports CSV</h2>
          <p className="text-xs text-(--color-text-muted)">
            Encodage UTF-8 avec BOM pour compatibilité Excel.
          </p>

          {exports.map((exp) => (
            <div
              key={exp.title}
              className="flex items-center justify-between rounded-(--radius-lg) bg-(--color-bg-elevated) p-4"
            >
              <div>
                <h3 className="text-sm font-medium">{exp.title}</h3>
                <p className="mt-1 text-xs text-(--color-text-muted)">{exp.description}</p>
                <p className="mt-1 text-xs text-(--color-text-secondary)">
                  {exp.count} {exp.countLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={exp.action}
                disabled={exp.disabled}
                className="shrink-0 rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover) disabled:opacity-50"
              >
                Exporter
              </button>
            </div>
          ))}
        </section>

        {/* Vault ZIP export */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-(--color-text-primary)">Sauvegarde complète</h2>
          <div className="mt-4 rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Export ZIP du vault</h3>
                <p className="mt-1 text-xs text-(--color-text-muted)">
                  Copie intégrale de tous vos fichiers Markdown avec la structure de dossiers
                  préservée. Idéal pour la sauvegarde ou la migration.
                </p>
              </div>
              <button
                type="button"
                onClick={handleZipExport}
                disabled={zipExporting}
                className="shrink-0 rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover) disabled:opacity-50"
              >
                {zipExporting ? 'Export en cours...' : 'Exporter en ZIP'}
              </button>
            </div>
            {zipError && (
              <p className="mt-3 text-xs text-(--color-danger)">{zipError}</p>
            )}
          </div>
        </section>

        {/* Report link */}
        <section className="mt-8">
          <h2 className="text-sm font-semibold text-(--color-text-primary)">Rapport médical</h2>
          <div className="mt-4 rounded-(--radius-lg) bg-(--color-bg-elevated) p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium">Rapport PDF pour consultation</h3>
                <p className="mt-1 text-xs text-(--color-text-muted)">
                  Document structuré avec résumé, graphiques, et détail des crises pour votre
                  médecin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => navigate('/rapport')}
                className="shrink-0 rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm font-medium text-(--color-text-inverse) transition-colors hover:bg-(--color-brand-hover)"
              >
                Générer
              </button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
