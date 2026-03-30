// 1. Importando as ferramentas do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
import { iniciarCalculadora, addDigito, limparCalc, apagarUltimo, calcularResultado } from "./calculadora.js";

// 2. Configuração do seu Projeto
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

// --- O NOVO TRUQUE MÁGICO ---
// Lê o parâmetro "?id=" da URL. Ex: ficha.html?id=jogador2 -> carrega o jogador2
const urlParams = new URLSearchParams(window.location.search);
let jogadorId = urlParams.get('id');

// Se alguém abrir a ficha sem ID nenhum, carrega o jogador1 por padrão
if (!jogadorId) {
    jogadorId = "jogador1"; 
}

// Agora a referência puxa exatamente o banco de dados de quem foi clicado!
const fichaRef = doc(db, "fichas", jogadorId);

// 3. Mapeamento das Perícias
const mapaPericias = {
    "Atletismo": "corpo", "Acrobacia": "movimento", "Furtividade": "movimento",
    "Investigacao": "mente", "Natureza": "mente", "Adestramento": "mente", 
    "Intuicao": "mente", "Medicina": "mente", "Percepcao": "mente", 
    "Sobrevivencia": "mente", "Historia": "mente",
    "Atuacao": "espirito", "Enganacao": "espirito", "Intimidacao": "espirito", "Persuasao": "espirito"
};

// --- Lógica do Inventário Dinâmico ---
const containerItens = document.getElementById("lista-itens");
const btnAddItem = document.getElementById("add-item");

// Função para criar o HTML de um item na tela
function criarTemplateItem(nome = "", qtd = "1", desc = "") {
    const itemDiv = document.createElement("div");
    itemDiv.className = "item-container bg-gray-900 p-3 rounded border border-gray-700 relative animate-fade-in mb-3 transition-colors hover:border-yellow-700";
    
    // O HTML do item foi dividido em Cabeçalho (Sempre Visível) e Corpo (Ocultável)
    itemDiv.innerHTML = `
        <div class="flex items-center gap-2">
            <div class="drag-item cursor-move text-gray-600 hover:text-white transition p-1" title="Arraste para mudar a ordem">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>
            </div>

            <button type="button" class="btn-toggle-item text-yellow-500 hover:text-yellow-400 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </button>

            <input type="text" placeholder="Nome do Item" value="${nome}" 
                class="flex-1 bg-gray-800 text-white text-sm p-2 rounded border border-gray-700 outline-none focus:border-yellow-600 campo-item-nome">
            
            <button type="button" class="text-gray-500 hover:text-red-500 font-bold btn-remover-item px-2 text-lg" title="Apagar Item">&times;</button>
        </div>

        <div class="item-body flex flex-col gap-3 mt-3 hidden">
            <div class="flex items-center gap-2 border-t border-gray-700 pt-3">
                <label class="text-xs text-gray-400 font-bold uppercase">Quantidade:</label>
                <input type="number" placeholder="Qtd" value="${qtd}" min="0"
                    class="w-20 bg-gray-800 text-white text-sm p-1.5 rounded border border-gray-700 outline-none focus:border-yellow-600 campo-item-qtd">
            </div>
            <textarea placeholder="Descrição do item, peso, efeito..." spellcheck="false"
                class="w-full bg-gray-800 text-gray-300 text-xs p-2 rounded border border-gray-700 outline-none focus:border-yellow-600 resize-y min-h-[60px] campo-item-desc">${desc}</textarea>
        </div>
    `;

    // --- LÓGICA DO BOTÃO EXPANDIR/RECOLHER ---
    const btnToggle = itemDiv.querySelector(".btn-toggle-item");
    const itemBody = itemDiv.querySelector(".item-body");
    
    // Se não tiver nome (item novo), já começa com o corpo aberto
    if (!nome) {
        itemBody.classList.remove("hidden");
        btnToggle.style.transform = "rotate(180deg)";
    }

    btnToggle.addEventListener("click", () => {
        itemBody.classList.toggle("hidden");
        // Gira a setinha
        btnToggle.style.transform = itemBody.classList.contains("hidden") ? "rotate(0deg)" : "rotate(180deg)";
    });

    // --- PROTEÇÃO DA QUANTIDADE (Apenas números) ---
    const inputQtd = itemDiv.querySelector(".campo-item-qtd");
    inputQtd.addEventListener("keydown", (e) => {
        if ([46, 8, 9, 27, 13].indexOf(e.keyCode) !== -1 || (e.keyCode === 65 && (e.ctrlKey === true || e.metaKey === true)) || (e.keyCode >= 35 && e.keyCode <= 40)) {
                 return;
        }
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });

    // --- BOTÃO DE REMOVER ---
    itemDiv.querySelector(".btn-remover-item").addEventListener("click", () => {
        itemDiv.remove();
        document.getElementById("avisoNaoSalvo").classList.remove("hidden");
    });

    // --- AVISO DE ALTERAÇÃO ---
    itemDiv.querySelectorAll("input, textarea").forEach(input => {
        input.addEventListener("input", () => {
            document.getElementById("avisoNaoSalvo").classList.remove("hidden");
        });
    });

    // Adiciona na tela
    containerItens.appendChild(itemDiv);
}

