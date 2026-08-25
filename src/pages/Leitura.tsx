import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { useCourses } from '@/hooks/useCourses'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/services/supabase'

export function Leitura() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { courses, enrollmentsReady, setCourses, loading } = useCourses()
  const [activeStep, setActiveStep] = useState<string>('')
  const [mobileStepsOpen, setMobileStepsOpen] = useState(false)
  const mainRef = useRef<HTMLElement>(null)
  const isInitialized = useRef(false)
  const maxSavedProgress = useRef(0)

  const course = courses.find(c => c.id === id)

  // Aguarda enrollments carregarem antes de inicializar
  useEffect(() => {
    if (!enrollmentsReady || !course?.steps?.length || isInitialized.current) return
    isInitialized.current = true
    const saved = course.progress ?? 0
    maxSavedProgress.current = saved
    const resumeIndex = saved > 0
      ? Math.min(
          Math.max(0, Math.round(saved / 100 * course.steps.length) - 1),
          course.steps.length - 1
        )
      : 0
    setActiveStep(course.steps[resumeIndex].id)
  }, [course, enrollmentsReady])

  const steps = course?.steps ?? []
  const activeIndex = steps.findIndex(s => s.id === activeStep)
  const stepProgress = steps.length > 0 ? Math.round(((activeIndex + 1) / steps.length) * 100) : 0

  // Salva progresso no banco sempre que o usuário avança para uma nova etapa
  useEffect(() => {
    if (!id || !activeStep || !user || stepProgress === 0) return
    if (stepProgress <= maxSavedProgress.current) return
    maxSavedProgress.current = stepProgress
    supabase
      .from('enrollments')
      .upsert(
        { user_id: user.id, course_id: id, progress: stepProgress, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,course_id' }
      )
      .then(({ error }) => {
        if (error) console.error('[Leitura] Erro ao salvar progresso:', error)
      })
  }, [activeStep, id, user, stepProgress])

  const goToStep = (stepId: string) => {
    setActiveStep(stepId)
    setMobileStepsOpen(false)
    mainRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleReset = () => {
    if (!id || !user || !steps.length) return
    maxSavedProgress.current = 0
    setCourses(prev => prev.map(c => c.id === id ? { ...c, progress: 0 } : c))
    supabase
      .from('enrollments')
      .upsert(
        { user_id: user.id, course_id: id, progress: 0, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,course_id' }
      )
      .then(({ error }) => {
        if (error) console.error('[Leitura] Erro ao reiniciar curso:', error)
      })
    goToStep(steps[0].id)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <span className="material-symbols-rounded text-4xl text-[var(--color-primary)] animate-spin">progress_activity</span>
      </div>
    )
  }

  if (!course) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center">
        <span className="material-symbols-rounded text-5xl text-[var(--color-surface-highest)] mb-4">search_off</span>
        <p className="font-['Space_Grotesk'] font-bold text-[var(--color-on-surface)]">Curso não encontrado</p>
        <button onClick={() => navigate('/biblioteca')} className="mt-4 text-sm text-[var(--color-tertiary)] hover:underline">
          Voltar à Biblioteca
        </button>
      </div>
    )
  }

  const currentStep = steps[activeIndex] ?? null
  const prevStep = activeIndex > 0 ? steps[activeIndex - 1] : null
  const nextStep = activeIndex < steps.length - 1 ? steps[activeIndex + 1] : null

  return (
    <div className="-mx-4 -my-4 sm:-m-6 flex flex-col lg:flex-row lg:h-[calc(100vh-5rem)]">

      {/* Desktop Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-[var(--color-surface-low)] border-r border-[var(--color-surface-highest)] flex-col overflow-hidden hidden lg:flex">
        <div className="p-4 border-b border-[var(--color-surface-highest)]">
          <Link to="/biblioteca" className="flex items-center gap-1 text-xs text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] mb-3 transition-colors">
            <span className="material-symbols-rounded text-sm">arrow_back</span>
            Biblioteca
          </Link>
          <h2 className="font-['Space_Grotesk'] font-bold text-[var(--color-on-surface)] text-sm leading-snug line-clamp-3">
            {course.title}
          </h2>
          <p className="text-xs text-[var(--color-on-surface-variant)] flex items-center gap-1 mt-2">
            <span className="material-symbols-rounded text-sm">schedule</span>
            {course.duration}
          </p>
        </div>

        <div className="px-4 py-3 border-b border-[var(--color-surface-highest)]">
          <ProgressBar value={stepProgress} showLabel size="sm" />
        </div>

        <nav className="flex-1 overflow-y-auto py-2">
          {steps.map((step, idx) => {
            const isActive = step.id === activeStep
            const isDone   = idx < activeIndex
            return (
              <button
                key={step.id}
                onClick={() => goToStep(step.id)}
                className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-all duration-150 group ${
                  isActive
                    ? 'border-l-2 border-[var(--color-primary)] bg-[var(--color-surface-container)]'
                    : 'border-l-2 border-transparent hover:bg-[var(--color-surface-container)]'
                }`}
              >
                <span className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                  isDone   ? 'bg-green-700 text-white' :
                  isActive ? 'bg-[var(--color-primary)] text-white' :
                             'bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)]'
                }`}>
                  {isDone ? <span className="material-symbols-rounded text-[10px]">check</span> : idx + 1}
                </span>
                <span className={`text-xs leading-snug ${
                  isActive ? 'text-[var(--color-primary)] font-semibold' :
                  isDone   ? 'text-[var(--color-on-surface-variant)] line-through' :
                             'text-[var(--color-on-surface-variant)] group-hover:text-[var(--color-on-surface)]'
                }`}>
                  {step.title}
                </span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[var(--color-surface-highest)]">
          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-[var(--color-on-surface-variant)] hover:text-red-400 hover:bg-[var(--color-surface-container)] transition-all duration-150 group"
          >
            <span className="material-symbols-rounded text-sm group-hover:text-red-400 transition-colors">restart_alt</span>
            Reiniciar curso
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main ref={mainRef} className="flex-1 overflow-y-auto">

        {/* Mobile top nav bar */}
        <div className="lg:hidden sticky top-0 z-10 bg-[var(--color-surface-low)] border-b border-[var(--color-surface-highest)] px-4 py-3 flex items-center gap-3">
          <Link
            to="/biblioteca"
            className="p-1 rounded-lg text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] flex-shrink-0"
          >
            <span className="material-symbols-rounded">arrow_back</span>
          </Link>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-[var(--color-on-surface)] truncate">{course.title}</p>
            <p className="text-[10px] text-[var(--color-on-surface-variant)]">
              Etapa {activeIndex + 1} de {steps.length} · {stepProgress}%
            </p>
          </div>
          <button
            onClick={() => setMobileStepsOpen(o => !o)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--color-surface-highest)] text-xs text-[var(--color-on-surface-variant)] flex-shrink-0 hover:bg-[var(--color-surface-high)] transition-colors"
          >
            <span className="material-symbols-rounded text-sm">
              {mobileStepsOpen ? 'expand_less' : 'list'}
            </span>
            Etapas
          </button>
        </div>

        {/* Mobile steps panel */}
        {mobileStepsOpen && (
          <div className="lg:hidden bg-[var(--color-surface-low)] border-b border-[var(--color-surface-highest)] max-h-72 overflow-y-auto">
            <div className="px-4 py-2 border-b border-[var(--color-surface-highest)]">
              <ProgressBar value={stepProgress} showLabel size="sm" />
            </div>
            {steps.map((step, idx) => {
              const isActive = step.id === activeStep
              const isDone   = idx < activeIndex
              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-all duration-150 border-l-2 ${
                    isActive
                      ? 'border-[var(--color-primary)] bg-[var(--color-surface-container)]'
                      : 'border-transparent hover:bg-[var(--color-surface-container)]'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] font-bold mt-0.5 ${
                    isDone   ? 'bg-green-700 text-white' :
                    isActive ? 'bg-[var(--color-primary)] text-white' :
                               'bg-[var(--color-surface-highest)] text-[var(--color-on-surface-variant)]'
                  }`}>
                    {isDone ? <span className="material-symbols-rounded text-[10px]">check</span> : idx + 1}
                  </span>
                  <span className={`text-xs leading-snug ${
                    isActive ? 'text-[var(--color-primary)] font-semibold' :
                    isDone   ? 'text-[var(--color-on-surface-variant)] line-through' :
                               'text-[var(--color-on-surface-variant)]'
                  }`}>
                    {step.title}
                  </span>
                </button>
              )
            })}
            <div className="p-3 border-t border-[var(--color-surface-highest)]">
              <button
                onClick={() => { handleReset(); setMobileStepsOpen(false) }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs text-[var(--color-on-surface-variant)] hover:text-red-400 hover:bg-[var(--color-surface-container)] transition-all duration-150"
              >
                <span className="material-symbols-rounded text-sm">restart_alt</span>
                Reiniciar curso
              </button>
            </div>
          </div>
        )}

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">

          {/* Course header — shown only on first step */}
          {activeIndex === 0 && (
            <header className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-[var(--color-on-surface-variant)]">
                <span className="uppercase tracking-widest text-[var(--color-primary)] font-semibold">{course.category}</span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <span className="material-symbols-rounded text-sm">schedule</span>{course.duration}
                </span>
                <span>·</span>
                <span>{steps.length} etapas</span>
              </div>
              <h1 className="font-['Space_Grotesk'] text-2xl sm:text-3xl font-bold text-[var(--color-on-surface)] leading-tight">
                {course.title}
              </h1>
              <p className="text-[var(--color-on-surface-variant)] leading-relaxed">{course.description}</p>
              {course.thumbnail && (
                <img src={course.thumbnail} alt={course.title} className="w-full aspect-video object-cover rounded-xl" />
              )}
            </header>
          )}

          {/* Step indicator */}
          {activeIndex > 0 && (
            <div className="flex items-center gap-2 text-xs text-[var(--color-on-surface-variant)]">
              <span className="uppercase tracking-widest text-[var(--color-primary)] font-semibold">{course.category}</span>
              <span>·</span>
              <span>Etapa {activeIndex + 1} de {steps.length}</span>
            </div>
          )}

          {/* Active step content */}
          {currentStep && (
            <article className="space-y-5">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-[var(--color-primary)] text-white flex items-center justify-center font-['Space_Grotesk'] font-bold text-sm flex-shrink-0">
                  {String(activeIndex + 1).padStart(2, '0')}
                </span>
                <h2 className="font-['Space_Grotesk'] text-lg sm:text-xl font-bold text-[var(--color-on-surface)]">
                  {currentStep.title}
                </h2>
              </div>

              <div className="h-px bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-surface-highest)] to-transparent" />

              {currentStep.content ? (
                <div
                  className="prose prose-invert prose-sm max-w-none step-content"
                  dangerouslySetInnerHTML={{ __html: currentStep.content }}
                />
              ) : (
                <p className="text-[var(--color-on-surface-variant)] italic text-sm">
                  Conteúdo não disponível para esta etapa.
                </p>
              )}
            </article>
          )}

          {/* Navigation */}
          <nav className="flex items-center justify-between gap-3 pt-4 border-t border-[var(--color-surface-highest)]">
            <div>
              {prevStep ? (
                <button
                  onClick={() => goToStep(prevStep.id)}
                  className="flex items-center gap-2 text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors group px-3 py-2 rounded-lg hover:bg-[var(--color-surface-highest)]"
                >
                  <span className="material-symbols-rounded group-hover:-translate-x-1 transition-transform flex-shrink-0">arrow_back</span>
                  {/* Mobile: simple label */}
                  <span className="font-medium sm:hidden">Anterior</span>
                  {/* Desktop: with step title */}
                  <div className="text-left hidden sm:block">
                    <p className="text-[10px] uppercase tracking-wider">Anterior</p>
                    <p className="font-medium line-clamp-1">{prevStep.title}</p>
                  </div>
                </button>
              ) : (
                <Link
                  to="/biblioteca"
                  className="flex items-center gap-2 text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors group px-3 py-2 rounded-lg hover:bg-[var(--color-surface-highest)]"
                >
                  <span className="material-symbols-rounded group-hover:-translate-x-1 transition-transform flex-shrink-0">arrow_back</span>
                  <span className="font-medium">Biblioteca</span>
                </Link>
              )}
            </div>
            <div>
              {nextStep ? (
                <button
                  onClick={() => goToStep(nextStep.id)}
                  className="flex items-center gap-2 text-sm text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] transition-colors group px-3 py-2 rounded-lg hover:bg-[var(--color-surface-highest)]"
                >
                  {/* Desktop: with step title */}
                  <div className="text-right hidden sm:block">
                    <p className="text-[10px] uppercase tracking-wider">Próximo</p>
                    <p className="font-medium line-clamp-1">{nextStep.title}</p>
                  </div>
                  {/* Mobile: simple label */}
                  <span className="font-medium sm:hidden">Próximo</span>
                  <span className="material-symbols-rounded group-hover:translate-x-1 transition-transform flex-shrink-0">arrow_forward</span>
                </button>
              ) : (
                <div className="flex items-center gap-2 text-sm text-green-500 font-semibold px-3 py-2">
                  <span className="material-symbols-rounded">emoji_events</span>
                  <span>Concluído!</span>
                </div>
              )}
            </div>
          </nav>

          <div className="h-16" />
        </div>
      </main>
    </div>
  )
}
