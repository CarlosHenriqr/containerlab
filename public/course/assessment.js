const moduleSelect = document.querySelector('#module');
const quiz = document.querySelector('#quiz');
const state = document.querySelector('#state');
const result = document.querySelector('#result');
let questions = [];

const style = document.createElement('style');
style.textContent = `.assessment{max-width:980px!important;padding-top:54px!important}.assessment-head{align-items:center!important;padding:28px 30px;background:#fff;border:1px solid #c8d6e7;border-radius:14px}.assessment h1{font-size:clamp(38px,5vw,60px)!important;max-width:520px}.assessment>#state{min-height:24px;margin:26px 0;color:#526b87;font:13px "DM Mono",monospace}.question{background:#fff;border:1px solid #c8d6e7!important;border-radius:14px;padding:24px!important;margin:14px 0}.question h2{margin-top:0}.option{transition:border-color .16s,background .16s}.option:hover{border-color:#1267e8}.assessment>#submit{margin-top:12px}.locked{padding:30px;border:1px dashed #8fa4bd;border-radius:14px;background:#eef5ff;color:#10233d;font-size:16px;line-height:1.6}.locked b{display:block;font-size:21px;margin-bottom:8px}.result{border:1px solid #b9d5ff}@media(max-width:650px){.assessment-head{padding:22px}.question{padding:19px!important}}`;
document.head.append(style);

const moduleId = () => Number(moduleSelect.value);

async function load() {
  result.innerHTML = '';
  quiz.innerHTML = '';
  state.textContent = 'Carregando avaliação...';
  const response = await fetch(`/api/assessments/${moduleId()}`);
  if (response.status === 423) {
    const data = await response.json();
    state.textContent = '';
    result.innerHTML = `<div class="locked"><b>Avaliação bloqueada</b>Conclua as aulas ${data.missingLessons.map(id => String(id).padStart(2, '0')).join(', ')} na trilha. A prova será liberada automaticamente.</div>`;
    return;
  }
  if (!response.ok) {
    state.textContent = 'Entre na sua conta para realizar e salvar esta avaliação.';
    return;
  }
  const data = await response.json();
  questions = data.questions;
  state.textContent = `${data.title} · ${data.attempts.length ? `última tentativa: ${data.attempts[0].score}%` : '10 perguntas · nenhuma tentativa ainda'}`;
  quiz.innerHTML = questions.map((question, index) => `<fieldset class="question"><h2>${String(index + 1).padStart(2, '0')} · ${question.prompt}</h2>${question.options.map((option, optionIndex) => `<label class="option"><input required type="radio" name="q${index}" value="${optionIndex}">${option}</label>`).join('')}</fieldset>`).join('');
}

moduleSelect.value = new URLSearchParams(location.search).get('module') || '1';
moduleSelect.onchange = load;

quiz.onsubmit = async event => {
  event.preventDefault();
  const answers = questions.map((_, index) => Number(new FormData(quiz).get(`q${index}`)));
  const response = await fetch(`/api/assessments/${moduleId()}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers }) });
  if (!response.ok) { state.textContent = 'Não foi possível salvar. Atualize a trilha e tente novamente.'; return; }
  const data = await response.json();
  result.className = `result ${data.passed ? '' : 'fail'}`;
  result.innerHTML = `<h2>${data.score}% · ${data.passed ? 'Aprovado!' : 'Ainda não aprovado'}</h2><p>${data.passed ? 'Módulo aprovado. Você pode seguir para a próxima etapa.' : 'Você precisa de 70%. Revise as explicações e tente novamente.'}</p>${data.answers.map((answer, index) => `<div class="feedback"><b>Questão ${index + 1}: ${answer.selected === answer.correct ? 'correta' : 'reveja esta resposta'}</b><br>${answer.explanation}</div>`).join('')}`;
  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
};

void load();
