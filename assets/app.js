const COURSE_KEY = "blakedev_wp_course_v2";

const units = [
  { id: 1, title: "Unidad 1: Instalación y configuración", path: "Modulos/Modulo-1.html", pdf: "Manuales/Unidad 1.pdf" },
  { id: 2, title: "Unidad 2: Gestión de páginas y contenidos 1", path: "Modulos/Modulo-2.html", pdf: "Manuales/Unidad 2.pdf" },
  { id: 3, title: "Unidad 3: Gestión de páginas y contenidos 2", path: "Modulos/Modulo-3.html", pdf: "Manuales/Unidad 3.pdf" },
  { id: 4, title: "Unidad 4: Menús y Widgets", path: "Modulos/Modulo-4.html", pdf: "Manuales/Unidad 4.pdf" },
  { id: 5, title: "Unidad 5: Plugins y Usuarios", path: "Modulos/Modulo-5.html", pdf: "Manuales/Unidad 5.pdf" },
  { id: 6, title: "Unidad 6: Contenidos con Canva", path: "Modulos/Modulo-6.html", pdf: "Manuales/Unidad 6.pdf" },
];

// Quizzes (puedes editar preguntas cuando quieras)
const quizzes = {
  1: [
    { q: "¿Para qué se usa XAMPP en el curso?", a: ["Para diseñar logos", "Para correr WordPress en local", "Para traducir temas"], correct: 1 },
    { q: "¿Dónde se descarga WordPress?", a: ["wordpress.org", "wordpress.net", "wp-download.pe"], correct: 0 },
    { q: "¿Qué componente maneja la BD (MySQL/MariaDB) en XAMPP?", a: ["Apache", "MariaDB/MySQL", "Perl"], correct: 1 },
  ],
  2: [
    { q: "En WordPress, ¿qué es una 'Entrada'?", a: ["Una página estática", "Un post del blog", "Un plugin"], correct: 1 },
    { q: "¿Qué controla principalmente el 'Tema'?", a: ["La apariencia del sitio", "La base de datos", "El dominio"], correct: 0 },
    { q: "Elementor se usa para…", a: ["Editar visualmente páginas", "Crear servidores", "Comprimir imágenes"], correct: 0 },
  ],
  3: [
    { q: "Las publicaciones del blog se muestran en…", a: ["Orden cronológico inverso", "Orden alfabético", "Orden aleatorio"], correct: 0 },
    { q: "¿Dónde gestionas comentarios?", a: ["Apariencia", "Comentarios", "Herramientas"], correct: 1 },
    { q: "Para no perder cambios al editar, debes…", a: ["Cerrar sesión", "Actualizar/Guardar", "Borrar caché"], correct: 1 },
  ],
  4: [
    { q: "Los menús se gestionan en…", a: ["Apariencia > Menús", "Plugins", "Medios"], correct: 0 },
    { q: "Los widgets permiten…", a: ["Agregar bloques/funciones en zonas del tema", "Cambiar DNS", "Crear usuarios"], correct: 0 },
    { q: "¿Qué acción final es clave al editar menús?", a: ["Guardar menú", "Reiniciar PC", "Desinstalar tema"], correct: 0 },
  ],
  5: [
    { q: "Un plugin sirve para…", a: ["Agregar funcionalidad", "Cambiar el SO", "Borrar páginas"], correct: 0 },
    { q: "Antes de instalar un plugin, revisas…", a: ["Reputación y compatibilidad", "El color del logo", "Tu edad"], correct: 0 },
    { q: "Roles típicos en WordPress incluyen…", a: ["Administrador y Editor", "Piloto y Copiloto", "Chef y Mesero"], correct: 0 },
  ],
  6: [
    { q: "Canva se usa para…", a: ["Diseño de piezas gráficas", "Alojar bases de datos", "Programar PHP"], correct: 0 },
    { q: "Para exportar optimizado para web debes…", a: ["Ajustar calidad/tamaño", "Aumentar peso", "Guardar como .exe"], correct: 0 },
    { q: "La opción para animar en Canva es…", a: ["Animar", "Consola", "Deploy"], correct: 0 },
  ],
};

const PASS_PERCENT = 70; // requisito para certificado

function defaultState(){
  return { completed: [], quiz: {}, createdAt: new Date().toISOString() };
}

function loadState(){
  try{
    const raw = localStorage.getItem(COURSE_KEY);
    if(!raw) return defaultState();
    const s = JSON.parse(raw);
    if(!Array.isArray(s.completed)) s.completed = [];
    if(typeof s.quiz !== "object" || !s.quiz) s.quiz = {};
    return s;
  } catch { return defaultState(); }
}

function saveState(state){
  localStorage.setItem(COURSE_KEY, JSON.stringify(state));
}

function completionPercent(state){
  return Math.round((state.completed.length / units.length) * 100);
}

