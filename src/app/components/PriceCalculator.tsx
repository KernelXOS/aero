'use client'

import { useState } from 'react'
import { PriceService } from '../lib/priceService'

interface PriceCalculatorProps {
  onDistanceCalculated?: (distance: number) => void
}

export default function PriceCalculator({ onDistanceCalculated }: PriceCalculatorProps) {
  const [distance, setDistance] = useState<string>('')
  const [price, setPrice] = useState<any>(null)
  
  const handleCalculate = () => {
    const km = parseFloat(distance)
    if (!isNaN(km) && km > 0) {
      const calculatedPrice = PriceService.calculatePrice(km)
      setPrice(calculatedPrice)
      onDistanceCalculated?.(km)
    }
  }
  
  return (
    <div className="bg-white rounded-lg p-4 shadow-md">
      <h3 className="text-lg font-semibold mb-3">Calculadora Manual</h3>
      <div className="space-y-3">
        <input
          type="number"
          value={distance}
          onChange={(e) => setDistance(e.target.value)}
          placeholder="Distancia en kilómetros"
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleCalculate}
          className="w-full bg-blue-500 text-white p-2 rounded-lg hover:bg-blue-600 transition"
        >
          Calcular Precio
        </button>
        {price && (
          <div className="mt-3 p-3 bg-gray-100 rounded-lg">
            <p className="font-semibold">Total: {PriceService.formatCurrency(price.total)}</p>
          </div>
        )}
      </div>
    </div>
  )
}