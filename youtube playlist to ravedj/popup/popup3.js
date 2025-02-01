// Function to extract links from input text
// Extracts links from input (handles both single links and arrays)
function extractLinksFromInput_VAR222(text) {
    try {
        let links = [];
        // If input is an array (JSON format), parse it
        if (text.trim().startsWith("[") && text.trim().endsWith("]")) {
            links = JSON.parse(text.trim());
        } else {
            // Otherwise, assume it's a single link
            links = [text.trim()];
        }
        // Validate extracted links
        links = links.filter(link => link.startsWith("http"));
        return links;
    } catch (error) {
        console.error("Error parsing input:", error);
        return [];
    }
}


// Function to generate unique link pairs (variations)
// Generate unique variations (no duplicates, no reversed pairs)
function generateUniquePairs_VAR222(links1, links2) {
    let pairs = new Set();
    
    for (let i = 0; i < links1.length; i++) {
        for (let j = 0; j < links2.length; j++) {
            if (links1[i] !== links2[j]) {
                // Always store as sorted pair to prevent reversed duplicates
                let pair = [links1[i], links2[j]].sort().join("||");
                pairs.add(pair);
            }
        }
    }

    return [...pairs].map(pair => pair.split("||"));
}


// Function to create variation chunks in the UI
function createVariationChunks_VAR222(pairs) {
    const container = document.getElementById("variationsContainerLINKS222");
    container.innerHTML = ""; // Clear previous variations

    pairs.forEach((pair, index) => {
        const formattedPair = `["${pair.join('","')}"]`;

        const textarea = document.createElement("textarea");
        textarea.value = formattedPair;
        textarea.rows = 3;
        textarea.cols = 50;
        textarea.readOnly = true;

        const copyButton = document.createElement("button");
        copyButton.textContent = `Copy Pair ${index + 1}`;
        copyButton.addEventListener("click", () => {
            navigator.clipboard.writeText(textarea.value);
            alert(`Pair ${index + 1} copied!`);
        });

        const raveButton = document.createElement("button");
        raveButton.textContent = "Pass to Rave.DJ";
        raveButton.addEventListener("click", () => {
            sendToRave_VAR222(pair);
        });

        const div = document.createElement("div");
        div.style.marginBottom = "10px";
        div.appendChild(textarea);
        div.appendChild(copyButton);
        div.appendChild(raveButton);

        container.appendChild(div);
    });

    // Save to local storage
    localStorage.setItem("savedVariationsLINKS222", JSON.stringify(pairs));
}


// Send a message to the background to handle the navigation and song input
function sendToRave_VAR222(pair) {
    chrome.runtime.sendMessage({ action: "navigateToRave_VAR222", songs: pair });
}



document.addEventListener("DOMContentLoaded", () => {
    let savedPairs = localStorage.getItem("savedVariationsLINKS222");
    if (savedPairs) {
        createVariationChunks_VAR222(JSON.parse(savedPairs));
    }
});


// Event listeners
document.getElementById("generateVariationsLINKS222").addEventListener("click", () => {
    const links1 = extractLinksFromInput_VAR222(document.getElementById("inputVariations1LINKS222").value);
    const links2 = extractLinksFromInput_VAR222(document.getElementById("inputVariations2LINKS222").value);

    if (links1.length === 0 || links2.length === 0) {
        alert("Please enter valid links in both fields.");
        return;
    }

    const pairs = generateUniquePairs_VAR222(links1, links2);
    createVariationChunks_VAR222(pairs);
});

document.getElementById("clearVariationsLINKS222").addEventListener("click", () => {
    localStorage.removeItem("savedVariationsLINKS222");
    document.getElementById("variationsContainerLINKS222").innerHTML = "";
});

document.addEventListener("DOMContentLoaded", function () {
    // Save Button
    document.getElementById("saveStateButtonLINKS222").addEventListener("click", function () {
        let state = {
            linksInput: document.getElementById("linksInputLINKS222").value,
            chunks: document.getElementById("chunksLINKS222").value,
            excludeDuplicates: document.getElementById("excludeDuplicatesCheckboxLINKS222").checked,
            shuffle: document.getElementById("shuffleCheckboxLINKS222").checked,
            variations1: document.getElementById("inputVariations1LINKS222").value,
            variations2: document.getElementById("inputVariations2LINKS222").value,
            variationsContainer: document.getElementById("variationsContainerLINKS222").innerHTML,
            splitLinksContainer: document.getElementById("splitLinksContainerLINKS222").innerHTML,
            manualInput: document.getElementById("manualLinksInput").value,
            processedLinks: document.getElementById("processed-links-textarea-rave").value
        };
        localStorage.setItem("savedStateLINKS222", JSON.stringify(state));
        alert("State saved successfully!");
    });

    // Restore Button
    document.getElementById("restoreStateButtonLINKS222").addEventListener("click", function () {
        let savedState = localStorage.getItem("savedStateLINKS222");
        if (savedState) {
            let state = JSON.parse(savedState);
            document.getElementById("linksInputLINKS222").value = state.linksInput || "";
            document.getElementById("chunksLINKS222").value = state.chunks || "";
            document.getElementById("excludeDuplicatesCheckboxLINKS222").checked = state.excludeDuplicates || false;
            document.getElementById("shuffleCheckboxLINKS222").checked = state.shuffle || false;
            document.getElementById("inputVariations1LINKS222").value = state.variations1 || "";
            document.getElementById("inputVariations2LINKS222").value = state.variations2 || "";
            document.getElementById("variationsContainerLINKS222").innerHTML = state.variationsContainer || "";
            document.getElementById("splitLinksContainerLINKS222").innerHTML = state.splitLinksContainer || "";
            document.getElementById("manualLinksInput").value = state.manualInput || "";
            document.getElementById("processed-links-textarea-rave").value = state.processedLinks || "";
            alert("State restored successfully!");
        } else {
            alert("No saved state found.");
        }
    });

    // Clear Button (Ensures everything resets)
    document.getElementById("clearVariationsLINKS222").addEventListener("click", function () {
        document.getElementById("inputVariations1LINKS222").value = "";
        document.getElementById("inputVariations2LINKS222").value = "";
        document.getElementById("variationsContainerLINKS222").innerHTML = "";
        document.getElementById("splitLinksContainerLINKS222").innerHTML = "";
        document.getElementById("linksInputLINKS222").value = "";
        document.getElementById("chunksLINKS222").value = "";
        document.getElementById("manualLinksInput").value = "";
        document.getElementById("processed-links-textarea-rave").value = "";
        document.getElementById("excludeDuplicatesCheckboxLINKS222").checked = false;
        document.getElementById("shuffleCheckboxLINKS222").checked = false;
        localStorage.removeItem("savedStateLINKS222");
        alert("All data cleared!");
    });
});
