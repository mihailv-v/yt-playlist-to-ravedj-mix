let gatheredLinks;
function extractAndCombineLinks(input) {
  // Regular expression to find all links surrounded by ' ' or " "
  const regex = /["'](.*?)["']/g;

  let matches = [];
  let match;

  // Extract all matches
  while ((match = regex.exec(input)) !== null) {
    matches.push(match[1]); // Capture the content inside quotes
  }

  // Remove duplicates and return a unique array
  const uniqueLinks = [...new Set(matches)];
  document.getElementById('linksDisplayC').textContent = uniqueLinks.length + " Unique Links and " + matches.length + " Total";

    return uniqueLinks;
}



document.getElementById('gatherLinksBtn').addEventListener('click', () => {
  // Send a message to background.js to gather links
  chrome.runtime.sendMessage({ action: "gatherLinks" }, (response) => {
    const linksDisplay = document.getElementById('linksDisplay');
    
    if (response && response.links) {
      linksDisplay.textContent = JSON.stringify(response.links, null, 2);
      gatheredLinks=linksDisplay.textContent;
      extractAndCombineLinks(linksDisplay.textContent)
    } else if (response && response.error) {
      linksDisplay.textContent = response.error;
      console.error('Error: ', response.error);
    } else {
      linksDisplay.textContent = 'Unexpected error occurred.';
      console.error('Unexpected response:', response);
    }
  });
});



document.getElementById('passToRaveDJBtn').addEventListener('click', () => {
  const progressDisplay = document.getElementById('progressDisplay');
  gatheredLinks = extractAndCombineLinks(linksDisplay.textContent);
  if(gatheredLinks.length == 0) {
    gatheredLinks = extractAndCombineLinks(document.getElementById('manualLinksInput').value);
  }
  progressDisplay.textContent = "Starting...";

  // Get the active tab
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id) {
      // Navigate to Rave.dj
      chrome.tabs.update(tabs[0].id, { url: "https://rave.dj/mix" }, () => {
        // Wait for the page to load completely before proceeding
        chrome.tabs.onUpdated.addListener(function waitForPageLoad(tabId, info) {
          if (tabId === tabs[0].id && info.status === 'complete') {
            // Once the page is fully loaded, send the links to the content script
            chrome.tabs.sendMessage(tabs[0].id, { action: "fillInput", links: gatheredLinks }, (response) => {
              if (chrome.runtime.lastError) {
                console.error("Error sending message to content script:", chrome.runtime.lastError.message);
                progressDisplay.textContent = `Error: ${chrome.runtime.lastError.message}`;
              } else if (response && response.error) {
                console.error("Content script error:", response.error);
                progressDisplay.textContent = `Error: ${response.error}`;
              } else {
                progressDisplay.textContent = "All links passed successfully!";
              }
            });

            // Remove the listener once the page is loaded and links are sent
            chrome.tabs.onUpdated.removeListener(waitForPageLoad);
          }
        });
      });
    } else {
      progressDisplay.textContent = "No active tab found!";
    }
  });
});


// Listen for progress updates
chrome.runtime.onMessage.addListener((message) => {
  if (message.action === "updateProgress") {
    const progressDisplay = document.getElementById('progressDisplay');
    progressDisplay.textContent = `Passing links... ${message.current} out of ${message.total}`;
  }
});





document.getElementById('copyLinksBtn').addEventListener('click', () => {
  const links = document.getElementById('linksDisplay').textContent;
  navigator.clipboard.writeText(links).then(() => {
    alert("Links copied to clipboard!");
  });
});


document.getElementById('submitManuallyBtn').addEventListener('click', () => {
  const manualInput = document.getElementById('manualLinksInput').value;
  console.log("Manual input received:", manualInput);
  let manualLinks = [];

  try {
    manualLinks = extractAndCombineLinks(manualInput); // Check if input is valid JSON
    console.log("Parsed manual links:", manualLinks);
  } catch (error) {
    console.error("Error parsing manual input as JSON:", error);
    document.getElementById('progressDisplay').textContent = "Invalid input format!";
    return;
  }

  if (!Array.isArray(manualLinks) || manualLinks.length === 0) {
    document.getElementById('progressDisplay').textContent = "No valid links provided!";
    return;
  }

  // Reuse logic from passToRaveDJBtn
  passLinksToRaveDJ(manualLinks);
});

