// 1. Importando as ferramentas do Firebase (agora com o onSnapshot)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
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

// --- CONTROLE DE ID DO JOGADOR E DO COMBATE ---
const urlParams = new URLSearchParams(window.location.search);
let jogadorId = urlParams.get('id') || "jogador1";
const fichaRef = doc(db, "fichas", jogadorId);
const iniciativaRef = doc(db, "combate", "estado_atual"); // Caminho da Iniciativa Global

// 3. Mapeamento das Perícias
const mapaPericias = {
    "Atletismo": "corpo", "Acrobacia": "movimento", "Furtividade": "movimento",
    "Investigacao": "mente", "Natureza": "mente", "Adestramento": "mente", 
    "Intuicao": "mente", "Medicina": "mente", "Percepcao": "mente", 
    "Sobrevivencia": "mente", "Historia": "mente",
    "Atuacao": "espirito", "Enganacao": "espirito", "Intimidacao": "espirito", "Persuasao": "espirito"
};

// ==========================================
// INVENTÁRIO DINÂMICO
// ==========================================
const containerItens = document.getElementById("lista-itens");
const btnAddItem = document.getElementById("add-item");

function criarTemplateItem(nome = "", qtd = "1", desc = "") {
    const itemDiv = document.createElement("div");
    itemDiv.className = "item-container bg-gray-900 p-3 rounded border border-gray-700 relative animate-fade-in mb-3 transition-colors hover:border-yellow-700";
    
    itemDiv.innerHTML = `
        <div class="flex items-center gap-2">
            <div class="drag-item cursor-move text-gray-600 hover:text-white transition p-1">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg>
            </div>
            <button type="button" class="btn-toggle-item text-yellow-500 hover:text-yellow-400 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg>
            </button>
            <input type="text" placeholder="Nome do Item" value="${nome}" class="flex-1 bg-gray-800 text-white text-sm p-2 rounded border border-gray-700 outline-none focus:border-yellow-600 campo-item-nome">
            <button type="button" class="text-gray-500 hover:text-red-500 font-bold btn-remover-item px-2 text-lg">&times;</button>
        </div>
        <div class="item-body flex flex-col gap-3 mt-3 hidden">
            <div class="flex items-center gap-2 border-t border-gray-700 pt-3">
                <label class="text-xs text-gray-400 font-bold uppercase">Quantidade:</label>
                <input type="number" value="${qtd}" min="0" class="w-20 bg-gray-800 text-white text-sm p-1.5 rounded border border-gray-700 outline-none focus:border-yellow-600 campo-item-qtd">
            </div>
            <textarea placeholder="Descrição..." class="w-full bg-gray-800 text-gray-300 text-xs p-2 rounded border border-gray-700 outline-none focus:border-yellow-600 resize-y min-h-[60px] campo-item-desc">${desc}</textarea>
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
        document.getElementById("avisoNaoSalvo")?.classList.remove("hidden");
    });

    itemDiv.querySelectorAll("input, textarea").forEach(input => {
        input.addEventListener("input", () => document.getElementById("avisoNaoSalvo")?.classList.remove("hidden"));
    });

    containerItens.appendChild(itemDiv);
}

if(btnAddItem) btnAddItem.addEventListener("click", () => criarTemplateItem());

// ==========================================
// GALERIA DE IMAGENS
// ==========================================
const containerImagens = document.getElementById("lista-imagens");
const btnAddImagem = document.getElementById("add-imagem");

function criarTemplateImagem(url = "", desc = "") {
    const div = document.createElement("div");
    div.className = "card-imagem bg-gray-900 p-4 rounded-xl border border-gray-700 flex flex-col gap-3 relative animate-fade-in shadow-xl";

    div.innerHTML = `
        <button type="button" class="absolute -top-3 -right-3 bg-red-600 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold btn-remover-img shadow-lg z-10 transition-transform hover:scale-110">&times;</button>
        
        <div class="w-full h-auto bg-gray-900 rounded-lg border border-gray-700 overflow-hidden relative group flex items-center justify-center p-1 min-h-[150px]">
            <img src="${url || 'https://via.placeholder.com/400x300/1f2937/4b5563?text=Colar+Link+Abaixo'}" 
                 class="w-full h-auto max-h-[500px] object-contain block preview-img transition-transform duration-500 group-hover:scale-105 rounded" 
                 alt="Arte">
        </div>

        <input type="text" placeholder="Cole o link da imagem aqui..." value="${url}" class="w-full bg-gray-800 text-white text-sm p-2 rounded border border-gray-700 outline-none focus:border-blue-500 campo-img-url mt-2">
        
        <textarea placeholder="Descrição da arte..." class="w-full bg-gray-800 text-gray-300 text-sm p-2 rounded border border-gray-700 outline-none focus:border-blue-500 resize-none h-20 campo-img-desc custom-scrollbar">${desc}</textarea>
    `;

    const inputUrl = div.querySelector(".campo-img-url");
    const imgPreview = div.querySelector(".preview-img");
    
    inputUrl.addEventListener("input", (e) => {
        imgPreview.src = e.target.value || 'https://via.placeholder.com/400x300/1f2937/4b5563?text=Colar+Link+Abaixo';
        document.getElementById("avisoNaoSalvo")?.classList.remove("hidden");
    });

    div.querySelector(".campo-img-desc").addEventListener("input", () => {
        document.getElementById("avisoNaoSalvo")?.classList.remove("hidden");
    });

    div.querySelector(".btn-remover-img").addEventListener("click", () => {
        div.remove();
        document.getElementById("avisoNaoSalvo")?.classList.remove("hidden");
    });

    containerImagens.appendChild(div);
}

if(btnAddImagem) btnAddImagem.addEventListener("click", () => criarTemplateImagem());

// ============================================================
// CÁLCULOS AUTOMÁTICOS
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
// CÓDIGO DO "FANTASMA" (SPACER) PARA SEÇÕES HORIZONTAIS
// ==========================================
const resizeObserver = new ResizeObserver(entries => {
    for (let entry of entries) {
        const secao = entry.target;
        const spacer = document.getElementById('spacer-' + secao.id);
        if (spacer) {
            spacer.style.height = secao.offsetHeight + 'px';
        }
    }
});

function limparExpansao(secao) {
    if (secao.classList.contains('secao-larga-dir') || secao.classList.contains('secao-larga-esq')) {
        window.alternarTamanho(secao); 
    }
}

// ==========================================
// FUNÇÕES DE MOVIMENTAÇÃO DE SEÇÕES E ABAS
// ==========================================
window.mudarPagina = function(aba) {
    const divPrincipal = document.getElementById("pagina-principal");
    const divImagens = document.getElementById("pagina-imagens");
    const tabPrincipal = document.getElementById("tab-principal");
    const tabImagens = document.getElementById("tab-imagens");

    if (aba === 'principal') {
        divPrincipal.classList.remove("hidden");
        divPrincipal.classList.add("block");
        divImagens.classList.remove("block");
        divImagens.classList.add("hidden");

        tabPrincipal.className = "px-6 py-3 bg-gray-800 text-white font-bold rounded-t-lg border-t-2 border-red-500 transition-all -mb-[1px] relative z-10";
        tabImagens.className = "px-6 py-3 bg-gray-900 text-gray-500 font-bold rounded-t-lg border border-gray-700 hover:text-gray-300 hover:bg-gray-800 transition-all border-b-0 -mb-[1px]";
    } else {
        divPrincipal.classList.remove("block");
        divPrincipal.classList.add("hidden");
        divImagens.classList.remove("hidden");
        divImagens.classList.add("block");

        tabImagens.className = "px-6 py-3 bg-gray-800 text-white font-bold rounded-t-lg border-t-2 border-blue-500 transition-all -mb-[1px] relative z-10";
        tabPrincipal.className = "px-6 py-3 bg-gray-900 text-gray-500 font-bold rounded-t-lg border border-gray-700 hover:text-gray-300 hover:bg-gray-800 transition-all border-b-0 -mb-[1px]";
    }
};

window.moverSecao = function(botao, direcao) {
    const secao = botao.closest('.secao-arrastavel');
    if (!secao) return;
    
    limparExpansao(secao); 

    if (direcao === -1) {
        const anterior = secao.previousElementSibling;
        if (anterior && anterior.classList.contains('secao-arrastavel')) {
            secao.parentNode.insertBefore(secao, anterior);
            document.getElementById("avisoNaoSalvo")?.classList.remove("hidden");
        }
    } else {
        const proximo = secao.nextElementSibling;
        if (proximo && proximo.classList.contains('secao-arrastavel')) {
            secao.parentNode.insertBefore(secao, proximo.nextElementSibling);
            document.getElementById("avisoNaoSalvo")?.classList.remove("hidden");
        }
    }
};

window.moverColuna = function(botao, direcao) {
    const secao = botao.closest('.secao-arrastavel');
    if (!secao) return;

    limparExpansao(secao);

    const colunas = ["coluna-esquerda", "coluna-centro", "coluna-direita"];
    let indexAtual = colunas.indexOf(secao.parentNode.id);
    
    if (indexAtual === -1) return; 

    let novoIndex = indexAtual + direcao;
    if(novoIndex >= 0 && novoIndex < colunas.length) {
        document.getElementById(colunas[novoIndex]).appendChild(secao);
        document.getElementById("avisoNaoSalvo")?.classList.remove("hidden");
    }
};

window.alternarTamanho = function(elemento) {
    const secao = elemento.classList && elemento.classList.contains('secao-arrastavel') 
        ? elemento 
        : elemento.closest('.secao-arrastavel');
    
    if (!secao) return;
    const colAtual = secao.parentNode.id;

    if (secao.classList.contains('secao-larga-dir') || secao.classList.contains('secao-larga-esq')) {
        secao.classList.remove('secao-larga-dir', 'secao-larga-esq');
        resizeObserver.unobserve(secao);
        
        const spacer = document.getElementById('spacer-' + secao.id);
        if (spacer) spacer.remove();
    } else {
        let colAlvoId;
        let classeLarga;

        if (colAtual === 'coluna-esquerda') {
            classeLarga = 'secao-larga-dir';
            colAlvoId = 'coluna-centro';
        } else if (colAtual === 'coluna-centro') {
            classeLarga = 'secao-larga-dir';
            colAlvoId = 'coluna-direita';
        } else if (colAtual === 'coluna-direita') {
            classeLarga = 'secao-larga-esq';
            colAlvoId = 'coluna-centro';
        }

        secao.classList.add(classeLarga);
        resizeObserver.observe(secao);

        const index = Array.from(secao.parentNode.children).indexOf(secao);
        const spacer = document.createElement('div');
        spacer.id = 'spacer-' + secao.id;
        spacer.className = 'spacer-div';
        spacer.style.height = secao.offsetHeight + 'px';

        const colAlvo = document.getElementById(colAlvoId);
        const nodeAlvo = colAlvo.children[index];
        if (nodeAlvo) {
            colAlvo.insertBefore(spacer, nodeAlvo);
        } else {
            colAlvo.appendChild(spacer);
        }
    }
    document.getElementById("avisoNaoSalvo")?.classList.remove("hidden");
};

// ==========================================
// INICIALIZA BIBLIOTECA DE ARRASTAR
// ==========================================
const configSortable = {
    group: 'fichas',
    handle: '.drag-handle',
    animation: 200,
    ghostClass: 'opacity-40',
    onStart: function (evt) { limparExpansao(evt.item); },
    onEnd: () => document.getElementById("avisoNaoSalvo")?.classList.remove("hidden")
};

["coluna-esquerda", "coluna-centro", "coluna-direita"].forEach(id => {
    const el = document.getElementById(id);
    if (el && window.Sortable) new Sortable(el, configSortable);
});

const areaInv = document.getElementById("lista-itens");
if (areaInv && window.Sortable) {
    new Sortable(areaInv, {
        handle: '.drag-item',
        animation: 150,
        onEnd: () => document.getElementById("avisoNaoSalvo")?.classList.remove("hidden")
    });
}

// ==========================================
// CARREGAR DADOS E SALVAR NA FICHA
// ==========================================
async function carregarFicha() {
    try {
        const docSnap = await getDoc(fichaRef);
        if (docSnap.exists()) {
            const dados = docSnap.data();
            const colunasIds = ["coluna-esquerda", "coluna-centro", "coluna-direita"];
            const secoesParaExpandir = [];
            
            if (dados.ordemEsquerda && !dados.ordem_coluna_esquerda) {
                dados.ordem_coluna_esquerda = (dados.ordemEsquerda || []).map(id => ({id, larga: false}));
                dados.ordem_coluna_direita = (dados.ordemDireita || []).map(id => ({id, larga: false}));
            }

            colunasIds.forEach(idCol => {
                const dadosCol = dados[`ordem_${idCol.replace(/-/g, '_')}`];
                if (dadosCol && Array.isArray(dadosCol)) {
                    dadosCol.forEach(item => {
                        const idSecao = typeof item === 'string' ? item : item.id;
                        const secao = document.getElementById(idSecao);
                        if (secao) {
                            document.getElementById(idCol).appendChild(secao);
                            if (item.larga) secoesParaExpandir.push(secao);
                        }
                    });
                }
            });

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

            Object.keys(mapaPericias).forEach(p => {
                const c1 = document.getElementById(`check${p}`);
                const c2 = document.getElementById(`checkDuplo${p}`);
                if (c1 && dados[`check${p}`] !== undefined) c1.checked = dados[`check${p}`];
                if (c2 && dados[`checkDuplo${p}`] !== undefined) c2.checked = dados[`checkDuplo${p}`];
            });

            if (dados.inventario && Array.isArray(dados.inventario)) {
                containerItens.innerHTML = "";
                dados.inventario.forEach(item => criarTemplateItem(item.nome, item.qtd, item.desc));
            }

            if (dados.galeria && Array.isArray(dados.galeria)) {
                containerImagens.innerHTML = "";
                dados.galeria.forEach(img => criarTemplateImagem(img.url, img.desc));
            }
            atualizarTudo();
            
            setTimeout(() => {
                secoesParaExpandir.forEach(secao => window.alternarTamanho(secao));
            }, 300);

            console.log("Ficha carregada com sucesso!");
        }
    } catch (erro) {
        console.error("Erro ao carregar a ficha:", erro);
    }
}
carregarFicha();

document.querySelectorAll("input, textarea, .editor-rico, [contenteditable='true']").forEach(elemento => {
    elemento.addEventListener("input", () => {
        atualizarTudo();
        document.getElementById("avisoNaoSalvo")?.classList.remove("hidden");
    });
});

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
        document.querySelectorAll(".item-container").forEach(el => {
            itens.push({
                nome: el.querySelector(".campo-item-nome").value,
                qtd: el.querySelector(".campo-item-qtd").value,
                desc: el.querySelector(".campo-item-desc").value
            });
        });
        dadosParaSalvar.inventario = itens;

        const galeria = [];
        document.querySelectorAll(".card-imagem").forEach(el => {
            galeria.push({
                url: el.querySelector(".campo-img-url").value,
                desc: el.querySelector(".campo-img-desc").value
            });
        });
        dadosParaSalvar.galeria = galeria;

        const colunasIds = ["coluna-esquerda", "coluna-centro", "coluna-direita"];
        colunasIds.forEach(idCol => {
            const ordem = [];
            document.querySelectorAll(`#${idCol} > .secao-arrastavel`).forEach(secao => {
                ordem.push({
                    id: secao.id,
                    larga: secao.classList.contains('secao-larga-dir') || secao.classList.contains('secao-larga-esq')
                });
            });
            dadosParaSalvar[`ordem_${idCol.replace(/-/g, '_')}`] = ordem;
        });

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

