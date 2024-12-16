export function generateOrderId() {
    const datePart = new Date().toISOString().replace(/[-:.T]/g, '').slice(0, 8); // YYYYMMDD
    const randomPart = Math.floor(Math.random() * 100000).toString().padStart(5, '0'); // Random 5 chữ số
    return `ORD${datePart}${randomPart}`;
  }
  
  