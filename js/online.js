// js/online.js
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, doc, setDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAp9MzVTjccwHoXvZSiVNjK36nbVf41rIM",
    authDomain: "meu-rpg-fichas.firebaseapp.com",
    projectId: "meu-rpg-fichas",
    storageBucket: "meu-rpg-fichas.firebasestorage.app",
    messagingSenderId: "244238439870",
    appId: "1:244238439870:web:974a21e2c76fce6ffad5ef"
};

// 1. BLINDAGEM DO FIREBASE (Evita o erro de duplicação)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const onlineRef = doc(db, "sessao", "online");

// Pergunta pro navegador: "Quem eu sou?"
const meuPerfil = localStorage.getItem("meu_perfil");

// Lógica de Redirecionamento de Pasta Inteligente
const isFicha = window.location.pathname.includes("fichas/");
const caminhoLogin = isFicha ? "../login.html" : "login.html";

// Se tentar entrar sem logar, chuta pro Login!
if (!meuPerfil) {
    window.location.href = caminhoLogin;
} else {
    // 2. A CORREÇÃO DE PRESENÇA! 
    // Assim que a página abrir, grita pro Firebase que você está vivo e online.
    // Isso anula o fato de você ter ficado "offline" por milissegundos ao mudar de tela ou dar F5.
    setDoc(onlineRef, { [meuPerfil]: true }, { merge: true });
}

document.addEventListener("DOMContentLoaded", () => {
    // Constrói a Barra Topo via JavaScript
    const barra = document.createElement("div");
    barra.className = "fixed top-0 left-0 w-full bg-gray-950 border-b border-gray-800 z-[100] flex justify-between items-center px-6 py-3 shadow-lg";
    
    barra.innerHTML = `
        <div class="text-gray-500 text-xs font-bold tracking-widest uppercase hidden md:block">Sistema Hunter</div>
        <div id="barra-jogadores" class="flex gap-4 md:gap-8 justify-center text-[10px] md:text-xs font-bold uppercase tracking-widest flex-1"></div>
        <button id="btn-sair-sessao" class="text-red-500 hover:text-red-400 hover:bg-red-950 border border-red-900 px-3 py-1 rounded text-[10px] md:text-xs font-bold uppercase transition-colors">
            Sair <span class="hidden md:inline">(${meuPerfil})</span>
        </button>
    `;

    document.body.prepend(barra);
    
    // Empurra o site inteiro 50px pra baixo
    document.body.style.paddingTop = "50px"; 

    // Lógica do Botão Sair
    document.getElementById("btn-sair-sessao").addEventListener("click", async () => {
        await setDoc(onlineRef, { [meuPerfil]: false }, { merge: true });
        localStorage.removeItem("meu_perfil");
        window.location.href = caminhoLogin;
    });

    // Escuta o Firebase para pintar as bolinhas
    const divJogadores = document.getElementById("barra-jogadores");
    onSnapshot(onlineRef, (snap) => {
        const dados = snap.exists() ? snap.data() : {};
        let html = '';
        ["Satsu", "Yugen", "Ace", "Takahashi"].forEach(p => {
            if(dados[p] === true) {
                html += `<span class="text-green-400 flex items-center gap-2 drop-shadow-md"><span class="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span> ${p}</span>`;
            } else {
                html += `<span class="text-gray-600 flex items-center gap-2"><span class="w-2.5 h-2.5 rounded-full bg-gray-800"></span> ${p}</span>`;
            }
        });
        divJogadores.innerHTML = html;
    });
});

// O Detalhe Ninja: Fica offline ao fechar a aba
window.addEventListener("beforeunload", () => {
    if(meuPerfil) {
        // Envia um último suspiro pra nuvem antes da aba morrer
        setDoc(onlineRef, { [meuPerfil]: false }, { merge: true });
    }
});