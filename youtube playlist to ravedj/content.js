
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "gatherLinks") {
    console.log("in gatherLinks: Starting link gathering process");

    // Redirect /watch?v=...&list=... to /playlist?list=...
    const currentUrl = window.location.href;
    const playlistRegex = /youtube\.com\/watch\?v=([^&]+)&list=([^&]+)/;
    if (playlistRegex.test(currentUrl)) {
      const newUrl = currentUrl.replace(playlistRegex, "youtube.com/playlist?list=$2");
      console.log(`Redirecting to playlist page: ${newUrl}`);
      window.location.href = newUrl;
      return; // Stop further execution since the page is reloading
    }

    const waitForPlaylistToLoad = () => {
      // Remove the recommended section before gathering video links
      const removeRecommendedSection = () => {
        const recommendedSection = document.querySelector("ytd-item-section-renderer[page-subtype='playlist'][title-style='ITEM_SECTION_HEADER_TITLE_STYLE_PLAYLIST_RECOMMENDATIONS']");
        if (recommendedSection) {
          recommendedSection.remove();
          console.log("Removed recommended videos section.");
        }
      };

      const videos = document.querySelectorAll('a.ytd-playlist-video-renderer');
      if (videos.length > 0) {
        console.log("Playlist loaded. Starting link gathering process.");

        const videoLinks = new Set();
        let previousLinks = new Set();
        let noChangeCounter = 0;

        // Gather video links excluding the recommended section
        const gatherVideoLinks = () => {
          // Select only videos that are part of the playlist, excluding the recommended section
          document.querySelectorAll('a.ytd-playlist-video-renderer').forEach(video => {
            // Check if the video is within the playlist section (exclude recommended)
            if (video.closest('ytd-playlist-video-list-renderer')) {
              if (video.href) {
                const cleanedLink = video.href.split('&')[0]; // Clean the URL
                videoLinks.add(cleanedLink);
                console.log(`Added link: ${cleanedLink}`);
              }
            }
          });
        };

        const forceScroll = () => {
          window.scrollBy(0, 1000); // Scroll down
          const continuationsElement = document.querySelector('#continuations');
          if (continuationsElement) {
            continuationsElement.scrollIntoView({ behavior: 'smooth' });
          }
        };

        const isSpinnerVisible = () => {
          const spinner = document.querySelector('tp-yt-paper-spinner#spinner');
          return spinner && spinner.offsetParent !== null;
        };

        const interval = setInterval(() => {
          gatherVideoLinks();
          removeRecommendedSection(); // Ensure the recommendation section is removed

          const currentLinks = Array.from(videoLinks).sort();
          const previousLinksArray = Array.from(previousLinks).sort();

          // Check if links have changed
          if (
            currentLinks.length === previousLinksArray.length &&
            currentLinks.every((link, index) => link === previousLinksArray[index])
          ) {
            noChangeCounter++;
          } else {
            noChangeCounter = 0;
          }

          previousLinks = new Set(videoLinks);

          // If no change for several iterations and no spinner, stop
          if (noChangeCounter >= 4 && !isSpinnerVisible()) {
            clearInterval(interval);
            console.log("Stopping scrolling. Final link count:", videoLinks.size);
            sendResponse({ links: Array.from(videoLinks) });
          } else {
            forceScroll(); // Continue scrolling to gather more links
          }
        }, 5000);
      } else {
        setTimeout(waitForPlaylistToLoad, 1000); // Retry if playlist hasn't loaded yet
      }
    };

    waitForPlaylistToLoad();
  }
  return true;
});





