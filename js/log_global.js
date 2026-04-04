import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAp9MzVTjccwHoXvZSiVNjK36nbVf41rIM",
    authDomain: "meu-rpg-fichas.firebaseapp.com",
    projectId: "meu-rpg-fichas",
    storageBucket: "meu-rpg-fichas.firebasestorage.app",
    messagingSenderId: "244238439870",
    appId: "1:244238439870:web:974a21e2c76fce6ffad5ef"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    
    // 1. O "Cérebro" Adaptativo: Detecta se é Celular ou PC
    const isMobile = window.innerWidth <= 768 || window.location.pathname.includes("mobile");
    
    let listaLogs;
    let modal, notificacao; // Variáveis que só vão existir no PC

    if (!isMobile) {
        // ==========================================
        // INTERFACE DO COMPUTADOR (JANELA FLUTUANTE)
        // ==========================================
        const container = document.createElement("div");
        container.className = "fixed bottom-10 left-10 z-[100] flex flex-col items-start gap-2 transition-transform";
        container.style.willChange = "top, left";

        container.innerHTML = `
            <div id="modalLogDados" class="hidden bg-gray-900 border-2 border-blue-900 w-80 rounded-xl shadow-2xl overflow-hidden animate-fade-in select-none">
                <div id="logHeader" class="bg-blue-900/50 p-2 flex justify-between items-center cursor-grab active:cursor-grabbing border-b border-blue-800">
                    <span class="text-base font-black text-blue-200 uppercase tracking-[0.2em] ml-2">Histórico de Dados</span>
                    <button id="fecharLog" class="text-blue-300 hover:text-white px-2 font-bold">&times;</button>
                </div>
                <div id="lista-log-dados" class="flex flex-col gap-2 p-4 max-h-80 overflow-y-auto custom-scrollbar bg-gray-950/50">
                    <div class="text-center text-gray-600 text-[10px] py-4 uppercase">Aguardando rolagens...</div>
                </div>
            </div>

            <button id="btnAbrirLog" class="bg-blue-700 hover:bg-blue-600 text-white p-4 rounded-full shadow-2xl border-2 border-blue-900 cursor-grab active:cursor-grabbing relative z-10 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <span id="notificacao-log" class="hidden absolute -top-1 -right-1 bg-red-500 w-4 h-4 rounded-full border-2 border-gray-900 animate-pulse pointer-events-none"></span>
            </button>
        `;
        document.body.appendChild(container);

        modal = document.getElementById("modalLogDados");
        const btnAbrir = document.getElementById("btnAbrirLog");
        const btnFechar = document.getElementById("fecharLog");
        notificacao = document.getElementById("notificacao-log");
        const header = document.getElementById("logHeader");
        
        // Define o alvo das mensagens no PC
        listaLogs = document.getElementById("lista-log-dados");

        // Lógica de Arrastar (Drag & Drop do PC)
        let isDragging = false;
        let hasDragged = false;
        let offset = { x: 0, y: 0 };

        const iniciarArrasto = (e) => {
            isDragging = true;
            hasDragged = false;
            const rect = container.getBoundingClientRect();
            offset.x = e.clientX - rect.left;
            offset.y = e.clientY - rect.top;
            document.body.style.userSelect = "none";
        };

        header.addEventListener("mousedown", iniciarArrasto);
        btnAbrir.addEventListener("mousedown", iniciarArrasto);

        document.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            hasDragged = true;
            container.style.bottom = "auto"; 
            container.style.right = "auto";
            container.style.left = (e.clientX - offset.x) + "px";
            container.style.top = (e.clientY - offset.y) + "px";
        });

        document.addEventListener("mouseup", () => {
            if (isDragging) {
                isDragging = false;
                document.body.style.userSelect = "";
                setTimeout(() => hasDragged = false, 50);
            }
        });

        // Lógica de Abrir/Fechar do PC
        btnAbrir.addEventListener("click", (e) => {
            if (hasDragged) {
                e.preventDefault();
                return;
            }
            modal.classList.toggle("hidden");
            notificacao.classList.add("hidden");
            if (!modal.classList.contains("hidden")) {
                setTimeout(() => listaLogs.scrollTop = listaLogs.scrollHeight, 100);
            }
        });

        btnFechar.addEventListener("click", () => modal.classList.add("hidden"));

    } else {
        // ==========================================
        // INTERFACE DO CELULAR (CHAT UNIFICADO)
        // ==========================================
        // No celular nós não desenhamos botões novos. Só apontamos para o HTML existente!
        listaLogs = document.getElementById("resultado-rolagens");
    }

    // ==========================================
    // ESCUTAR FIREBASE E RENDERIZAR NA TELA CERTA
    // ==========================================
    const q = query(collection(db, "logs_dados"), orderBy("timestamp", "asc"));
    let primeiraCarga = true;
    
    onSnapshot(q, (snap) => {
        if (snap.empty) return;

        let html = "";
        snap.forEach((doc) => {
            const d = doc.data();
            
            // Define as cores baseadas no nome do autor (Ajuste para os nomes reais da sua mesa)
            let corAutor = "text-purple-500";
            if (d.autor) {
                const nome = d.autor.toLowerCase();
                if (nome.includes("satsu")) corAutor = "text-red-500";
                else if (nome.includes("yugen")) corAutor = "text-blue-500";
                else if (nome.includes("ace")) corAutor = "text-green-500";
                else if (nome.includes("mestre")) corAutor = "text-white"; // <-- COR DO MESTRE AQUI
            }
            
            html += `
                <div class="bg-gray-900/80 p-2 rounded border border-gray-800 shadow-sm animate-fade-in border-l-2 border-l-blue-600">
                    <div class="text-[9px] font-black ${corAutor} uppercase mb-1 flex justify-between">
                        <span>${d.autor || "Desconhecido"}</span>
                        <span class="text-gray-600 font-mono">${d.formula || ""}</span>
                    </div>
                    <div class="text-[11px] text-gray-300 leading-tight">
                        <span class="text-gray-500">${d.detalhes || ""}</span> ➔ <b class="text-white text-sm">${d.total || "0"}</b>
                    </div>
                </div>
            `;
        });

        // Imprime a mensagem na caixa correta (Dependendo de qual dispositivo o usuário está)
        if (listaLogs) {
            listaLogs.innerHTML = html;
            listaLogs.scrollTop = listaLogs.scrollHeight; // Auto-scroll para baixo
        }

        // Lógica do pontinho vermelho de notificação (Que agora só roda no PC)
        if (!isMobile) {
            if (primeiraCarga) {
                primeiraCarga = false; 
            } else {
                if (modal && modal.classList.contains("hidden") && notificacao) {
                    notificacao.classList.remove("hidden");
                }
            }
        }
    });
});