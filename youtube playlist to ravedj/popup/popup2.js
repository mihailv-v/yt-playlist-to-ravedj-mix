// Regular expression to find links surrounded by ' ' or " "
const regex = /["'](.*?)["']/g;

// Utility function to shuffle an array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

// Function to extract and combine links from input
function extractAndCombineLinks(input) {
  let matches = [];
  let match;

  // Extract all matches
  while ((match = regex.exec(input)) !== null) {
    matches.push(match[1]); // Capture the content inside quotes
  }

  // Return all links extracted
  return matches;
}

// Function to split an array into chunks based on the provided chunk size
function splitIntoChunks(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }
  
  // Function to create textareas with properly formatted arrays
  function createSplitTextareas(links) {
    const container = document.getElementById("splitLinksContainerLINKS222");
    const chunkSizeInput = document.getElementById("chunksLINKS222").value;
    
    // Default to 500 if no chunk size is provided, and parse as integer
    let chunkSize = parseInt(chunkSizeInput);
  
    // Validate chunkSize to make sure it's a positive integer
    if (isNaN(chunkSize) || chunkSize <= 0) {
      chunkSize = 500;  // Fallback to default chunk size if invalid input
      alert("Invalid chunk size entered. Defaulting to 500.");
    }
  
    container.innerHTML = ""; // Clear any previous content
  
    // Split the links into chunks based on the specified chunk size
    const chunks = splitIntoChunks(links, chunkSize);
  
    // Create the chunk elements with textareas
    chunks.forEach((chunk, index) => {
      const formattedChunk = `["${chunk.join('","')}"]`;
  
      const textarea = document.createElement("textarea");
      textarea.value = formattedChunk; // Add the formatted chunk to the textarea
      textarea.rows = 10;
      textarea.cols = 50;
      textarea.readOnly = true;
  
      const copyButton = document.createElement("button");
      copyButton.textContent = `Copy Chunk ${index + 1}`;
      copyButton.addEventListener("click", () => {
        navigator.clipboard.writeText(textarea.value);
        alert(`Chunk ${index + 1} copied to clipboard!`);
      });
  
      const containerDiv = document.createElement("div");
      containerDiv.style.marginBottom = "20px";
      containerDiv.appendChild(textarea);
      containerDiv.appendChild(copyButton);
  
      container.appendChild(containerDiv);
    });

  // Show stats about the split process
  const stats = document.createElement("p");
  stats.textContent = `${links.length} links divided into ${chunks.length} chunks (max ${chunkSize} links per chunk).`;
  container.insertBefore(stats, container.firstChild);
}

// Function to save the current state
function saveState() {
  const linksInput = document.getElementById("linksInputLINKS222").value;
  const excludeDuplicatesChecked = document.getElementById("excludeDuplicatesCheckboxLINKS222").checked;
  const shuffleChecked = document.getElementById("shuffleCheckboxLINKS222").checked;

  const state = {
    linksInput,
    excludeDuplicatesChecked,
    shuffleChecked,
  };

  // Save linksInput and state to localStorage
  localStorage.setItem("linkProcessorState", JSON.stringify(state));

  // Save chunk values
  const chunkedLinks = [];
  const textareas = document.querySelectorAll("#splitLinksContainerLINKS222 textarea");
  textareas.forEach(textarea => {
    chunkedLinks.push(textarea.value);
  });

  localStorage.setItem("linkChunks", JSON.stringify(chunkedLinks));

  alert("State saved!");
}

// Function to restore the previous state
function restoreState() {
  const savedState = localStorage.getItem("linkProcessorState");
  const savedChunks = localStorage.getItem("linkChunks");

  if (savedState) {
    const state = JSON.parse(savedState);

    // Restore the saved values
    document.getElementById("linksInputLINKS222").value = state.linksInput;
    document.getElementById("excludeDuplicatesCheckboxLINKS222").checked = state.excludeDuplicatesChecked;
    document.getElementById("shuffleCheckboxLINKS222").checked = state.shuffleChecked;

    // If chunks were previously saved, restore them
    if (savedChunks) {
      const chunkedLinks = JSON.parse(savedChunks);

      // Restore the chunked links inside the container
      const container = document.getElementById("splitLinksContainerLINKS222");
      container.innerHTML = ""; // Clear the container first

      chunkedLinks.forEach((chunk, index) => {
        const textarea = document.createElement("textarea");
        textarea.value = chunk; // Add the saved chunk data to the textarea
        textarea.rows = 10;
        textarea.cols = 50;
        textarea.readOnly = true;

        const copyButton = document.createElement("button");
        copyButton.textContent = `Copy Chunk ${index + 1}`;
        copyButton.addEventListener("click", () => {
          navigator.clipboard.writeText(textarea.value);
          alert(`Chunk ${index + 1} copied to clipboard!`);
        });

        const containerDiv = document.createElement("div");
        containerDiv.style.marginBottom = "20px";
        containerDiv.appendChild(textarea);
        containerDiv.appendChild(copyButton);

        container.appendChild(containerDiv);
      });

      alert("State and chunks restored!");
    } else {
      // If no chunks are saved, regenerate them
      const input = state.linksInput;
      let links = extractAndCombineLinks(input); // Extract and combine links from the input

      // Optionally exclude duplicates
      if (state.excludeDuplicatesChecked) {
        links = [...new Set(links)];
      }

      // Optionally shuffle links
      if (state.shuffleChecked) {
        links = shuffleArray(links);
      }

      // Generate and display the output
      createSplitTextareas(links);
    }
  } else {
    alert("No saved state found.");
  }
}

// Event Listener for the Split Links Button
document.getElementById("splitLinksButtonLINKS222").addEventListener("click", () => {
  const input = document.getElementById("linksInputLINKS222").value;
  const excludeDuplicatesCheckbox = document.getElementById("excludeDuplicatesCheckboxLINKS222").checked;
  const shuffleCheckbox = document.getElementById("shuffleCheckboxLINKS222").checked;

  let links = extractAndCombineLinks(input); // Extract and combine links from the input

  // Optionally exclude duplicates
  if (excludeDuplicatesCheckbox) {
    links = [...new Set(links)];
  }

  // Optionally shuffle links
  if (shuffleCheckbox) {
    links = shuffleArray(links);
  }

  // Generate and display the output
  createSplitTextareas(links);
});

// Event Listener for Save State Button
document.getElementById("saveStateButtonLINKS222").addEventListener("click", saveState);

// Event Listener for Restore State Button
document.getElementById("restoreStateButtonLINKS222").addEventListener("click", restoreState);
