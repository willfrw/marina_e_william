/* =========================================================
   CONFIGURAÇÕES
========================================================= */

const JSON_PATH = "data/presentes.json";


/* =========================================================
   ELEMENTOS DO DOM
========================================================= */

const giftGrid = document.getElementById("gift-grid");

const giftCounter = document.getElementById("gift-counter");

const filterButtons =
    document.querySelectorAll(".filter-button");


/* =========================================================
   MODAL PIX
========================================================= */

const pixModal =
    document.getElementById("pix-modal");

const closePixModal =
    document.getElementById("close-pix-modal");

const pixGiftName =
    document.getElementById("pix-gift-name");

const pixGiftValue =
    document.getElementById("pix-gift-value");

const pixCode =
    document.getElementById("pix-code");

const copyPixButton =
    document.getElementById("copy-pix");

const modalOverlay =
    document.querySelector(".modal-overlay");


/* =========================================================
   VARIÁVEIS
========================================================= */

let presentes = [];

let filtroAtual = "todos";


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    iniciar
);


async function iniciar() {

    try {

        await carregarPresentes();

        renderizarPresentes();

        configurarFiltros();

        configurarModalPix();

    } catch (error) {

        console.error(
            "Erro ao iniciar a aplicação:",
            error
        );

        mostrarErro();

    }

}


/* =========================================================
   CARREGAR JSON
========================================================= */

async function carregarPresentes() {

    const resposta =
        await fetch(JSON_PATH);

    if (!resposta.ok) {

        throw new Error(
            `Erro ao carregar presentes.json: ${resposta.status}`
        );

    }

    presentes =
        await resposta.json();

}


/* =========================================================
   RENDERIZAR PRESENTES
========================================================= */

function renderizarPresentes() {

    const presentesFiltrados =
        filtrarPresentes();


    /*
        Limpa o grid.
    */

    giftGrid.innerHTML = "";


    /*
        Caso não existam presentes
        para o filtro selecionado.
    */

    if (presentesFiltrados.length === 0) {

        mostrarListaVazia();

        atualizarContador([]);

        return;

    }


    /*
        Cria os cards.
    */

    presentesFiltrados.forEach(
        presente => {

            const card =
                criarCardPresente(presente);

            giftGrid.appendChild(card);

        }
    );


    /*
        Atualiza o contador.
    */

    atualizarContador(
        presentesFiltrados
    );

}


/* =========================================================
   CRIAR CARD
========================================================= */

function criarCardPresente(presente) {

    const card =
        document.createElement("article");


    const escolhido =
        presente.status === "escolhido";


    /*
        Classe principal.
    */

    card.className =
        "gift-card";


    if (escolhido) {

        card.classList.add("chosen");

    }


    /*
        Valor formatado.
    */

    const valorFormatado =
        formatarMoeda(
            presente.valor
        );


    /*
        Quantidade.
    */

    const quantidade =
        Number(
            presente.quantidade || 1
        );


    /*
        HTML do status.
    */

    const statusHTML =
        escolhido

            ? `
                <span class="gift-status chosen">
                    🔒 Já escolhido
                </span>
            `

            : `
                <span class="gift-status available">
                    🟢 Disponível
                </span>
            `;


    /*
        HTML da quantidade.
    */

    let quantidadeHTML = "";


    if (quantidade > 1) {

        quantidadeHTML = `
            <p class="gift-quantity">
                Quantidade: ${quantidade} unidades
            </p>
        `;

    }


    /*
        HTML das ações.
    */

    let actionsHTML = "";


    if (escolhido) {

        actionsHTML = `
            <div class="gift-chosen-message">
                Este presente já foi escolhido ❤️
            </div>
        `;

    } else {

        actionsHTML = `
            <div class="gift-actions">

                <a
                    href="${escaparHTML(presente.link)}"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="btn btn-gift"
                >
                    🎁 Ver presente
                </a>

                <button
                    type="button"
                    class="btn btn-pix"
                    data-pix-id="${presente.id}"
                >
                    💰 Presentear via PIX
                </button>

            </div>
        `;

    }


    /*
        Monta o card.
    */

    card.innerHTML = `

        <div class="gift-image-container">

            <img
                src="${escaparHTML(presente.imagem)}"
                alt="${escaparHTML(presente.nome)}"
                class="gift-image"
                loading="lazy"
                onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
            >

            <div class="gift-image-placeholder">

                <span>
                    🎁
                </span>

                <span>
                    Imagem indisponível
                </span>

            </div>

            ${statusHTML}

        </div>


        <div class="gift-content">

            <h3 class="gift-name">
                ${escaparHTML(
                    presente.nome
                )}
            </h3>

            <p class="gift-price">
                ${valorFormatado}
            </p>

            ${quantidadeHTML}

            ${actionsHTML}

        </div>

    `;


    /*
        Evento do botão PIX.
    */

    if (!escolhido) {

        const pixButton =
            card.querySelector(
                "[data-pix-id]"
            );


        pixButton.addEventListener(
            "click",
            () => {

                abrirModalPix(
                    presente
                );

            }
        );

    }


    return card;

}


