(() => {
  const params = new URLSearchParams(location.search);
  const embedded = params.has("embedded") || window.self !== window.top;
  if (embedded) document.body.classList.add("embedded");

  const lessons = window.containerLabLessons || [];
  const requested = Number(params.get("module")) || 1;
  const current = Math.min(Math.max(requested, 1), lessons.length);
  const lesson = lessons[current - 1];
  if (!lesson) return;

  const escapeHtml = value => String(value).replace(/[&<>'"]/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[character]);
  const setText = (selector, value) => { document.querySelector(selector).textContent = value; };
  const commandBox = item => `<div class="command-box"><code>${escapeHtml(item.value)}</code><button class="copy-command" type="button" data-command="${escapeHtml(item.value)}">copiar</button>${item.note ? `<p>${escapeHtml(item.note)}</p>` : ""}</div>`;

  document.title = `${lesson.title} | Container Lab`;
  setText("#lessonPosition", `AULA ${String(current).padStart(2, "0")} DE ${lessons.length}`);
  setText("#lessonTitle", lesson.title);
  setText("#lessonLead", lesson.lead);
  setText("#lessonDuration", lesson.duration);
  setText("#lessonObjective", lesson.objective);
  setText("#lessonOutcome", lesson.outcome);
  setText("#lessonConcept", lesson.concept);
  setText("#labTitle", lesson.lab);
  setText("#lessonExpected", lesson.outcome);
  setText("#lessonSafety", lesson.safety);
  setText("#lessonChallenge", lesson.challenge);

  document.querySelector("#lessonPrerequisites").innerHTML = lesson.prerequisites.map(item => `<li>${escapeHtml(item)}</li>`).join("");
  document.querySelector("#keyIdeas").innerHTML = lesson.ideas.map((idea, index) => `<div class="idea"><b>${String(index + 1).padStart(2, "0")}</b><p>${escapeHtml(idea)}</p></div>`).join("");
  document.querySelector("#lessonGlossary").innerHTML = lesson.glossary.map(([term, definition]) => `<div class="glossary-item"><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(definition)}</dd></div>`).join("");
  document.querySelector("#steps").innerHTML = lesson.steps.map(item => `<li><h3>${escapeHtml(item.title)}</h3><p>${escapeHtml(item.text)}</p>${item.commands.map(commandBox).join("")}<p class="step-verify"><strong>Valide:</strong> ${escapeHtml(item.verify)}</p></li>`).join("");
  document.querySelector("#lessonIssues").innerHTML = lesson.errors.map(item => `<article class="issue-card"><h3>${escapeHtml(item.symptom)}</h3><dl><div><dt>Causa provável</dt><dd>${escapeHtml(item.cause)}</dd></div><div><dt>Como corrigir</dt><dd>${escapeHtml(item.fix)}</dd></div></dl></article>`).join("");
  document.querySelector("#lessonChecklist").innerHTML = lesson.checklist.map(item => `<li>${escapeHtml(item)}</li>`).join("");
  document.querySelector("#lessonCleanup").innerHTML = lesson.cleanup.map(commandBox).join("");
  document.querySelector("#lessonResources").innerHTML = lesson.resources.map(item => `<a href="${escapeHtml(item.href)}" target="_blank" rel="noreferrer"><span>Documentação oficial</span><strong>${escapeHtml(item.label)}</strong><b aria-hidden="true">↗</b></a>`).join("");

  const completeButton = document.querySelector("#complete");
  const status = document.querySelector(".lesson-status");
  const statusText = document.querySelector("#statusText");
  const key = `containerlab-module-${current}`;
  const paint = done => {
    status.classList.toggle("done", done);
    statusText.textContent = done ? "Concluída" : "Ainda não concluída";
    completeButton.textContent = done ? "Concluída ✓" : "Marcar como concluída ✓";
  };
  const isDone = () => localStorage.getItem(key) === "true";
  paint(isDone());

  completeButton.addEventListener("click", () => {
    localStorage.setItem(key, "true");
    paint(true);
    void fetch("/api/progress", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ moduleId: current, completed: true, practiceComplete: false })
    }).catch(() => {});
  });

  void fetch("/api/progress")
    .then(response => response.ok ? response.json() : null)
    .then(data => {
      if (data?.progress?.some(item => item.moduleId === current && item.completed)) {
        localStorage.setItem(key, "true");
        paint(true);
      }
    })
    .catch(() => {});

  document.querySelector("#previous").disabled = current === 1;
  document.querySelector("#next").disabled = current === lessons.length;
  const lessonUrl = id => `module.html?module=${id}${embedded ? "&embedded=1" : ""}`;
  document.querySelector("#previous").addEventListener("click", () => location.href = lessonUrl(current - 1));
  document.querySelector("#next").addEventListener("click", () => location.href = lessonUrl(current + 1));
  document.addEventListener("click", async event => {
    const button = event.target.closest("[data-command]");
    if (!button) return;
    try {
      await navigator.clipboard.writeText(button.dataset.command);
      button.textContent = "copiado!";
      setTimeout(() => { button.textContent = "copiar"; }, 1200);
    } catch {
      button.textContent = "copie manualmente";
    }
  });
})();
