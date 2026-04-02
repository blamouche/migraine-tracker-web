import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useIAStore } from '@/stores/iaStore'
import { useCrisisStore } from '@/stores/crisisStore'
import { useFoodStore } from '@/stores/foodStore'
import { previewAnonymizedData } from '@/lib/ia/anonymize'
import { MIN_CRISES_FOR_IA, IA_RECOMMENDATION_CATEGORIES } from '@/types/ia'
import type { IASummary } from '@/types/ia'

export function IAModulePage() {
  const navigate = useNavigate()
  const { crises } = useCrisisStore()
  const { dailyFactors } = useFoodStore()
  const {
    preferences, patterns, recommendations, summaries, lastRiskRefinement, log,
    isAnalyzing, error,
    giveConsent, revokeConsent, updatePreferences,
    runPatternAnalysis, validatePattern, rejectPattern,
    runRecommendations, dismissRecommendation,
    generateSummary, refineRisk, clearError,
  } = useIAStore()

  const [showPreview, setShowPreview] = useState(false)
  const [previewData, setPreviewData] = useState('')
  const [summaryPeriod, setSummaryPeriod] = useState<IASummary['period']>('3m')
  const [summaryDetail, setSummaryDetail] = useState<IASummary['detailLevel']>('synthetique')
  const [summaryLang, setSummaryLang] = useState<IASummary['language']>('fr')

  const canUseIA = crises.length >= MIN_CRISES_FOR_IA

  const handlePreview = () => {
    const data = previewAnonymizedData(crises, dailyFactors ?? [])
    setPreviewData(data)
    setShowPreview(true)
  }

  return (
    <main className="min-h-screen bg-(--color-bg-base) text-(--color-text-primary)">
      <div className="mx-auto max-w-3xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold">Module IA</h1>
          <button type="button" onClick={() => navigate('/')} className="text-sm text-(--color-text-muted) hover:text-(--color-text-primary)">Retour</button>
        </div>

        <p className="mt-2 text-sm text-(--color-text-secondary)">
          Analyses approfondies par intelligence artificielle. Vos données sont anonymisées côté client avant envoi.
        </p>
        <p className="mt-1 text-xs text-(--color-warning)">Ne remplace pas l'avis médical.</p>

        {error && <div className="mt-4 rounded-(--radius-md) bg-(--color-danger-light) px-4 py-3 text-sm text-(--color-danger)">{error} <button type="button" onClick={clearError} className="ml-2 underline">Fermer</button></div>}

        {/* Consent */}
        {!preferences.consentGiven ? (
          <section className="mt-6 rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
            <h2 className="text-lg font-semibold">Consentement requis</h2>
            <div className="mt-4 space-y-2 text-sm text-(--color-text-secondary)">
              <p><strong>Données envoyées (anonymisées) :</strong> dates, intensités, traitements, symptômes, déclencheurs, durées, scores HIT-6, facteurs quotidiens.</p>
              <p><strong>Données exclues :</strong> notes libres (optionnel), noms, emails, toute information personnelle identifiable.</p>
              <p>Vous pouvez désactiver le module à tout moment.</p>
            </div>
            <button type="button" onClick={handlePreview} className="mt-4 text-sm text-(--color-brand) underline">Voir ce qui sera envoyé</button>
            <button type="button" onClick={giveConsent} className="mt-4 w-full rounded-(--radius-md) bg-(--color-brand) py-3 text-sm font-semibold text-(--color-text-inverse)">J'accepte — Activer le module IA</button>
          </section>
        ) : (
          <>
            {/* Not enough data */}
            {!canUseIA && (
              <div className="mt-6 rounded-(--radius-md) bg-(--color-warning-light) px-4 py-3 text-sm text-(--color-warning)">
                Module de prédiction désactivé : {crises.length}/{MIN_CRISES_FOR_IA} crises minimum. L'indicateur de risque local reste actif.
              </div>
            )}

            {/* Preferences */}
            <section className="mt-6 rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
              <h2 className="text-sm font-semibold">Préférences IA</h2>
              <div className="mt-3 space-y-3">
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={preferences.autoWeeklyAnalysis} onChange={(e) => updatePreferences({ autoWeeklyAnalysis: e.target.checked })} className="rounded" />
                  Analyse automatique hebdomadaire
                </label>
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={preferences.autoRiskRefinement} onChange={(e) => updatePreferences({ autoRiskRefinement: e.target.checked })} className="rounded" />
                  Affiner le risque automatiquement au démarrage
                </label>
                <label className="flex items-center gap-3 text-sm">
                  <input type="checkbox" checked={preferences.excludeNotes} onChange={(e) => updatePreferences({ excludeNotes: e.target.checked })} className="rounded" />
                  Exclure les notes libres de l'envoi
                </label>
                {preferences.excludeNotes && <p className="ml-8 text-xs text-(--color-text-muted)">L'exclusion des notes peut réduire la qualité des analyses.</p>}
              </div>
              <div className="mt-4 flex gap-3">
                <button type="button" onClick={handlePreview} className="text-sm text-(--color-brand) underline">Voir les données envoyées</button>
                <button type="button" onClick={revokeConsent} className="text-sm text-(--color-danger) underline">Désactiver le module IA</button>
              </div>
            </section>

            {/* Pattern analysis */}
            <section className="mt-6 rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Patterns IA</h2>
                <button type="button" onClick={() => runPatternAnalysis(crises.length)} disabled={isAnalyzing || !canUseIA} className="rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm text-(--color-text-inverse) disabled:opacity-50">
                  {isAnalyzing ? 'Analyse…' : 'Lancer l\'analyse'}
                </button>
              </div>
              {patterns.length > 0 && (
                <ul className="mt-4 space-y-2">
                  {patterns.map((p) => (
                    <li key={p.id} className="rounded-(--radius-lg) border border-(--color-border) p-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{p.label} <span className="ml-1 rounded bg-(--color-brand-light) px-1.5 py-0.5 text-xs text-(--color-brand)">IA</span></p>
                          <p className="text-xs text-(--color-text-muted)">Confiance : {p.confidence}% · {p.status}</p>
                        </div>
                        {p.status === 'detected' && (
                          <div className="flex gap-1">
                            <button type="button" onClick={() => validatePattern(p.id)} className="rounded px-2 py-1 text-xs bg-(--color-success) text-white">Valider</button>
                            <button type="button" onClick={() => rejectPattern(p.id)} className="rounded px-2 py-1 text-xs bg-(--color-danger) text-white">Rejeter</button>
                          </div>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-(--color-text-secondary)">{p.description}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Recommendations */}
            <section className="mt-6 rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Recommandations</h2>
                <button type="button" onClick={() => runRecommendations(crises.length)} disabled={isAnalyzing || !canUseIA} className="rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm text-(--color-text-inverse) disabled:opacity-50">Générer</button>
              </div>
              {recommendations.filter((r) => r.status === 'active').length > 0 && (
                <ul className="mt-4 space-y-2">
                  {recommendations.filter((r) => r.status === 'active').map((r) => (
                    <li key={r.id} className="rounded-(--radius-lg) border border-(--color-border) p-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-(--color-brand)">{IA_RECOMMENDATION_CATEGORIES[r.category]} · {r.confidence}%</span>
                        <button type="button" onClick={() => dismissRecommendation(r.id)} className="text-xs text-(--color-text-muted)">Ignorer</button>
                      </div>
                      <p className="mt-1 text-sm">{r.text}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            {/* Summary generation */}
            <section className="mt-6 rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
              <h2 className="text-sm font-semibold">Résumé narratif pour le médecin</h2>
              <div className="mt-3 flex gap-3">
                <select value={summaryPeriod} onChange={(e) => setSummaryPeriod(e.target.value as IASummary['period'])} className="rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-2 py-1 text-sm">
                  <option value="1m">1 mois</option><option value="3m">3 mois</option><option value="6m">6 mois</option>
                </select>
                <select value={summaryDetail} onChange={(e) => setSummaryDetail(e.target.value as IASummary['detailLevel'])} className="rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-2 py-1 text-sm">
                  <option value="synthetique">Synthétique</option><option value="detaille">Détaillé</option>
                </select>
                <select value={summaryLang} onChange={(e) => setSummaryLang(e.target.value as IASummary['language'])} className="rounded-(--radius-md) border border-(--color-border) bg-(--color-bg-base) px-2 py-1 text-sm">
                  <option value="fr">Français</option><option value="en">English</option>
                </select>
                <button type="button" onClick={() => generateSummary(summaryPeriod, summaryDetail, summaryLang)} disabled={isAnalyzing} className="rounded-(--radius-md) bg-(--color-brand) px-4 py-1 text-sm text-(--color-text-inverse) disabled:opacity-50">Générer</button>
              </div>
              {summaries.length > 0 && (
                <div className="mt-4 rounded-(--radius-lg) bg-(--color-bg-subtle) p-4 text-sm whitespace-pre-wrap">{summaries[0]!.content}</div>
              )}
            </section>

            {/* Risk refinement */}
            <section className="mt-6 rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
              <h2 className="text-sm font-semibold">Affinement du risque</h2>
              <button type="button" onClick={() => refineRisk(crises.length)} disabled={isAnalyzing || !canUseIA} className="mt-3 rounded-(--radius-md) bg-(--color-brand) px-4 py-2 text-sm text-(--color-text-inverse) disabled:opacity-50">Affiner avec l'IA</button>
              {lastRiskRefinement && (
                <div className="mt-4">
                  <p className="text-sm font-medium">Probabilité de crise : {lastRiskRefinement.probability}%</p>
                  <ul className="mt-2 space-y-1">
                    {lastRiskRefinement.factors.map((f, i) => (
                      <li key={i} className="text-xs text-(--color-text-muted)">{f.label}: {f.contribution}%</li>
                    ))}
                  </ul>
                  <p className="mt-2 text-xs text-(--color-warning)">Ne remplace pas l'avis médical.</p>
                </div>
              )}
            </section>

            {/* Log */}
            <section className="mt-6 rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
              <h2 className="text-sm font-semibold">Journal des appels IA</h2>
              {log.length > 0 ? (
                <ul className="mt-3 divide-y divide-(--color-border)">
                  {log.slice(0, 20).map((entry) => (
                    <li key={entry.id} className="py-2 text-xs text-(--color-text-muted)">
                      {new Date(entry.date).toLocaleString('fr-FR')} · {entry.type} · {entry.trigger} · {entry.dataSummary}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-xs text-(--color-text-muted)">Aucun appel effectué</p>
              )}
            </section>
          </>
        )}

        {/* Preview modal */}
        {showPreview && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="mx-4 max-h-[80vh] w-full max-w-2xl overflow-auto rounded-(--radius-xl) bg-(--color-bg-elevated) p-6">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Données qui seront envoyées</h3>
                <button type="button" onClick={() => setShowPreview(false)} className="text-(--color-text-muted)">✕</button>
              </div>
              <pre className="mt-4 rounded-(--radius-lg) bg-(--color-bg-subtle) p-4 text-xs overflow-auto max-h-[60vh]">{previewData}</pre>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
