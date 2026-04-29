// popup.js

const $ = id => document.getElementById(id);

let pendingImages = []; // { dataUrl, name } for upload mode

// ── Init ──────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", async () => {
  const { apiKey } = await chrome.storage.local.get("apiKey");

  if (!apiKey) {
    $("noKeyMsg").style.display = "block";
  } else {
    $("appContent").style.display = "block";
  }

  // Restore last context
  const { lastContext } = await chrome.storage.local.get("lastContext");
  if (lastContext) $("contextInput").value = lastContext;
});

// ── Settings button ───────────────────────────────────────────────────────────
$("settingsBtn").addEventListener("click", () => {
  chrome.runtime.openOptionsPage();
});
$("openSettings")?.addEventListener("click", e => {
  e.preventDefault();
  chrome.runtime.openOptionsPage();
});

// ── Screenshot current tab ────────────────────────────────────────────────────
$("screenshotBtn").addEventListener("click", async () => {
  const { apiKey } = await chrome.storage.local.get("apiKey");
  if (!apiKey) { showError("Please add your API key in settings first."); return; }

  const context = $("contextInput").value.trim();
  saveContext(context);
  setLoading(true, "Capturing tab...");
  clearResult();

  const response = await chrome.runtime.sendMessage({
    type: "CAPTURE_TAB",
    context,
    apiKey
  });

  setLoading(false);
  if (response.error) {
    showError(response.error);
  } else {
    renderSummary(response.summary);
  }
});

// ── Upload images ─────────────────────────────────────────────────────────────
$("uploadBtn").addEventListener("click", () => {
  const zone = $("uploadZone");
  zone.classList.toggle("visible");
  if (zone.classList.contains("visible")) {
    zone.addEventListener("click", () => $("fileInput").click(), { once: true });
  }
});

$("uploadZone").addEventListener("dragover", e => {
  e.preventDefault();
  $("uploadZone").classList.add("dragover");
});
$("uploadZone").addEventListener("dragleave", () => {
  $("uploadZone").classList.remove("dragover");
});
$("uploadZone").addEventListener("drop", e => {
  e.preventDefault();
  $("uploadZone").classList.remove("dragover");
  handleFiles(e.dataTransfer.files);
});
$("fileInput").addEventListener("change", e => handleFiles(e.target.files));

function handleFiles(files) {
  Array.from(files).forEach(file => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = ev => {
      pendingImages.push({ dataUrl: ev.target.result, name: file.name });
      renderPreview();
    };
    reader.readAsDataURL(file);
  });
}

function renderPreview() {
  const strip = $("previewStrip");
  strip.innerHTML = "";
  pendingImages.forEach((img, i) => {
    const wrap = document.createElement("div");
    wrap.className = "preview-thumb";
    wrap.innerHTML = `<img src="${img.dataUrl}" alt="page ${i+1}" />
      <button class="rm" data-i="${i}">✕</button>`;
    strip.appendChild(wrap);
  });

  // Show summarize button only when images are queued
  if (pendingImages.length > 0) {
    let existingBtn = $("summarizeUploadsBtn");
    if (!existingBtn) {
      const btn = document.createElement("button");
      btn.id = "summarizeUploadsBtn";
      btn.className = "btn primary";
      btn.style = "margin: 0 16px 12px; width: calc(100% - 32px);";
      btn.innerHTML = `<span>Summarize ${pendingImages.length} image(s)</span>`;
      $("uploadZone").insertAdjacentElement("afterend", btn);
      btn.addEventListener("click", summarizeUploads);
    } else {
      existingBtn.querySelector("span").textContent = `Summarize ${pendingImages.length} image(s)`;
    }
  }

  strip.querySelectorAll(".rm").forEach(btn => {
    btn.addEventListener("click", e => {
      e.stopPropagation();
      pendingImages.splice(+btn.dataset.i, 1);
      renderPreview();
      if (pendingImages.length === 0) {
        $("summarizeUploadsBtn")?.remove();
      }
    });
  });
}

async function summarizeUploads() {
  if (!pendingImages.length) return;
  const { apiKey } = await chrome.storage.local.get("apiKey");
  if (!apiKey) { showError("Please add your API key in settings first."); return; }

  const context = $("contextInput").value.trim();
  saveContext(context);

  // For multiple images, summarize them one at a time and combine,
  // or just send the first for simplicity — here we send them sequentially
  // and concatenate (Claude API handles one image per message in this flow)
  setLoading(true, `Analyzing ${pendingImages.length} image(s)...`);
  clearResult();

  const summaries = [];
  for (let i = 0; i < pendingImages.length; i++) {
    if (pendingImages.length > 1) {
      setLoading(true, `Analyzing image ${i+1} of ${pendingImages.length}...`);
    }
    const res = await chrome.runtime.sendMessage({
      type: "SUMMARIZE_IMAGE",
      dataUrl: pendingImages[i].dataUrl,
      context: pendingImages.length > 1 ? `${context} (page ${i+1})` : context,
      apiKey
    });
    if (res.error) {
      setLoading(false);
      showError(res.error);
      return;
    }
    summaries.push(res.summary);
  }

  setLoading(false);

  if (summaries.length === 1) {
    renderSummary(summaries[0]);
  } else {
    // Combine multiple summaries with page dividers
    renderSummary(summaries.join("\n\n───────── Next page ─────────\n\n"));
  }
}

