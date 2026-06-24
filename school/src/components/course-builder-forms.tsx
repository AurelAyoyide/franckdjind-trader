"use client";

import { Archive, CheckCircle2, FilePlus2, Layers3, Save, Info, Users } from "lucide-react";
import { useActionState, useState, useEffect } from "react";
import { ConfirmButton } from "@/components/confirm-button";
import {
  assignLearnerAction,
  bulkAssignLearnersAction,
  createLessonAction,
  createModuleAction,
  createQuizAction,
  addQuizQuestionAction,
  deleteQuizQuestionAction,
  setCourseStatusAction,
  updateCourseAction,
  type BuilderActionState,
} from "@/app/trainer/courses/[courseId]/actions";

type ModuleOption = {
  id: string;
  title: string;
};

type QuizLessonOption = {
  id: string;
  title: string;
};
type ConfiguredQuizOption = { id: string; title: string; questions: { id: string; text: string }[] };

type LearnerOption = {
  id: string;
  name: string;
  email: string;
};

type CourseBuilderFormsProps = {
  course: {
    id: string;
    title: string;
    description: string;
    type: "FREE" | "PAID";
    priceAmount: number | null;
    priceCurrency: string | null;
    durationValue: number | null;
    durationUnit: string | null;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  };
  modules: ModuleOption[];
  quizLessons: QuizLessonOption[];
  configuredQuizzes: ConfiguredQuizOption[];
  learners: LearnerOption[];
  structureView: React.ReactNode;
  learnersView: React.ReactNode;
};

const initialState: BuilderActionState = {
  ok: false,
  message: "",
};

function StateMessage({ state }: { state: BuilderActionState }) {
  if (!state.message) {
    return null;
  }

  return (
    <p
      className={`mt-4 rounded-lg border p-3 text-sm font-semibold ${state.ok ? "border-market/30 bg-market/10 text-market" : "border-danger/30 bg-danger/10 text-danger"
        }`}
    >
      {state.message}
    </p>
  );
}

