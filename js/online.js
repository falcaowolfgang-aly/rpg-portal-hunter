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

// 1. BLINDAGEM DO FIREBASE
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const onlineRef = doc(db, "sessao", "online");

const meuPerfil = localStorage.getItem("meu_perfil");

const isFicha = window.location.pathname.includes("fichas/");
const caminhoLogin = isFicha ? "../login.html" : "login.html";

if (!meuPerfil) {
    window.location.href = caminhoLogin;
} else {
    // 2. CORREÇÃO DE PRESENÇA
    setDoc(onlineRef, { [meuPerfil]: true }, { merge: true });
}

document.addEventListener("DOMContentLoaded", () => {
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
    document.body.style.paddingTop = "50px"; 

    document.getElementById("btn-sair-sessao").addEventListener("click", async () => {
        await setDoc(onlineRef, { [meuPerfil]: false }, { merge: true });
        localStorage.removeItem("meu_perfil");
        window.location.href = caminhoLogin;
    });

    const divJogadores = document.getElementById("barra-jogadores");

    // 3. ESCUTA O FIREBASE (COM O MESTRE INCLUSO E PADRONIZADO)
    onSnapshot(onlineRef, (snap) => {
        const dados = snap.exists() ? snap.data() : {};
        let html = '';
        
        // Lista de perfis para monitorar (Mestre no topo)
        const listaPerfis = ["Mestre", "Satsu", "Yugen", "Ace", "Takahashi"];

        listaPerfis.forEach(p => {
            if(dados[p] === true) {
                // Todo mundo online fica verde
                html += `
                    <span class="text-green-400 flex items-center gap-2 drop-shadow-md transition-all duration-500">
                        <span class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_#22c55e]"></span> 
                        ${p}
                    </span>`;
            } else {
                // Todo mundo offline fica cinza
                html += `
                    <span class="text-gray-700 flex items-center gap-2 transition-all duration-500 opacity-50">
                        <span class="w-2 h-2 rounded-full bg-gray-800"></span> 
                        ${p}
                    </span>`;
            }
        });
        divJogadores.innerHTML = html;
    });
});

window.addEventListener("beforeunload", () => {
    if(meuPerfil) {
        setDoc(onlineRef, { [meuPerfil]: false }, { merge: true });
    }
});