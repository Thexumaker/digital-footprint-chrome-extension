/* Keep track of the active tab in each window */
var activeTabs = {};


chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.sync.set({ allTimeBytes: 0, allTimeCO2: 0 });
});


chrome.tabs.onActivated.addListener(function(details) {
    activeTabs[details.windowId] = details.tabId;
});

chrome.windows.onCreated.addListener(async () => {
  await chrome.storage.session.set({currentSessionBytes: 0, currentSessionCO2: 0})
})


/* Clear the corresponding entry, whenever a window is closed */
chrome.windows.onRemoved.addListener(async function(winId) {
    let {currentSessionBytes, currentSessionCO2 } = await chrome.storage.session.get(['currentSessionBytes', 'currentSessionCO2'])
    const {allTimeBytes, allTimeCO2} = await chrome.storage.sync.get(['allTimeBytes', 'allTimeCO2']);
    const newTotalBytes = parseFloat(allTimeBytes) + parseFloat(currentSessionBytes);
    const newTotalCO2 = parseFloat(allTimeCO2) + parseFloat(currentSessionCO2);
    chrome.storage.sync.set({ allTimeBytes:  newTotalBytes, allTimeCO2: newTotalCO2});
    delete(activeTabs[winId]);
});

/* Listen for web-requests and filter them */
// chrome.webRequest.onBeforeRequest.addListener(function(details) {
//     if (details.tabId == -1) {
//         console.log("Skipping request from non-tabbed context...");
//         return;
//     }

//     var notInteresting = Object.keys(activeTabs).every(function(key) {
//         if (activeTabs[key] == details.tabId) {
//             /* We are interested in this request */
//             console.log("Check this out:", details);
//             return false;
//         } else {
//             return true;
//         }
//     });

//     if (notInteresting) {
//         /* We are not interested in this request */
//         console.log("Just ignore this one:", details);
//     }
// }, { urls: ["<all_urls>"] });

chrome.webRequest.onCompleted.addListener(async (details) => {
  let {currentSessionBytes, currentSessionCO2 } = await chrome.storage.session.get(['currentSessionBytes', 'currentSessionCO2'])
  const responseHeaders = details.responseHeaders;
  responseHeaders.map( async (responseHeader) => {
    if (responseHeader.name === "content-length" || responseHeader.name === "Content-Length") {
      currentSessionBytes += parseFloat(responseHeader.value);
      currentSessionCO2 = kwhToCo2Conversion(byteToKwhconversion(currentSessionBytes))
    }
  await chrome.storage.session.set({currentSessionBytes: currentSessionBytes, currentSessionCO2: currentSessionCO2})

});

}, { urls: ["<all_urls>"] }, ["responseHeaders"])
/* Get the active tabs in all currently open windows */
chrome.tabs.query({ active: true }, function(tabs) {
    tabs.forEach(function(tab) {
        activeTabs[tab.windowId] = tab.id;
    });
    console.log("activeTabs = ", activeTabs);
});


const byteToKwhconversion = (numberOfBytes) => {
  return numberOfBytes * 0.000000000224;
}

const kwhToCo2Conversion = (kwh) => {
  return kwh * 0.233;
}