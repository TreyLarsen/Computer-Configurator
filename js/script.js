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
  var startCheckoutButton = document.getElementById("startCheckout");
  var componentProgressFillEl = document.getElementById("componentProgressFill");
  var componentProgressTextEl = document.getElementById("componentProgressText");

  // Selects ordered by data-step attribute to control reveal flow
  var selects = Array.prototype.slice.call(form.querySelectorAll("select[data-step]")).sort(function(a,b){
    return Number(a.dataset.step) - Number(b.dataset.step);
  });

  // Store default image sources for each component head so we can restore them
  var componentImageMap = new Map();
  selects.forEach(function (select) {
    var container = select.closest('.component-field');
    if (!container) return;
    var img = container.querySelector('img.component-image');
    if (!img) return;
    // Save the original src so we can fall back when an option has no custom image
    componentImageMap.set(select.id || select.name, img.src);
  });

  // Initialize sequential reveal: hide all except first
  selects.forEach(function(select, idx){
    var container = select.closest('.component-field');
    if (!container) return;
    if (idx === 0) {
      select.disabled = false;
      container.style.display = '';
    } else {
      select.disabled = true;
      container.style.display = 'none';
    }
  });

  function updateComponentProgress() {
    var total = selects.length;
    var revealed = selects.filter(function(s){ return !s.disabled; }).length;
    var pct = Math.round((revealed / total) * 100);
    if (componentProgressFillEl) componentProgressFillEl.style.width = pct + "%";
    if (componentProgressTextEl) componentProgressTextEl.textContent = 'Step ' + revealed + ' of ' + total;
  }

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
    var visibleSelects = selects.filter(function(s){ return !s.disabled; });
    var selectedCase = form.elements.case ? form.elements.case.value : '';
    var selectedCpu = form.elements.cpu ? form.elements.cpu.value : '';
    var selectedGpu = form.elements.gpu ? form.elements.gpu.value : '';
    var selectedMemory = form.elements.memory ? form.elements.memory.value : '';
    var selectedCooling = form.elements.cooling ? form.elements.cooling.value : '';
    var notes = [];
    var partsMarkup = [];
    var fortniteFps = Math.round(
      (gpuBaseFps[selectedGpu] || 180) +
      (cpuFpsBoost[selectedCpu] || 0) +
      (memoryFpsBoost[selectedMemory] || 0) +
      (coolingFpsBoost[selectedCooling] || 0)
    );
    var fpsMode = (selectedGpu && (selectedGpu.indexOf("4080") !== -1 || selectedGpu.indexOf("4070") !== -1)) ? "1080p Competitive settings" : "1080p Performance Mode";

    visibleSelects.forEach(function (select) {
      var option = selectedOption(select);
      var price = Number(option.dataset.price || 0);
      total += price;
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

    // Update component progress completion (visible components / total)
    if (completionFillEl) {
      completionFillEl.style.width = Math.round((visibleSelects.length / selects.length) * 100) + "%";
    }

    if (completionValueEl) {
      completionValueEl.textContent = Math.round((visibleSelects.length / selects.length) * 100) + "%";
    }

    if (buildNameEl) {
      buildNameEl.textContent = selectedGpu && selectedGpu.indexOf("4080") !== -1 ? "Forge X custom" : selectedGpu && selectedGpu.indexOf("4070") !== -1 ? "Nightforge custom" : "Pulse custom";
    }

    if (buildTypeEl) {
      buildTypeEl.textContent = selectedGpu && selectedGpu.indexOf("4080") !== -1 ? "Premium creator workstation" : selectedCpu && selectedCpu.indexOf("7800X3D") !== -1 ? "Balanced gaming and creation build" : selectedCpu && selectedCpu.indexOf("14600K") !== -1 ? "High-refresh esports focused build" : "Compact performance system";
    }

    if (fortniteFpsEl) {
      fortniteFpsEl.textContent = fortniteFps + " FPS";
    }

    if (fpsModeEl) {
      fpsModeEl.textContent = fpsMode;
    }

    if (selectedGpu && selectedGpu.indexOf("4080") !== -1 && selectedCase === "Compact ITX") {
      notes.push("The RTX 4080 Super may be a tight fit in a compact ITX case.");
    }

    if (selectedCpu && selectedCpu.indexOf("14700K") !== -1 && selectedCooling === "Air Cooler") {
      notes.push("An AIO is a better match for the Core i7-14700K.");
    }

    if (selectedCpu && selectedCpu.indexOf("7800X3D") !== -1 && selectedGpu && selectedGpu.indexOf("4070") !== -1) {
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

    // Update component preview images after summary updates
    selects.forEach(function (select) {
      var container = select.closest('.component-field');
      if (!container) return;
      var img = container.querySelector('img.component-image');
      if (!img) return;
      var option = selectedOption(select);
      var custom = option && option.dataset && option.dataset.image;
      if (custom) {
        img.src = custom;
      } else {
        var key = select.id || select.name;
        if (componentImageMap.has(key)) img.src = componentImageMap.get(key);
      }
    });
  }

  function revealNext(select) {
    var idx = selects.indexOf(select);
    if (idx === -1) return;
    var next = selects[idx + 1];
    if (!next) return;
    var container = next.closest('.component-field');
    if (!container) return;
    if (next.disabled) {
      next.disabled = false;
      container.style.display = '';
      updateComponentProgress();
    }
  }

  function randomizeBuild() {
    // reveal all and pick random options
    selects.forEach(function(select){
      var container = select.closest('.component-field');
      if (container) container.style.display = '';
      select.disabled = false;
      select.selectedIndex = Math.floor(Math.random() * select.options.length);
    });
    updateComponentProgress();
    updateSummary();
  }

  function saveCheckoutState() {
    var order = selects.map(function (select) {
      var option = selectedOption(select);
      return {
        label: select.dataset.label || select.name,
        value: option.value,
        price: Number(option.dataset.price || 0)
      };
    });

    var selectedTotal = order.reduce(function (sum, item) {
      return sum + item.price;
    }, 149);

    try {
      localStorage.setItem("siphonbuilds_checkout", JSON.stringify({
        buildName: buildNameEl ? buildNameEl.textContent : "Custom build",
        buildType: buildTypeEl ? buildTypeEl.textContent : "Selected parts",
        items: order,
        total: selectedTotal,
        shipping: 49
      }));
      window.location.href = "checkout.html";
    } catch (error) {
      window.location.href = "checkout.html";
    }
  }

  selects.forEach(function (select) {
    select.addEventListener("change", function () {
      revealNext(select);
      updateSummary();
      updateComponentProgress();
      if (select === selects[selects.length - 1]) {
        saveCheckoutState();
      }
    });
  });

  if (randomizeButton) {
    randomizeButton.addEventListener("click", randomizeBuild);
  }

  if (startCheckoutButton) {
    startCheckoutButton.addEventListener("click", saveCheckoutState);
  }

  // initial UI state
  updateComponentProgress();
  updateSummary();
});

