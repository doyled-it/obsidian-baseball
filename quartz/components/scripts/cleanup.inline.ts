// Force cleanup of problematic elements after page load
function cleanupPage() {
  // Remove right sidebar completely - multiple selectors
  const rightSelectors = [
    ".right",
    ".sidebar.right",
    '[class*="right"]',
    ".graph",
    ".graph-view",
    ".backlinks",
    ".toc",
    ".table-of-contents",
    ".graph-outer",
    ".graph-container",
    ".toc-container",
    "aside.right",
    "nav.right",
    "section.right",
  ];

  rightSelectors.forEach((selector) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el) => {
      if (el.closest(".left") || el.closest(".center")) {
        // Don't remove if it's inside left or center content
        return;
      }
      el.style.display = "none";
      el.style.visibility = "hidden";
      el.style.width = "0";
      el.style.maxWidth = "0";
      el.style.overflow = "hidden";
    });
  });

  // Remove elements containing specific text
  const textToRemove = ["Graph View", "Backlinks", "Table of Contents"];
  textToRemove.forEach((text) => {
    const elements = document.querySelectorAll("*");
    elements.forEach((el) => {
      if (
        el.textContent?.trim() === text &&
        !el.closest(".left") &&
        !el.closest(".center")
      ) {
        el.style.display = "none";
      }
    });
  });

  // Fix explorer title
  const explorerTitles = document.querySelectorAll(
    ".explorer h1, .explorer-title, .left h1"
  );
  explorerTitles.forEach((el) => {
    if (
      el.textContent?.includes("Quartz") ||
      el.textContent?.trim() === "Quartz 4"
    ) {
      el.textContent = "⚾ Baseball Analytics";
    }
  });

  // Remove any remaining Quartz branding
  const quartzElements = document.querySelectorAll("*");
  quartzElements.forEach((el) => {
    if (
      el.textContent?.includes("Quartz 4") &&
      !el.closest("script") &&
      !el.closest("style")
    ) {
      el.textContent = el.textContent.replace(
        /Quartz 4?/g,
        "⚾ Baseball Analytics"
      );
    }
  });

  // Force grid layout to only have left and center
  const pageElement = document.querySelector(".page");
  if (pageElement) {
    pageElement.style.gridTemplateColumns = "auto 1fr";
    pageElement.style.gridTemplateAreas = '"left center"';
  }
}

// Run cleanup on page load and when content changes
document.addEventListener("DOMContentLoaded", cleanupPage);
window.addEventListener("load", cleanupPage);

// Also run on any dynamic content changes
const observer = new MutationObserver(function (mutations) {
  let shouldCleanup = false;
  mutations.forEach(function (mutation) {
    if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
      shouldCleanup = true;
    }
  });

  if (shouldCleanup) {
    setTimeout(cleanupPage, 100); // Small delay to ensure elements are rendered
  }
});

observer.observe(document.body, { childList: true, subtree: true });

// Run cleanup periodically as fallback
setInterval(cleanupPage, 2000);
