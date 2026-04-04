// 1. IMPORTAÇÕES DO FIREBASE (Sempre na primeira linha)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

// 2. O SEU CARROSSEL INTACTO
const swiper = new Swiper('.mySwiper', {
    // Quantos cards mostrar por padrão
    slidesPerView: 1, 
    spaceBetween: 30, // Espaço entre os cards
    grabCursor: true,

    // Responsividade: mostra mais cards em telas maiores
    breakpoints: {
        640: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 },
    },
    
    // Controles
    navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
    },
    pagination: {
        el: '.swiper-pagination',
        clickable: true,
    },
});

// 3. CONFIGURAÇÃO E INTEGRAÇÃO DO FIREBASE
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

// Função que puxa os dados do Jogador 1 e joga no HTML
async function atualizarCardJogador1() {
    try {
        const fichaRef = doc(db, "fichas", "jogador1");
        const docSnap = await getDoc(fichaRef);

        if (docSnap.exists()) {
            const dados = docSnap.data();

            const nomeEl = document.getElementById("card-nome-1");
            const nivelEl = document.getElementById("card-nivel-1");
            const recadoEl = document.getElementById("card-recado-1");

            // Atualiza os textos no card
            if (nomeEl) nomeEl.innerText = dados.nome || "Personagem 1";
            if (nivelEl) nivelEl.innerText = dados.nivel ? `Nível ${dados.nivel}` : "Nível 1";
            // Como deve ficar:
if (recadoEl) recadoEl.innerText = dados.recado || "Sem recado";
        }
    } catch (erro) {
        console.error("Erro ao carregar dados do Firebase no Hub: ", erro);
    }
}
// Função que puxa os dados do Jogador 2
async function atualizarCardJogador2() {
    try {
        const fichaRef = doc(db, "fichas", "jogador2"); // Puxa do jogador 2
        const docSnap = await getDoc(fichaRef);

        if (docSnap.exists()) {
            const dados = docSnap.data();

            const nomeEl = document.getElementById("card-nome-2"); // IDs do jogador 2
            const nivelEl = document.getElementById("card-nivel-2");
            const recadoEl = document.getElementById("card-recado-2");

            if (nomeEl) nomeEl.innerText = dados.nome || "Personagem 2";
            if (nivelEl) nivelEl.innerText = dados.nivel ? `Nível ${dados.nivel}` : "Nível 1";
            if (recadoEl) recadoEl.innerText = dados.recado || "Sem recado";
        }
    } catch (erro) {
        console.error("Erro ao carregar dados do Jogador 2: ", erro);
    }
}
// Função que puxa os dados do Jogador 3
async function atualizarCardJogador3() {
    try {
        const fichaRef = doc(db, "fichas", "jogador3"); // Puxa do jogador 3
        const docSnap = await getDoc(fichaRef);

        if (docSnap.exists()) {
            const dados = docSnap.data();

            const nomeEl = document.getElementById("card-nome-3"); // IDs do jogador 3
            const nivelEl = document.getElementById("card-nivel-3");
            const recadoEl = document.getElementById("card-recado-3");

            if (nomeEl) nomeEl.innerText = dados.nome || "Personagem 3";
            if (nivelEl) nivelEl.innerText = dados.nivel ? `Nível ${dados.nivel}` : "Nível 1";
            if (recadoEl) recadoEl.innerText = dados.recado || "Sem recado";
        }
    } catch (erro) {
        console.error("Erro ao carregar dados do Jogador 3: ", erro);
    }
}

// Função que puxa os dados do Jogador 4
async function atualizarCardJogador4() {
    try {
        const fichaRef = doc(db, "fichas", "jogador4"); // Puxa do jogador 4
        const docSnap = await getDoc(fichaRef);

        if (docSnap.exists()) {
            const dados = docSnap.data();

            const nomeEl = document.getElementById("card-nome-4"); // IDs do jogador 4
            const nivelEl = document.getElementById("card-nivel-4");
            const recadoEl = document.getElementById("card-recado-4");

            if (nomeEl) nomeEl.innerText = dados.nome || "Personagem 4";
            if (nivelEl) nivelEl.innerText = dados.nivel ? `Nível ${dados.nivel}` : "Nível 1";
            if (recadoEl) recadoEl.innerText = dados.recado || "Sem recado";
        }
    } catch (erro) {
        console.error("Erro ao carregar dados do Jogador 4: ", erro);
    }
}
// Lembre-se de executar as duas funções no final do main.js!
atualizarCardJogador1();
atualizarCardJogador2();
atualizarCardJogador3();
atualizarCardJogador4();

// ==========================================
// PAINEL DE VISÃO GERAL DO MESTRE
// ==========================================
async function atualizarVisaoGeral() {
    const btn = document.getElementById("btn-atualizar-visao");
    const icone = document.getElementById("icone-atualizar");
    const textoBtn = document.getElementById("texto-atualizar-visao");
    
    // Efeito visual de carregando no botão
    if (icone) icone.classList.add("animate-spin");
    if (textoBtn) textoBtn.innerText = "Sincronizando...";

    // Função interna para preencher as barras e textos
    const preencherMonitor = (i, dados) => {
        // Atualiza Nome
        const nomeEl = document.getElementById(`vg-nome-${i}`);
        if (nomeEl) nomeEl.innerText = dados.nome || `Jogador ${i} (Vazio)`;

        // Atualiza Barras
        const atualizarBarra = (tipo, atual, max) => {
            const elAtual = document.getElementById(`vg-${tipo}-atual-${i}`);
            const elMax = document.getElementById(`vg-${tipo}-max-${i}`);
            const elBarra = document.getElementById(`vg-${tipo}-barra-${i}`);
            
            const valAtual = Number(atual) || 0;
            const valMax = Number(max) || 1;
            const pct = Math.min(100, Math.max(0, (valAtual / valMax) * 100));

            if (elAtual) elAtual.innerText = valAtual;
            if (elMax) elMax.innerText = valMax;
            if (elBarra) elBarra.style.width = `${pct}%`;
        };

        atualizarBarra('hp', dados.hpAtual, dados.hpMax);
        atualizarBarra('pn', dados.pnAtual, dados.pnMax);
        atualizarBarra('pr', dados.prAtual, dados.prMax);
    };

    // Puxa os dados dos 4 jogadores do banco de dados simultaneamente
    for (let i = 1; i <= 4; i++) {
        try {
            const docSnap = await getDoc(doc(db, "fichas", `jogador${i}`));
            if (docSnap.exists()) {
                preencherMonitor(i, docSnap.data());
            } else {
                // Caso a ficha ainda não exista no banco
                document.getElementById(`vg-nome-${i}`).innerText = `Ficha ${i} vazia`;
            }
        } catch (erro) {
            console.error(`Erro ao atualizar visão geral do jogador ${i}:`, erro);
        }
    }

    // Tira o efeito de carregando do botão e restaura o texto
    setTimeout(() => {
        if (icone) icone.classList.remove("animate-spin");
        if (textoBtn) textoBtn.innerText = "Atualizar";
    }, 500); // Pequeno atraso só pro mestre perceber que a ação ocorreu
}

// Associa a função ao clique do botão
const btnAtualizar = document.getElementById("btn-atualizar-visao");
if (btnAtualizar) {
    btnAtualizar.addEventListener("click", atualizarVisaoGeral);
}

// Roda a função uma vez assim que a página abre para carregar o painel
atualizarVisaoGeral();