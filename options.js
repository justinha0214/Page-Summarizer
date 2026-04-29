const input = document.getElementById("apiKeyInput");
const msg   = document.getElementById("msg");

function showMsg(text, type) {
  msg.textContent = text;
  msg.className = "msg " + type;
  setTimeout(function() { msg.className = "msg"; }, 3000);
}

// Load saved key using callback (works in all Edge/Chrome versions)
chrome.storage.local.get("apiKey", function(result) {
  if (result.apiKey) input.value = result.apiKey;
});

document.getElementById("saveBtn").addEventListener("click", function() {
  var key = input.value.trim();
  if (!key.startsWith("AIza")) {
    showMsg("That doesn't look like a valid Gemini key (should start with AIza)", "error");
    return;
  }
  chrome.storage.local.set({ apiKey: key }, function() {
    showMsg("API key saved!", "success");
  });
});

document.getElementById("clearBtn").addEventListener("click", function() {
  chrome.storage.local.remove("apiKey", function() {
    input.value = "";
    showMsg("Key cleared.", "success");
  });
});

var shown = false;
document.getElementById("showBtn").addEventListener("click", function() {
  shown = !shown;
  input.type = shown ? "text" : "password";
  document.getElementById("showBtn").textContent = shown ? "Hide" : "Show";
});
