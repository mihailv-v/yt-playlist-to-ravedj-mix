chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "gatherLinks") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0];
      console.log("activeTab")
      console.log(activeTab)
      console.log("tabs.length")
      console.log(tabs.length)
      if (activeTab && activeTab.id) {
        chrome.tabs.sendMessage(activeTab.id, { action: "gatherLinks" }, (response) => {
          if (chrome.runtime.lastError) {
            console.error("Error connecting to content script:", chrome.runtime.lastError.message);
            sendResponse({ error: "Content script not loaded. Reload the tab and try again." });
          } else {
            sendResponse(response);
          }
        });
      } else {
        sendResponse({ error: "No active tab found." });
      }
    });
    return true; // Keep message channel open
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "progressUpdate") {
    // Relay progress updates to the popup
    chrome.runtime.sendMessage({
      action: "updateProgress",
      current: message.current,
      total: message.total,
    });
  }
});





chrome.runtime.onInstalled.addListener(() => {
  console.log("Background script is installed and running.");
});