btnAddItem.addEventListener("click", () => criarTemplateItem());

// ============================================================
function atualizarTudo() {
    const calcularPct = (atualId, maxId) => {
        const atual = Number(document.getElementById(atualId).value) || 0;
        const max = Number(document.getElementById(maxId).value) || 1;
        return Math.min(100, Math.max(0, (atual / max) * 100));
    };
    document.getElementById("barraHp").style.width = `${calcularPct("hpAtual", "hpMax")}%`;
    document.getElementById("barraPn").style.width = `${calcularPct("pnAtual", "pnMax")}%`;
    document.getElementById("barraPr").style.width = `${calcularPct("prAtual", "prMax")}%`;

    const atributos = ["corpo", "movimento", "mente", "espirito"];
    atributos.forEach(attr => {
        const val = Number(document.getElementById(attr).value) || 0;
        const mod = Math.floor((val - 10) / 2);
        const spanId = `mod${attr.charAt(0).toUpperCase() + attr.slice(1)}`;
        document.getElementById(spanId).innerText = mod >= 0 ? `mod +${mod}` : `mod ${mod}`;
    });

    Object.keys(mapaPericias).forEach(p => {
        const attrPai = mapaPericias[p];
        const valAttr = Number(document.getElementById(attrPai).value) || 10;
        const mod = Math.floor((valAttr - 10) / 2);
        
        // Pega as duas caixinhas
        const check1 = document.getElementById(`check${p}`);
        const check2 = document.getElementById(`checkDuplo${p}`);
        
        // Cada caixinha marcada soma +2
        let bonus = 0;
        if (check1 && check1.checked) bonus += 2;
        if (check2 && check2.checked) bonus += 2;
        
        const total = mod + bonus;
        const display = document.getElementById(`val${p}`);
        if (display) display.innerText = total >= 0 ? `+${total}` : total;
    });
}

