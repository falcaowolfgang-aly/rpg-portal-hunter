import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { iniciarCalculadora, addDigito, limparCalc, apagarUltimo, calcularResultado } from "./calculadora.js";

const firebaseConfig = {
  apiKey: "AIzaSyAp9MzVTjccwHoXvZSiVNjK36nbVf41rIM",
  authDomain: "meu-rpg-fichas.firebaseapp.com",
  projectId: "meu-rpg-fichas",
  storageBucket: "meu-rpg-fichas.firebasestorage.app",
  messagingSenderId: "244238439870",
  appId: "1:244238439870:web:974a21e2c76fce6ffad5ef"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const urlParams = new URLSearchParams(window.location.search);
let jogadorId = urlParams.get('id') || "jogador1";
const fichaRef = doc(db, "fichas", jogadorId);
const iniciativaRef = doc(db, "combate", "estado_atual");

const mapaPericias = {
    "Atletismo": "corpo", "Acrobacia": "movimento", "Furtividade": "movimento",
    "Investigacao": "mente", "Natureza": "mente", "Adestramento": "mente", 
    "Intuicao": "mente", "Medicina": "mente", "Percepcao": "mente", 
    "Sobrevivencia": "mente", "Historia": "mente",
    "Atuacao": "espirito", "Enganacao": "espirito", "Intimidacao": "espirito", "Persuasao": "espirito"
};

// ==========================================
// AVISO DE NÃO SALVO
// ==========================================
const alertarSalvar = () => document.getElementById("avisoNaoSalvo")?.classList.remove("hidden");

// ==========================================
// INVENTÁRIO
// ==========================================
const containerItens = document.getElementById("lista-itens");
const btnAddItem = document.getElementById("add-item");

function criarTemplateItem(nome = "", qtd = "1", desc = "") {
    const itemDiv = document.createElement("div");
    itemDiv.className = "item-container bg-gray-900 p-2 rounded border border-gray-700 relative animate-fade-in mb-2 transition-colors hover:border-yellow-700";
    
    itemDiv.innerHTML = `
        <div class="flex items-center gap-1 sm:gap-2">
            <div class="drag-item cursor-move text-gray-600 hover:text-white transition p-1"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg></div>
            <button type="button" class="btn-toggle-item text-yellow-500 hover:text-yellow-400 transition-transform duration-300"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg></button>
            <input type="text" placeholder="Nome do Item" value="${nome}" class="flex-1 min-w-0 bg-gray-800 text-white text-sm p-1.5 rounded border border-gray-700 outline-none focus:border-yellow-600 campo-item-nome">
            <button type="button" class="text-gray-500 hover:text-red-500 font-bold btn-remover-item px-2">&times;</button>
        </div>
        <div class="item-body flex flex-col gap-2 mt-2 hidden">
            <div class="flex items-center gap-2 border-t border-gray-700 pt-2">
                <label class="text-[10px] text-gray-400 font-bold uppercase">Qtd:</label>
                <input type="number" value="${qtd}" min="0" class="w-16 bg-gray-800 text-white text-sm p-1 rounded border border-gray-700 outline-none focus:border-yellow-600 campo-item-qtd">
            </div>
            <textarea placeholder="Descrição..." class="w-full bg-gray-800 text-gray-300 text-xs p-2 rounded border border-gray-700 outline-none resize-y min-h-[60px] campo-item-desc">${desc}</textarea>
        </div>
    `;

    const btnToggle = itemDiv.querySelector(".btn-toggle-item");
    const itemBody = itemDiv.querySelector(".item-body");
    
    if (!nome) {
        itemBody.classList.remove("hidden");
        btnToggle.style.transform = "rotate(180deg)";
    }

    btnToggle.addEventListener("click", () => {
        itemBody.classList.toggle("hidden");
        btnToggle.style.transform = itemBody.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)";
    });

    itemDiv.querySelector(".btn-remover-item").addEventListener("click", () => {
        itemDiv.remove();
        alertarSalvar();
    });

    itemDiv.querySelectorAll("input, textarea").forEach(input => input.addEventListener("input", alertarSalvar));
    containerItens.appendChild(itemDiv);
}

if(btnAddItem) btnAddItem.addEventListener("click", () => criarTemplateItem());

// ==========================================
// GALERIA
// ==========================================
const containerImagens = document.getElementById("lista-imagens");
const btnAddImagem = document.getElementById("add-imagem");