/* =========================================================
   FILTRAR PRESENTES
========================================================= */

function filtrarPresentes() {

    if (filtroAtual === "todos") {

        return presentes;

    }


    if (filtroAtual === "disponivel") {

        return presentes.filter(
            presente =>
                presente.status === "disponivel"
        );

    }


    if (filtroAtual === "escolhido") {

        return presentes.filter(
            presente =>
                presente.status === "escolhido"
        );

    }


    return presentes;

}


/* =========================================================
   CONFIGURAR FILTROS
========================================================= */

function configurarFiltros() {

    filterButtons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    /*
                        Remove o estado ativo
                        dos demais botões.
                    */

                    filterButtons.forEach(
                        item => {

                            item.classList.remove(
                                "active"
                            );

                        }
                    );


                    /*
                        Ativa o botão selecionado.
                    */

                    button.classList.add(
                        "active"
                    );


                    /*
                        Obtém o filtro.
                    */

                    filtroAtual =
                        button.dataset.filter;


                    /*
                        Renderiza novamente.
                    */

                    renderizarPresentes();

                }
            );

        }
    );

}


/* =========================================================
   CONTADOR
========================================================= */

function atualizarContador(
    presentesExibidos
) {

    const total =
        presentesExibidos.length;


    const disponiveis =
        presentesExibidos.filter(
            presente =>
                presente.status === "disponivel"
        ).length;


    if (filtroAtual === "todos") {

        giftCounter.textContent =
            `${total} presentes na lista · ${disponiveis} disponíveis`;

        return;

    }


    if (filtroAtual === "disponivel") {

        giftCounter.textContent =
            `${total} presentes disponíveis`;

        return;

    }


    if (filtroAtual === "escolhido") {

        giftCounter.textContent =
            `${total} presentes já escolhidos`;

    }

}


/* =========================================================
   MODAL PIX
========================================================= */

function configurarModalPix() {


    /*
        Fechar pelo botão X.
    */

    closePixModal.addEventListener(
        "click",
        fecharModalPix
    );


    /*
        Fechar clicando fora.
    */

    modalOverlay.addEventListener(
        "click",
        fecharModalPix
    );


    /*
        Fechar pressionando ESC.
    */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                pixModal.classList.contains(
                    "active"
                )
            ) {

                fecharModalPix();

            }

        }
    );


    /*
        Botão copiar PIX.
    */

    copyPixButton.addEventListener(
        "click",
        copiarPix
    );

}


/* =========================================================
   ABRIR MODAL PIX
========================================================= */

