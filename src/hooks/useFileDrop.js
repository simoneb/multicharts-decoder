import { useEffect } from 'react'

export default function useFileDrop(root, callback) {
  useEffect(() => {
    /**
     * @param {DragEvent} e
     */
    async function handleDrop(e) {
      e.preventDefault()

      const file = e.dataTransfer.files[0]
      callback(await file.text(), file.type)
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
