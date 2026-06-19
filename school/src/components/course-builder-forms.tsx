"use client";

import { Archive, CheckCircle2, FilePlus2, Layers3, Save } from "lucide-react";
import { useActionState } from "react";
import {
  assignLearnerAction,
  createLessonAction,
  createModuleAction,
  createQuizAction,
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
    priceLabel: string | null;
    duration: string | null;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  };
  modules: ModuleOption[];
  quizLessons: QuizLessonOption[];
  learners: LearnerOption[];
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
      className={`mt-4 rounded-lg border p-3 text-sm font-semibold ${
        state.ok ? "border-market/30 bg-market/10 text-market" : "border-danger/30 bg-danger/10 text-danger"
      }`}
    >
      {state.message}
    </p>
  );
}

export function CourseBuilderForms({ course, modules, quizLessons, learners }: CourseBuilderFormsProps) {
  const [courseState, courseAction, coursePending] = useActionState(updateCourseAction, initialState);
  const [moduleState, moduleAction, modulePending] = useActionState(createModuleAction, initialState);
  const [lessonState, lessonAction, lessonPending] = useActionState(createLessonAction, initialState);
  const [quizState, quizAction, quizPending] = useActionState(createQuizAction, initialState);
  const [assignmentState, assignmentAction, assignmentPending] = useActionState(assignLearnerAction, initialState);

  return (
    <div className="grid gap-5">
      <form action={courseAction} className="rounded-lg border border-line bg-surface p-5">
        <input name="courseId" type="hidden" value={course.id} />
        <div className="flex items-center gap-3">
          <Save className="h-5 w-5 text-market" aria-hidden="true" />
          <h2 className="text-xl font-black">Parametres formation</h2>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-black">
            Titre
            <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" defaultValue={course.title} name="title" />
            {courseState.errors?.title ? <span className="mt-2 block text-xs text-danger">{courseState.errors.title[0]}</span> : null}
          </label>
          <label className="text-sm font-black">
            Type
            <select className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" defaultValue={course.type} name="type">
              <option value="FREE">Gratuite</option>
              <option value="PAID">Payante hors plateforme</option>
            </select>
          </label>
          <label className="text-sm font-black">
            Prix hors plateforme
            <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" defaultValue={course.priceLabel ?? ""} name="priceLabel" />
          </label>
          <label className="text-sm font-black">
            Duree
            <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" defaultValue={course.duration ?? ""} name="duration" />
            {courseState.errors?.duration ? <span className="mt-2 block text-xs text-danger">{courseState.errors.duration[0]}</span> : null}
          </label>
        </div>
        <label className="mt-4 block text-sm font-black">
          Description
          <textarea className="mt-2 min-h-28 w-full rounded-lg border border-line bg-background p-3 text-sm" defaultValue={course.description} name="description" />
          {courseState.errors?.description ? <span className="mt-2 block text-xs text-danger">{courseState.errors.description[0]}</span> : null}
        </label>
        <StateMessage state={courseState} />
        <button className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market disabled:opacity-60" disabled={coursePending} type="submit">
          {coursePending ? "Enregistrement..." : "Enregistrer"}
        </button>
      </form>

      <div className="grid gap-3 sm:grid-cols-2">
        {course.status !== "PUBLISHED" ? (
          <form action={setCourseStatusAction} className="rounded-lg border border-line bg-surface p-4">
            <input name="courseId" type="hidden" value={course.id} />
            <input name="status" type="hidden" value="PUBLISHED" />
            <button className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-market px-3 text-sm font-black text-on-market" type="submit">
              <CheckCircle2 className="h-4 w-4" /> Publier
            </button>
          </form>
        ) : null}
        {course.status !== "ARCHIVED" ? (
          <form action={setCourseStatusAction} className="rounded-lg border border-line bg-surface p-4">
            <input name="courseId" type="hidden" value={course.id} />
            <input name="status" type="hidden" value="ARCHIVED" />
            <button className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-line bg-foreground/[0.06] px-3 text-sm font-black" type="submit">
              <Archive className="h-4 w-4" /> Archiver
            </button>
          </form>
        ) : null}
      </div>

      <form action={moduleAction} className="rounded-lg border border-line bg-surface p-5">
        <input name="courseId" type="hidden" value={course.id} />
        <div className="flex items-center gap-3">
          <Layers3 className="h-5 w-5 text-cyan" aria-hidden="true" />
          <h2 className="text-xl font-black">Ajouter un module</h2>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-black">
            Titre
            <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" name="title" />
            {moduleState.errors?.title ? <span className="mt-2 block text-xs text-danger">{moduleState.errors.title[0]}</span> : null}
          </label>
          <label className="text-sm font-black">
            Description
            <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" name="description" />
          </label>
        </div>
        <StateMessage state={moduleState} />
        <button className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market disabled:opacity-60" disabled={modulePending} type="submit">
          {modulePending ? "Creation..." : "Creer le module"}
        </button>
      </form>

      <form action={lessonAction} className="rounded-lg border border-line bg-surface p-5" encType="multipart/form-data">
        <div className="flex items-center gap-3">
          <FilePlus2 className="h-5 w-5 text-amber" aria-hidden="true" />
          <h2 className="text-xl font-black">Ajouter une lecon</h2>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-black">
            Module
            <select className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" name="moduleId">
              {modules.map((module) => (
                <option key={module.id} value={module.id}>
                  {module.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-black">
            Type
            <select className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" name="type">
              <option value="TEXT">Texte</option>
              <option value="VIDEO">Video privee</option>
              <option value="DOCUMENT">Document</option>
              <option value="QUIZ">Quiz</option>
            </select>
          </label>
          <label className="text-sm font-black">
            Titre
            <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" name="title" />
            {lessonState.errors?.title ? <span className="mt-2 block text-xs text-danger">{lessonState.errors.title[0]}</span> : null}
          </label>
          <label className="text-sm font-black">
            Chemin video/document prive
            <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" name="videoPath" placeholder="videos/lesson.mp4" />
          </label>
          <label className="text-sm font-black">
            Fichier prive
            <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 py-2 text-sm" name="asset" type="file" />
          </label>
        </div>
        <label className="mt-4 block text-sm font-black">
          Contenu texte
          <textarea className="mt-2 min-h-24 w-full rounded-lg border border-line bg-background p-3 text-sm" name="content" />
        </label>
        <input name="documentPath" type="hidden" value="" />
        <StateMessage state={lessonState} />
        <button className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market disabled:opacity-60" disabled={lessonPending || modules.length === 0} type="submit">
          {lessonPending ? "Creation..." : "Creer la lecon"}
        </button>
      </form>

      <form action={quizAction} className="rounded-lg border border-line bg-surface p-5">
        <h2 className="text-xl font-black">Configurer un quiz</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="text-sm font-black">
            Lecon quiz
            <select className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" name="lessonId">
              {quizLessons.map((lesson) => (
                <option key={lesson.id} value={lesson.id}>
                  {lesson.title}
                </option>
              ))}
            </select>
          </label>
          <label className="text-sm font-black">
            Titre quiz
            <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" name="title" />
          </label>
          <label className="text-sm font-black">
            Score minimum
            <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" defaultValue="70" name="minimumScore" type="number" />
          </label>
          <label className="text-sm font-black">
            Tentatives
            <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" defaultValue="3" name="maxAttempts" type="number" />
          </label>
        </div>
        <label className="mt-4 flex items-center gap-2 text-sm font-black">
          <input className="accent-[var(--market)]" name="blocking" type="checkbox" />
          Quiz bloquant
        </label>
        <label className="mt-4 block text-sm font-black">
          Question
          <input className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" name="questionText" />
        </label>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <input className="min-h-11 rounded-lg border border-line bg-background px-3 text-sm" name="optionA" placeholder="Option A" />
          <input className="min-h-11 rounded-lg border border-line bg-background px-3 text-sm" name="optionB" placeholder="Option B" />
          <input className="min-h-11 rounded-lg border border-line bg-background px-3 text-sm" name="optionC" placeholder="Option C" />
        </div>
        <label className="mt-4 block text-sm font-black">
          Bonne reponse
          <select className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" name="correctOption">
            <option value="A">Option A</option>
            <option value="B">Option B</option>
            <option value="C">Option C</option>
          </select>
        </label>
        <StateMessage state={quizState} />
        <button className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market disabled:opacity-60" disabled={quizPending || quizLessons.length === 0} type="submit">
          {quizPending ? "Creation..." : "Creer le quiz"}
        </button>
      </form>

      <form action={assignmentAction} className="rounded-lg border border-line bg-surface p-5">
        <input name="courseId" type="hidden" value={course.id} />
        <h2 className="text-xl font-black">Inscrire un apprenant</h2>
        <label className="mt-5 block text-sm font-black">
          Apprenant
          <select className="mt-2 min-h-11 w-full rounded-lg border border-line bg-background px-3 text-sm" name="learnerId">
            {learners.map((learner) => (
              <option key={learner.id} value={learner.id}>
                {learner.name} - {learner.email}
              </option>
            ))}
          </select>
        </label>
        <StateMessage state={assignmentState} />
        <button
          className="mt-5 inline-flex min-h-11 items-center justify-center rounded-lg bg-market px-4 text-sm font-black text-on-market disabled:opacity-60"
          disabled={assignmentPending || learners.length === 0}
          type="submit"
        >
          {assignmentPending ? "Inscription..." : "Inscrire"}
        </button>
      </form>
    </div>
  );
}