// Function to create a random delay between 60 and 1600 milliseconds 
function randomDelay(min = 60, max = 1600) { return Math.floor(Math.random() * (max - min + 1)) + min; }



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
            await new Promise((resolve) => setTimeout(resolve, randomDelay(50,1500)));
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







  







  console.log("content.js is running and ready for messages.");

  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("Received message in content.js:", message);
  
      if (message.action === "startInput" && message.songs) {
          console.log("Starting song input...");
  
          const waitForElement = (selector, timeout = 15000) => {
              return new Promise((resolve, reject) => {
                  const startTime = Date.now();
                  const check = () => {
                      const element = document.querySelector(selector);
                      if (element) resolve(element);
                      else if (Date.now() - startTime > timeout) reject("Timeout waiting for element: " + selector);
                      else setTimeout(check, 100);
                  };
                  check();
              });
          };
  
          const getTrackCount = () => document.querySelectorAll(".track").length;
  
          waitForElement("input.search-input")
              .then(async (inputField) => {
                  for (let i = 0; i < message.songs.length; i++) {
                      const link = message.songs[i];
  
                      console.log(`🎵 Entering link: ${link}`);
                      inputField.value = link;
                      inputField.dispatchEvent(new Event("input", { bubbles: true }));
  
                      const searchButton = document.querySelector('button > a > svg.icon');
                      if (searchButton) {
                          searchButton.closest('button').click();
                          console.log(`🔍 Clicked search for: ${link}`);
                      } else {
                          console.warn("⚠️ Search button not found!");
                      }
  
                      await new Promise((resolve) => setTimeout(resolve, 1000));
                  }
  
                  const checkTracksInterval = setInterval(async () => {
                      const trackCount = getTrackCount();
                      console.log("🎶 Current track count:", trackCount);
  
                      if (trackCount === 2) {
                          clearInterval(checkTracksInterval);
                          console.log("✅ Both songs detected! Waiting 2 seconds before clicking 'Create Mashup'...");
                          
                          await new Promise((resolve) => setTimeout(resolve, 2000));
  
                          const createButton = document.querySelector(".mix-button.mix-floating-footer");
                          if (createButton) {
                              console.log("✅ Create Mashup button found! Attempting click events...");
  
                              const clickEvents = [
                                  { type: "touchstart", delay: 126 },
                                  { type: "touchend", delay: 3000 },
                                  { type: "click", delay: 3000 },
                              ];
  
                              for (const event of clickEvents) {
                                  createButton.dispatchEvent(new MouseEvent(event.type, { bubbles: true }));
                                  console.log(`🖱️ ${event.type} event performed. Waiting ${event.delay / 1000} seconds to check for mashup creation...`);
                                  
                                  await new Promise((resolve) => setTimeout(resolve, event.delay));
  
                                  if (checkIfMashupStarted()) {
                                      console.log("🎉 Mashup has started creating! URL changed and button disappeared.");
                                      sendResponse({ success: true });
                                      return;
                                  }
                              }
  
                              console.warn("❌ Mashup creation did not start despite all click events!");
                          } else {
                              console.warn("❌ Create Mashup button not found!");
                          }
                      }
                  }, 1000);
              })
              .catch((error) => {
                  console.error("🚨 Error:", error);
                  sendResponse({ error: "Input field not found!" });
              });
  
          return true;
      }
  });
  
  // Function to check if mashup creation has started
  function checkIfMashupStarted() {
      const currentURL = window.location.pathname;
      const createButton = document.querySelector(".mix-button.mix-floating-footer");
  
      if (currentURL !== "/mix" || !createButton) {
          return true; // Mashup started
      }
      return false;
  }
  
  
  
  
  
  








// content.js gather from profile
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "gatherAllVideosFromPage") {
    console.log("In gatherAllVideosFromPage: Starting video gathering process");

    const waitForPageToLoad = () => {
      const videos = document.querySelectorAll('ytd-rich-item-renderer');
      if (videos.length > 0) {
        console.log("Page loaded. Starting video link gathering.");

        const videoLinks = new Set();
        let previousLinks = new Set();
        let noChangeCounter = 0;

        const gatherVideoLinks = () => {
          document.querySelectorAll('a.ytd-rich-grid-media').forEach(video => {
            if (video.href) {
              const cleanedLink = video.href.split('&')[0]; // Clean the URL
              videoLinks.add(cleanedLink);
              console.log(`Added link: ${cleanedLink}`);
            }
          });
        };

        const forceScroll = () => {
          window.scrollBy(0, 1000); // Scroll down
          const continuationsElement = document.querySelector('#continuations');
          if (continuationsElement) {
            continuationsElement.scrollIntoView({ behavior: 'smooth' });
          }
        };

        const isSpinnerVisible = () => {
          const spinner = document.querySelector('tp-yt-paper-spinner#spinner');
          return spinner && spinner.offsetParent !== null;
        };

        const interval = setInterval(() => {
          gatherVideoLinks();

          const currentLinks = Array.from(videoLinks).sort();
          const previousLinksArray = Array.from(previousLinks).sort();

          if (currentLinks.length === previousLinksArray.length &&
            currentLinks.every((link, index) => link === previousLinksArray[index])) {
            noChangeCounter++;
          } else {
            noChangeCounter = 0;
          }

          previousLinks = new Set(videoLinks);

          if (noChangeCounter >= 4 && !isSpinnerVisible()) {
            clearInterval(interval);
            console.log("Stopping scroll. Final video link count:", videoLinks.size);
            sendResponse({ links: Array.from(videoLinks) });
          } else {
            forceScroll();
          }
        }, 5000);
      } else {
        setTimeout(waitForPageToLoad, 1000); // Retry if page hasn't loaded yet
      }
    };

    waitForPageToLoad();
  }
  return true;
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
  


  



  

  
  
  
  
  
  