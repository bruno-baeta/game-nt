let cards = []; // dados dos cartões
let cardIndex = 0; // índice do cartão atual

// substitui os dados no HTML

function displayCard() {
    if (cardIndex >= cards.length) { // se não houver mais cartas
        document.getElementById('endMessage').style.display = 'block'; // mostra a mensagem de fim
        document.getElementById('card').style.display = 'none'; // esconde a carta
    } else {
        document.getElementById('cardTitle').textContent = cards[cardIndex].cardTitle;
        document.getElementById('cardDescription').textContent = cards[cardIndex].cardDescription;
    }
}

// embaralha um array
function shuffle(array) {
    let currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}

// obtém os dados da API
async function fetchCards() {
    let response = await fetch('https://tame-erin-lovebird-hose.cyclic.app/game'); // substitua 'URL_DA_API' pelo endpoint da API real
    cards = await response.json();
    shuffle(cards); // embaralha as cartas
    displayCard(); // exibe o primeiro cartão
}

let card = document.getElementById('card');

gsap.registerPlugin(Draggable);

let draggable = Draggable.create(card, {
    type: "x,y", // permite o arrasto em todas as direções
    edgeResistance: 0.65,
    bounds: document.body,
    onDragEnd: function(e) {
        if (Math.abs(this.endX) > 200 || Math.abs(this.endY) > 200) { // se a carta for arrastada mais de 200px em qualquer direção
            gsap.to(this.target, {
                duration: 0.3,
                x: this.endX * 2, // amplia o movimento
                y: this.endY * 2,
                ease: "power1.in", // adiciona suavização na transição
                onComplete: function() {
                    gsap.set(card, { x: 0, y: 0 }); // reseta a posição da carta
                    cardIndex = (cardIndex + 1) % cards.length; // vai para a próxima carta
                    displayCard(); // exibe a próxima carta
                }
            });
        } else {
            gsap.to(this.target, { // se a carta for arrastada menos de 200px, volta para o centro
                duration: 0.3,
                x: 0,
                y: 0,
                ease: "power1.out", // adiciona suavização na transição
            });
        }
    }
});

var modal = document.getElementById("cardModal");
var btn = document.getElementById("listCards");
var span = document.getElementsByClassName("close")[0];

btn.onclick = function() {
    modal.style.display = "block";
    var cardList = document.getElementById('cardList');
    cardList.innerHTML = '';
    for(var i = 0; i < cards.length; i++) {
        cardList.innerHTML += `<h2 class="cardTitle">
            <i class="fas fa-trash delete" data-id="${cards[i]._id}"></i>
            ${cards[i].cardTitle}</h2>
        <p class="cardDescription" style="display:none;">${cards[i].cardDescription}</p>`;
}

    var cardTitles = document.getElementsByClassName("cardTitle");
    for (var i = 0; i < cardTitles.length; i++) {
        cardTitles[i].addEventListener('click', function() {
            var description = this.nextElementSibling;
            if (description.style.display === "none") {
                description.style.display = "block";
            } else {
                description.style.display = "none";
            }
        });
    }

    var deleteButtons = document.getElementsByClassName("delete");
    for (var i = 0; i < deleteButtons.length; i++) {
        deleteButtons[i].addEventListener('click', function(e) {
            var id = this.getAttribute('data-id');
            fetch('https://tame-erin-lovebird-hose.cyclic.app/game/delete/' + id, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(res => {
                if (res.ok) {
                    console.log('Carta deletada com sucesso!');
                    // Remover a carta do modal
                    var cardContainer = this.parentNode;
                    cardContainer.parentNode.removeChild(cardContainer);
                } else {
                    console.error('Falha ao deletar carta');
                }
            })
            .catch(error => console.error('Erro:', error));
            
            e.stopPropagation(); // Impede a propagação do evento para evitar abrir a descrição da carta
        });
    }
    
}   

span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

var addModal = document.getElementById("addModal");
var addBtn = document.getElementById("addCard");
var addClose = document.querySelector("#addModal .close");

addBtn.onclick = function() {
    addModal.style.display = "block";
}

addClose.onclick = function() {
    addModal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == addModal) {
        addModal.style.display = "none";
    }
}

var saveCardBtn = document.getElementById("saveCard");

saveCardBtn.addEventListener("click", function() {
    var titleInput = document.getElementById("cardTitleAdd");
    var descriptionInput = document.getElementById("cardDescriptionAdd");

    console.log(titleInput, descriptionInput)

    var cardData = {
        cardTitle: titleInput.value,
        cardDescription: descriptionInput.value,
        cardUserAdd: "Web"
    };

    fetch('https://tame-erin-lovebird-hose.cyclic.app/game/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cardData)
    }).then(res => res.json())
    .then(data => {
        if (data.success) {
            console.log('Carta adicionada com sucesso!');
            // Adicione aqui o código para atualizar a lista de cartas ou realizar outra ação necessária
            titleInput.value = "";
            descriptionInput.value = "";
            addModal.style.display = "none";
        } else {
            console.log('Resposta da API:', data);
        }
    })
    .catch(error => console.error('Erro:', error));
});

// obtém os dados ao carregar a página
fetchCards();
