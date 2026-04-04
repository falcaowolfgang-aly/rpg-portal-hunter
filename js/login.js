import { initializeApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

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
const onlineRef = doc(db, "sessao", "online");

// Declaramos as cores inteiras para o Tailwind não se perder
const perfis = [
    { nome: "Satsu", corBorder: "hover:border-red-500", corGroup: "group-hover:border-red-500", corText: "group-hover:text-red-400" },
    { nome: "Yugen", corBorder: "hover:border-blue-500", corGroup: "group-hover:border-blue-500", corText: "group-hover:text-blue-400" },
    { nome: "Ace", corBorder: "hover:border-green-500", corGroup: "group-hover:border-green-500", corText: "group-hover:text-green-400" },
    { nome: "Takahashi", corBorder: "hover:border-purple-500", corGroup: "group-hover:border-purple-500", corText: "group-hover:text-purple-400" },
    // O PERFIL DO MESTRE ADICIONADO AQUI COM TONS DE BRANCO/CINZA
    { nome: "Mestre", corBorder: "hover:border-gray-300", corGroup: "group-hover:border-gray-300", corText: "group-hover:text-gray-200" }
];

// Espera a tela carregar 100% para começar a pintar os perfis
document.addEventListener('DOMContentLoaded', () => {
    const lista = document.getElementById('lista-perfis');
    const msgErro = document.getElementById('mensagem-erro');
    let estadoAtual = {};

    // Se estiver na página errada, não faz nada
    if (!lista) return;

    // 1. Cria os cards na tela (agora são 5!)
    perfis.forEach(p => {
        const div = document.createElement('div');
        div.id = `card-${p.nome}`;
        div.className = `bg-gray-800 border-2 border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 transform hover:-translate-y-2 hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] group ${p.corBorder}`;
        
        div.innerHTML = `
            <div class="w-24 h-24 rounded-full bg-gray-700 mb-6 border-4 border-gray-600 transition-colors flex items-center justify-center overflow-hidden ${p.corGroup}">
                <span class="text-4xl font-black text-gray-500 transition-colors ${p.corText}">${p.nome[0]}</span>
            </div>
            <h2 class="text-2xl font-bold text-white mb-3">${p.nome}</h2>
            <span id="status-${p.nome}" class="text-xs font-bold text-gray-500 uppercase tracking-widest bg-gray-900 px-4 py-1.5 rounded-full border border-gray-700 transition-colors">Livre</span>
        `;

        // 2. Evento de clique no card
        div.addEventListener('click', async () => {
            if (estadoAtual[p.nome] === true) {
                msgErro.innerText = `O perfil de ${p.nome} já está em uso!`;
                setTimeout(() => msgErro.innerText = "", 3000);
                return;
            }
            
            // Dá um feedback pro jogador não clicar duas vezes
            msgErro.classList.replace('text-red-500', 'text-yellow-500');
            msgErro.innerText = "Conectando...";

            try {
                await setDoc(onlineRef, { [p.nome]: true }, { merge: true });
                localStorage.setItem("meu_perfil", p.nome);
                window.location.href = "index.html"; // Joga pro Portal!
            } catch(e) {
                console.error(e);
                msgErro.classList.replace('text-yellow-500', 'text-red-500');
                msgErro.innerText = "Erro ao conectar. Verifique a internet.";
            }
        });

        lista.appendChild(div);
    });

    // 3. Fica olhando o Firebase o tempo todo
    onSnapshot(onlineRef, (snap) => {
        estadoAtual = snap.exists() ? snap.data() : {};

        perfis.forEach(p => {
            const card = document.getElementById(`card-${p.nome}`);
            const status = document.getElementById(`status-${p.nome}`);

            if (estadoAtual[p.nome] === true) {
                // Bloqueia e fica cinza
                card.classList.add('opacity-40', 'grayscale');
                card.classList.remove('hover:-translate-y-2', 'cursor-pointer', p.corBorder);
                card.style.pointerEvents = 'none'; 
                status.innerText = "Em Uso";
                status.classList.remove('text-gray-500', 'border-gray-700');
                status.classList.add('text-red-500', 'border-red-900');
            } else {
                // Libera e volta as cores
                card.classList.remove('opacity-40', 'grayscale');
                card.classList.add('hover:-translate-y-2', 'cursor-pointer', p.corBorder);
                card.style.pointerEvents = 'auto';
                status.innerText = "Livre";
                status.classList.remove('text-red-500', 'border-red-900');
                status.classList.add('text-gray-500', 'border-gray-700');
            }
        });
    }, (error) => {
        console.error("Erro na leitura do Firebase:", error);
    });

    // 4. Botão de Emergência
    const btnEmergencia = document.getElementById('btn-emergencia');
    if (btnEmergencia) {
        btnEmergencia.addEventListener('click', async () => {
            // Adicionamos o Mestre: false aqui para ele resetar junto com os outros!
            await setDoc(onlineRef, { Satsu: false, Yugen: false, Ace: false, Takahashi: false, Mestre: false }, { merge: true });
            alert("Sessões resetadas! Todos os perfis foram liberados.");
        });
    }
});