if (new URLSearchParams(location.search).has('embedded') || window.self !== window.top) {
  document.body.classList.add('embedded');
  const embeddedStyle = document.createElement('style');
  embeddedStyle.textContent = '.embedded .site-header{display:none}';
  document.head.append(embeddedStyle);
}

window.addEventListener('load', () => {
  const moduleId = Number(new URLSearchParams(location.search).get('module')) || 1;
  const completeButton = document.querySelector('#complete');
  const status = document.querySelector('.lesson-status');
  const statusText = document.querySelector('#statusText');

  const paint = done => {
    status.classList.toggle('done', done);
    statusText.textContent = done ? 'Concluída' : 'Ainda não concluída';
    completeButton.textContent = done ? 'Concluída ✓' : 'Marcar como concluída ✓';
  };

  const savedHandler = completeButton.onclick;
  completeButton.onclick = () => {
    savedHandler();
    void fetch('/api/progress', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moduleId, completed: true, practiceComplete: false }),
    }).catch(() => {});
  };

  void fetch('/api/progress')
    .then(response => response.ok ? response.json() : null)
    .then(data => {
      if (!data) return;
      const record = data.progress.find(item => item.moduleId === moduleId);
      if (!record?.completed) return;
      localStorage.setItem(`containerlab-module-${moduleId}`, 'true');
      paint(true);
    })
    .catch(() => {});
});

