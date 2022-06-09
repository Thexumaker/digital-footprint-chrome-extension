async function updatePopup() {
    const {allTimeBytes, allTimeCO2} = await chrome.storage.sync.get(['allTimeBytes', 'allTimeCO2']);
    const {currentSessionBytes, currentSessionCO2 } = await chrome.storage.session.get(['currentSessionBytes', 'currentSessionCO2'])
    document.getElementById("allTime").innerText = allTimeBytes;
    document.getElementById("allTimeCO2").innerText = allTimeCO2;
    document.getElementById("currentSessionBytes").innerText = currentSessionBytes;
    document.getElementById("currentSessionCO2").innerText = currentSessionCO2;
    

}    
document.addEventListener('DOMContentLoaded', updatePopup);