// ==========================================
// CARREGAR DADOS
// ==========================================
async function carregarFicha() {
    try {
        const docSnap = await getDoc(fichaRef);
        if (docSnap.exists()) {
            const dados = docSnap.data();

            // 1. REORDENAR AS DUAS COLUNAS ANTES DE PREENCHER OS DADOS
            const colEsq = document.getElementById("coluna-esquerda");
            const colDir = document.getElementById("coluna-direita");

            // Se for uma ficha antiga (que só tinha uma coluna), joga tudo pra esquerda temporariamente
            if (dados.ordemSecoes && !dados.ordemEsquerda) {
                dados.ordemEsquerda = dados.ordemSecoes;
            }

            if (dados.ordemEsquerda && Array.isArray(dados.ordemEsquerda)) {
                dados.ordemEsquerda.forEach(idSecao => {
                    const secao = document.getElementById(idSecao);
                    if (secao && colEsq) colEsq.appendChild(secao);
                });
            }

            if (dados.ordemDireita && Array.isArray(dados.ordemDireita)) {
                dados.ordemDireita.forEach(idSecao => {
                    const secao = document.getElementById(idSecao);
                    if (secao && colDir) colDir.appendChild(secao);
                });
            }

            // CARREGA TEXTOS E EDITORES RICOS
            document.querySelectorAll("input[type='text'], input[type='number'], textarea, .editor-rico").forEach(el => {
                if (!el.classList.contains('campo-item-nome') && !el.classList.contains('campo-item-qtd') && !el.classList.contains('campo-item-desc')) {
                    if (dados[el.id] !== undefined) {
                        if (el.classList.contains('editor-rico')) {
                            el.innerHTML = dados[el.id]; // Salva a formatação!
                        } else {
                            el.value = dados[el.id];
                        }
                    }
                }
            });

            // CARREGA PERÍCIAS
            Object.keys(mapaPericias).forEach(p => {
                const check1 = document.getElementById(`check${p}`);
                const check2 = document.getElementById(`checkDuplo${p}`);
                
                if (check1 && dados[`check${p}`] !== undefined) check1.checked = dados[`check${p}`];
                if (check2 && dados[`checkDuplo${p}`] !== undefined) check2.checked = dados[`checkDuplo${p}`];
            });

            // CARREGA INVENTÁRIO
            if (dados.inventario && Array.isArray(dados.inventario)) {
                containerItens.innerHTML = "";
                dados.inventario.forEach(item => {
                    criarTemplateItem(item.nome, item.qtd, item.desc);
                });
            }

            atualizarTudo();
            console.log("Ficha carregada com sucesso!");
        }
    } catch (erro) {
        console.error("Erro ao carregar a ficha: ", erro);
    }
}
carregarFicha();

// ==========================================
// EVENTOS E SALVAMENTO
// ==========================================
const avisoNaoSalvo = document.getElementById("avisoNaoSalvo");

document.querySelectorAll("input, textarea, .editor-rico").forEach(elemento => {
    elemento.addEventListener("input", () => {
        atualizarTudo();
        avisoNaoSalvo.classList.remove("hidden");
    });
});

const btnSalvar = document.getElementById("btnSalvar");
const textoBtnSalvar = document.getElementById("textoBtnSalvar");

btnSalvar.addEventListener("click", async () => {
    textoBtnSalvar.innerText = "Salvando...";
    const dadosParaSalvar = {};
    
    document.querySelectorAll("input[type='text'], input[type='number'], textarea, .editor-rico").forEach(el => {
        if (el.id) {
            dadosParaSalvar[el.id] = el.classList.contains('editor-rico') ? el.innerHTML : el.value;
        }
    });

    Object.keys(mapaPericias).forEach(p => {
        const check1 = document.getElementById(`check${p}`);
        const check2 = document.getElementById(`checkDuplo${p}`);
        
        if (check1) dadosParaSalvar[`check${p}`] = check1.checked;
        if (check2) dadosParaSalvar[`checkDuplo${p}`] = check2.checked;
    });

    const itensParaSalvar = [];
    document.querySelectorAll(".item-container").forEach(el => {
        itensParaSalvar.push({
            nome: el.querySelector(".campo-item-nome").value,
            qtd: el.querySelector(".campo-item-qtd").value,
            desc: el.querySelector(".campo-item-desc").value
        });
    });
    dadosParaSalvar.inventario = itensParaSalvar;

    // --- SALVAR A ORDEM DAS DUAS COLUNAS ---
    const ordemEsq = [];
    document.querySelectorAll("#coluna-esquerda > .secao-arrastavel").forEach(secao => {
        ordemEsq.push(secao.id);
    });
    dadosParaSalvar.ordemEsquerda = ordemEsq;

    const ordemDir = [];
    document.querySelectorAll("#coluna-direita > .secao-arrastavel").forEach(secao => {
        ordemDir.push(secao.id);
    });
    dadosParaSalvar.ordemDireita = ordemDir;

    try {
        await setDoc(fichaRef, dadosParaSalvar);
        atualizarTudo();
        textoBtnSalvar.innerText = "Salvo com sucesso!";
        avisoNaoSalvo.classList.add("hidden");
        setTimeout(() => { textoBtnSalvar.innerText = "Salvar Ficha"; }, 2000);
    } catch (erro) {
        console.error("Erro ao salvar: ", erro);
        textoBtnSalvar.innerText = "Erro ao salvar!";
    }
});

