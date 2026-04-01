import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
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

const mapaPericias = {
    "Atletismo": "corpo", "Acrobacia": "movimento", "Furtividade": "movimento",
    "Investigacao": "mente", "Natureza": "mente", "Adestramento": "mente", 
    "Intuicao": "mente", "Medicina": "mente", "Percepcao": "mente", 
    "Sobrevivencia": "mente", "Historia": "mente",
    "Atuacao": "espirito", "Enganacao": "espirito", "Intimidacao": "espirito", "Persuasao": "espirito"
};

// ==========================================
// INVENTÁRIO (LÓGICA MANTIDA INTÁCTA)
// ==========================================
const containerItens = document.getElementById("lista-itens");
const btnAddItem = document.getElementById("add-item");

function criarTemplateItem(nome = "", qtd = "1", desc = "") {
    const itemDiv = document.createElement("div");
    itemDiv.className = "item-container bg-gray-900 p-2 rounded border border-gray-700 relative animate-fade-in mb-2 transition-colors hover:border-yellow-700";
    
    itemDiv.innerHTML = `
        <div class="flex items-center gap-2">
            <div class="drag-item cursor-move text-gray-600 hover:text-white transition p-1"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="9" cy="5" r="1.5"/><circle cx="15" cy="5" r="1.5"/><circle cx="9" cy="12" r="1.5"/><circle cx="15" cy="12" r="1.5"/><circle cx="9" cy="19" r="1.5"/><circle cx="15" cy="19" r="1.5"/></svg></div>
            <button type="button" class="btn-toggle-item text-yellow-500 hover:text-yellow-400 transition-transform duration-300"><svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" /></svg></button>
            <input type="text" placeholder="Nome do Item" value="${nome}" class="flex-1 bg-gray-800 text-white text-sm p-1.5 rounded border border-gray-700 outline-none focus:border-yellow-600 campo-item-nome">
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
        document.getElementById("avisoNaoSalvo")?.classList.remove("hidden");
    });

    itemDiv.querySelectorAll("input, textarea").forEach(input => {
        input.addEventListener("input", () => document.getElementById("avisoNaoSalvo")?.classList.remove("hidden"));
    });

    containerItens.appendChild(itemDiv);
}

if(btnAddItem) btnAddItem.addEventListener("click", () => criarTemplateItem());

// ==========================================
// GALERIA (MANTIDA)
// ==========================================
const containerImagens = document.getElementById("lista-imagens");
const btnAddImagem = document.getElementById("add-imagem");

function criarTemplateImagem(url = "", desc = "") {
    const div = document.createElement("div");
    div.className = "card-imagem bg-gray-900 p-4 rounded-xl border border-gray-700 flex flex-col gap-3 relative animate-fade-in shadow-xl";

    div.innerHTML = `
        <button type="button" class="absolute -top-3 -right-3 bg-red-600 hover:bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold btn-remover-img shadow-lg z-10 transition-transform hover:scale-110">&times;</button>
        <div class="w-full h-auto bg-gray-900 rounded-lg border border-gray-700 overflow-hidden relative group flex items-center justify-center p-1 min-h-[150px]">
            <img src="${url || 'https://via.placeholder.com/400x300/1f2937/4b5563?text=Colar+Link+Abaixo'}" class="w-full h-auto max-h-[500px] object-contain block preview-img transition-transform duration-500 group-hover:scale-105 rounded" alt="Arte">
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

    div.querySelector(".campo-img-desc").addEventListener("input", () => document.getElementById("avisoNaoSalvo")?.classList.remove("hidden"));
    div.querySelector(".btn-remover-img").addEventListener("click", () => {
        div.remove();
        document.getElementById("avisoNaoSalvo")?.classList.remove("hidden");
    });

    containerImagens.appendChild(div);
}

if(btnAddImagem) btnAddImagem.addEventListener("click", () => criarTemplateImagem());

// ============================================================
// CÁLCULOS (MANTIDA)
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
// ABAS (MANTIDA)
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