// Calculadora
iniciarCalculadora();
window.addDigito = addDigito;
window.limparCalc = limparCalc;
window.apagarUltimo = apagarUltimo;
window.calcularResultado = calcularResultado;


// ==========================================
// INICIATIVA MULTIPLAYER (FIREBASE)
// ==========================================
const btnIniciativa = document.getElementById('btn-iniciativa');
if (btnIniciativa) {
    const painelIniciativa = document.getElementById('painel-iniciativa');
    const viewMode = document.getElementById('iniciativa-view-mode');
    const editMode = document.getElementById('iniciativa-edit-mode');
    const displayIniciativa = document.getElementById('iniciativa-display');
    const textareaIniciativa = document.getElementById('iniciativa-textarea');
    const btnEditarIniciativa = document.getElementById('btn-editar-iniciativa');
    const btnConfirmarIniciativa = document.getElementById('btn-confirmar-iniciativa');

    btnIniciativa.addEventListener('click', () => {
        painelIniciativa.classList.toggle('hidden');
    });

    btnEditarIniciativa.addEventListener('click', () => {
        const textoAtual = displayIniciativa.innerText;
        textareaIniciativa.value = textoAtual === "Nenhum combate ativo." ? "" : textoAtual;
        viewMode.classList.add('hidden');
        editMode.classList.remove('hidden');
    });

    function atualizarDisplay(texto) {
        if(displayIniciativa) {
            displayIniciativa.innerText = texto && texto.trim() !== "" ? texto : "Nenhum combate ativo.";
        }
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

    // ESCUTA O FIREBASE EM TEMPO REAL
    onSnapshot(iniciativaRef, (docSnap) => {
        if (docSnap.exists()) {
            atualizarDisplay(docSnap.data().texto);
        } else {
            atualizarDisplay("");
        }
    });
}
