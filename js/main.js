// fonction qui fait le fetch(), qui contacte l'API
async function callAPI(uri) {
    console.log("-- callAPI - start --");
    console.log("uri - ", uri);

    try{
        // fecth(), appel à l'API et réception de la reponse
        const response = await fetch(uri);
        console.log("response = ", response);

        if (!response.ok){
            throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
        }
        // récupération des données JSON reçues de l'API
        const data = await response.json();
        console.log("data = ", data);

        console.log("-- callAPI - end --");

        // renvoie des données
        return data;
    } catch (error){
        console.error("Erreur lors de l'appel API :", error);
        
        return null; // Retourne null en cas d'échec

    }
}

// constante globale : l'URI du endpoint de demande du nouveau deck
const API_ENDPOINT_NEW_DECK = "https://deckofcardsapi.com/api/deck/new/";

// fonction de demande du nouveau deck
async function getNewDeck() {
    console.log(">> getNewDeck");

    return await callAPI(API_ENDPOINT_NEW_DECK);
}

// variable globale : l'id du deck utilisé, dans lequel on pioche
let idDeck = null;

// fonctions (syntaxe de fonction fleché) qui renvoient des URI dynamiques de demande de mélange du deck et de pioche
const getApiEndpointShuffleDeck = () => `https://deckofcardsapi.com/api/deck/${idDeck}/shuffle/`;

// fonction de demande de mélange du deck
async function shuffleDeck() {
    console.log(">> shuffleDeck")
    return await callAPI(getApiEndpointShuffleDeck());
}

// fonctions (syntaxe de fonction fleché) qui renvoient des URI dynamiques de demande de mélange du deck et de pioche
const getApiEndpointDrawDeck = () => `https://deckofcardsapi.com/api/deck/${idDeck}/draw/?count=1`;

// fonction de demande de pioche du deck
async function drawCard() {
    console.log(">> drawCard");

    return await callAPI(getApiEndpointDrawDeck());
}

// supprimer les cartes de l'ancien deck du DOM
const cleanDomCardsFromPreviousDeck = () => 
    // recuperation des cartes
    document.querySelectorAll(".card")
    // et pour chacune de ses cartes
    .forEach((child) => 
        // suppression de DOM
        child.remove());

//fonction de réinitialisation (demande de nouveau deck + demande de mélange de ce nouvea deck)
async function actionReset() {
    // vider dans le DOM les cartes de l'ancien deck
    cleanDomCardsFromPreviousDeck();

    // récupération d'un nouveau deck
    const newDeckResponse = await getNewDeck();
    
    // recuperation de l'id de ce nouveau deck dans les données reçues et mise à jour de la variable globale
    idDeck = newDeckResponse.deck_id;

    // mélange du deck
    await shuffleDeck()
}


// Element HTML utiles pour les évènements et pour la manipulation du DOM
const cardsContainer = document.getElementById("cards-container");

// ajoute une carte dans le DOM d'après l'uri de son image
function addCardToDomByImgUri(imgUri) {
    // Création de l'élément HTML "img", de classe CSS "card" et avec pour attribut HTML "src" l'URI en argument
    const imgCardHtmlElement = document.createElement('img');
    imgCardHtmlElement.classList.add("card");
    imgCardHtmlElement.src = imgUri;

    // ajout de cette image dans la zone des cartes piochées 
    cardsContainer.append(imgCardHtmlElement);
}

// fonction qui demande à piocher une carte, puis qui fait l'appel pour l'intègrer dans le DOM
async function actionDraw() {
    // appel à l'API pour demander au croupier de piocher une carte et de nous la renvoyer
    const drawCardResponse = await drawCard();

    console.log("drawCardResponse = ", drawCardResponse);

    // Récupération de l'URI de l'image de cette carte dans les données reçues
    const imgCardUri = drawCardResponse.cards[0].image;

    // ajout de la carte piochée dans la zone des cartes piochées
    addCardToDomByImgUri(imgCardUri);
}

// appel d'initialisation au lancement de l'application
actionReset();

// éléments HTML utiles de l'événement "click" sur les 2 boutons d'action :
const actionResetButton = document.getElementById("action-reset");
const actionDrawButton = document.getElementById("action-draw");

// écoutes d'évènement sur les boutons d'action
actionResetButton.addEventListener("click", actionReset);
actionDrawButton.addEventListener("click", actionDraw);
