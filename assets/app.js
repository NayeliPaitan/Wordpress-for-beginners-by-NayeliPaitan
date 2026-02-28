const COURSE_KEY = "wp_course_progress_v1";

const units = [
  { id: 1, title: "Unidad 1: Instalación y configuración", path: "unidades/unidad-1.html" },
  { id: 2, title: "Unidad 2: Gestión de páginas y contenidos 1", path: "unidades/unidad-2.html" },
  { id: 3, title: "Unidad 3: Gestión de páginas y contenidos 2", path: "unidades/unidad-3.html" },
  { id: 4, title: "Unidad 4: Menús y Widgets", path: "unidades/unidad-4.html" },
  { id: 5, title: "Unidad 5: Plugins y Usuarios", path: "unidades/unidad-5.html" },
  { id: 6, title: "Unidad 6: Contenidos con Canva", path: "unidades/unidad-6.html" },
];

function loadProgress(){
  try{
    const raw = localStorage.getItem(COURSE_KEY);
    if(!raw) return { completed: [] };
    const parsed = JSON.parse(raw);
    if(!parsed.completed) parsed.completed = [];
    return parsed;
  } catch {
    return { completed: [] };
  }
}
function saveProgress(state){
  localStorage.setItem(COURSE_KEY, JSON.stringify(state));
}
function percent(state){
  return Math.round((state.completed.length / units.length) * 100);
}
function setBar(p){
  const bar = document.querySelector("[data-progress-bar]");
  const label = document.querySelector("[data-progress-label]");
  if(bar) bar.style.width = `${p}%`;
  if(label) label.textContent = `${p}% completado`;
}
function renderBadges(state){
  document.querySelectorAll("[data-unit-badge]").forEach(el=>{
    const id = Number(el.getAttribute("data-unit-badge"));
    const done = state.completed.includes(id);
    el.textContent = done ? "Completado ✅" : "Pendiente";
  });
}
function markCompleted(unitId){
  const state = loadProgress();
  if(!state.completed.includes(unitId)){
    state.completed.push(unitId);
    state.completed.sort((a,b)=>a-b);
    saveProgress(state);
  }
  const p = percent(state);
  setBar(p);
  renderBadges(state);
  const here = document.querySelector("[data-here-status]");
  if(here) here.textContent = "Completado ✅";
}
function resetProgress(){
  saveProgress({ completed: [] });
  const state = loadProgress();
  setBar(percent(state));
  renderBadges(state);
  const here = document.querySelector("[data-here-status]");
  if(here) here.textContent = "Pendiente";
}

window.Course = {
  units,
  loadProgress,
  percent,
  setBar,
  renderBadges,
  markCompleted,
  resetProgress
};