function criarTemplateImagem(url = "", desc = "", oculta = false) {
    const div = document.createElement("div");
    // Classe "group" adicionada para fazer a barra aparecer só no hover
    div.className = `w-[45%] md:w-56 bg-gray-800 border-2 border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] group ${p.corBorder}`;
    div.innerHTML = `
        <div class="flex justify-between items-center bg-gray-800/90 backdrop-blur-sm p-1.5 rounded-lg border border-gray-700 drag-img cursor-move opacity-0 group-hover:opacity-100 transition-opacity absolute top-4 left-4 right-4 z-20 shadow-lg">
            <div class="text-gray-400 hover:text-white px-1"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg></div>
            <div class="flex gap-1">
                <button type="button" class="btn-toggle-img text-gray-400 hover:text-blue-400 font-bold px-2 rounded transition" title="Esconder/Mostrar Textos">👁️</button>
                <button type="button" class="text-gray-400 hover:text-red-500 font-bold px-2 rounded transition btn-remover-img" title="Apagar">&times;</button>
            </div>
        </div>
        
        <div class="w-full flex-1 bg-gray-900 rounded-lg border border-gray-700 overflow-hidden relative flex items-center justify-center p-2 min-h-[150px]">
            <img src="${url || 'https://via.placeholder.com/400x300/1f2937/4b5563?text=Colar+Link+Abaixo'}" class="max-w-full max-h-[500px] object-contain m-auto preview-img transition-transform duration-500 hover:scale-105 rounded shadow-lg" alt="Arte">
        </div>
        
        <div class="img-detalhes flex flex-col gap-2 ${oculta ? 'hidden' : 'mt-3'}">
            <input type="text" placeholder="Cole o link da imagem aqui..." value="${url}" class="w-full bg-gray-800 text-white text-sm p-2 rounded border border-gray-700 outline-none focus:border-blue-500 campo-img-url">
            <textarea placeholder="Descrição da arte..." class="w-full bg-gray-800 text-gray-300 text-sm p-2 rounded border border-gray-700 outline-none focus:border-blue-500 resize-none h-20 campo-img-desc custom-scrollbar">${desc}</textarea>
        </div>
    `;

    const inputUrl = div.querySelector(".campo-img-url");
    const imgPreview = div.querySelector(".preview-img");
    const detalhes = div.querySelector(".img-detalhes");
    const btnToggle = div.querySelector(".btn-toggle-img");
    
    // Lógica do botão do Olhinho (👁️)
    btnToggle.addEventListener("click", () => {
        detalhes.classList.toggle("hidden");
        detalhes.classList.toggle("mt-3");
        alertarSalvar();
    });
    
    inputUrl.addEventListener("input", (e) => {
        imgPreview.src = e.target.value || 'https://via.placeholder.com/400x300/1f2937/4b5563?text=Colar+Link+Abaixo';
        alertarSalvar();
    });

    div.querySelector(".campo-img-desc").addEventListener("input", alertarSalvar);
    div.querySelector(".btn-remover-img").addEventListener("click", () => { div.remove(); alertarSalvar(); });

    containerImagens.appendChild(div);
}

if(btnAddImagem) btnAddImagem.addEventListener("click", () => criarTemplateImagem());

// ==========================================
// MURAL DE ANOTAÇÕES (HD VIRTUAL - MINI NOTION)
// ==========================================
const quadroAnotacoes = document.getElementById("quadro-anotacoes");
const migalhasPao = document.getElementById("migalhas-pao");

window.sistemaNotas = []; 
window.trilhaAtual = []; 

const gerarIdNota = () => 'nota_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

window.renderizarMigalhas = function() {
    if (!migalhasPao) return;
    migalhasPao.innerHTML = "";
    window.trilhaAtual.forEach((passo, index) => {
        const btn = document.createElement("button");
        btn.className = "hover:text-white transition-colors truncate max-w-[150px] flex items-center gap-1";
        btn.innerHTML = passo.nome;
        btn.onclick = () => {
            window.trilhaAtual = window.trilhaAtual.slice(0, index + 1);
            window.renderizarQuadroAtual();
        };
        migalhasPao.appendChild(btn);

        if (index < window.trilhaAtual.length - 1) {
            const sep = document.createElement("span");
            sep.className = "text-gray-600";
            sep.innerText = "/";
            migalhasPao.appendChild(sep);
        }
    });
};

window.renderizarQuadroAtual = function() {
    if(!quadroAnotacoes) return;
    quadroAnotacoes.innerHTML = "";
    window.renderizarMigalhas();

    const arrayAtual = window.trilhaAtual[window.trilhaAtual.length - 1].ref;

    if (arrayAtual.length === 0) {
        quadroAnotacoes.innerHTML = `<div class="col-span-full text-center text-gray-600 py-10 font-bold uppercase tracking-widest">Pasta Vazia</div>`;
        return;
    }

    arrayAtual.forEach(notaObj => {
        quadroAnotacoes.appendChild(criarElementoNota(notaObj, arrayAtual));
    });
};

