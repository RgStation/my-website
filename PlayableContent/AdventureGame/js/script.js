// Game map
const map = []

map[0] = "Old castle tower";
map[1] = "Deep well";
map[2] = "Sunny forest";
map[3] = "Sleeping dragon";
map[4] = "Narrow forest path";
map[5] = "Old gate";
map[6] = "Riverbank";
map[7] = "Old wooden bench";
map[8] = "Distant cabin, seems vacant";

const images = [];
images[0] = "torni.jpg";
images[1] = "kaivo.jpg";
images[2] = "aukio.jpg";
images[3] = "sleepydragon2.jpg";
images[4] = "polku.jpg";
images[5] = "lockedgate.jpg";
images[6] = "joki.jpg";
images[7] = "penkki.jpg";
images[8] = "mokki.jpg";

const blockMessages = [];
blockMessages[0] = "You can go either east or south, or you will drop down from a cliff.";
blockMessages[1] = "Mysterious power prevents you from going there.";
blockMessages[2] = "Impassable thicket prevents crossing it.";
blockMessages[3] = "You can't pass the dragon that way.";
blockMessages[4] = ""; // Tästä ruudusta pääsee jokaiseen neljään suuntaan, mutta sen pitää olla mukana
blockMessages[5] = "The gate is locked.";    
blockMessages[6] = "The river is too deep to be crossed.";
blockMessages[7] = "The forest is too dense to traverse.";
blockMessages[8] = "You are too scared to go that way.";

let mapLocation = 4;
console.log(map[mapLocation]);

let items = ["stone"];
let itemLocations = [2];
const knownItems = ["flute", "stone", "sword", "magic potion", "spellbook", "fairytale book"];
let hiddenItems = {
    "flute": 6,
    "magic potion": 0,
    "spellbook": 1,
    "sword": 8,
    "fairytale book": 7
};
let item = "";
let backPack = [];

// Pelaajan syöte
let playersInput = "";

// Pelin viesti
let gameMessage = "";

// Pelaajan käytössä olevat komennot
let actionsForPlayer = ["north", "east", "south", "west", "pick up", "use", "leave", "backpack"];
let action = "";

let dragonDefeated = false;
let gameOver = false;

window.addEventListener('load', () => {
    render();
});

// Käyttöliittymäelementit
const image = document.querySelector("#image");
const output = document.querySelector("#output");
const input = document.querySelector("#input");
const button = document.querySelector("#action_btn");
button.addEventListener("click", clickHandler, false);

document.addEventListener("keydown",function(event) {
    if (event.key === "Enter") {
        clickHandler();
    }
});

document.addEventListener("keydown", function(event) {
    if (gameOver) {
        event.preventDefault();
        return;
    }

    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
        event.preventDefault();
    }

    let direction = "";

    switch(event.key) {
        case "ArrowUp":
            direction = "north";
            break;
        case "ArrowDown":
            direction = "south";
            break;
        case "ArrowLeft":
            direction = "west";
            break;
        case "ArrowRight":
            direction = "east";
            break;
        default:
            return;
    }
    if (!gameOver) {
        playersInput = direction;
        action = direction;
        playGame();
    }
});

function openPopup() {
    document.getElementById("popup").style.display = "block";
    document.getElementById("overlay").style.display = "block";
}
function closePopup() {
    document.getElementById("popup").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}
function openPopup2() {
    document.getElementById("popup2").style.display = "block";
    document.getElementById("overlay2").style.display = "block";
}
function closePopup2() {
    document.getElementById("popup2").style.display = "none";
    document.getElementById("overlay2").style.display = "none";
}

render();

function render() {
    if (!image) {
        console.error("Image element not found!");
        return;
    }
    output.innerHTML = `Your location is: ${map[mapLocation]}`;
    if (gameMessage) {
        output.innerHTML += `<br>${gameMessage}`;
    }

    if (mapLocation === 3) {
        if (dragonDefeated) {
            image.src = "images/ripdragon2.png";
            gameMessage = `You attack the sleeping dragon and kill it. <br>In the distance you can see the gate opening.`;
        } else if (mapLocation === 3) {
            image.src = "images/sleepydragon2.jpg";
        }
    } else if (mapLocation === 5 && dragonDefeated) {
        image.src = "images/portti.jpg";
        gameMessage = "<br>The gate is now open! What could be found from behind it?";
    } else {
        image.src = `images/${images[mapLocation]}`;
    }

    for (let i = 0; i < items.length; i++) {
        if (mapLocation === itemLocations[i]) {
            output.innerHTML += `<br>You see an item: ${items[i]}`; // kirjoita `` heti kärkeen, eikä erikseen, helpottaa
        }
    }
}

