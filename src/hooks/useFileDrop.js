import { useEffect } from 'react'

export default function useFileDrop(root, callback) {
  useEffect(() => {
    /**
     * @param {DragEvent} e
     */
    async function handleDrop(e) {
      e.preventDefault()

      callback(e.dataTransfer.files[0])
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
