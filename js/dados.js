// js/dados.js
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, getDocs, query, orderBy, deleteDoc } from "https://www.gstatic.com/firebasejs/10.9.0/firebase-firestore.js";
const firebaseConfig = {
    apiKey: "AIzaSyAp9MzVTjccwHoXvZSiVNjK36nbVf41rIM",
    authDomain: "meu-rpg-fichas.firebaseapp.com",
    projectId: "meu-rpg-fichas",
    storageBucket: "meu-rpg-fichas.firebasestorage.app",
    messagingSenderId: "244238439870",
    appId: "1:244238439870:web:974a21e2c76fce6ffad5ef"
};

// Trava de segurança: Só inicializa o Firebase se ele já não estiver rodando em outro arquivo
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

document.addEventListener('DOMContentLoaded', () => {
    const btnDados = document.getElementById('btn-dados');
    if (!btnDados) return; // Se não tiver o botão na tela, para por aqui

    const painelDados = document.getElementById('painel-dados');
    const inputFormula = document.getElementById('input-formula');
    const btnLimpar = document.getElementById('btn-limpar-dados');
    const btnRolar = document.getElementById('btn-rolar-dados');
    const areaResultados = document.getElementById('resultado-rolagens');

    // ==========================================
    // 1. ABRIR E FECHAR A JANELA (A parte que faltou!)
    // ==========================================
    btnDados.addEventListener('click', () => {
        painelDados.classList.toggle('hidden');
        if (!painelDados.classList.contains('hidden')) {
            inputFormula.focus(); // Foca no campo de texto automaticamente
        }
    });

    // Botão de Limpar
    btnLimpar.addEventListener('click', () => {
        inputFormula.value = '';
        areaResultados.innerHTML = '<div class="text-center text-gray-500 text-xs italic py-4">Digite uma fórmula acima para rolar.</div>';
        inputFormula.focus();
    });

    // Permite apertar "Enter" no teclado para rolar os dados
    inputFormula.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') btnRolar.click();
    });

    // ==========================================
    // 2. LÓGICA DE ROLAR E ENVIAR PARA O LOG GLOBAL
    // ==========================================
    btnRolar.addEventListener('click', async () => {
        let texto = inputFormula.value.trim().toLowerCase(); 
        if (!texto) return;

        let conjuntos = 1;
        if (texto.includes('#')) {
            const partes = texto.split('#');
            conjuntos = parseInt(partes[0]) || 1;
            texto = partes.slice(1).join(''); 
        }

        if (conjuntos < 1) conjuntos = 1;
        if (conjuntos > 50) conjuntos = 50;

        let htmlFinal = '';
        const regexDados = /(\d*)d(\d+)/g;
        const meuPerfil = localStorage.getItem("meu_perfil") || "Desconhecido";

        for (let c = 0; c < conjuntos; c++) {
            let logDetalhadoVisual = [];
            let logDetalhadoTexto = ""; // Usado para mandar pro Firebase
            let expressaoMatematica = texto;

            expressaoMatematica = expressaoMatematica.replace(regexDados, (match, p1, p2) => {
                const qtd = p1 ? parseInt(p1) : 1; 
                const faces = parseInt(p2);
                let somaDado = 0;
                let rolls = [];

                const safeQtd = Math.min(qtd, 100); 

                for (let i = 0; i < safeQtd; i++) {
                    const roll = Math.floor(Math.random() * faces) + 1;
                    somaDado += roll;
                    rolls.push(roll);
                }

                logDetalhadoVisual.push(`
                    <div class="flex justify-between w-full">
                        <span class="text-blue-400 font-bold">[${qtd}d${faces}]</span> 
                        <span class="text-white mx-2 flex-1 text-right break-words">${rolls.join(', ')}</span> 
                        <span class="text-gray-500 text-[10px] self-end min-w-[50px] text-right">soma: <b class="text-gray-400">${somaDado}</b></span>
                    </div>
                `);
                
                logDetalhadoTexto += `[${rolls.join(', ')}] `;
                return somaDado;
            });

            let totalFinal = 0;
            let erroNaConta = false;

            try {
                const expressaoSegura = expressaoMatematica.replace(/[^0-9+\-*/().]/g, '');
                totalFinal = new Function('return ' + expressaoSegura)();
                if(totalFinal % 1 !== 0) totalFinal = totalFinal.toFixed(2);
            } catch (e) {
                erroNaConta = true;
            }

            if (erroNaConta) {
                htmlFinal += `<div class="bg-red-900/50 p-3 rounded border border-red-700 text-red-200 text-xs mb-2">Erro na fórmula. Tente algo como 2d6+5.</div>`;
                break; 
            }

            // Mostra o card na própria janela de dados
            htmlFinal += `
                <div class="bg-gray-900 p-3 rounded border border-gray-700 shadow-inner relative animate-fade-in mb-2 last:mb-0">
                    ${conjuntos > 1 ? `<div class="absolute top-0 left-0 bg-blue-700 text-white text-[9px] font-bold px-2 py-0.5 rounded-br-lg rounded-tl z-10">CONJUNTO ${c + 1}</div>` : ''}
                    
                    <div class="flex flex-col mt-3">
                        <div class="text-[11px] font-mono leading-relaxed flex flex-col gap-1 mb-2 border-b border-gray-800 pb-2">
                            ${logDetalhadoVisual.length > 0 ? logDetalhadoVisual.join('') : '<span class="text-gray-500 text-center w-full">Cálculo direto (Sem Dados)</span>'}
                        </div>
                        <div class="flex justify-between items-center bg-gray-950 p-2 rounded border border-gray-800">
                            <span class="text-xs text-gray-500 font-mono flex-1 overflow-hidden truncate" title="Cálculo final: ${expressaoMatematica}">
                                Math: ${expressaoMatematica}
                            </span>
                            <span class="text-3xl font-black text-white ml-2 border-l border-gray-700 pl-3">
                                ${totalFinal}
                            </span>
                        </div>
                    </div>
                </div>
            `;

            // === A MÁGICA: ENVIA PARA O LOG GLOBAL DO FIREBASE ===
            try {
                await addDoc(collection(db, "logs_dados"), {
                    autor: meuPerfil,
                    formula: inputFormula.value.trim().toLowerCase(), // Salva o que a pessoa digitou de verdade
                    detalhes: logDetalhadoTexto.trim() || "(Matemática Direta)",
                    total: totalFinal,
                    timestamp: serverTimestamp()
                });
            } catch(e) {
                console.error("Erro ao salvar log: ", e);
            }
        }
        try {
    const qLimpeza = query(collection(db, "logs_dados"), orderBy("timestamp", "desc"));
    const snapshot = await getDocs(qLimpeza);
    
    // Se passar de 50, deletamos o excesso
    if (snapshot.size > 50) {
        const paraDeletar = snapshot.docs.slice(50); // Pega tudo que passou de 50
        paraDeletar.forEach(async (velhoDoc) => {
            await deleteDoc(velhoDoc.ref);
        });
    }
} catch(e) {
    console.error("Erro na faxina de logs:", e);
}
        areaResultados.innerHTML = htmlFinal;

        btnRolar.classList.add('bg-white', 'text-blue-600');
        btnRolar.innerText = "ROLADO!";
        setTimeout(() => {
            btnRolar.classList.remove('bg-white', 'text-blue-600');
            btnRolar.innerText = "ROLAR!";
        }, 200);
    });
});