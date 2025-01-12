// Log that the background script is running
console.log("Background script is running.");

// Gather Links Handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received:", message);
  if (message.action === "gatherLinks") {
    console.log("Action is 'gatherLinks'. Querying active tab...");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      console.log("Tabs returned by query:", tabs);
      const activeTab = tabs[0];
      console.log("Active tab:", activeTab);
      if (activeTab && activeTab.id) {
        console.log("Sending message to content script in active tab:", activeTab.id);
        chrome.tabs.sendMessage(
          activeTab.id,
          { action: "gatherLinks" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Error connecting to content script:", chrome.runtime.lastError.message);
              sendResponse({ error: "Content script not loaded. Reload the tab and try again." });
            } else {
              console.log("Response from content script:", response);
              sendResponse(response);
            }
          }
        );
      } else {
        console.error("No active tab found.");
        sendResponse({ error: "No active tab found." });
      }
    });
    return true; // Keep message channel open
  }
});

// Progress Update Handler
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received for progressUpdate:", message);
  if (message.action === "progressUpdate") {
    console.log("Relaying progress updates to popup:", message);
    chrome.runtime.sendMessage({
      action: "updateProgress",
      current: message.current,
      total: message.total,
    });
  }
});











chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "gatherRaveData") {
    // Forward data to popup.js
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, message, (response) => {
        sendResponse(response);
      });
    });
    return true; // Keep the message channel open for async response
  }
});
























// Log when the background script is installed
chrome.runtime.onInstalled.addListener(() => {
  console.log("Background script is installed and running.");
});

// chrome.tabs.executeScript(activeTabId, { file: 'content.js' }, () => {
//   if (chrome.runtime.lastError) {
//     console.error("Error injecting content script:", chrome.runtime.lastError.message);
//   }
// });
