// js/calculadora.js

const visor = document.getElementById("visorCalc");
const modalCalc = document.getElementById("modalCalculadora");

export function iniciarCalculadora() {
    const btnAbrirCalc = document.getElementById("btnAbrirCalc");
    const btnFecharCalc = document.getElementById("fecharCalc");

    if (!btnAbrirCalc || !modalCalc) return;

    btnAbrirCalc.addEventListener("click", () => {
        modalCalc.classList.toggle("hidden");
        if (!modalCalc.classList.contains("hidden")) visor.focus();
    });

    btnFecharCalc.addEventListener("click", () => modalCalc.classList.add("hidden"));

    // Ouvinte de Teclado Real
    window.addEventListener("keydown", (e) => {
        if (modalCalc.classList.contains("hidden")) return;
        
        const tecla = e.key;
        if ("0123456789+-*/.".includes(tecla)) addDigito(tecla);
        else if (tecla === "Enter") { e.preventDefault(); calcularResultado(); }
        else if (tecla === "Backspace") apagarUltimo();
        else if (tecla === "Escape") limparCalc();
    });
}

export function addDigito(d) { visor.value += d; }
export function limparCalc() { visor.value = ""; }
export function apagarUltimo() { visor.value = visor.value.slice(0, -1); }
export function calcularResultado() {
    try {
        const res = eval(visor.value.replace(/,/g, '.'));
        visor.value = Number.isInteger(res) ? res : res.toFixed(2);
    } catch {
        visor.value = "Erro";
        setTimeout(limparCalc, 1000);
    }
}