function criarElementoNota(notaObj, arrayPai) {
    const div = document.createElement("div");
    div.dataset.id = notaObj.id;
    // IMPORTANTE: A classe "group" foi adicionada para os botões aparecerem só quando passar o mouse
    div.className = "card-nota group bg-gray-900 p-0 rounded-lg border border-gray-700 shadow-xl relative animate-fade-in flex flex-col overflow-hidden focus-within:border-purple-500 transition-colors w-full";

    const btnRemover = `<button type="button" class="text-gray-500 hover:text-red-500 font-bold px-1 transition-colors btn-remover" title="Apagar">&times;</button>`;

    if (notaObj.tipo === "simples") {
        // TIPO 1: POST-IT (Sem título, botões flutuantes que aparecem no hover)
        div.innerHTML = `
            <div class="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <div class="drag-nota cursor-move text-gray-400 hover:text-white p-1.5 bg-gray-800 rounded shadow border border-gray-700"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg></div>
                <button type="button" class="text-gray-400 hover:text-red-500 font-bold px-2 bg-gray-800 rounded shadow border border-gray-700 transition-colors btn-remover" title="Apagar">&times;</button>
            </div>
            <textarea placeholder="Escreva suas anotações aqui..." class="w-full bg-transparent text-gray-300 text-sm p-4 pt-5 outline-none resize-y min-h-[140px] custom-scrollbar flex-1">${notaObj.conteudo || ''}</textarea>
        `;
        div.querySelector("textarea").oninput = (e) => { notaObj.conteudo = e.target.value; alertarSalvar(); };

    } else if (notaObj.tipo === "pasta") {
        // TIPO 3: PASTA MINIMALISTA (Só título, duplo clique para abrir)
        div.classList.replace("focus-within:border-purple-500", "focus-within:border-yellow-500");
        if(!notaObj.itens) notaObj.itens = [];
        
        div.innerHTML = `
            <div class="bg-yellow-900/20 p-2 flex justify-between items-center drag-nota cursor-pointer hover:bg-yellow-900/40 transition-colors" title="Duplo clique para abrir">
                <span class="text-yellow-600 mr-2 pointer-events-none">📁</span>
                <input type="text" placeholder="Nome da Pasta..." value="${notaObj.titulo || ''}" class="bg-transparent text-yellow-500 font-bold text-sm outline-none w-full mr-2 cursor-text" title="Duplo clique para abrir">
                ${btnRemover}
            </div>
        `;
        div.querySelector("input").oninput = (e) => { notaObj.titulo = e.target.value; alertarSalvar(); };
        
        // A Mágica do Duplo Clique
        const abrirPasta = () => {
            window.trilhaAtual.push({ nome: `📁 ${notaObj.titulo || "Pasta"}`, ref: notaObj.itens });
            window.renderizarQuadroAtual();
        };
        
        // O duplo clique na barrinha inteira (ou no input) abre a pasta
        div.querySelector(".drag-nota").ondblclick = abrirPasta;

    } else if (notaObj.tipo === "accordion") {
        // TIPO 2: ACORDEÃO (Agora com Memória de Estado)
        div.classList.replace("focus-within:border-purple-500", "focus-within:border-blue-500");
        if(!notaObj.itens) notaObj.itens = [];

        // Verifica a memória: ele estava aberto ou fechado da última vez?
        const isAberto = notaObj.aberto === true;
        const rotacaoSeta = isAberto ? "rotate(0deg)" : "rotate(-90deg)";
        const classeCorpo = isAberto ? "" : "hidden";

        div.innerHTML = `
            <div class="bg-blue-900/20 p-2 flex justify-between items-center border-b border-gray-700 drag-nota cursor-move">
                <button type="button" class="text-blue-400 mr-2 hover:text-white transition-transform transform btn-toggle" style="transform: ${rotacaoSeta}">▼</button>
                <input type="text" placeholder="Título do Acordeão..." value="${notaObj.titulo || ''}" class="bg-transparent text-blue-400 font-bold text-sm outline-none w-full mr-2">
                ${btnRemover}
            </div>
            <div class="corpo-accordion flex flex-col ${classeCorpo}">
                <div class="p-2 flex flex-col gap-3 container-itens-ac min-h-[40px] bg-gray-950/50"></div>
                <div class="p-2 border-t border-gray-800 bg-gray-900/50 flex justify-center gap-2">
                    <button type="button" class="text-gray-400 hover:text-purple-400 text-[10px] font-bold uppercase bg-gray-800 px-3 py-1 rounded border border-gray-700 btn-add-txt">+ Nota</button>
                    <button type="button" class="text-gray-400 hover:text-yellow-400 text-[10px] font-bold uppercase bg-gray-800 px-3 py-1 rounded border border-gray-700 btn-add-pst">+ Pasta</button>
                </div>
            </div>
        `;
        
        const corpo = div.querySelector(".corpo-accordion");
        const btnToggle = div.querySelector(".btn-toggle");
        const containerItens = div.querySelector(".container-itens-ac");

        div.querySelector("input").oninput = (e) => { notaObj.titulo = e.target.value; alertarSalvar(); };
        
        // A mágica acontece aqui: ao clicar, ele salva na memória se ficou aberto ou fechado
        btnToggle.onclick = () => {
            const vaiAbrir = corpo.classList.contains("hidden");
            if (vaiAbrir) {
                corpo.classList.remove("hidden");
                btnToggle.style.transform = "rotate(0deg)";
                notaObj.aberto = true; // Salva no HD que está aberto
            } else {
                corpo.classList.add("hidden");
                btnToggle.style.transform = "rotate(-90deg)";
                notaObj.aberto = false; // Salva no HD que está fechado
            }
            alertarSalvar(); // Avisa o sistema que teve uma alteração para o jogador clicar em Salvar
        };

        const renderizarFilhosAc = () => {
            containerItens.innerHTML = "";
            notaObj.itens.forEach(subObj => containerItens.appendChild(criarElementoNota(subObj, notaObj.itens)));
        };
        renderizarFilhosAc();

        if (window.Sortable) {
            new Sortable(containerItens, {
                handle: '.drag-nota', animation: 150, ghostClass: 'opacity-40',
                onEnd: () => { atualizarOrdemArray(containerItens, notaObj.itens); alertarSalvar(); }
            });
        }

        div.querySelector(".btn-add-txt").onclick = () => { notaObj.itens.push({ id: gerarIdNota(), tipo: 'simples', conteudo: '' }); renderizarFilhosAc(); alertarSalvar(); };
        div.querySelector(".btn-add-pst").onclick = () => { notaObj.itens.push({ id: gerarIdNota(), tipo: 'pasta', titulo: '', itens: [] }); renderizarFilhosAc(); alertarSalvar(); };
    }

    div.querySelector(".btn-remover").onclick = () => {
        const index = arrayPai.findIndex(n => n.id === notaObj.id);
        if (index > -1) arrayPai.splice(index, 1);
        window.renderizarQuadroAtual();
        alertarSalvar();
    };

    return div;
}

