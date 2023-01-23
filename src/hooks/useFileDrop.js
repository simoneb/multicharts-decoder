import { useEffect } from 'react'

export default function useFileDrop(root, callback) {
  useEffect(() => {
    async function handleDrop(e) {
      e.preventDefault()

      /** @type {File} */
      const file = e.dataTransfer.items[0].getAsFile()
      callback(await file.text())
    }

    function handleDragOver(e) {
      e.preventDefault()
    }

    root.addEventListener('drop', handleDrop)
    root.addEventListener('dragover', handleDragOver)

    return () => {
      root.removeEventListener('drop', handleDrop)
      root.removeEventListener('dragover', handleDragOver)
    }
  }, [root, callback])
}
