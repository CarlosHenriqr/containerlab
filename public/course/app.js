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
    location.href = `module.html?module=${card.querySelector('[data-module]').dataset.module}`;
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