function setProgressUI(p){
  const bar = document.querySelector("[data-progress-bar]");
  const label = document.querySelector("[data-progress-label]");
  if(bar) bar.style.width = `${p}%`;
  if(label) label.textContent = `${p}% completado`;
}

function renderUnitBadges(state){
  document.querySelectorAll("[data-unit-badge]").forEach(el=>{
    const id = Number(el.getAttribute("data-unit-badge"));
    const done = state.completed.includes(id);
    el.textContent = done ? "Completado ✅" : "Pendiente";
    el.classList.toggle("ok", done);
    el.classList.toggle("warn", !done);
  });
}

function firstIncompleteUnit(state){
  for(const u of units){
    if(!state.completed.includes(u.id)) return u;
  }
  return null;
}

function markUnitCompleted(unitId){
  const state = loadState();
  if(!state.completed.includes(unitId)){
    state.completed.push(unitId);
    state.completed.sort((a,b)=>a-b);
    saveState(state);
  }
  refreshAllUI();
}

function resetAll(){
  saveState(defaultState());
  refreshAllUI();
}

function quizScore(state, unitId){
  return state.quiz?.[unitId]?.score ?? null;
}

function quizPassed(state, unitId){
  const score = quizScore(state, unitId);
  return typeof score === "number" && score >= PASS_PERCENT;
}

function allQuizzesPassed(state){
  return units.every(u => quizPassed(state, u.id));
}

function canGetCertificate(state){
  return completionPercent(state) === 100 && allQuizzesPassed(state);
}

function renderContinueButton(state){
  const btn = document.querySelector("[data-continue-btn]");
  if(!btn) return;

  const next = firstIncompleteUnit(state);
  if(next){
    btn.disabled = false;
    btn.textContent = `Continuar: ${next.title}`;
    btn.onclick = () => { window.location.href = next.path; };
  } else {
    btn.disabled = false;
    btn.textContent = "Continuar: Curso completado ✅";
    btn.onclick = () => { window.location.href = units[units.length-1].path; };
  }
}

function renderCertificateButton(state){
  const btn = document.querySelector("[data-certificate-btn]");
  const hint = document.querySelector("[data-certificate-hint]");
  if(!btn) return;

  const ok = canGetCertificate(state);
  btn.disabled = !ok;

  if(hint){
    if(ok) hint.textContent = "Listo: ya puedes generar tu certificado 🎓";
    else hint.textContent = `Requisito: 100% unidades + quizzes >= ${PASS_PERCENT}%`;
  }

  btn.onclick = () => generateCertificate(state);
}