const lessons = [
  ['Fundamentos de containers','Entenda containers e rode uma aplicação de teste.','Docker cria caixas isoladas chamadas containers. Imagem é o molde; container é o molde em execução.','docker --version|docker run hello-world','Você verá a mensagem “Hello from Docker!”.','Se “docker” não for reconhecido, abra Docker Desktop e espere ele iniciar.'],
  ['Executando containers','Coloque um servidor web no ar e abra-o no navegador.','Portas criam uma passagem entre o Windows e um container.','docker run -d --name meu-nginx -p 8080:80 nginx|docker ps|docker stop meu-nginx','A página do Nginx abre em http://localhost:8080.','Se 8080 estiver ocupada, use 8081:80 e abra localhost:8081.'],
  ['Dockerfile','Monte uma imagem para a sua própria aplicação.','Dockerfile é uma receita: escolhe a base, copia arquivos e define como iniciar o programa.','mkdir minha-app; cd minha-app|docker build -t minha-app:1.0 .|docker run --rm -p 3000:3000 minha-app:1.0','O build termina sem erros e a app responde em localhost:3000.','Se Dockerfile não for encontrado, confira se ele não virou Dockerfile.txt.'],
  ['Volumes e dados','Guarde dados que sobrevivem ao fim de um container.','Volume é um espaço separado do container, usado para dados persistentes como os de bancos.','docker volume create dados-postgres|docker volume ls','dados-postgres aparece na lista de volumes.','Use senhas fictícias aqui. Não guarde senha real no código.'],
  ['Redes','Faça containers conversarem entre si por nome.','Uma rede Docker é privada. Containers nela encontram outros pelo nome do container.','docker network create minha-rede|docker network inspect minha-rede','A inspeção da rede mostra os containers conectados.','Dentro de um container, localhost significa ele mesmo, não seu Windows.'],
  ['Docker Compose','Suba a aplicação e o banco com um só comando.','Compose registra vários serviços no arquivo compose.yaml e evita repetir comandos longos.','docker compose up --build|docker compose down','Os serviços iniciam e os logs aparecem no terminal.','O nome do arquivo precisa ser compose.yaml, sem .txt no fim.'],
  ['Boas práticas','Crie hábitos que deixam imagens previsíveis e seguras.','Use versões fixas, ignore arquivos desnecessários e nunca coloque segredos na imagem.','docker images|docker system df','Você sabe qual imagem e versão sua aplicação utiliza.','Não use comandos de limpeza automática sem antes entender o que será removido.'],
  ['Seu primeiro cluster','Crie um Kubernetes local usando Kind.','Cluster é um grupo que executa aplicações. Kind cria esse grupo dentro do Docker.','kubectl version --client|kind create cluster --name estudo|kubectl get nodes','kubectl get nodes mostra o status Ready.','Se falhar, confirme que Docker Desktop está aberto.'],
  ['Pods e Deployments','Peça ao Kubernetes que mantenha sua aplicação rodando.','Pod é a menor unidade do Kubernetes. Deployment descreve e repõe os Pods necessários.','kubectl apply -f deployment.yaml|kubectl get pods','Dois Pods da aplicação aparecem como Running.','YAML usa espaços para organizar blocos. Não use Tab.'],
  ['Services','Crie um endereço estável para chegar aos Pods.','Pods mudam de nome. Service é um ponto de acesso fixo que encaminha pedidos aos Pods certos.','kubectl apply -f service.yaml|kubectl port-forward service/minha-app-service 8080:80','A aplicação abre em http://localhost:8080.','O selector do Service deve ser igual ao label do Deployment.'],
  ['Config e secrets','Separe configurações e senhas da imagem.','ConfigMap guarda valores comuns. Secret guarda dados sensíveis, que ainda não devem ir para Git.','kubectl create secret generic banco-secret --from-literal=usuario=admin --from-literal=senha=senha-de-estudo|kubectl get secrets','O Secret aparece na lista do cluster.','Secret não substitui boas práticas de segurança.'],
  ['Escala e rollout','Aumente cópias e atualize a aplicação com cuidado.','Escalar muda o número de réplicas. Rollout troca uma versão gradualmente.','kubectl scale deployment/minha-app --replicas=5|kubectl rollout status deployment/minha-app','Há cinco Pods e o rollout termina com sucesso.','Se a atualização falhar, use kubectl rollout undo deployment/minha-app.'],
  ['Saúde e recursos','Ensine Kubernetes a saber se a app está pronta.','Readiness decide se recebe tráfego; liveness verifica se ela precisa reiniciar.','kubectl get events --sort-by=.metadata.creationTimestamp','O Pod fica Ready e não reinicia em sequência.','Confira primeiro a rota e a porta das probes.'],
  ['Ingress','Direcione um endereço amigável para sua aplicação.','Ingress contém regras de entrada. Um controlador lê essas regras e encaminha pedidos ao Service.','kubectl get ingress','Uma URL amigável chega ao Service sem port-forward.','Sem um controlador de Ingress, o arquivo Ingress não faz nada sozinho.'],
  ['Persistência','Conecte armazenamento durável aos Pods.','PersistentVolumeClaim pede armazenamento que continua quando um Pod é recriado.','kubectl get storageclass|kubectl get pvc','O PVC aparece com status Bound.','Bancos precisam de backup e restauração planejados.'],
  ['Helm e projeto final','Empacote a aplicação como um projeto real.','Helm instala conjuntos configuráveis de arquivos Kubernetes, chamados charts.','helm version|helm repo add bitnami https://charts.bitnami.com/bitnami|helm repo update|helm list','Você consegue subir localmente e implantar no Kind.','Leia os valores e a documentação de cada chart antes de usá-lo.']
];
const enrichment = [
  ['Imagem nao muda enquanto voce usa; container pode ser criado, parado e removido. Por isso a imagem e o ponto de partida repetivel.', 'Comece usando imagens oficiais como hello-world e nginx. Mais tarde voce vai criar as suas.','Execute hello-world uma segunda vez e observe que o download nao acontece novamente. Docker reutiliza a imagem local.'],
  ['A opcao -d significa detached: o container fica rodando em segundo plano. O nome dado com --name facilita os proximos comandos.', 'A parte antes de dois-pontos em -p e a porta do Windows; a parte depois pertence ao container.','Inicie o Nginx, veja docker ps, abra o navegador e depois pare o container. Repita o ciclo sem consultar esta aula.'],
  ['Cada linha do Dockerfile forma uma camada. Organizar primeiro arquivos que mudam pouco deixa os proximos builds mais rapidos.', 'O CMD e o comando padrao ao iniciar. EXPOSE documenta a porta esperada, mas nao publica uma porta sozinho.','Crie uma imagem com uma tag nova, como minha-app:1.1, e compare as duas tags em docker images.'],
  ['Um volume e gerenciado pelo Docker e continua existindo mesmo que voce apague o container que o usava.', 'Bind mount e diferente: ele aponta diretamente para uma pasta sua. Para bancos, prefira volume nomeado no inicio.','Pare o banco, inicie outro container apontando para o mesmo volume e confirme que o volume continua listado.'],
  ['A rede padrao ja existe, mas criar uma rede por projeto deixa o ambiente mais claro e isolado.', 'O DNS interno do Docker resolve o nome banco para o container banco. Isso substitui enderecos IP decorados.','Liste as redes com docker network ls e identifique bridge, host e a rede que voce criou.'],
  ['Compose nao e outro Docker: ele e uma forma de declarar e executar varios containers juntos.', 'depends_on organiza a ordem de inicio, mas nao garante que um banco ja esteja pronto para receber conexoes.','Escreva em papel quais servicos sua aplicacao precisa e quais portas cada um deveria expor.'],
  ['A tag latest muda com o tempo. Uma tag fixa deixa seu ambiente reproduzivel para voce e para outras pessoas.', 'O arquivo .dockerignore funciona como .gitignore: ele reduz o que vai para o contexto do build.','Crie .dockerignore com node_modules e rode novamente o build observando a quantidade de arquivos enviados.'],
  ['kubectl e seu controle remoto do cluster. Kind e o criador do cluster local. Sao ferramentas diferentes e complementares.', 'O contexto ativo diz a qual cluster kubectl esta falando. Ao ter mais de um cluster, esse detalhe evita erros.','Rode kubectl config get-contexts e localize o contexto kind-estudo.'],
  ['Deployment descreve o estado desejado, nao uma lista manual de containers. Kubernetes trabalha para manter esse estado.', 'Labels sao etiquetas. Deployment e Service usam as mesmas etiquetas para se encontrarem.','Apague um Pod de estudo com kubectl delete pod NOME e veja o Deployment criar outro automaticamente.'],
  ['Service ClusterIP existe apenas dentro do cluster. Port-forward cria uma passagem temporaria para seu Windows.', 'Um Service usa selector e nao nomes de Pods, porque Pods podem ser substituidos a qualquer momento.','Mantenha port-forward aberto, atualize a pagina e observe que o endereco local permanece o mesmo.'],
  ['Configuracao muda mais frequentemente que a imagem. Separar as duas evita rebuild apenas para trocar um endereco ou modo.', 'Secret costuma ser codificado em Base64, que nao e criptografia. Controle de acesso continua necessario.','Altere uma chave nao sensivel do ConfigMap e pense se a aplicacao precisaria reiniciar para ler o novo valor.'],
  ['Replicas aumentam disponibilidade, mas so ajudam se a aplicacao puder atender varias copias sem depender de memoria local.', 'Rollout permite observar a nova versao e voltar atras. Nunca trate uma atualizacao como algo irreversivel.','Escalone para 3 e depois para 1 replica. Observe como kubectl get pods acompanha a mudanca.'],
  ['Readiness impede trafego cedo demais. Liveness tenta recuperar um processo travado. Sao verificacoes com propositos distintos.', 'Requests ajudam o agendador a escolher onde o Pod cabe; limits definem um teto de uso.','Liste detalhes do Pod com kubectl describe pod NOME e encontre a secao de probes ou recursos.'],
  ['Ingress e regra; controller e o programa que executa a regra. Sem controller, nenhum pedido e encaminhado.', 'Em producao, Ingress tambem costuma cuidar de HTTPS, certificados e varios dominios.','Desenhe a rota do seu navegador ate o Pod e identifique em qual parte um erro de dominio poderia acontecer.'],
  ['PVC e o pedido de armazenamento feito pela aplicacao. A storage class define como esse armazenamento sera fornecido.', 'StatefulSet fornece nomes estaveis e ordem previsivel, caracteristicas importantes para sistemas com estado.','Leia os nomes das storage classes do seu Kind e pesquise qual delas e padrao no seu cluster.'],
  ['Chart e um pacote; release e uma instalacao daquele pacote no seu cluster. Voce pode ter mais de um release do mesmo chart.', 'O projeto final prova uma ideia importante: o mesmo app pode rodar localmente e em Kubernetes com configuracoes adequadas.','Crie um README curto com requisitos, como iniciar localmente e como verificar o resultado.']
];
const current=Math.min(Math.max(Number(new URLSearchParams(location.search).get('module'))||1,1),lessons.length),data=lessons[current-1],extra=enrichment[current-1];
const commandList=data[3].split('|');
document.title=`${data[0]} | Container Lab`;
document.querySelector('#lessonPosition').textContent=`MÓDULO ${String(current).padStart(2,'0')} DE ${lessons.length}`;
document.querySelector('#lessonTitle').textContent=data[0];document.querySelector('#lessonIntro').textContent=data[1];document.querySelector('#lessonConcept').textContent=data[2];document.querySelector('#lessonSuccess').textContent=data[4];document.querySelector('#lessonHelp').textContent=data[5];document.querySelector('#keyIdeas').innerHTML=[data[2],extra[0],extra[1]].map((idea,index)=>`<div class="idea"><b>0${index+1}</b><p>${idea}</p></div>`).join('');document.querySelector('#practice').textContent=extra[2];
const copyBox=command=>`<div class="command-box"><code>${command}</code><button class="copy-command" data-command="${command}">copiar</button></div>`;
const steps=[['Prepare o ambiente','Abra o PowerShell. Leia esta aula inteira antes de executar e mantenha Docker Desktop ligado quando for usar Docker.'],['Entenda o objetivo','Antes do comando, confirme a ideia: '+data[2]],['Execute com calma','Cole um comando por vez, aperte Enter e espere o terminal terminar.',commandList[0]],['Confira e avance','Use os comandos abaixo para confirmar o resultado ou continuar a prática.',...commandList.slice(1)]];
const list=document.querySelector('#steps');steps.forEach(([title,text,...commands])=>{const li=document.createElement('li');li.innerHTML=`<h3>${title}</h3><p>${text}</p>${commands.map(copyBox).join('')}`;list.append(li)});
const complete=document.querySelector('#complete'),status=document.querySelector('.lesson-status');function sync(){const done=localStorage.getItem(`containerlab-module-${current}`)==='true';status.classList.toggle('done',done);document.querySelector('#statusText').textContent=done?'Concluída':'Ainda não concluída';complete.textContent=done?'Concluída ✓':'Marcar como concluída ✓'}complete.onclick=()=>{localStorage.setItem(`containerlab-module-${current}`,'true');sync()};document.querySelector('#previous').disabled=current===1;document.querySelector('#next').disabled=current===lessons.length;document.querySelector('#previous').onclick=()=>location.href=`module.html?module=${current-1}`;document.querySelector('#next').onclick=()=>location.href=`module.html?module=${current+1}`;document.querySelectorAll('[data-command]').forEach(button=>button.onclick=async()=>{try{await navigator.clipboard.writeText(button.dataset.command);button.textContent='copiado!';setTimeout(()=>button.textContent='copiar',1200)}catch{}});sync();