// ==========================================
// NOVO SISTEMA: SWITCH DE TAMANHO (LIGA/DESLIGA)
// ==========================================
window.toggleTamanho = function(botao, eixo) {
    const secao = botao.closest('.secao-arrastavel');
    if (!secao) return;

    // Descobre o que está ligado agora
    const isLargo = secao.classList.contains('bloco-2x1');
    const isAlto = secao.classList.contains('bloco-1x2');

    // Botões da seção atual
    const btnLargo = secao.querySelector('.btn-largo');
    const btnAlto = secao.querySelector('.btn-alto');

    // Reset geral da caixa (limpa as classes de tamanho)
    secao.classList.remove('bloco-1x1', 'bloco-2x1', 'bloco-1x2');

    if (eixo === 'horizontal') {
        if (isLargo) {
            // Se já estava largo, volta pro normal (1x1)
            secao.classList.add('bloco-1x1');
            btnLargo.classList.remove('text-blue-400', 'bg-gray-800'); // Desliga a luz do botão
        } else {
            // Estica horizontal
            secao.classList.add('bloco-2x1');
            btnLargo.classList.add('text-blue-400', 'bg-gray-800'); // Acende o botão
            btnAlto.classList.remove('text-blue-400', 'bg-gray-800'); // Apaga o outro
        }
    } else if (eixo === 'vertical') {
        if (isAlto) {
            // Se já estava alto, volta pro normal (1x1)
            secao.classList.add('bloco-1x1');
            btnAlto.classList.remove('text-blue-400', 'bg-gray-800');
        } else {
            // Estica vertical
            secao.classList.add('bloco-1x2');
            btnAlto.classList.add('text-blue-400', 'bg-gray-800');
            btnLargo.classList.remove('text-blue-400', 'bg-gray-800');
        }
    }

    document.getElementById("avisoNaoSalvo")?.classList.remove("hidden");
};

// ==========================================
// ARRASTAR E SOLTAR (SORTABLE GRID ÚNICO)
// ==========================================
const gridFichas = document.getElementById("grid-fichas");
if (gridFichas && window.Sortable) {
    new Sortable(gridFichas, {
        animation: 300,
        handle: '.drag-handle',
        ghostClass: 'opacity-40',
        onEnd: () => document.getElementById("avisoNaoSalvo")?.classList.remove("hidden")
    });
}

const areaInv = document.getElementById("lista-itens");
if (areaInv && window.Sortable) {
    new Sortable(areaInv, {
        handle: '.drag-item',
        animation: 150,
        onEnd: () => document.getElementById("avisoNaoSalvo")?.classList.remove("hidden")
    });
}