// ── Parse & render summary ────────────────────────────────────────────────────
function renderSummary(raw) {
  const sections = parseSummary(raw);

  $("summaryText").textContent = sections.summary || raw;

  const keyList = $("keyList");
  keyList.innerHTML = "";
  (sections.keyPoints || []).forEach(pt => {
    const li = document.createElement("li");
    li.innerHTML = `<span class="dot">·</span><span>${pt}</span>`;
    keyList.appendChild(li);
  });

  if (sections.terms) {
    $("termsText").textContent = sections.terms;
    $("termsSection").style.display = "block";
  }
  if (sections.watchOut) {
    $("watchText").textContent = sections.watchOut;
    $("watchSection").style.display = "block";
  }

  $("result").classList.add("visible");
}

function parseSummary(raw) {
  const out = { summary: "", keyPoints: [], terms: "", watchOut: "" };
  const lines = raw.split("\n");
  let section = null;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed === "SUMMARY") { section = "summary"; continue; }
    if (trimmed === "KEY POINTS") { section = "keys"; continue; }
    if (trimmed === "TERMS TO KNOW") { section = "terms"; continue; }
    if (trimmed === "WATCH OUT FOR") { section = "watch"; continue; }

    if (section === "summary") out.summary += (out.summary ? " " : "") + trimmed;
    else if (section === "keys" && trimmed.startsWith("-")) out.keyPoints.push(trimmed.slice(1).trim());
    else if (section === "terms") out.terms += (out.terms ? "\n" : "") + trimmed;
    else if (section === "watch") out.watchOut += (out.watchOut ? " " : "") + trimmed;
  }

  return out;
}

// ── Result actions ────────────────────────────────────────────────────────────
$("copyBtn").addEventListener("click", () => {
  const text = buildPlainText();
  navigator.clipboard.writeText(text).then(() => {
    $("copyBtn").textContent = "✓ Copied";
    setTimeout(() => $("copyBtn").textContent = "📋 Copy", 1800);
  });
});

$("saveBtn").addEventListener("click", () => {
  const text = buildPlainText();
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const ts = new Date().toISOString().replace(/[:.]/g, "-").slice(0, 19);
  a.download = `summary_${ts}.txt`;
  a.click();
  URL.revokeObjectURL(url);
});

$("resetBtn").addEventListener("click", () => {
  clearResult();
  pendingImages = [];
  $("previewStrip").innerHTML = "";
  $("summarizeUploadsBtn")?.remove();
  $("uploadZone").classList.remove("visible");
  $("errorMsg").classList.remove("visible");
});

function buildPlainText() {
  const ctx = $("contextInput").value.trim();
  let out = ctx ? `Context: ${ctx}\n\n` : "";
  out += "SUMMARY\n" + $("summaryText").textContent + "\n\n";
  const pts = Array.from($("keyList").querySelectorAll("li span:last-child")).map(el => "- " + el.textContent);
  if (pts.length) out += "KEY POINTS\n" + pts.join("\n") + "\n\n";
  if ($("termsSection").style.display !== "none") out += "TERMS TO KNOW\n" + $("termsText").textContent + "\n\n";
  if ($("watchSection").style.display !== "none") out += "WATCH OUT FOR\n" + $("watchText").textContent + "\n";
  return out.trim();
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function setLoading(on, text = "Analyzing page...") {
  $("loading").classList.toggle("visible", on);
  $("loadingText").textContent = text;
  $("screenshotBtn").disabled = on;
  $("uploadBtn").disabled = on;
}

function clearResult() {
  $("result").classList.remove("visible");
  $("summaryText").textContent = "";
  $("keyList").innerHTML = "";
  $("termsText").textContent = "";
  $("watchText").textContent = "";
  $("termsSection").style.display = "none";
  $("watchSection").style.display = "none";
}

function showError(msg) {
  const el = $("errorMsg");
  el.textContent = msg;
  el.classList.add("visible");
}

function saveContext(ctx) {
  chrome.storage.local.set({ lastContext: ctx });
}
