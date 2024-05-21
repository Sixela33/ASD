class OCR_Model {
    static task = "image-to-text"
    static model = "selvakumarcts/sk_invoice_receipts"
    static instance = null
  
    static async getInstance(progress_callback = null) {
      if (this.instance === null) {
        try {
            // Dynamically import the Transformers.js library
            let { pipeline, env } = await import('@xenova/transformers')
      
            this.instance = await pipeline(this.task, this.model, { progress_callback })
        } catch (error) {
            console.log(error)
        }
      }
  
      return this.instance
    }
}

export default OCR_Model