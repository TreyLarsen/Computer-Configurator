function myFunction() {
  var nav = document.getElementById("myTopnav");

  if (!nav) {
    return;
  }

  if (nav.className === "topnav") {
    nav.className += " responsive";
  } else {
    nav.className = "topnav";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  var form = document.getElementById("configuratorForm");

  if (!form) {
    return;
  }

  var totalEl = document.getElementById("builder-total");
  var grandTotalEl = document.getElementById("builder-grand-total");
  var partsListEl = document.getElementById("partsList");
  var noteEl = document.getElementById("builder-note");
  var compatibilityEl = document.getElementById("compatibilityNote");
  var completionFillEl = document.getElementById("completionFill");
  var completionValueEl = document.getElementById("completionValue");
  var buildNameEl = document.getElementById("build-name");
  var buildTypeEl = document.getElementById("build-type");
  var fortniteFpsEl = document.getElementById("fortniteFps");
  var fpsModeEl = document.getElementById("fpsMode");
  var randomizeButton = document.getElementById("randomizeBuild");
  var selects = Array.prototype.slice.call(form.querySelectorAll("select"));

  var gpuBaseFps = {
    "RTX 4060 Ti": 195,
    "RX 7800 XT": 220,
    "RTX 4070 Super": 265,
    "RTX 4080 Super": 330
  };

  var cpuFpsBoost = {
    "Ryzen 5 7600": 0,
    "Core i5-14600K": 12,
    "Ryzen 7 7800X3D": 28,
    "Core i7-14700K": 22
  };

  var memoryFpsBoost = {
    "16 GB DDR5": -8,
    "32 GB DDR5": 0,
    "64 GB DDR5": 3
  };

  var coolingFpsBoost = {
    "Air Cooler": 0,
    "240 mm AIO": 4,
    "360 mm AIO": 6
  };

  function formatCurrency(amount) {
    return "$" + amount.toLocaleString("en-US");
  }

  function selectedOption(select) {
    return select.options[select.selectedIndex];
  }

  function updateSummary() {
    var total = 149;
    var selectedCount = 0;
    var selectedCpu = form.elements.cpu.value;
    var selectedGpu = form.elements.gpu.value;
    var selectedCase = form.elements.case.value;
    var selectedCooling = form.elements.cooling.value;
    var selectedMemory = form.elements.memory.value;
    var notes = [];
    var partsMarkup = [];
    var fortniteFps = Math.round(
      (gpuBaseFps[selectedGpu] || 180) +
      (cpuFpsBoost[selectedCpu] || 0) +
      (memoryFpsBoost[selectedMemory] || 0) +
      (coolingFpsBoost[selectedCooling] || 0)
    );
    var fpsMode = selectedGpu.indexOf("4080") !== -1 || selectedGpu.indexOf("4070") !== -1 ? "1080p Competitive settings" : "1080p Performance Mode";

    selects.forEach(function (select) {
      var option = selectedOption(select);
      var price = Number(option.dataset.price || 0);
      total += price;
      selectedCount += 1;
      partsMarkup.push('<li><span>' + (select.dataset.label || select.name) + '</span><strong>' + option.value + ' (' + formatCurrency(price) + ')</strong></li>');
    });

    partsMarkup.push('<li><span>Assembly</span><strong>' + formatCurrency(149) + '</strong></li>');

    if (partsListEl) {
      partsListEl.innerHTML = partsMarkup.join("");
    }

    if (totalEl) {
      totalEl.textContent = formatCurrency(total);
    }

    if (grandTotalEl) {
      grandTotalEl.textContent = formatCurrency(total);
    }

    if (completionFillEl) {
      completionFillEl.style.width = Math.round((selectedCount / selects.length) * 100) + "%";
    }

    if (completionValueEl) {
      completionValueEl.textContent = Math.round((selectedCount / selects.length) * 100) + "%";
    }

    if (buildNameEl) {
      buildNameEl.textContent = selectedGpu.indexOf("4080") !== -1 ? "Forge X custom" : selectedGpu.indexOf("4070") !== -1 ? "Nightforge custom" : "Pulse custom";
    }

    if (buildTypeEl) {
      buildTypeEl.textContent = selectedGpu.indexOf("4080") !== -1 ? "Premium creator workstation" : selectedCpu.indexOf("7800X3D") !== -1 ? "Balanced gaming and creation build" : selectedCpu.indexOf("14600K") !== -1 ? "High-refresh esports focused build" : "Compact performance system";
    }

    if (fortniteFpsEl) {
      fortniteFpsEl.textContent = fortniteFps + " FPS";
    }

    if (fpsModeEl) {
      fpsModeEl.textContent = fpsMode;
    }

    if (selectedGpu.indexOf("4080") !== -1 && selectedCase === "Compact ITX") {
      notes.push("The RTX 4080 Super may be a tight fit in a compact ITX case.");
    }

    if (selectedCpu.indexOf("14700K") !== -1 && selectedCooling === "Air Cooler") {
      notes.push("An AIO is a better match for the Core i7-14700K.");
    }

    if (selectedCpu.indexOf("7800X3D") !== -1 && selectedGpu.indexOf("4070") !== -1) {
      notes.push("This is a strong 1440p gaming pairing.");
    }

    notes.unshift("Estimated Fortnite performance: " + fortniteFps + " FPS at " + fpsMode + ".");

    if (!notes.length) {
      notes.push("Your configuration is balanced for general gaming and creator work.");
    }

    if (noteEl) {
      noteEl.textContent = notes[0];
    }

    if (compatibilityEl) {
      compatibilityEl.textContent = notes.length > 1 ? notes.slice(1).join(" ") : "No compatibility warnings.";
    }
  }

  function randomizeBuild() {
    selects.forEach(function (select) {
      select.selectedIndex = Math.floor(Math.random() * select.options.length);
    });

    updateSummary();
  }

  selects.forEach(function (select) {
    select.addEventListener("change", updateSummary);
  });

  if (randomizeButton) {
    randomizeButton.addEventListener("click", randomizeBuild);
  }

  updateSummary();
});