function clickHandler() {
    console.log("Button pressed");
    console.log("Input:", input.value);
    playGame();
}

function playGame() {
    if (gameOver) return;

    gameMessage = "";
    action = "";

    if (input.value.trim() !== "") {
        playersInput = input.value.toLowerCase();
    }

    console.log("Player's input", playersInput);


    // Check if the player's input matches any valid action
    for (let i = 0; i < actionsForPlayer.length; i++) {
        if(playersInput.includes(actionsForPlayer[i])) {
            action = actionsForPlayer[i];
            console.log(`Player's input ${action} recognised.`)
            break;
        }
    }

    if (!action) {
        gameMessage = "Unknown action. Try again.";
        render();
        return;
    }

    if (action === "backpack") {
        if (backPack.length > 0) {
            gameMessage = `You are carrying: ${backPack.join(", ")}`;
        } else {
            gameMessage = "Your backpack is empty.";
        }
        render();
        return;
    }

    for (let i = 0; i < knownItems.length; i++) {
        if (playersInput.includes(knownItems[i])) {
            item = knownItems[i];
            console.log(`Wanted item: ${item}`);
        }
    }

    switch(action) {
        case "north":
            if (mapLocation >= 3) {
            mapLocation -= 3;
            } else {
                gameMessage = blockMessages[mapLocation];
            }
            break;

        case "east":
            if (mapLocation === 5) {
                if (dragonDefeated) {
                    image.src = "images/Rotko.jpg";
                    gameMessage = "You fall down into a ravine and die, because you killed an innocent dragon. Karma is a bitch!"
                    endGame();
                    return;
                } else {
                    gameMessage = blockMessages[5];
                }
            } else if (mapLocation % 3 != 2) {
                mapLocation  += 1; // tai mapLocation++;
            } else {
                gameMessage = blockMessages[mapLocation];
            }
            break;

        case "south":
            if (mapLocation <= 5) {
            mapLocation += 3;
            } else {
                gameMessage = blockMessages[mapLocation];
            }
            break;

        case "west":
            if (mapLocation % 3 != 0) {
            mapLocation -= 1; // tai mapLocation--;
            } else {
                gameMessage = blockMessages[mapLocation];
            }
            break;

        case "pick up":
            takeItem();
            break

        case "use":
            useItem();
            break

        case "leave":
            leaveItem();
            break

        default:
            gameMessage = "Unknown action. Try again.";
    }

    if (action) {
        playersInput = "";
        input.value = "";
    }

    console.log("New location:", mapLocation);
    render();
}

function hideInputAndButton() {
    const actionButton = document.querySelector("#action_btn");
    actionButton.style.display = "none";
    input.style.display = "none";

}

function restartGame() {
    console.log("New game starts");
    mapLocation = 4;
    backPack = [];
    dragonDefeated = false;
    items = ["stone"];
    itemLocations = [2];
    hiddenItems = {
        "flute": 6,
        "magic potion": 0,
        "spellbook": 1,
        "sword": 8
    };

    input.value = "";
    input.style.display = "inline-block";
    document.querySelector("#action_btn").style.display = "inline-block";
   
    const restartBtn = document.querySelector('button');
    if (restartBtn) restartBtn.remove();

    render();
}

function takeItem() {
    const itemIndexNumber = items.indexOf(item);

    if (itemIndexNumber !== -1 && itemLocations[itemIndexNumber] === mapLocation) {
        backPack.push(item);
        items.splice(itemIndexNumber, 1);
        itemLocations.splice(itemIndexNumber, 1);
        gameMessage += `You pick up an item: ${item}`;
        gameMessage += `<br>You have an item: ${backPack.join(", ")}`;
        console.log(`On the gameboard: ${items}`);
        console.log(`In backpack: ${backPack}`);
    } else {
        gameMessage += "You can't do that action.";
    }
}