function atualizarOrdemArray(containerDOM, arrayReferencia) {
    const novaOrdem = [];
    containerDOM.querySelectorAll(':scope > div.card-nota').forEach(el => {
        const obj = arrayReferencia.find(item => item.id === el.dataset.id);
        if (obj) novaOrdem.push(obj);
    });
    arrayReferencia.length = 0;
    novaOrdem.forEach(o => arrayReferencia.push(o));
}

const criarNaPasta = (tipo) => {
    const arrayAtual = window.trilhaAtual[window.trilhaAtual.length - 1].ref;
    const novaNota = { id: gerarIdNota(), tipo: tipo };
    if (tipo === 'simples') novaNota.conteudo = '';
    if (tipo === 'pasta' || tipo === 'accordion') { novaNota.titulo = ''; novaNota.itens = []; }
    arrayAtual.push(novaNota);
    window.renderizarQuadroAtual();
    alertarSalvar();
};

document.getElementById("btn-add-simples")?.addEventListener("click", () => criarNaPasta('simples'));
document.getElementById("btn-add-accordion")?.addEventListener("click", () => criarNaPasta('accordion'));
document.getElementById("btn-add-pasta")?.addEventListener("click", () => criarNaPasta('pasta'));

// ============================================================
// CÁLCULOS
// ============================================================
function atualizarTudo() {
    const calcularPct = (atualId, maxId) => {
        const atual = Number(document.getElementById(atualId)?.value) || 0;
        const max = Number(document.getElementById(maxId)?.value) || 1;
        return Math.min(100, Math.max(0, (atual / max) * 100));
    };

    if(document.getElementById("barraHp")) document.getElementById("barraHp").style.width = `${calcularPct("hpAtual", "hpMax")}%`;
    if(document.getElementById("barraPn")) document.getElementById("barraPn").style.width = `${calcularPct("pnAtual", "pnMax")}%`;
    if(document.getElementById("barraPr")) document.getElementById("barraPr").style.width = `${calcularPct("prAtual", "prMax")}%`;

    ["corpo", "movimento", "mente", "espirito"].forEach(attr => {
        const el = document.getElementById(attr);
        if (el) {
            const val = Number(el.value) || 0;
            const mod = Math.floor((val - 10) / 2);
            const spanId = `mod${attr.charAt(0).toUpperCase() + attr.slice(1)}`;
            const span = document.getElementById(spanId);
            if (span) span.innerText = mod >= 0 ? `mod +${mod}` : `mod ${mod}`;
        }
    });

    Object.keys(mapaPericias).forEach(p => {
        const attrPai = mapaPericias[p];
        const valAttr = Number(document.getElementById(attrPai)?.value) || 10;
        const mod = Math.floor((valAttr - 10) / 2);
        const check1 = document.getElementById(`check${p}`);
        const check2 = document.getElementById(`checkDuplo${p}`);
        
        let bonus = 0;
        if (check1 && check1.checked) bonus += 2;
        if (check2 && check2.checked) bonus += 2;
        
        const total = mod + bonus;
        const display = document.getElementById(`val${p}`);
        if (display) display.innerText = total >= 0 ? `+${total}` : total;
    });
}

