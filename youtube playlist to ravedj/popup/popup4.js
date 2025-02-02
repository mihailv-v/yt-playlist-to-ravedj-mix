document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('gatherAllVideosFromPageBtn').addEventListener('click', () => {
      // Send a message to background.js to gather video links
      chrome.runtime.sendMessage({ action: "gatherAllVideosFromPage" }, (response) => {
        const videoLinksDisplay = document.getElementById('videoLinksDisplay');
        
        if (response && response.links) {
          videoLinksDisplay.textContent = JSON.stringify(response.links, null, 2);
          gatheredVideoLinks = videoLinksDisplay.textContent;
        } else if (response && response.error) {
          videoLinksDisplay.textContent = response.error;
          console.error('Error: ', response.error);
        } else {
          videoLinksDisplay.textContent = 'Unexpected error occurred.';
          console.error('Unexpected response:', response);
        }
      });
    });
  });
  
  