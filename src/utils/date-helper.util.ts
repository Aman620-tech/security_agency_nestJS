export class DateHelper {
  static getMonthDateRange(month: number, year: number): { startDate: Date; endDate: Date } {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);
    
    return { startDate, endDate };
  }
  
  static formatDate(date: Date, format: string = 'DD/MM/YYYY'): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear().toString();
    
    let result = format;
    result = result.replace('DD', day);
    result = result.replace('MM', month);
    result = result.replace('YYYY', year);
    
    return result;
  }
  
  static getWorkingDaysCount(startDate: Date, endDate: Date): number {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }
}