// ==========================================
// ABAS INTELIGENTES
// ==========================================
window.mudarPagina = function(abaDesejada) {
    const paginas = ['principal', 'imagens', 'anotacoes'];
    
    paginas.forEach(aba => {
        const div = document.getElementById(`pagina-${aba}`);
        const btn = document.getElementById(`tab-${aba}`);
        
        if (aba === abaDesejada) {
            div.classList.remove("hidden");
            div.classList.add("block");
            let corBorda = aba === 'principal' ? 'border-red-500' : aba === 'imagens' ? 'border-blue-500' : 'border-purple-500';
            btn.className = `aba-btn px-6 py-3 bg-gray-800 text-white font-bold rounded-t-lg border-t-2 ${corBorda} transition-all -mb-[1px] relative z-10 whitespace-nowrap`;
        } else {
            div.classList.remove("block");
            div.classList.add("hidden");
            btn.className = "aba-btn px-6 py-3 bg-gray-900 text-gray-500 font-bold rounded-t-lg border border-gray-700 hover:text-gray-300 hover:bg-gray-800 transition-all border-b-0 -mb-[1px] whitespace-nowrap";
        }
    });
};

// ==========================================
// SWITCH DE TAMANHO (GRID DENSE)
// ==========================================
window.toggleTamanho = function(botao, eixo) {
    const secao = botao.closest('.secao-arrastavel');
    if (!secao) return;

    const isLargo = secao.classList.contains('bloco-2x1');
    const isAlto = secao.classList.contains('bloco-1x2');
    const btnLargo = secao.querySelector('.btn-largo');
    const btnAlto = secao.querySelector('.btn-alto');

    secao.classList.remove('bloco-1x1', 'bloco-2x1', 'bloco-1x2');

    if (eixo === 'horizontal') {
        if (isLargo) {
            secao.classList.add('bloco-1x1');
            btnLargo.classList.remove('text-blue-400', 'bg-gray-800');
        } else {
            secao.classList.add('bloco-2x1');
            btnLargo.classList.add('text-blue-400', 'bg-gray-800');
            btnAlto.classList.remove('text-blue-400', 'bg-gray-800');
        }
    } else if (eixo === 'vertical') {
        if (isAlto) {
            secao.classList.add('bloco-1x1');
            btnAlto.classList.remove('text-blue-400', 'bg-gray-800');
        } else {
            secao.classList.add('bloco-1x2');
            btnAlto.classList.add('text-blue-400', 'bg-gray-800');
            btnLargo.classList.remove('text-blue-400', 'bg-gray-800');
        }
    }
    alertarSalvar();
};

// ==========================================
// MODO MINIMIZAR CARDS
// ==========================================
window.toggleMinimizar = function(botao) {
    const secao = botao.closest('.secao-arrastavel');
    if (!secao) return;

    secao.classList.toggle('minimizada');
    
    const btnMin = secao.querySelector('.btn-min');
    if (secao.classList.contains('minimizada')) {
        btnMin.classList.add('text-yellow-400', 'bg-gray-800'); // Fica amarelo aceso
    } else {
        btnMin.classList.remove('text-yellow-400', 'bg-gray-800'); // Apaga
    }
    
    alertarSalvar();
};

