if (new URLSearchParams(window.location.search).has("embedded")) {
  document.body.classList.add("embedded");
}

const modules = [...document.querySelectorAll('[data-module]')];
const tasks = [...document.querySelectorAll('[data-task]')];
const progressText = document.querySelector('#progressText');
const progressLine = document.querySelector('#progressLine');
const accountProgress = document.querySelector('#accountProgress');
let accountSyncEnabled = false;

function syncProgress() {
  const complete = modules.filter(item => item.checked).length;
  progressText.textContent = `${complete} de ${modules.length}`;
  progressLine.style.width = `${(complete / modules.length) * 100}%`;
  accountProgress.textContent = `${Math.round((complete / modules.length) * 100)}%`;
  document.querySelectorAll('[data-badge]').forEach(badge => {
    badge.classList.toggle('earned', complete >= Number(badge.dataset.badge) * 3);
  });
  modules.forEach(item => localStorage.setItem(`containerlab-module-${item.dataset.module}`, item.checked));
}

async function saveModule(module) {
  if (!accountSyncEnabled) return;
  try {
    await fetch('/api/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        moduleId: Number(module.dataset.module),
        completed: module.checked,
        practiceComplete: false,
      }),
    });
  } catch {
    // Progresso local continua disponível se a rede estiver indisponível.
  }
}

modules.forEach(item => {
  item.checked = localStorage.getItem(`containerlab-module-${item.dataset.module}`) === 'true';
  item.addEventListener('change', () => {
    syncProgress();
    void saveModule(item);
  });
});

document.querySelectorAll('.module').forEach(card => {
  card.tabIndex = 0;
  card.setAttribute('role', 'link');
  card.setAttribute('aria-label', `Abrir aula: ${card.querySelector('h3').textContent}`);
  const openLesson = event => {
    if (event.target.closest('label, input')) return;
    location.href = `module.html?module=${card.querySelector('[data-module]').dataset.module}&embedded=1`;
  };
  card.addEventListener('click', openLesson);
  card.addEventListener('keydown', event => { if (event.key === 'Enter') openLesson(event); });
});
tasks.forEach(item => {
  item.checked = localStorage.getItem(`containerlab-task-${item.dataset.task}`) === 'true';
  item.addEventListener('change', () => localStorage.setItem(`containerlab-task-${item.dataset.task}`, item.checked));
});
syncProgress();

async function loadAccountProgress() {
  try {
    const response = await fetch('/api/progress');
    if (!response.ok) return;

    accountSyncEnabled = true;
    const { progress } = await response.json();
    if (!progress.length) {
      await Promise.all(modules.filter(module => module.checked).map(saveModule));
    } else {
      const completedIds = new Set(progress.filter(item => item.completed).map(item => item.moduleId));
      modules.forEach(module => {
        module.checked = completedIds.has(Number(module.dataset.module));
        localStorage.setItem(`containerlab-module-${module.dataset.module}`, module.checked);
      });
      syncProgress();
    }
  } catch {
    // Visitantes e falhas de rede usam o progresso local sem interromper o curso.
  }
}

void loadAccountProgress();

const moduleGroups = [
  ['Ambiente e fundamentos', 'Windows, WSL 2, Docker Desktop e primeiro container.', [1, 2]],
  ['Docker na prática', 'Portas, logs, ciclo de vida e Dockerfile.', [3, 4, 5]],
  ['Aplicações com Docker', 'Compose, volumes, redes e banco de dados.', [6, 7]],
  ['Fundamentos de Kubernetes', 'Kind, kubectl, Pods, Deployments e labels.', [8, 9]],
  ['Kubernetes em operação', 'Services, configuração, escala, rollouts e probes.', [10, 11, 12, 13]],
  ['Publicação e projeto final', 'Ingress, persistência, Helm e entrega.', [14, 15, 16]],
];

const groupStyle = document.createElement('style');
groupStyle.textContent = '.module-overview{display:grid;grid-template-columns:repeat(2,1fr);border:1px solid var(--line);margin-top:25px}.course-module{padding:28px;border-right:1px solid var(--line);border-bottom:1px solid var(--line);background:#f9fbfe}.course-module:nth-child(2n){border-right:0}.course-module:nth-last-child(-n+2){border-bottom:0}.course-module>span{font:11px "DM Mono",monospace;color:var(--blue)}.course-module h3{font-size:23px;letter-spacing:-1px;margin:12px 0 8px}.course-module>p{color:var(--muted);font-size:14px;line-height:1.6;margin:0 0 20px}.course-lessons{display:grid;gap:7px;margin-bottom:20px}.course-lessons a{padding:9px 10px;border:1px solid var(--line);border-radius:7px;background:#fff;font-size:13px;font-weight:700}.course-lessons a:hover{border-color:var(--blue);color:var(--blue)}.course-module-footer{display:flex;align-items:center;justify-content:space-between;font-size:13px;font-weight:800}.course-module-footer a{color:var(--blue)}@media(max-width:700px){.module-overview{grid-template-columns:1fr}.course-module,.course-module:nth-child(2n){border-right:0;border-bottom:1px solid var(--line)}.course-module:last-child{border-bottom:0}}';
document.head.append(groupStyle);
const moduleGrid = document.querySelector('#moduleGrid');
if (moduleGrid) {
  const overview = document.createElement('section');
  overview.className = 'module-overview';
  overview.innerHTML = moduleGroups.map(([title, description, lessonIds], index) => {
    const lessons = lessonIds.map((lessonId) => {
      const card = document.querySelector(`[data-module="${lessonId}"]`).closest('.module');
      return `<a href="module.html?module=${lessonId}&embedded=1">${String(lessonId).padStart(2, '0')} · ${card.querySelector('h3').textContent}</a>`;
    }).join('');
    return `<article class="course-module"><span>MÓDULO ${String(index + 1).padStart(2, '0')}</span><h3>${title}</h3><p>${description}</p><div class="course-lessons">${lessons}</div><div class="course-module-footer"><span>${lessonIds.length} aulas</span><a href="assessment.html?module=${index + 1}">Avaliação</a></div></article>`;
  }).join('');
  moduleGrid.before(overview);
  moduleGrid.style.display = 'none';
  document.querySelector('.filters').style.display = 'none';
}

document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => {
  document.querySelectorAll('.filter').forEach(item => item.classList.remove('active'));
  button.classList.add('active');
  document.querySelectorAll('.module').forEach(module => {
    module.classList.toggle('hidden', button.dataset.filter !== 'all' && !module.classList.contains(button.dataset.filter));
  });
}));

document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(button.dataset.copy);
    const label = button.querySelector('b');
    label.textContent = 'copiado!';
    setTimeout(() => { label.textContent = 'copiar'; }, 1400);
  } catch { /* Clipboard may be unavailable in a local file preview. */ }
}));
