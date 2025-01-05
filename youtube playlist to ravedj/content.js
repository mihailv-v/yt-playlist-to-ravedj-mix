
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "gatherLinks") {
    const videoLinks = [];
    if (window.location.href.includes('/watch')) {
      document.querySelectorAll('#playlist-items a').forEach(video => {
        if (video.href) {
          videoLinks.push(video.href.split("&list")[0]);
        }
      });
    } else if (window.location.href.includes('/playlist')) {
      const playlistId = new URLSearchParams(window.location.search).get('list');
      if (playlistId) {
        videoLinks.push(`https://www.youtube.com/watch?v=playlist?list=${playlistId}&index=1`);
      }
    }
    // Send the response back
    sendResponse({ links: [...new Set(videoLinks)] });
  }
  return true; // Keep the message channel open
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "fillInput" && message.links) {
      const waitForElement = (selector, timeout = 15000) => {
        return new Promise((resolve, reject) => {
          const startTime = Date.now();
          const check = () => {
            const element = document.querySelector(selector);
            if (element) resolve(element);
            else if (Date.now() - startTime > timeout) reject("Timeout waiting for element: " + selector);
            else setTimeout(check, 100); // Retry every 100ms (faster checks)
          };
          check();
        });
      };
  
      // Wait for the input field and start processing links
      waitForElement("input.search-input")
        .then(async (inputField) => {
          for (let i = 0; i < message.links.length; i++) {
            const link = message.links[i];
            
            // Set input field value
            inputField.value = link;
            inputField.dispatchEvent(new Event("input", { bubbles: true }));
            
            // Simulate clicking the search button
            const searchButton = document.querySelector('button > a > svg.icon');
            if (searchButton) {
              searchButton.closest('button').click();
              console.log(`Clicked the search button for link: ${link}`);
            } else {
              console.warn("Search button not found!");
            }
  
            // Notify background script of progress
            chrome.runtime.sendMessage({
              action: "progressUpdate",
              current: i + 1,
              total: message.links.length,
            });
  
            // Delay to allow page processing before the next link
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
  
          sendResponse({ success: true });
        })
        .catch((error) => {
          console.error("Error finding input field:", error);
          sendResponse({ error: "Input field not found!" });
        });
  
      return true; // Keeps the message channel open for async operations
    }
  });






  

  
  
  
  
  
  