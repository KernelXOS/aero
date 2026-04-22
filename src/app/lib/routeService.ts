import { LatLng, RouteInfo, RouteResponse } from '../../types'

export class RouteService {
  private static readonly OSRM_API = 'https://router.project-osrm.org/route/v1/driving/'
  private static readonly FETCH_TIMEOUT_MS = 7000
  private static readonly FALLBACK_AVG_SPEED_KMH = 35
  private static readonly FALLBACK_MIN_DURATION_SECONDS = 180

  static async getRoute(pickup: LatLng, delivery: LatLng): Promise<RouteInfo> {
    const osrmRoute = await this.tryGetOsrmRoute(pickup, delivery)
    if (osrmRoute) {
      return osrmRoute
    }

    // Fallback local: mantiene la app funcional aunque OSRM falle/timeout.
    return this.buildFallbackRoute(pickup, delivery)
  }

  private static async tryGetOsrmRoute(pickup: LatLng, delivery: LatLng): Promise<RouteInfo | null> {
    const coordinates = `${pickup.lng},${pickup.lat};${delivery.lng},${delivery.lat}`
    const url = `${this.OSRM_API}${coordinates}?overview=full&geometries=polyline`
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.FETCH_TIMEOUT_MS)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json'
        }
      })

      if (!response.ok) {
        return null
      }

      const contentType = response.headers.get('content-type') || ''
      if (!contentType.includes('application/json')) {
        return null
      }

      const data: RouteResponse = await response.json()

      if (data.code !== 'Ok' || !data.routes.length) {
        return null
      }

      const route = data.routes[0]
      const decodedCoordinates = this.decodePolyline(route.geometry)
      if (decodedCoordinates.length < 2) {
        return null
      }

      return {
        distance: route.distance / 1000,
        duration: route.duration,
        geometry: route.geometry,
        coordinates: decodedCoordinates
      }
    } catch (error) {
      console.warn('OSRM no disponible, usando ruta aproximada local:', error)
      return null
    } finally {
      clearTimeout(timeoutId)
    }
  }

  private static buildFallbackRoute(pickup: LatLng, delivery: LatLng): RouteInfo {
    const distanceKm = this.calculateHaversineDistanceKm(pickup, delivery)
    const rawDurationSeconds = (distanceKm / this.FALLBACK_AVG_SPEED_KMH) * 3600
    const duration = Math.max(this.FALLBACK_MIN_DURATION_SECONDS, Math.round(rawDurationSeconds))

    return {
      distance: distanceKm,
      duration,
      geometry: '',
      coordinates: this.interpolateCoordinates(pickup, delivery, distanceKm)
    }
  }

  private static calculateHaversineDistanceKm(from: LatLng, to: LatLng): number {
    const earthRadiusKm = 6371
    const lat1 = this.toRadians(from.lat)
    const lat2 = this.toRadians(to.lat)
    const deltaLat = this.toRadians(to.lat - from.lat)
    const deltaLng = this.toRadians(to.lng - from.lng)

    const a =
      Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) *
      Math.sin(deltaLng / 2) * Math.sin(deltaLng / 2)

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return Math.max(0.1, earthRadiusKm * c)
  }

  private static interpolateCoordinates(start: LatLng, end: LatLng, distanceKm: number): LatLng[] {
    const segments = Math.max(24, Math.min(200, Math.round(distanceKm * 16)))
    const points: LatLng[] = []

    for (let index = 0; index <= segments; index++) {
      const progress = index / segments
      points.push({
        lat: start.lat + (end.lat - start.lat) * progress,
        lng: start.lng + (end.lng - start.lng) * progress
      })
    }

    return points
  }

  private static toRadians(value: number): number {
    return value * (Math.PI / 180)
  }
  
  private static decodePolyline(encoded: string): LatLng[] {
    const points: LatLng[] = []
    let index = 0
    let lat = 0
    let lng = 0
    
    while (index < encoded.length) {
      let b: number
      let shift = 0
      let result = 0
      
      do {
        if (index >= encoded.length) {
          return points
        }
        b = encoded.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)
      
      const dlat = ((result & 1) ? ~(result >> 1) : (result >> 1))
      lat += dlat
      
      shift = 0
      result = 0
      
      do {
        if (index >= encoded.length) {
          return points
        }
        b = encoded.charCodeAt(index++) - 63
        result |= (b & 0x1f) << shift
        shift += 5
      } while (b >= 0x20)
      
      const dlng = ((result & 1) ? ~(result >> 1) : (result >> 1))
      lng += dlng
      
      points.push({
        lat: lat / 1e5,
        lng: lng / 1e5
      })
    }
    
    return points
  }
}