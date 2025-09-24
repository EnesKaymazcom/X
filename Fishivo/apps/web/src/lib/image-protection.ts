'use client'

export function initImageProtection() {
  if (typeof window === 'undefined') return

  // Disable right-click on all images
  document.addEventListener('contextmenu', (e) => {
    const target = e.target
    if (target instanceof Element && (target.tagName === 'IMG' || target.closest('.protected-image-container'))) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  }, true)

  // Disable drag on all images
  document.addEventListener('dragstart', (e) => {
    const target = e.target
    if (target instanceof Element && (target.tagName === 'IMG' || target.closest('.protected-image-container'))) {
      e.preventDefault()
      e.stopPropagation()
      return false
    }
  }, true)

  // Disable text selection on images
  document.addEventListener('selectstart', (e) => {
    const target = e.target
    if (target instanceof Element && (target.tagName === 'IMG' || target.closest('.protected-image-container'))) {
      e.preventDefault()
      return false
    }
  }, true)

  // Prevent F12 and Ctrl+Shift+I (DevTools)
  document.addEventListener('keydown', (e) => {
    // F12
    if (e.keyCode === 123) {
      e.preventDefault()
      return false
    }
    // Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C
    if (e.ctrlKey && e.shiftKey && (e.keyCode === 73 || e.keyCode === 74 || e.keyCode === 67)) {
      e.preventDefault()
      return false
    }
    // Ctrl+U (View Source)
    if (e.ctrlKey && e.keyCode === 85) {
      e.preventDefault()
      return false
    }
  })

  // Detect DevTools (basic detection)
  let devtools = { open: false, orientation: null }
  const threshold = 160
  const emitEvent = (state: boolean) => {
    if (state) {
      console.clear()
      console.log('%c⚠️ Developer Tools Detected!', 'color: red; font-size: 30px; font-weight: bold;')
      console.log('%c🚫 Image protection is active. Please respect our content.', 'color: orange; font-size: 16px;')
      
      // Optional: Blur images when devtools open
      document.querySelectorAll('.protected-image-container img').forEach((img) => {
        (img as HTMLElement).style.filter = 'blur(10px)'
      })
    } else {
      // Restore images when devtools closed
      document.querySelectorAll('.protected-image-container img').forEach((img) => {
        (img as HTMLElement).style.filter = 'none'
      })
    }
  }

  setInterval(() => {
    if (window.outerHeight - window.innerHeight > threshold || 
        window.outerWidth - window.innerWidth > threshold) {
      if (!devtools.open) {
        devtools.open = true
        emitEvent(true)
      }
    } else {
      if (devtools.open) {
        devtools.open = false
        emitEvent(false)
      }
    }
  }, 500)

  // Disable print
  window.addEventListener('beforeprint', (e) => {
    const protectedImages = document.querySelectorAll('.protected-image-container')
    protectedImages.forEach(container => {
      (container as HTMLElement).style.display = 'none'
    })
  })

  window.addEventListener('afterprint', (e) => {
    const protectedImages = document.querySelectorAll('.protected-image-container')
    protectedImages.forEach(container => {
      (container as HTMLElement).style.display = ''
    })
  })
}