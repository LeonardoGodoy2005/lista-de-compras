const formularioItem = document.getElementById("formularioItem");
const campoItem = document.getElementById("campoItem");
const listaItens = document.getElementById("listaItens");

const campoPesquisa = document.getElementById("campoPesquisa");

const totalItens = document.getElementById("totalItens");
const itensPendentes = document.getElementById("itensPendentes");
const itensConcluidos = document.getElementById("itensConcluidos");

const porcentagemProgresso = document.getElementById(
    "porcentagemProgresso"
);

const barraProgresso = document.getElementById(
    "barraProgresso"
);

const contadorLista = document.getElementById(
    "contadorLista"
);

const listaVazia = document.getElementById(
    "listaVazia"
);

const botaoLimpar = document.getElementById(
    "botaoLimpar"
);

const botaoTema = document.getElementById(
    "botaoTema"
);

const botaoVoltar = document.getElementById(
    "botaoVoltar"
);

const alerta = document.getElementById(
    "alerta"
);

const tituloAlerta = document.getElementById(
    "tituloAlerta"
);

const mensagemAlerta = document.getElementById(
    "mensagemAlerta"
);

const fecharAlerta = document.getElementById(
    "fecharAlerta"
);

const dataAtual = document.getElementById(
    "dataAtual"
);

const filtros = document.querySelectorAll(
    ".filtro"
);

let itens = [];

let filtroAtual = "todos";

let temporizadorAlerta;


/*
|--------------------------------------------------------------------------
| ITENS INICIAIS
|--------------------------------------------------------------------------
*/

const itensIniciais = [
    {
        id: Date.now() + 1,
        nome: "Pão de forma",
        concluido: false
    },

    {
        id: Date.now() + 2,
        nome: "Café preto",
        concluido: false
    },

    {
        id: Date.now() + 3,
        nome: "Suco de laranja",
        concluido: false
    },

    {
        id: Date.now() + 4,
        nome: "Bolacha",
        concluido: false
    }
];


/*
|--------------------------------------------------------------------------
| LOCAL STORAGE
|--------------------------------------------------------------------------
*/

function salvarItens() {
    localStorage.setItem(
        "listaCompras",
        JSON.stringify(itens)
    );
}


function carregarItens() {

    const itensSalvos =
        localStorage.getItem("listaCompras");

    if (itensSalvos) {

        itens = JSON.parse(itensSalvos);

    } else {

        itens = itensIniciais;

        salvarItens();
    }
}


/*
|--------------------------------------------------------------------------
| ADICIONAR ITEM
|--------------------------------------------------------------------------
*/

function adicionarItem() {

    const nomeItem =
        campoItem.value.trim();

    if (nomeItem === "") {

        mostrarAlerta(
            "Campo vazio",
            "Digite um item antes de adicionar."
        );

        campoItem.focus();

        return;
    }

    const novoItem = {

        id: Date.now(),

        nome: nomeItem,

        concluido: false

    };

    itens.push(novoItem);

    salvarItens();

    campoItem.value = "";

    campoItem.focus();

    renderizarLista();

    mostrarAlerta(
        "Item adicionado",
        `"${nomeItem}" foi adicionado à lista.`
    );
}


/*
|--------------------------------------------------------------------------
| REMOVER ITEM
|--------------------------------------------------------------------------
*/

function removerItem(id) {

    const itemRemovido =
        itens.find(item => item.id === id);

    itens = itens.filter(
        item => item.id !== id
    );

    salvarItens();

    renderizarLista();

    if (itemRemovido) {

        mostrarAlerta(
            "Item removido",
            `"${itemRemovido.nome}" foi removido da lista.`
        );
    }
}


/*
|--------------------------------------------------------------------------
| CONCLUIR ITEM
|--------------------------------------------------------------------------
*/

function alternarItem(id) {

    itens = itens.map(item => {

        if (item.id === id) {

            return {
                ...item,
                concluido: !item.concluido
            };
        }

        return item;
    });

    salvarItens();

    renderizarLista();
}


/*
|--------------------------------------------------------------------------
| LIMPAR CONCLUÍDOS
|--------------------------------------------------------------------------
*/

function limparConcluidos() {

    const quantidadeConcluidos =
        itens.filter(item => item.concluido).length;

    if (quantidadeConcluidos === 0) {

        mostrarAlerta(
            "Nenhum item concluído",
            "Não existem itens concluídos para remover."
        );

        return;
    }

    itens = itens.filter(
        item => !item.concluido
    );

    salvarItens();

    renderizarLista();

    mostrarAlerta(
        "Lista atualizada",
        `${quantidadeConcluidos} item(ns) concluído(s) removido(s).`
    );
}


/*
|--------------------------------------------------------------------------
| RENDERIZAR LISTA
|--------------------------------------------------------------------------
*/