function abrirModalPix(
    presente
) {

    pixGiftName.textContent =
        presente.nome;


    pixGiftValue.textContent =
        formatarMoeda(
            presente.valor
        );


    /*
        Por enquanto o PIX está vazio.
        Vamos configurar posteriormente
        a chave PIX real.
    */

    pixCode.value =
        "00020126880014br.gov.bcb.pix0136c94ed8f8-ca56-46b7-ab80-49e3ded769490226Cofrinho de Marina Ribeiro5204000053039865802BR5914Marina Ribeiro6006Marica61082494141062270523COFRNDYzNzAyODMwMDAwMDQ630470AD";


    pixModal.classList.add(
        "active"
    );


    pixModal.setAttribute(
        "aria-hidden",
        "false"
    );


    /*
        Bloqueia o scroll da página.
    */

    document.body.style.overflow =
        "hidden";

}


/* =========================================================
   FECHAR MODAL PIX
========================================================= */

function fecharModalPix() {

    pixModal.classList.remove(
        "active"
    );


    pixModal.setAttribute(
        "aria-hidden",
        "true"
    );


    /*
        Libera o scroll.
    */

    document.body.style.overflow =
        "";

}


/* =========================================================
   COPIAR PIX
========================================================= */

async function copiarPix() {

    const codigo =
        pixCode.value.trim();


    /*
        Se ainda não houver
        código PIX configurado.
    */

    if (!codigo) {

        alert(
            "O código PIX ainda não foi configurado."
        );

        return;

    }


    try {

        await navigator.clipboard.writeText(
            codigo
        );


        const textoOriginal =
            copyPixButton.textContent;


        copyPixButton.textContent =
            "PIX copiado!";


        setTimeout(
            () => {

                copyPixButton.textContent =
                    textoOriginal;

            },
            2000
        );


    } catch (error) {

        console.error(
            "Erro ao copiar PIX:",
            error
        );


        /*
            Fallback para navegadores
            que não suportam Clipboard API.
        */

        pixCode.select();

        document.execCommand(
            "copy"
        );

    }

}


/* =========================================================
   FORMATAR MOEDA
========================================================= */

function formatarMoeda(
    valor
) {

    return new Intl.NumberFormat(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    ).format(
        Number(valor) || 0
    );

}


/* =========================================================
   ESCAPAR HTML
========================================================= */

function escaparHTML(
    texto
) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        texto ?? "";


    return div.innerHTML;

}


/* =========================================================
   LISTA VAZIA
========================================================= */

function mostrarListaVazia() {

    giftGrid.innerHTML = `

        <div class="empty-state">

            <div class="empty-state-icon">
                ♡
            </div>

            <h3>
                Nenhum presente encontrado
            </h3>

            <p>
                Não encontramos presentes
                para este filtro.
            </p>

        </div>

    `;

}


/* =========================================================
   ERRO AO CARREGAR
========================================================= */

function mostrarErro() {

    giftGrid.innerHTML = `

        <div class="empty-state">

            <div class="empty-state-icon">
                ⚠️
            </div>

            <h3>
                Não foi possível carregar a lista
            </h3>

            <p>
                Tente atualizar a página
                novamente.
            </p>

        </div>

    `;


    giftCounter.textContent =
        "Erro ao carregar presentes";

}

// ==========================================
// PIX GERAL - CONTRIBUIÇÃO LIVRE
// ==========================================

const generalPixCode = document.getElementById("general-pix-code");
const copyGeneralPixButton = document.getElementById("copy-general-pix");
const generalPixMessage = document.getElementById("general-pix-message");

if (copyGeneralPixButton) {

    copyGeneralPixButton.addEventListener("click", async () => {

        const pixCode = generalPixCode.value;

        try {

            await navigator.clipboard.writeText(pixCode);

            generalPixMessage.textContent =
                "Chave Pix copiada com sucesso! ❤️";

        } catch (error) {

            // Fallback para navegadores que não suportam
            // navigator.clipboard

            generalPixCode.select();
            generalPixCode.setSelectionRange(0, 99999);

            document.execCommand("copy");

            generalPixMessage.textContent =
                "Chave Pix copiada com sucesso! ❤️";

        }

        setTimeout(() => {

            generalPixMessage.textContent = "";

        }, 3000);

    });

}