import { PriceBreakdown } from '../../types'

export class PriceService {
  private static BASE_PRICE = 7.00
  private static PRICE_PER_KM = 2.50
  private static MINIMUM_CHARGE = 10.00
  
  static calculatePrice(distanceKm: number): PriceBreakdown {
    const distanceCost = distanceKm * this.PRICE_PER_KM
    let total = this.BASE_PRICE + distanceCost
    
    if (total < this.MINIMUM_CHARGE) {
      total = this.MINIMUM_CHARGE
    }
    
    return {
      basePrice: this.BASE_PRICE,
      pricePerKm: this.PRICE_PER_KM,
      distanceKm: distanceKm,
      distanceCost: distanceCost,
      total: total,
      minimumCharge: this.MINIMUM_CHARGE
    }
  }
  
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }
}