// ==========================================
// INICIA CALCULADORA E ARRASTAR
// ==========================================
iniciarCalculadora();
window.addDigito = addDigito;
window.limparCalc = limparCalc;
window.apagarUltimo = apagarUltimo;
window.calcularResultado = calcularResultado;

// INICIALIZA A BIBLIOTECA SORTABLEJS NAS DUAS COLUNAS
const colEsq = document.getElementById("coluna-esquerda");
const colDir = document.getElementById("coluna-direita");

const configSortableColunas = {
    group: 'fichas', // ESSA É A MÁGICA: permite arrastar entre as duas colunas!
    handle: '.drag-handle',
    animation: 200,
    ghostClass: 'opacity-40',
    onEnd: function () {
        avisoNaoSalvo.classList.remove("hidden");
    }
};

if (colEsq && window.Sortable) new Sortable(colEsq, configSortableColunas);
if (colDir && window.Sortable) new Sortable(colDir, configSortableColunas);

// INICIALIZA A BIBLIOTECA SORTABLEJS DENTRO DO INVENTÁRIO
const areaInventario = document.getElementById("lista-itens");
if (areaInventario && window.Sortable) {
    new Sortable(areaInventario, {
        handle: '.drag-item',
        animation: 150,
        ghostClass: 'opacity-50',
        onEnd: function () {
            avisoNaoSalvo.classList.remove("hidden");
        }
    });
}

// ==========================================
// MOVER SEÇÕES COM AS SETAS (Alternativa ao Drag and Drop)
// ==========================================
window.moverSecao = function(botao, direcao) {
    // Acha a seção inteira onde o botão foi clicado
    const secao = botao.closest('.secao-arrastavel');
    if (!secao) return;

    if (direcao === -1) { // SUBIR
        const anterior = secao.previousElementSibling;
        // Se existe uma seção acima, troca de lugar com ela
        if (anterior && anterior.classList.contains('secao-arrastavel')) {
            secao.parentNode.insertBefore(secao, anterior);
            document.getElementById("avisoNaoSalvo").classList.remove("hidden");
        }
    } else if (direcao === 1) { // DESCER
        const proximo = secao.nextElementSibling;
        // Se existe uma seção abaixo, joga essa pra depois dela
        if (proximo && proximo.classList.contains('secao-arrastavel')) {
            secao.parentNode.insertBefore(secao, proximo.nextElementSibling);
            document.getElementById("avisoNaoSalvo").classList.remove("hidden");
        }
    }
};

// ==========================================
// MOVER PARA A OUTRA COLUNA
// ==========================================
window.moverColuna = function(botao) {
    // Acha a seção inteira onde o botão foi clicado
    const secao = botao.closest('.secao-arrastavel');
    if (!secao) return;

    const colEsq = document.getElementById("coluna-esquerda");
    const colDir = document.getElementById("coluna-direita");

    // Se estiver na esquerda, joga pro final da direita. E vice-versa.
    if (secao.parentNode.id === "coluna-esquerda") {
        colDir.appendChild(secao);
    } else {
        colEsq.appendChild(secao);
    }

    // Aciona o aviso de salvar
    document.getElementById("avisoNaoSalvo").classList.remove("hidden");
};