document.addEventListener("DOMContentLoaded", function () {
  var checkoutForm = document.getElementById("checkoutForm");
  var checkoutPartsList = document.getElementById("checkoutPartsList");
  var checkoutTotal = document.getElementById("checkoutTotal");
  var checkoutShipping = document.getElementById("checkoutShipping");
  var checkoutBuildName = document.getElementById("checkoutBuildName");
  var checkoutBuildType = document.getElementById("checkoutBuildType");
  var confirmationPanel = document.getElementById("confirmationPanel");
  var checkoutNotice = document.getElementById("checkoutNotice");

  if (!checkoutForm) {
    return;
  }

  var stored = null;
  try {
    stored = JSON.parse(localStorage.getItem("siphonbuilds_checkout") || "null");
  } catch (error) {
    stored = null;
  }

  if (stored) {
    if (checkoutBuildName) checkoutBuildName.textContent = stored.buildName || "Custom build";
    if (checkoutBuildType) checkoutBuildType.textContent = stored.buildType || "Selected parts";
    if (checkoutPartsList) {
      checkoutPartsList.innerHTML = (stored.items || []).map(function (item) {
        return '<li><span>' + item.label + '</span><strong>' + item.value + ' ($' + item.price.toFixed(2) + ')</strong></li>';
      }).join("");
    }
    if (checkoutTotal) checkoutTotal.textContent = '$' + ((stored.total || 0) + (stored.shipping || 0)).toFixed(2);
    if (checkoutShipping) checkoutShipping.textContent = 'Shipping: $' + (stored.shipping || 0).toFixed(2);
  }

  checkoutForm.addEventListener("submit", function (event) {
    event.preventDefault();
    checkoutForm.style.display = 'none';
    if (confirmationPanel) confirmationPanel.style.display = 'block';
    if (checkoutNotice) checkoutNotice.textContent = 'Order submitted. No real charge was made.';
  });
});