function renderizarLista() {

    listaItens.innerHTML = "";

    const pesquisa =
        campoPesquisa.value
            .toLowerCase()
            .trim();

    let itensFiltrados = itens.filter(item => {

        const correspondePesquisa =
            item.nome
                .toLowerCase()
                .includes(pesquisa);

        if (!correspondePesquisa) {
            return false;
        }

        if (filtroAtual === "pendentes") {
            return !item.concluido;
        }

        if (filtroAtual === "concluidos") {
            return item.concluido;
        }

        return true;
    });


    itensFiltrados.forEach(item => {

        const elementoItem =
            document.createElement("li");

        elementoItem.classList.add("item");

        if (item.concluido) {
            elementoItem.classList.add("concluido");
        }


        const checkbox =
            document.createElement("input");

        checkbox.type = "checkbox";

        checkbox.classList.add(
            "checkbox-item"
        );

        checkbox.checked =
            item.concluido;


        const nomeItem =
            document.createElement("span");

        nomeItem.classList.add(
            "nome-item"
        );

        nomeItem.textContent =
            item.nome;


        const botaoRemover =
            document.createElement("button");

        botaoRemover.type = "button";

        botaoRemover.classList.add(
            "botao-remover"
        );

        botaoRemover.innerHTML = "🗑️";

        botaoRemover.setAttribute(
            "aria-label",
            `Remover ${item.nome}`
        );


        checkbox.addEventListener(
            "change",
            () => alternarItem(item.id)
        );


        botaoRemover.addEventListener(
            "click",
            () => removerItem(item.id)
        );


        elementoItem.appendChild(
            checkbox
        );

        elementoItem.appendChild(
            nomeItem
        );

        elementoItem.appendChild(
            botaoRemover
        );

        listaItens.appendChild(
            elementoItem
        );
    });


    atualizarEstatisticas(
        itensFiltrados.length
    );
}


/*
|--------------------------------------------------------------------------
| ESTATÍSTICAS
|--------------------------------------------------------------------------
*/

function atualizarEstatisticas(
    quantidadeVisivel
) {

    const total =
        itens.length;

    const concluidos =
        itens.filter(
            item => item.concluido
        ).length;

    const pendentes =
        total - concluidos;


    totalItens.textContent =
        total;

    itensConcluidos.textContent =
        concluidos;

    itensPendentes.textContent =
        pendentes;


    let progresso = 0;

    if (total > 0) {

        progresso =
            Math.round(
                (concluidos / total) * 100
            );
    }


    porcentagemProgresso.textContent =
        `${progresso}%`;

    barraProgresso.style.width =
        `${progresso}%`;


    contadorLista.textContent =
        `${quantidadeVisivel} ${
            quantidadeVisivel === 1
                ? "item"
                : "itens"
        }`;


    if (quantidadeVisivel === 0) {

        listaVazia.style.display =
            "block";

    } else {

        listaVazia.style.display =
            "none";
    }
}


/*
|--------------------------------------------------------------------------
| FILTROS
|--------------------------------------------------------------------------
*/

filtros.forEach(filtro => {

    filtro.addEventListener(
        "click",
        () => {

            filtros.forEach(
                item =>
                    item.classList.remove(
                        "ativo"
                    )
            );

            filtro.classList.add(
                "ativo"
            );

            filtroAtual =
                filtro.dataset.filtro;

            renderizarLista();
        }
    );
});


/*
|--------------------------------------------------------------------------
| PESQUISA
|--------------------------------------------------------------------------
*/

campoPesquisa.addEventListener(
    "input",
    renderizarLista
);


/*
|--------------------------------------------------------------------------
| ALERTA
|--------------------------------------------------------------------------
*/

function mostrarAlerta(
    titulo,
    mensagem
) {

    clearTimeout(
        temporizadorAlerta
    );

    tituloAlerta.textContent =
        titulo;

    mensagemAlerta.textContent =
        mensagem;

    alerta.classList.add(
        "visivel"
    );

    temporizadorAlerta =
        setTimeout(
            esconderAlerta,
            3500
        );
}


function esconderAlerta() {

    alerta.classList.remove(
        "visivel"
    );
}


fecharAlerta.addEventListener(
    "click",
    esconderAlerta
);


/*
|--------------------------------------------------------------------------
| TEMA
|--------------------------------------------------------------------------
*/

function carregarTema() {

    const temaSalvo =
        localStorage.getItem(
            "temaListaCompras"
        );

    if (temaSalvo === "escuro") {

        document.body.classList.add(
            "modo-escuro"
        );

        botaoTema.textContent =
            "☀️";

    } else {

        botaoTema.textContent =
            "🌙";
    }
}


function alternarTema() {

    document.body.classList.toggle(
        "modo-escuro"
    );

    const modoEscuro =
        document.body.classList.contains(
            "modo-escuro"
        );


    localStorage.setItem(
        "temaListaCompras",
        modoEscuro
            ? "escuro"
            : "claro"
    );


    botaoTema.textContent =
        modoEscuro
            ? "☀️"
            : "🌙";
}


botaoTema.addEventListener(
    "click",
    alternarTema
);


/*
|--------------------------------------------------------------------------
| DATA
|--------------------------------------------------------------------------
*/

function mostrarData() {

    const hoje = new Date();

    const dataFormatada =
        hoje.toLocaleDateString(
            "pt-BR",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

    dataAtual.textContent =
        dataFormatada.charAt(0).toUpperCase() +
        dataFormatada.slice(1);
}


/*
|--------------------------------------------------------------------------
| BOTÃO VOLTAR
|--------------------------------------------------------------------------
*/

botaoVoltar.addEventListener(
    "click",
    () => {
        window.history.back();
    }
);


/*
|--------------------------------------------------------------------------
| EVENTOS
|--------------------------------------------------------------------------
*/

formularioItem.addEventListener(
    "submit",
    evento => {

        evento.preventDefault();

        adicionarItem();
    }
);


botaoLimpar.addEventListener(
    "click",
    limparConcluidos
);


/*
|--------------------------------------------------------------------------
| INICIALIZAÇÃO
|--------------------------------------------------------------------------
*/

carregarItens();

carregarTema();

mostrarData();

renderizarLista();