// ==========================================
// ARRASTAR E SOLTAR (SORTABLEJS GERAL)
// ==========================================
if (window.Sortable) {
    const gridFichas = document.getElementById("grid-fichas");
    if (gridFichas) {
        new Sortable(gridFichas, {
            animation: 300,
            handle: '.drag-handle',
            ghostClass: 'opacity-40',
            delay: 200, // <--- ADICIONE ISSO
            delayOnTouchOnly: true, // <--- E ISSO
            onEnd: alertarSalvar
        });
    }

    const areaInv = document.getElementById("lista-itens");
    if (areaInv) {
        new Sortable(areaInv, {
            handle: '.drag-item',
            animation: 150,
            delay: 200, // <--- AQUI TAMBÉM
            delayOnTouchOnly: true,
            onEnd: alertarSalvar
        });
    }

    if (quadroAnotacoes) {
        new Sortable(quadroAnotacoes, {
            handle: '.drag-nota',
            animation: 200,
            ghostClass: 'opacity-40',
            delay: 200, // <--- E AQUI!
            delayOnTouchOnly: true,
            onEnd: () => {
                const arrayAtual = window.trilhaAtual[window.trilhaAtual.length - 1].ref;
                atualizarOrdemArray(quadroAnotacoes, arrayAtual);
                alertarSalvar();
            }
        });
    }

    if (containerImagens) {
        new Sortable(containerImagens, {
            handle: '.drag-img',
            animation: 200,
            ghostClass: 'opacity-40',
            onEnd: alertarSalvar
        });
    }

}

// ==========================================
// CARREGAR DADOS E SALVAR NO FIREBASE
// ==========================================
async function carregarFicha() {
    try {
        const docSnap = await getDoc(fichaRef);
        if (docSnap.exists()) {
            const dados = docSnap.data();
            
            // 1. CARREGA O GRID
            const gridContainer = document.getElementById("grid-fichas");
            if (dados.ordem_grid && Array.isArray(dados.ordem_grid)) {
                dados.ordem_grid.forEach(item => {
                    const secao = document.getElementById(item.id);
                    if (secao) {
                        gridContainer.appendChild(secao);
                        secao.classList.remove('bloco-1x1', 'bloco-2x1', 'bloco-1x2');
                        secao.classList.add(item.tamanho || 'bloco-1x1');

                        const btnLargo = secao.querySelector('.btn-largo');
                        const btnAlto = secao.querySelector('.btn-alto');
                        
                        if (btnLargo && btnAlto) {
                            btnLargo.classList.remove('text-blue-400', 'bg-gray-800');
                            btnAlto.classList.remove('text-blue-400', 'bg-gray-800');
                            if (item.tamanho === 'bloco-2x1') btnLargo.classList.add('text-blue-400', 'bg-gray-800');
                            if (item.tamanho === 'bloco-1x2') btnAlto.classList.add('text-blue-400', 'bg-gray-800');
                        }

                        // LÓGICA DE LEMBRAR SE ESTAVA MINIMIZADO
                        const btnMin = secao.querySelector('.btn-min');
                        if (item.minimizada) {
                            secao.classList.add('minimizada');
                            if(btnMin) btnMin.classList.add('text-yellow-400', 'bg-gray-800');
                        } else {
                            secao.classList.remove('minimizada');
                            if(btnMin) btnMin.classList.remove('text-yellow-400', 'bg-gray-800');
                        }
                    } 
                });
            } 

            // 2. CARREGA INPUTS E TEXTOS
            document.querySelectorAll("input[type='text'], input[type='number'], textarea, .editor-rico").forEach(el => {
                if (el.id && !el.classList.contains('campo-item-nome') && !el.classList.contains('campo-item-qtd') && !el.classList.contains('campo-item-desc') && !el.classList.contains('campo-img-url') && !el.classList.contains('campo-img-desc')) {
                    if (dados[el.id] !== undefined) {
                        if (el.classList.contains('editor-rico') || el.getAttribute('contenteditable') === 'true') {
                            el.innerHTML = dados[el.id];
                        } else {
                            el.value = dados[el.id];
                        }
                    }
                }
            });

            // 3. CARREGA CHECKS (PERÍCIAS)
            Object.keys(mapaPericias).forEach(p => {
                const c1 = document.getElementById(`check${p}`);
                const c2 = document.getElementById(`checkDuplo${p}`);
                if (c1 && dados[`check${p}`] !== undefined) c1.checked = dados[`check${p}`];
                if (c2 && dados[`checkDuplo${p}`] !== undefined) c2.checked = dados[`checkDuplo${p}`];
            });

            // 4. CARREGA INVENTÁRIO
            if (dados.inventario && Array.isArray(dados.inventario)) {
                containerItens.innerHTML = "";
                dados.inventario.forEach(item => criarTemplateItem(item.nome, item.qtd, item.desc));
            }

            // 5. CARREGA GALERIA
            if (dados.galeria && Array.isArray(dados.galeria)) {
                containerImagens.innerHTML = "";
                dados.galeria.forEach(img => criarTemplateImagem(img.url, img.desc, img.oculta));
            }

            // 6. CARREGA ANOTAÇÕES (SISTEMA DE ARQUIVOS)
            const sanitizarNotas = (arr) => {
                arr.forEach(n => {
                    if (!n.id) n.id = 'nota_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                    // Migração de código velho para o novo se necessário
                    if (n.tipo === 'pasta' && n.paginas) {
                        n.itens = n.paginas.map(txt => ({ id: 'nota_'+Math.random().toString(36).substr(2, 9), tipo: 'simples', titulo: '', conteudo: txt }));
                        delete n.paginas;
                    }
                    if (!n.itens && (n.tipo === 'pasta' || n.tipo === 'accordion')) n.itens = [];
                    if (n.itens) sanitizarNotas(n.itens);
                });
            };

            if (dados.anotacoes && Array.isArray(dados.anotacoes)) {
                sanitizarNotas(dados.anotacoes);
                window.sistemaNotas = dados.anotacoes;
            } else {
                window.sistemaNotas = [];
            }
            
            // Inicia o caminho na Raiz e manda desenhar a tela
            window.trilhaAtual = [{ nome: '🏠 Início', ref: window.sistemaNotas }];
            window.renderizarQuadroAtual();

            atualizarTudo();
        }
    } catch (erro) {
        console.error("Erro ao carregar a ficha:", erro);
    }
}
carregarFicha();