export function CourseBuilderForms({ course, modules, quizLessons, configuredQuizzes, learners, structureView, learnersView }: CourseBuilderFormsProps) {
  const [courseState, courseAction, coursePending] = useActionState(updateCourseAction, initialState);
  const [moduleState, moduleAction, modulePending] = useActionState(createModuleAction, initialState);
  const [lessonState, lessonAction, lessonPending] = useActionState(createLessonAction, initialState);
  const [quizState, quizAction, quizPending] = useActionState(createQuizAction, initialState);
  const [questionState, questionAction, questionPending] = useActionState(addQuizQuestionAction, initialState);
  const [assignmentState, assignmentAction, assignmentPending] = useActionState(assignLearnerAction, initialState);
  const [bulkState, bulkAction, bulkPending] = useActionState(bulkAssignLearnersAction, initialState);
  const [lessonType, setLessonType] = useState<"TEXT" | "VIDEO" | "DOCUMENT" | "QUIZ">("TEXT");
  const [learnerSearch, setLearnerSearch] = useState("");
  const storageKey = `school-builder-step-${course.id}`;
  const [step, setStep] = useState(1);

  useEffect(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      setStep(Number(saved));
    }
  }, [storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, String(step));
  }, [step, storageKey]);

  const matchingLearners = learners.filter((learner) => `${learner.name} ${learner.email}`.toLowerCase().includes(learnerSearch.trim().toLowerCase()));

  return (
    <div className="grid gap-6">
      <nav aria-label="Etapes de creation" className="grid grid-cols-2 gap-3 rounded-lg border border-line bg-surface p-4 sm:grid-cols-4">
        {[[1, "1. Informations"], [2, "2. Modules & lecons"], [3, "3. Quiz"], [4, "4. Publication"]].map(([number, label]) => (
          <button
            className={`min-h-12 rounded-lg px-2 text-sm font-black transition ${step === number ? "bg-market text-on-market shadow-market" : "bg-foreground/[0.05] text-muted hover:bg-foreground/[0.08]"}`}
            key={number as number}
            onClick={() => setStep(number as number)}
            type="button"
          >
            {label as string}
          </button>
        ))}
      </nav>

      {step === 1 ? (
        <form action={courseAction} className="rounded-lg border border-line bg-surface p-5">
          <input name="courseId" type="hidden" value={course.id} />
          <div className="flex items-center gap-3">
            <Save className="h-5 w-5 text-market" aria-hidden="true" />
            <h2 className="text-xl font-black">Parametres formation</h2>
          </div>
          <div className="mt-5 grid gap-5 md:grid-cols-2">
            <label className="text-sm font-black">
              Titre
              <input className="mt-2 min-h-12 w-full rounded-lg border border-line bg-background px-4 text-sm focus:border-market" defaultValue={course.title} name="title" />
              {courseState.errors?.title ? <span className="mt-2 block text-xs text-danger">{courseState.errors.title[0]}</span> : null}
            </label>
            <label className="text-sm font-black">
              Type
              <select className="mt-2 min-h-12 w-full rounded-lg border border-line bg-background px-4 text-sm focus:border-market" defaultValue={course.type} name="type">
                <option value="FREE">Gratuite</option>
                <option value="PAID">Payante hors plateforme</option>
              </select>
            </label>
            <label className="text-sm font-black">
              Prix hors plateforme
              <div className="mt-2 flex gap-3">
                <input className="min-h-12 min-w-0 flex-1 rounded-lg border border-line bg-background px-4 text-sm focus:border-market" defaultValue={course.priceAmount ?? ""} name="priceAmount" placeholder="Montant" step="1" type="number" />
                <select className="min-h-12 rounded-lg border border-line bg-background px-4 text-sm focus:border-market" defaultValue={course.priceCurrency ?? "XOF"} name="priceCurrency">
                  <option value="XOF">FCFA</option>
                  <option value="EUR">EUR</option>
                </select>
              </div>
            </label>
            <label className="text-sm font-black">
              Duree estimee <span className="font-medium text-muted">(facultatif)</span>
              <div className="mt-2 flex gap-3">
                <input className="min-h-12 min-w-0 flex-1 rounded-lg border border-line bg-background px-4 text-sm focus:border-market" defaultValue={course.durationValue ?? ""} min="1" name="durationValue" placeholder="Ex. 6" type="number" />
                <select className="min-h-12 rounded-lg border border-line bg-background px-4 text-sm focus:border-market" defaultValue={course.durationUnit ?? "WEEKS"} name="durationUnit">
                  <option value="HOURS">heures</option>
                  <option value="DAYS">jours</option>
                  <option value="WEEKS">semaines</option>
                  <option value="MONTHS">mois</option>
                </select>
              </div>
              <span className="mt-2 block text-xs font-medium text-muted">Laisse vide si le parcours est libre.</span>
              {courseState.errors?.duration ? <span className="mt-2 block text-xs text-danger">{courseState.errors.duration[0]}</span> : null}
            </label>
          </div>
          <label className="mt-5 block text-sm font-black">
            Description
            <textarea className="mt-2 min-h-32 w-full rounded-lg border border-line bg-background p-4 text-sm leading-6 focus:border-market" defaultValue={course.description} name="description" />
            {courseState.errors?.description ? <span className="mt-2 block text-xs text-danger">{courseState.errors.description[0]}</span> : null}
          </label>
          <StateMessage state={courseState} />
          <button className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-market px-6 text-sm font-black text-on-market disabled:opacity-60" disabled={coursePending} type="submit">
            {coursePending ? "Enregistrement..." : "Enregistrer"}
          </button>
        </form>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] items-start">
          {structureView}
          <div className="grid gap-6">
            <form action={moduleAction} className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <input name="courseId" type="hidden" value={course.id} />
              <div className="flex items-center gap-3">
                <Layers3 className="h-5 w-5 text-cyan" aria-hidden="true" />
                <h2 className="text-xl font-black">Ajouter un module</h2>
              </div>
              <div className="mt-5 grid gap-4">
                <label className="text-sm font-black">
                  Titre
                  <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm focus:border-market" name="title" />
                  {moduleState.errors?.title ? <span className="mt-2 block text-xs text-danger">{moduleState.errors.title[0]}</span> : null}
                </label>
                <label className="text-sm font-black">
                  Description
                  <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm focus:border-market" name="description" />
                </label>
              </div>
              <StateMessage state={moduleState} />
              <button className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market disabled:opacity-60" disabled={modulePending} type="submit">
                {modulePending ? "Creation..." : "Creer le module"}
              </button>
            </form>

            <form action={lessonAction} className="rounded-lg border border-line bg-surface p-5 shadow-sm" encType="multipart/form-data">
              <div className="flex items-center gap-3">
                <FilePlus2 className="h-5 w-5 text-amber" aria-hidden="true" />
                <h2 className="text-xl font-black">Ajouter une lecon</h2>
              </div>
              <div className="mt-5 grid gap-4">
                <label className="text-sm font-black">
                  Module parent
                  <select className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm focus:border-market" name="moduleId">
                    {modules.map((module) => (
                      <option key={module.id} value={module.id}>{module.title}</option>
                    ))}
                  </select>
                </label>
                <label className="text-sm font-black">
                  Type de contenu
                  <select
                    className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm focus:border-market"
                    name="type"
                    onChange={(event) => setLessonType(event.target.value as "TEXT" | "VIDEO" | "DOCUMENT" | "QUIZ")}
                    value={lessonType}
                  >
                    <option value="TEXT">Texte</option>
                    <option value="VIDEO">Video privee</option>
                    <option value="DOCUMENT">Document</option>
                    <option value="QUIZ">Quiz</option>
                  </select>
                </label>
                <label className="text-sm font-black">
                  Titre de la lecon
                  <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm focus:border-market" name="title" />
                  {lessonState.errors?.title ? <span className="mt-2 block text-xs text-danger">{lessonState.errors.title[0]}</span> : null}
                </label>
                {lessonType === "VIDEO" || lessonType === "DOCUMENT" ? (
                  <label className="text-sm font-black">
                    Fichier prive
                    <input
                      accept={lessonType === "VIDEO" ? "video/mp4,video/webm,video/quicktime" : ".pdf,.doc,.docx,.ppt,.pptx,.xlsx,image/png,image/jpeg"}
                      className="mt-2 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm focus:border-market"
                      name="asset"
                      required
                      type="file"
                    />
                    <span className="mt-2 block text-xs font-medium text-muted">A uploader en toute securite.</span>
                  </label>
                ) : null}
                {lessonType === "TEXT" ? (
                  <label className="mt-4 block text-sm font-black">
                    Contenu texte
                    <textarea className="mt-2 min-h-24 w-full rounded-lg border border-line bg-background p-3 text-sm focus:border-market" name="content" required />
                  </label>
                ) : lessonType === "QUIZ" ? (
                  <p className="mt-4 rounded-lg border border-cyan/30 bg-cyan/10 p-3 text-sm font-medium text-cyan">
                    Cree d&apos;abord la lecon, puis va a l'etape 3 pour y ajouter des questions.
                  </p>
                ) : null}
              </div>
              <StateMessage state={lessonState} />
              <button className="mt-5 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market disabled:opacity-60" disabled={lessonPending || modules.length === 0} type="submit">
                {lessonPending ? "Creation..." : "Creer la lecon"}
              </button>
            </form>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_0.8fr] items-start">
          <form action={quizAction} className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-xl font-black">Creer un quiz</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="text-sm font-black">
                Associer a la lecon (de type Quiz)
                <select className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm focus:border-market disabled:opacity-50" disabled={quizLessons.length === 0} name="lessonId">
                  {quizLessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>{lesson.title}</option>
                  ))}
                  {quizLessons.length === 0 && <option value="">Aucune lecon en attente</option>}
                </select>
              </label>
              <label className="text-sm font-black">
                Titre du quiz
                <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm focus:border-market" name="title" />
              </label>
              <label className="text-sm font-black">
                Score minimum (%)
                <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm focus:border-market" defaultValue="70" name="minimumScore" type="number" />
              </label>
              <label className="text-sm font-black">
                Tentatives max
                <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm focus:border-market" defaultValue="3" name="maxAttempts" type="number" />
              </label>
            </div>
            <label className="mt-5 flex items-center gap-3 text-sm font-black">
              <input className="h-5 w-5 accent-[var(--market)]" name="blocking" type="checkbox" />
              Rendre ce quiz bloquant
            </label>

            {quizLessons.length === 0 ? (
              <div className="mt-6 flex items-start gap-3 rounded-lg border border-cyan/30 bg-cyan/10 p-4 text-cyan">
                <Info className="mt-0.5 h-5 w-5 flex-shrink-0" />
                <p className="text-sm font-medium leading-6">
                  Aucune lecon de type "Quiz interactif" n'est en attente de configuration. Retourne a <strong>l'etape 2 (Modules & Lecons)</strong> pour ajouter la coquille de ta lecon, puis reviens ici concevoir ses questions !
                </p>
              </div>
            ) : null}

            <div className={`mt-6 border-t border-line pt-6 ${quizLessons.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
              <h3 className="text-lg font-black text-muted">Ajouter la toute premiere question</h3>
              <label className="mt-4 block text-sm font-black">
                Question
                <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm focus:border-market" name="questionText" />
              </label>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                <input className="min-h-11 rounded-lg border border-line bg-background px-3 text-sm focus:border-market" name="optionA" placeholder="Option A" />
                <input className="min-h-11 rounded-lg border border-line bg-background px-3 text-sm focus:border-market" name="optionB" placeholder="Option B" />
                <input className="min-h-11 rounded-lg border border-line bg-background px-3 text-sm focus:border-market" name="optionC" placeholder="Option C" />
              </div>
              <label className="mt-4 block text-sm font-black">
                Bonne reponse
                <select className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm focus:border-market" name="correctOption">
                  <option value="A">Option A</option>
                  <option value="B">Option B</option>
                  <option value="C">Option C</option>
                </select>
              </label>
            </div>
            <StateMessage state={quizState} />
            <button className="mt-6 inline-flex min-h-11 items-center justify-center rounded-lg bg-market px-6 text-sm font-black text-on-market disabled:opacity-60" disabled={quizPending || quizLessons.length === 0} type="submit">
              {quizPending ? "Creation..." : "Creer le quiz initial"}
            </button>
          </form>

          <form action={questionAction} className="rounded-lg border border-line bg-surface p-5">
            <h2 className="text-xl font-black">Ajouter des questions supplementaires</h2>
            <label className="mt-5 block text-sm font-black">Quiz existant<select className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm focus:border-market" name="quizId">{configuredQuizzes.map((quiz) => <option key={quiz.id} value={quiz.id}>{quiz.title}</option>)}</select></label>
            <label className="mt-4 block text-sm font-black">Question<input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm focus:border-market" name="questionText" required /></label>
            <div className="mt-4 grid gap-3 md:grid-cols-3"><input className="min-h-11 rounded-lg border border-line bg-background px-3 text-sm focus:border-market" name="optionA" placeholder="Option A" required /><input className="min-h-11 rounded-lg border border-line bg-background px-3 text-sm focus:border-market" name="optionB" placeholder="Option B" required /><input className="min-h-11 rounded-lg border border-line bg-background px-3 text-sm focus:border-market" name="optionC" placeholder="Option C" /></div>
            <label className="mt-4 block text-sm font-black">Bonne reponse<select className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm focus:border-market" name="correctOption"><option value="A">Option A</option><option value="B">Option B</option><option value="C">Option C</option></select></label>
            <StateMessage state={questionState} />
            <button className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-market px-6 text-sm font-black text-on-market disabled:opacity-60" disabled={questionPending || !configuredQuizzes.length} type="submit">Ajouter la question</button>
            <div className="mt-8 border-t border-line pt-6 grid gap-4">
              <h3 className="text-lg font-black text-muted">Questions existantes</h3>
              {configuredQuizzes.map(quiz => (
                <div key={quiz.id} className="grid gap-2">
                  <h4 className="text-sm font-black text-foreground">{quiz.title}</h4>
                  {quiz.questions.map(q => (
                    <div key={q.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg border border-line bg-foreground/[0.04]">
                      <span className="text-sm text-foreground">{q.text}</span>
                      <form action={deleteQuizQuestionAction}>
                        <input type="hidden" name="questionId" value={q.id} />
                        <ConfirmButton className="text-xs font-black text-danger hover:underline whitespace-nowrap">Supprimer</ConfirmButton>
                      </form>
                    </div>
                  ))}
                  {quiz.questions.length === 0 ? <p className="text-xs text-muted">Aucune question dans ce quiz pour l'instant.</p> : null}
                </div>
              ))}
            </div>
          </form>
        </div>
      ) : null}

      {step === 4 ? (
        <div className="grid gap-6">
          <div className="grid gap-4 md:grid-cols-2">
            {course.status !== "PUBLISHED" ? (
              <form action={setCourseStatusAction} className="flex flex-col items-center justify-center gap-4 rounded-lg border hover:border-market border-line bg-surface p-8 transition">
                <input name="courseId" type="hidden" value={course.id} />
                <input name="status" type="hidden" value="PUBLISHED" />
                <p className="text-center text-sm font-medium text-muted">Avant de publier, assure-toi que les lecons ont bien du contenu et les quiz des questions.</p>
                <button className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-market px-6 text-base font-black text-on-market shadow-market" type="submit">
                  <CheckCircle2 className="h-5 w-5" /> Publier la formation
                </button>
              </form>
            ) : null}
            {course.status !== "ARCHIVED" ? (
              <form action={setCourseStatusAction} className="flex flex-col items-center justify-center gap-4 rounded-lg border hover:border-foreground/20 border-line bg-surface p-8 transition">
                <input name="courseId" type="hidden" value={course.id} />
                <input name="status" type="hidden" value="ARCHIVED" />
                <p className="text-center text-sm font-medium text-muted">L'archivage desactive les nouveaux acces mais preserve l'historique de la formation.</p>
                <button className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-line bg-foreground/[0.06] px-6 text-base font-black hover:bg-foreground/[0.08]" type="submit">
                  <Archive className="h-5 w-5" /> Archiver la formation
                </button>
              </form>
            ) : null}
          </div>

          <div className="grid gap-6 lg:grid-cols-[1fr_0.6fr] items-start">
            {learnersView}
            <form action={assignmentAction} className="rounded-lg border border-line bg-surface p-5 shadow-sm">
              <input name="courseId" type="hidden" value={course.id} />
              <h2 className="text-xl font-black">Inscrire un apprenant</h2>
              <label className="mt-5 block text-sm font-black">
                Rechercher un apprenant platforme
                <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm focus:border-market" onChange={(event) => setLearnerSearch(event.target.value)} placeholder="Nom ou email" type="search" value={learnerSearch} />
                <select className="mt-3 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm focus:border-market" name="learnerId">
                  {matchingLearners.map((learner) => (
                    <option key={learner.id} value={learner.id}>
                      {learner.name} - {learner.email}
                    </option>
                  ))}
                </select>
                {!matchingLearners.length ? <span className="mt-2 block text-xs text-muted">Aucun apprenant ne correspond.</span> : null}
              </label>
              <StateMessage state={assignmentState} />
              <button
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market disabled:opacity-60"
                disabled={assignmentPending || learners.length === 0}
                type="submit"
              >
                {assignmentPending ? "Inscription..." : "Inscrire"}
              </button>

              <div className="mt-4 border-t border-line pt-4">
                <form action={bulkAction}>
                  <input name="courseId" type="hidden" value={course.id} />
                  <p className="text-xs font-medium text-muted leading-5">Inscrire d'un clic tous les apprenants de la plateforme qui ne sont pas encore inscrits a cette formation.</p>
                  <StateMessage state={bulkState} />
                  <button
                    className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg border border-market/40 bg-market/10 px-4 text-sm font-black text-market transition hover:bg-market/20 disabled:opacity-60"
                    disabled={bulkPending}
                    type="submit"
                  >
                    <Users className="h-4 w-4" />
                    {bulkPending ? "Inscription en masse..." : "Inscrire tous les apprenants"}
                  </button>
                </form>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
