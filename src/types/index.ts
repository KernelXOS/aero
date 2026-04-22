export interface LatLng {
	lat: number
	lng: number
}

export interface RouteInfo {
	distance: number
	duration: number
	geometry: string
	coordinates: LatLng[]
}

export interface PriceBreakdown {
	basePrice: number
	pricePerKm: number
	distanceKm: number
	distanceCost: number
	total: number
	minimumCharge: number
}

export interface RouteResponse {
	code: string
	routes: Array<{
		geometry: string
		distance: number
		duration: number
	}>
}

export type PointSelectionMode = 'pickup' | 'delivery'
