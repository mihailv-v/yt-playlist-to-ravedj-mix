
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "gatherLinks") {
    console.log("in gatherLinks: Starting link gathering process");

    // Check if the current URL is on `music.youtube`
    if (window.location.host.includes("music.youtube")) {
      const newUrl = window.location.href.replace("music.youtube", "www.youtube");
      console.log(`in gatherLinks: Redirecting to ${newUrl}`);
      window.location.href = newUrl; // Redirect to the new URL
      return; // Stop further execution as the redirection will reload the page
    }

    // Wait for the playlist page to load before starting
    const waitForPlaylistToLoad = () => {
      if (document.querySelectorAll('a.ytd-playlist-video-renderer').length > 0) {
        console.log("in gatherLinks: Playlist loaded. Starting link gathering process.");

        // Main link-gathering logic
        const videoLinks = new Set(); // To store unique links
        let previousLinks = new Set(); // To compare against current links
        let noChangeCounter = 0; // Counter for consecutive unchanged iterations

        // Function to gather video links
        const gatherVideoLinks = () => {
          const videos = document.querySelectorAll('a.ytd-playlist-video-renderer'); // Playlist video elements
          console.log(`in gatherLinks: Found ${videos.length} video elements`);

          videos.forEach(video => {
            if (video.href) {
              const cleanedLink = video.href.split('&')[0];
              videoLinks.add(cleanedLink);
              console.log(`in gatherLinks: Added link ${cleanedLink}`);
            }
          });

          console.log(`in gatherLinks: Current videoLinks size: ${videoLinks.size}`);
        };

        // Function to force scroll the page
        const forceScroll = () => {
          window.scrollBy(0, 1000); // Scroll down by 1000px
          console.log("in gatherLinks: Forced scroll down");

          const continuationsElement = document.querySelector('#continuations');
          if (continuationsElement) {
            continuationsElement.scrollIntoView({ behavior: 'smooth' });
            console.log("in gatherLinks: Scrolled to #continuations element");
          }
        };

        // Function to check if spinner is visible
        const isSpinnerVisible = () => {
          const spinner = document.querySelector('tp-yt-paper-spinner#spinner');
          const visible = spinner && spinner.offsetParent !== null; // Checks if the spinner is visible
          console.log(`in gatherLinks: Spinner visible: ${visible}`);
          return visible;
        };

        // Interval to manage scrolling and gathering links
        const interval = setInterval(() => {
          gatherVideoLinks(); // Gather links after scrolling

          // Compare current links to previous
          const currentLinks = Array.from(videoLinks).sort(); // Convert to sorted array for comparison
          const previousLinksArray = Array.from(previousLinks).sort(); // Previous links as sorted array

          if (
            currentLinks.length === previousLinksArray.length && // Same number of links
            currentLinks.every((link, index) => link === previousLinksArray[index]) // Same links
          ) {
            noChangeCounter++;
            console.log(`in gatherLinks: No change detected. Counter: ${noChangeCounter}`);
          } else {
            noChangeCounter = 0; // Reset counter if there’s a change
            console.log(`in gatherLinks: Detected change in links. Resetting counter.`);
          }

          // Update previousLinks for the next iteration
          previousLinks = new Set(videoLinks);

          // Stop scrolling if no changes for 4 consecutive iterations AND spinner is no longer visible
          if (noChangeCounter >= 4 && !isSpinnerVisible()) {
            clearInterval(interval); // Stop the interval
            console.log("in gatherLinks: Stopping scrolling process. Gathering final links.");
            console.log(`in gatherLinks: Final videoLinks size: ${videoLinks.size}`);
            sendResponse({ links: Array.from(videoLinks) }); // Send unique links back
          } else {
            forceScroll(); // Force scroll the page
          }
        }, 5000); // Wait 5 seconds between loops
      } else {
        console.log("in gatherLinks: Waiting for playlist to load...");
        setTimeout(waitForPlaylistToLoad, 1000); // Retry after 1 second
      }
    };

    // Start the playlist-loading wait process
    waitForPlaylistToLoad();
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







  










  
  






  
  console.log("content.js loaded");

  // Listener to extract track data from the page
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "gatherRaveData") {
      console.log("Extracting tracks...");
  
      // Find tracks in the DOM
      const tracks = document.querySelectorAll(".track");
      let trackData = [];
  
      tracks.forEach((track) => {
        const title = track.querySelector(".track-title")?.innerText || "Unknown Title";
        const thumbnail = track.querySelector(".track-thumbnail")?.src || "No Thumbnail";
        const duration = track.querySelector(".track-duration")?.innerText || "Unknown Duration";
  
        // Extract the video ID from the thumbnail URL
        const videoIdMatch = thumbnail.match(/\/vi\/([^\/]+)/);
        const videoId = videoIdMatch ? videoIdMatch[1] : null;
  
        // If we have a video ID, create a YouTube URL
        const youtubeUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : "No valid video ID";
  
        trackData.push({
          title,
          thumbnail,
          duration,
          youtubeUrl // Add the YouTube link to the track data
        });
      });
  
      console.log("Extracted tracks:", trackData);
      sendResponse({ success: true, data: trackData });
    }
  });
  


  



  

  
  
  
  
  
  