function leaveItem() {
    if (!backPack.includes(item)) {
        gameMessage += `You don't have it with you.`;
        return;
    }

    const backPackIndexNumber = backPack.indexOf(item);
    if (backPackIndexNumber !== -1) {
        if (item === "stone" && mapLocation === 1) {
            gameMessage += `You drop the stone into the well and ask for wisdom from the spirit of the well.`;
            backPack.splice(backPackIndexNumber, 1);
            revealItem("spellbook");
            return;
        }
            items.push(backPack[backPackIndexNumber]);
            itemLocations.push(mapLocation);
            backPack.splice(backPackIndexNumber, 1);
            gameMessage += `You dropped the item: ${item}`;
              
    } else {
        gameMessage += `You can't do this action.`;
    } 
}

function useItem() {
    const backPackIndexNumber = backPack.indexOf(item);
    if (backPackIndexNumber === -1) {
        gameMessage += `You don't have it with you.`
        return;
    }
    
        switch(item) {
            case "flute":
                if (mapLocation === 0) {
                    gameMessage += `Beautiful music calls forth hidden treasures.`;
                    revealItem("magic potion");
                } else if (mapLocation === 7) {
                    gameMessage += `Flute plays an moves away the fallen leaves, revealing a book.`;
                    revealItem("fairytale book");
                } else {
                    gameMessage += `Beautiful music is playing around you.`;
                }
                break;

            case "sword":
                if (mapLocation === 3) {
                    gameMessage += `You attack the sleeping dragon and kill it. <br>In the distance you can see the gate opening.`;
                    dragonDefeated = true;
                    render();
                } else {
                    gameMessage = `You wave your sword around.`;
                }
                break;

            case "magic potion":
                if (mapLocation === 8) {
                    gameMessage += `You use the magic potion to find the sword.`;
                    revealItem("sword");
                } else {
                    gameMessage = `You watch the magic potion, but you know it is not the time to use it.`;
                }
                break;

            case "spellbook":
                if (mapLocation === 6) {
                    gameMessage += `Now you can read the spellbook! Well, one spell. You use it.`;
                    revealItem("flute");
                } else {
                    gameMessage = `None of the spells are readable.`;
                }
                break;
            
            case "fairytale book":
                gameMessage += `You flip the pages of the book, before you recall what you were doing.`;
                break;
            
            case "stone":
                gameMessage += `Nothing happens.`;
                break;
        }
    
 }

function revealItem(itemName) {
    if (hiddenItems[itemName] !== undefined) {
        items.push(itemName);
        itemLocations.push(hiddenItems[itemName]);
        delete hiddenItems[itemName];
        console.log(`${itemName} is now visible at location ${itemLocations[itemLocations.length -1]}`);   
    }

    if (itemName === "magic potion" && mapLocation === 8 && !backPack.includes("magic potion")) {
        gameMessage += "The magic potion gives you more power! Now you can pick up the sword.";
        hiddenItems["sword"] = 8;  
    }
    if (itemName === "flute" && mapLocation === 7 && !backPack.includes("fairytale book")) {
        gameMessage += "<br>Flute plays and reveals a fairytale book!";
        revealItem("fairytale book");
    }
    
}

function restartGame() {
    mapLocation = 4;
    backPack = [];
    dragonDefeated = false;
    items = ["stone"];
    itemLocations = [2];
    hiddenItems = {
        "flute": 6,
        "magic potion": 0,
        "spellbook": 1,
        "sword": 8
    };
    gameMessage = "";
    document.querySelector("#output").innerHTML = "";
    document.querySelector("#input").value = "";
    document.querySelector("#input").style.display = "inline-block";
    document.querySelector("#action_btn").style.display = "inline-block";

    render();
}

function endGame() {
    console.log("Game over.");
    gameOver = true;

    document.querySelector("#action_btn").style.display = "none";
    document.querySelector("#input").style.display = "none";
    document.removeEventListener("keydown", arguments.callee);
    document.querySelector("#output").innerText = gameMessage;
}