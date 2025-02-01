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












chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "navigateToRave_VAR222" && message.songs) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs.length === 0) {
              console.error("No active tab found.");
              return;
          }

          const currentTab = tabs[0];
          const url = new URL(currentTab.url);

          console.log("🌍 Active tab:", currentTab.url);

          if (url.hostname === "rave.dj") {
              if (url.pathname === "/mix") {
                  console.log("✅ Already on the mix page. Injecting content script...");

                  chrome.scripting.executeScript({
                      target: { tabId: currentTab.id },
                      files: ["content.js"],
                  }, () => {
                      console.log("📜 Content script injected. Sending startInput message...");
                      chrome.tabs.sendMessage(currentTab.id, {
                          action: "startInput",
                          songs: message.songs
                      });
                  });
              } else {
                  console.log("🚀 Detected a mashup page! Opening a new tab for /mix...");

                  chrome.tabs.create({ url: "https://rave.dj/mix" }, (newTab) => {
                      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                          if (tabId === newTab.id && changeInfo.status === "complete") {
                              chrome.tabs.onUpdated.removeListener(listener);
                              console.log("✅ New mix page loaded, injecting content script...");

                              chrome.scripting.executeScript({
                                  target: { tabId: newTab.id },
                                  files: ["content.js"],
                              }, () => {
                                  console.log("📜 Content script injected in the new tab. Sending startInput message...");
                                  chrome.tabs.sendMessage(newTab.id, {
                                      action: "startInput",
                                      songs: message.songs
                                  });
                              });
                          }
                      });
                  });
              }
          } else {
              console.log("🌍 Not on Rave.dj. Navigating to /mix...");
              chrome.tabs.update(currentTab.id, { url: "https://rave.dj/mix" }, () => {
                  chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo) {
                      if (tabId === currentTab.id && changeInfo.status === "complete") {
                          chrome.tabs.onUpdated.removeListener(listener);
                          console.log("✅ Mix page loaded, injecting content script...");

                          chrome.scripting.executeScript({
                              target: { tabId: currentTab.id },
                              files: ["content.js"],
                          }, () => {
                              console.log("📜 Content script injected after page load. Sending startInput message...");
                              chrome.tabs.sendMessage(currentTab.id, {
                                  action: "startInput",
                                  songs: message.songs
                              });
                          });
                      }
                  });
              });
          }
      });
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
