// Force cleanup of problematic elements after page load
document.addEventListener('DOMContentLoaded', function() {
  // Remove right sidebar completely
  const rightSidebars = document.querySelectorAll('.right, .sidebar.right, [class*="right"]');
  rightSidebars.forEach(el => {
    if (el.classList.contains('right') || el.classList.contains('sidebar')) {
      el.remove();
    }
  });

  // Fix explorer title
  const explorerTitles = document.querySelectorAll('.explorer h1, .explorer-title, .left h1');
  explorerTitles.forEach(el => {
    if (el.textContent?.includes('Quartz') || el.textContent?.trim() === 'Quartz 4') {
      el.textContent = '⚾ Baseball Analytics';
    }
  });

  // Remove any remaining Quartz branding
  const quartzElements = document.querySelectorAll('*');
  quartzElements.forEach(el => {
    if (el.textContent?.includes('Quartz 4') && !el.closest('script') && !el.closest('style')) {
      el.textContent = el.textContent.replace(/Quartz 4?/g, '⚾ Baseball Analytics');
    }
  });

  // Force grid layout to only have left and center
  const pageElement = document.querySelector('.page');
  if (pageElement) {
    pageElement.style.gridTemplateColumns = 'auto 1fr';
    pageElement.style.gridTemplateAreas = '"left center"';
  }
});

// Also run on any dynamic content changes
const observer = new MutationObserver(function(mutations) {
  mutations.forEach(function(mutation) {
    if (mutation.type === 'childList') {
      // Re-run cleanup on new nodes
      const rightSidebars = document.querySelectorAll('.right, .sidebar.right');
      rightSidebars.forEach(el => el.remove());
    }
  });
});

observer.observe(document.body, { childList: true, subtree: true });