// Escuta geral para ativar o botão vermelho de salvar
document.querySelectorAll("input, textarea, .editor-rico, [contenteditable='true']").forEach(elemento => {
    elemento.addEventListener("input", () => {
        atualizarTudo();
        alertarSalvar();
    });
});

// FUNÇÃO DE SALVAR TUDO NA NUVEM
const btnSalvar = document.getElementById("btnSalvar");
if(btnSalvar) {
    btnSalvar.addEventListener("click", async () => {
        const textoBtnSalvar = document.getElementById("textoBtnSalvar");
        textoBtnSalvar.innerText = "Salvando...";
        const dadosParaSalvar = {};
        
        document.querySelectorAll("input[type='text'], input[type='number'], textarea, .editor-rico, [contenteditable='true']").forEach(el => {
            if (el.id && !el.classList.contains('campo-item-nome') && !el.classList.contains('campo-item-qtd') && !el.classList.contains('campo-item-desc') && !el.classList.contains('campo-img-url') && !el.classList.contains('campo-img-desc')) {
                dadosParaSalvar[el.id] = (el.classList.contains('editor-rico') || el.getAttribute('contenteditable') === 'true') ? el.innerHTML : el.value;
            }
        });

        Object.keys(mapaPericias).forEach(p => {
            const c1 = document.getElementById(`check${p}`);
            const c2 = document.getElementById(`checkDuplo${p}`);
            if (c1) dadosParaSalvar[`check${p}`] = c1.checked;
            if (c2) dadosParaSalvar[`checkDuplo${p}`] = c2.checked;
        });

        const itens = [];
        document.querySelectorAll(".item-container").forEach(el => itens.push({nome: el.querySelector(".campo-item-nome").value, qtd: el.querySelector(".campo-item-qtd").value, desc: el.querySelector(".campo-item-desc").value}));
        dadosParaSalvar.inventario = itens;

        const galeria = [];
                document.querySelectorAll(".card-imagem").forEach(el => {
                    galeria.push({
                        url: el.querySelector(".campo-img-url").value, 
                        desc: el.querySelector(".campo-img-desc").value,
                        oculta: el.querySelector(".img-detalhes").classList.contains("hidden") // <--- A MÁGICA DE SALVAR
                    });
                });
                dadosParaSalvar.galeria = galeria;

        // SALVA AS ANOTAÇÕES: É só copiar o "HD Virtual" inteiro pra nuvem, numa linha só!
        dadosParaSalvar.anotacoes = window.sistemaNotas;

        const ordemGrid = [];
        document.querySelectorAll("#grid-fichas > .secao-arrastavel").forEach(secao => {
            let tamanho = 'bloco-1x1';
            if (secao.classList.contains('bloco-2x1')) tamanho = 'bloco-2x1';
            if (secao.classList.contains('bloco-1x2')) tamanho = 'bloco-1x2';
            ordemGrid.push({ 
                id: secao.id, 
                tamanho: tamanho,
                minimizada: secao.classList.contains('minimizada') // <-- NOVA LINHA AQUI
            });
        });
        dadosParaSalvar.ordem_grid = ordemGrid;

        try {
            await setDoc(fichaRef, dadosParaSalvar);
            atualizarTudo();
            textoBtnSalvar.innerText = "Salvo!";
            document.getElementById("avisoNaoSalvo")?.classList.add("hidden");
            setTimeout(() => textoBtnSalvar.innerText = "Salvar Ficha", 2000);
        } catch (erro) {
            console.error("Erro ao salvar:", erro);
            textoBtnSalvar.innerText = "Erro!";
        }
    });
}