// function passLinksToRaveDJ(links) {
//   console.log("Passing links to Rave.dj:", links);
//   chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
//     if (tabs[0] && tabs[0].id) {
//       chrome.tabs.update(tabs[0].id, { url: "https://rave.dj/mix" }, () => {
//         chrome.tabs.onUpdated.addListener(function waitForPageLoad(tabId, info) {
//           if (tabId === tabs[0].id && info.status === 'complete') {
//             chrome.tabs.sendMessage(tabs[0].id, { action: "fillInput", links }, (response) => {
//               if (chrome.runtime.lastError) {
//                 console.error("Error sending message to content script:", chrome.runtime.lastError.message);
//                 document.getElementById('progressDisplay').textContent = `Error: ${chrome.runtime.lastError.message}`;
//               } else if (response && response.error) {
//                 console.error("Content script error:", response.error);
//                 document.getElementById('progressDisplay').textContent = `Error: ${response.error}`;
//               } else {
//                 document.getElementById('progressDisplay').textContent = "All links passed successfully!";
//               }
//             });
//             chrome.tabs.onUpdated.removeListener(waitForPageLoad);
//           }
//         });
//       });
//     } else {
//       document.getElementById('progressDisplay').textContent = "No active tab found!";
//     }
//   });
// }

function passLinksToRaveDJ(links) {
  console.log("Passing links to Rave.dj:", links);
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs[0] && tabs[0].id) {
      const currentTab = tabs[0];
      if (currentTab.url && currentTab.url.startsWith("https://rave.dj/mix")) {
        // Already on the correct site, just send the links
        chrome.tabs.sendMessage(currentTab.id, { action: "fillInput", links }, (response) => {
          handleContentScriptResponse(response);
        });
      } else {
        // Navigate to Rave.dj and wait for the page to load
        chrome.tabs.update(currentTab.id, { url: "https://rave.dj/mix" }, () => {
          chrome.tabs.onUpdated.addListener(function waitForPageLoad(tabId, info) {
            if (tabId === currentTab.id && info.status === 'complete') {
              chrome.tabs.sendMessage(currentTab.id, { action: "fillInput", links }, (response) => {
                handleContentScriptResponse(response);
              });
              chrome.tabs.onUpdated.removeListener(waitForPageLoad);
            }
          });
        });
      }
    } else {
      document.getElementById('progressDisplay').textContent = "No active tab found!";
    }
  });
}

function handleContentScriptResponse(response) {
  if (chrome.runtime.lastError) {
    console.error("Error sending message to content script:", chrome.runtime.lastError.message);
    document.getElementById('progressDisplay').textContent = `Error: ${chrome.runtime.lastError.message}`;
  } else if (response && response.error) {
    console.error("Content script error:", response.error);
    document.getElementById('progressDisplay').textContent = `Error: ${response.error}`;
  } else {
    document.getElementById('progressDisplay').textContent = "All links passed successfully!";
  }
}








// Function to store data in chrome.storage
function saveState() {
  const linksDisplay = document.getElementById('linksDisplay').value;
  const manualLinksInput = document.getElementById('manualLinksInput').value;

  chrome.storage.local.set({
    linksDisplay: linksDisplay,
    manualLinksInput: manualLinksInput
  });
}

// Function to restore data from chrome.storage
function restoreState() {
  chrome.storage.local.get(['linksDisplay', 'manualLinksInput'], (result) => {
    if (result.linksDisplay) {
      document.getElementById('linksDisplay').value = result.linksDisplay;
    }
    if (result.manualLinksInput) {
      document.getElementById('manualLinksInput').value = result.manualLinksInput;
    }
  });
}

// Debounce function to delay the saveState call to prevent too many writes
function debounce(fn, delay) {
  let timeout;
  return function () {
    clearTimeout(timeout);
    timeout = setTimeout(fn, delay);
  };
}

// Optional: Button actions like 'Gather Links', 'Pass to Rave.dj', etc. (same as before)
document.getElementById('gatherLinksBtn').addEventListener('click', () => {
  console.log("Gathering links...");
});

document.getElementById('passToRaveDJBtn').addEventListener('click', () => {
  console.log("Passing links to Rave.dj...");
});

// Add event listeners for input changes (to handle dynamically updated content)
document.getElementById('linksDisplay').addEventListener('input', debounce(saveState, 500));  // 500ms delay
document.getElementById('manualLinksInput').addEventListener('input', debounce(saveState, 500));  // 500ms delay
// Add event listeners for input changes (to handle dynamically updated content)
document.getElementById('linksDisplay').addEventListener('change', debounce(saveState, 500));  // 500ms delay
document.getElementById('manualLinksInput').addEventListener('change', debounce(saveState, 500));  // 500ms delay

// Load the state when the popup is opened
document.addEventListener('DOMContentLoaded', restoreState);



// Button event listeners to restore and clear data
document.getElementById('clearLinksBtn').addEventListener('click', () => {
  document.getElementById('linksDisplay').value = "";
  saveState();  // Ensure state is saved after clearing
});

document.getElementById('restoreLinksBtn').addEventListener('click', restoreState);

document.getElementById('saveLinksBtn').addEventListener('click', () => {
  saveState();
});

document.getElementById('clearManualInputBtn').addEventListener('click', () => {
  document.getElementById('manualLinksInput').value = "";
  saveState();  // Ensure state is saved after clearing
});

document.getElementById('restoreManualInputBtn').addEventListener('click', restoreState);

document.getElementById('saveManualInputBtn').addEventListener('click', () => {
  saveState();
});
