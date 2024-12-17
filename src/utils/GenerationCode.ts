export function generateOrderId() {
    const datePart = new Date().toISOString().replace(/[-:.T]/g, '').slice(0, 8); // YYYYMMDD
    const randomPart = Math.floor(Math.random() * 100000).toString().padStart(5, '0'); // Random 5 chữ số
    return `ORD${datePart}${randomPart}`;
  }
export function IsDuplicatesWithSort(arr: any[]): boolean {
  arr.sort(); // Sắp xếp 
  for (let i = 1; i < arr.length; i++) {
    if(typeof arr[i]==='object'){
      if(JSON.stringify(arr[i])===JSON.stringify(arr[i-1])){
        return true
      }
      continue
    }
    if (arr[i] === arr[i - 1]) {
      return true
    }
  }

  return false
}


  
  