// ==========================================
// CARREGAR DADOS E SALVAR NO FIREBASE
// ==========================================
async function carregarFicha() {
    try {
        const docSnap = await getDoc(fichaRef);
        if (docSnap.exists()) {
            const dados = docSnap.data();
            
            // LÓGICA DO GRID UNIFICADO
            const gridContainer = document.getElementById("grid-fichas");
            
            if (dados.ordem_grid && Array.isArray(dados.ordem_grid)) {
    // Lê o array salvo e reordena os blocos reais na tela
    dados.ordem_grid.forEach(item => {
        const secao = document.getElementById(item.id);
        
        if (secao) {
            gridContainer.appendChild(secao); // Joga pro fim da fila, criando a ordem
            
            // Restaura o tamanho (1x1, 2x1, 1x2)
            secao.classList.remove('bloco-1x1', 'bloco-2x1', 'bloco-1x2');
            secao.classList.add(item.tamanho || 'bloco-1x1');

            // Acende o botão correto ao carregar a página
            const btnLargo = secao.querySelector('.btn-largo');
            const btnAlto = secao.querySelector('.btn-alto');
            
            if (btnLargo && btnAlto) {
                btnLargo.classList.remove('text-blue-400', 'bg-gray-800');
                btnAlto.classList.remove('text-blue-400', 'bg-gray-800');
                
                if (item.tamanho === 'bloco-2x1') btnLargo.classList.add('text-blue-400', 'bg-gray-800');
                if (item.tamanho === 'bloco-1x2') btnAlto.classList.add('text-blue-400', 'bg-gray-800');
            }
        } // <--- FALTAVA ESSA CHAVE AQUI PARA FECHAR O "if (secao)"!
    });
} else {
                // MIGRACÃO: Se a ficha do jogador é velha (tinha 3 colunas),
                // Ele ignora a ordem antiga e usa a padrão do HTML atual (1x1 em tudo).
                // Daí o jogador ajeita a tela do zero e salva.
            }

            // Preenche os Inputs
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

            // Preenche os Checks
            Object.keys(mapaPericias).forEach(p => {
                const c1 = document.getElementById(`check${p}`);
                const c2 = document.getElementById(`checkDuplo${p}`);
                if (c1 && dados[`check${p}`] !== undefined) c1.checked = dados[`check${p}`];
                if (c2 && dados[`checkDuplo${p}`] !== undefined) c2.checked = dados[`checkDuplo${p}`];
            });

            // Recria Inventario
            if (dados.inventario && Array.isArray(dados.inventario)) {
                containerItens.innerHTML = "";
                dados.inventario.forEach(item => criarTemplateItem(item.nome, item.qtd, item.desc));
            }

            // Recria Galeria
            if (dados.galeria && Array.isArray(dados.galeria)) {
                containerImagens.innerHTML = "";
                dados.galeria.forEach(img => criarTemplateImagem(img.url, img.desc));
            }
            atualizarTudo();

            console.log("Ficha carregada com sucesso no novo Grid!");
        }
    } catch (erro) {
        console.error("Erro ao carregar a ficha:", erro);
    }
}
carregarFicha();

// Escuta tudo que o jogador digita para acender o aviso "Nao Salvo"
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
        
        // Pega Inputs e Textos
        document.querySelectorAll("input[type='text'], input[type='number'], textarea, .editor-rico, [contenteditable='true']").forEach(el => {
            if (el.id && !el.classList.contains('campo-item-nome') && !el.classList.contains('campo-item-qtd') && !el.classList.contains('campo-item-desc') && !el.classList.contains('campo-img-url') && !el.classList.contains('campo-img-desc')) {
                dadosParaSalvar[el.id] = (el.classList.contains('editor-rico') || el.getAttribute('contenteditable') === 'true') ? el.innerHTML : el.value;
            }
        });

        // Pega Checks
        Object.keys(mapaPericias).forEach(p => {
            const c1 = document.getElementById(`check${p}`);
            const c2 = document.getElementById(`checkDuplo${p}`);
            if (c1) dadosParaSalvar[`check${p}`] = c1.checked;
            if (c2) dadosParaSalvar[`checkDuplo${p}`] = c2.checked;
        });

        // Pega Inventário e Galeria
        const itens = [];
        document.querySelectorAll(".item-container").forEach(el => itens.push({nome: el.querySelector(".campo-item-nome").value, qtd: el.querySelector(".campo-item-qtd").value, desc: el.querySelector(".campo-item-desc").value}));
        dadosParaSalvar.inventario = itens;

        const galeria = [];
        document.querySelectorAll(".card-imagem").forEach(el => galeria.push({url: el.querySelector(".campo-img-url").value, desc: el.querySelector(".campo-img-desc").value}));
        dadosParaSalvar.galeria = galeria;

        // Pega a Ordem e o Tamanho do GRID
        const ordemGrid = [];
        document.querySelectorAll("#grid-fichas > .secao-arrastavel").forEach(secao => {
            let tamanho = 'bloco-1x1';
            if (secao.classList.contains('bloco-2x1')) tamanho = 'bloco-2x1';
            if (secao.classList.contains('bloco-1x2')) tamanho = 'bloco-1x2';
            
            ordemGrid.push({
                id: secao.id,
                tamanho: tamanho
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

// Inicia Calculadora
iniciarCalculadora();
window.addDigito = addDigito;
window.limparCalc = limparCalc;
window.apagarUltimo = apagarUltimo;
window.calcularResultado = calcularResultado;