// Inicia Calculadora (Vem do arquivo externa)
iniciarCalculadora();
window.addDigito = addDigito;
window.limparCalc = limparCalc;
window.apagarUltimo = apagarUltimo;
window.calcularResultado = calcularResultado;

// ==========================================
// INICIATIVA MULTIPLAYER
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const btnIniciativa = document.getElementById('btn-iniciativa');
    if (btnIniciativa) {
        const painelIniciativa = document.getElementById('painel-iniciativa');
        const viewMode = document.getElementById('iniciativa-view-mode');
        const editMode = document.getElementById('iniciativa-edit-mode');
        const displayIniciativa = document.getElementById('iniciativa-display');
        const textareaIniciativa = document.getElementById('iniciativa-textarea');
        const btnEditarIniciativa = document.getElementById('btn-editar-iniciativa');
        const btnConfirmarIniciativa = document.getElementById('btn-confirmar-iniciativa');

        btnIniciativa.addEventListener('click', () => painelIniciativa.classList.toggle('hidden'));

        btnEditarIniciativa.addEventListener('click', () => {
            const textoAtual = displayIniciativa.innerText;
            textareaIniciativa.value = textoAtual === "Nenhum combate ativo." ? "" : textoAtual;
            viewMode.classList.add('hidden');
            editMode.classList.remove('hidden');
        });

        function atualizarDisplay(texto) {
            if(displayIniciativa) displayIniciativa.innerText = texto && texto.trim() !== "" ? texto : "Nenhum combate ativo.";
        }

        btnConfirmarIniciativa.addEventListener('click', async () => {
            const novoTexto = textareaIniciativa.value.trim();
            const btnTextoOriginal = btnConfirmarIniciativa.innerText;
            btnConfirmarIniciativa.innerText = "ENVIANDO...";
            try {
                await setDoc(iniciativaRef, { texto: novoTexto });
                editMode.classList.add('hidden');
                viewMode.classList.remove('hidden');
            } catch (erro) {
                console.error("Erro ao salvar iniciativa:", erro);
                alert("Erro ao sincronizar iniciativa. Verifique a internet.");
            } finally {
                btnConfirmarIniciativa.innerText = btnTextoOriginal;
            }
        });

        if (typeof iniciativaRef !== 'undefined') {
            onSnapshot(iniciativaRef, (docSnap) => {
                if (docSnap.exists()) atualizarDisplay(docSnap.data().texto);
                else atualizarDisplay("");
            });
        }
    }
});

// ==========================================
// MELHORIAS DE UX (Texto, Negrito, Italico)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('input[type="text"], textarea, [contenteditable="true"]').forEach(el => {
        el.setAttribute('spellcheck', 'false');
    });

    const editores = document.querySelectorAll('.editor-rico');
    const botoesFormato = document.querySelectorAll('.btn-formato');

    botoesFormato.forEach(btn => {
        btn.addEventListener('mousedown', (e) => {
            e.preventDefault(); 
            const cmd = btn.getAttribute('data-cmd');
            document.execCommand(cmd, false, null);
            verificarFormatacaoAtiva(); 
            alertarSalvar(); 
        });
    });

    function verificarFormatacaoAtiva() {
        botoesFormato.forEach(btn => {
            const cmd = btn.getAttribute('data-cmd');
            if (document.queryCommandState(cmd)) {
                btn.classList.add('bg-blue-600', 'text-white', 'shadow-inner');
                btn.classList.remove('text-gray-400', 'hover:bg-gray-700');
            } else {
                btn.classList.remove('bg-blue-600', 'text-white', 'shadow-inner');
                btn.classList.add('text-gray-400', 'hover:bg-gray-700');
            }
        });
    }

    editores.forEach(editor => {
        editor.addEventListener('keyup', verificarFormatacaoAtiva);
        editor.addEventListener('mouseup', verificarFormatacaoAtiva);
        editor.addEventListener('click', verificarFormatacaoAtiva);
    });
});

// ==========================================
// LÓGICA DE ROLAGEM VIA TECLADO (MOBILE)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    const campoFormula = document.getElementById('input-formula');
    const botaoInvisivel = document.getElementById('btn-rolar-dados');

    if (campoFormula) {
        campoFormula.addEventListener('keydown', (e) => {
            // Se o jogador apertar a tecla Enter ou o botão "Ir" do teclado mobile
            if (e.key === 'Enter') {
                e.preventDefault(); // Impede que a página recarregue
                
                // Dispara o clique no botão invisível que já tem a lógica do seu dados.js
                if (botaoInvisivel) {
                    botaoInvisivel.click();
                    
                    // Limpa o campo após rolar para a próxima jogada
                    setTimeout(() => { campoFormula.value = ""; }, 10);
                }
            }
        });
    }
});