function generateCertificate(state){
  const userName = prompt("Nombre para el certificado (ej: Nayeli Paitan):", "Nayeli Paitan");
  if(!userName) return;

  const date = new Date().toLocaleDateString("es-PE", { year:"numeric", month:"long", day:"numeric" });
  const url = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "/");

  // Certificado HTML imprimible (Guardar como PDF desde el navegador)
  const html = `
<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Certificado - Curso WordPress</title>
<style>
  body{margin:0;font-family:system-ui,Arial;background:#081430;color:#eaf0ff}
  .wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:30px}
  .cert{
    width:min(1000px, 100%);
    border-radius:22px;
    border:1px solid rgba(255,255,255,.14);
    background:
      radial-gradient(900px 500px at 15% 10%, rgba(168,85,247,.30), transparent 55%),
      radial-gradient(900px 500px at 85% 20%, rgba(34,211,238,.18), transparent 55%),
      linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.03));
    padding:44px;
    position:relative;
    overflow:hidden;
  }
  .badge{
    display:inline-block;
    padding:8px 12px;
    border-radius:999px;
    border:1px solid rgba(255,255,255,.18);
    background:rgba(255,255,255,.04);
    font-size:12px;
    opacity:.9;
  }
  h1{margin:14px 0 6px;font-size:40px;line-height:1.1}
  .sub{opacity:.8;margin:0 0 26px}
  .name{font-size:34px;font-weight:900;margin:10px 0}
  .p{opacity:.85;max-width:75ch}
  .row{display:flex;gap:18px;flex-wrap:wrap;margin-top:30px;align-items:flex-end;justify-content:space-between}
  .sig{opacity:.85}
  .line{height:1px;background:rgba(255,255,255,.14);margin-top:10px}
  .seal{
    width:56px;height:56px;border-radius:18px;
    background:linear-gradient(135deg,#a855f7,#22d3ee);
    box-shadow:0 12px 40px rgba(168,85,247,.25);
  }
  .small{opacity:.75;font-size:12px}
  @media print{
    body{background:white;color:black}
    .cert{border:1px solid #ddd}
    .badge,.small,.sub,.p,.sig{color:#111 !important}
  }
</style>
</head>
<body>
<div class="wrap">
  <div class="cert">
    <div class="badge">Blake Dev · Certificación</div>
    <h1>Certificado de Finalización</h1>
    <p class="sub">Curso Profesional de WordPress</p>

    <p class="p">Se certifica que:</p>
    <div class="name">${escapeHtml(userName)}</div>

    <p class="p">
      Ha completado el curso (6 unidades) y aprobó las evaluaciones (quizzes) con los criterios establecidos.
    </p>

    <div class="row">
      <div class="sig">
        <div class="seal"></div>
        <div class="line"></div>
        <div class="small">Nayeli Paitan (Blake Dev)</div>
      </div>
      <div class="sig">
        <div class="small">Fecha</div>
        <div style="font-weight:800">${date}</div>
        <div class="small">Sitio: ${escapeHtml(url)}</div>
      </div>
    </div>

    <p class="small" style="margin-top:22px">
      Para guardarlo como PDF: Imprimir → Destino: “Guardar como PDF”.
    </p>
  </div>
</div>

<script>
  // abre diálogo de impresión automáticamente
  setTimeout(() => window.print(), 400);
</script>
</body>
</html>`;

  const w = window.open("", "_blank");
  w.document.open();
  w.document.write(html);
  w.document.close();
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function renderQuiz(unitId, mountSelector){
  const mount = document.querySelector(mountSelector);
  if(!mount) return;

  const bank = quizzes[unitId];
  if(!bank) return;

  const state = loadState();
  const prev = state.quiz?.[unitId];

  mount.innerHTML = `
    <div class="quiz">
      <h2>Quiz de la Unidad ${unitId}</h2>
      <div class="small">Aprobación: ${PASS_PERCENT}% o más.</div>
      <div id="quiz-qs"></div>
      <div class="quizResult">
        <div>
          <span class="badge ${prev ? (prev.score >= PASS_PERCENT ? "ok" : "fail") : "warn"}" id="quizBadge">
            ${prev ? `Último puntaje: ${prev.score}%` : "Sin intento"}
          </span>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          <button class="btn" id="quizReset" type="button">Reintentar</button>
          <button class="btn primary" id="quizSubmit" type="button">Enviar respuestas</button>
        </div>
      </div>
    </div>
  `;

  const qs = mount.querySelector("#quiz-qs");

  bank.forEach((item, idx) => {
    const qId = `q_${unitId}_${idx}`;
    const options = item.a.map((opt, oidx) => `
      <label>
        <input type="radio" name="${qId}" value="${oidx}"> ${opt}
      </label>
    `).join("");

    const el = document.createElement("div");
    el.className = "q";
    el.innerHTML = `
      <div class="qtitle">${idx+1}. ${item.q}</div>
      ${options}
    `;
    qs.appendChild(el);
  });

  mount.querySelector("#quizReset").addEventListener("click", () => {
    mount.querySelectorAll("input[type=radio]").forEach(i => i.checked = false);
  });

  mount.querySelector("#quizSubmit").addEventListener("click", () => {
    let correct = 0;

    bank.forEach((item, idx) => {
      const qId = `q_${unitId}_${idx}`;
      const chosen = mount.querySelector(`input[name="${qId}"]:checked`);
      if(!chosen) return;
      if(Number(chosen.value) === item.correct) correct++;
    });

    const score = Math.round((correct / bank.length) * 100);
    const state = loadState();
    state.quiz[unitId] = { score, at: new Date().toISOString() };
    saveState(state);

    const badge = mount.querySelector("#quizBadge");
    badge.textContent = `Último puntaje: ${score}%`;
    badge.classList.remove("ok","warn","fail");
    badge.classList.add(score >= PASS_PERCENT ? "ok" : "fail");

    // refrescar UI global (certificado, progreso, etc.)
    refreshAllUI();
  });
}

function refreshAllUI(){
  const state = loadState();
  setProgressUI(completionPercent(state));
  renderUnitBadges(state);
  renderContinueButton(state);
  renderCertificateButton(state);

  // Estado en página de unidad (si existe)
  const here = document.querySelector("[data-here-status]");
  const hereId = Number(document.body.getAttribute("data-unit-id") || "0");
  if(here && hereId){
    here.textContent = state.completed.includes(hereId) ? "Completado ✅" : "Pendiente";
  }

  // Badge quiz en cards (si existen)
  document.querySelectorAll("[data-quiz-badge]").forEach(el=>{
    const id = Number(el.getAttribute("data-quiz-badge"));
    const s = loadState();
    const score = quizScore(s, id);

    if(score === null){
      el.textContent = "Quiz: sin intento";
      el.className = "badge warn";
    } else if(score >= PASS_PERCENT){
      el.textContent = `Quiz: ${score}% ✅`;
      el.className = "badge ok";
    } else {
      el.textContent = `Quiz: ${score}% ❌`;
      el.className = "badge fail";
    }
  });
}

window.Course = {
  units,
  loadState,
  saveState,
  completionPercent,
  markUnitCompleted,
  resetAll,
  firstIncompleteUnit,
  canGetCertificate,
  renderQuiz,
  refreshAllUI
};
