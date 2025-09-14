import axios, { AxiosInstance } from 'axios'

interface GPS808Credentials {
  server: string
  account: string
  password: string
}

interface LoginResponse {
  result: number
  jsession: string
  account_name: string
  JSESSIONID: string
}

interface VehicleResponse {
  result: number
  vehicles: Array<{
    id: number
    nm: string
    dl: Array<{
      id: string
      cc: number
      cn: string
    }>
  }>
}

interface StatusResponse {
  result: number
  status: Array<{
    id: string
    ol: number // online status: 0=offline, 1=online
    lng: number
    lat: number
    mlng: string
    mlat: string
    sp: number // speed
    gt: string // GPS time
  }>
}

export class GPS808Client {
  private api: AxiosInstance
  private session: string | null = null
  private credentials: GPS808Credentials

  constructor(credentials: GPS808Credentials) {
    this.credentials = credentials
    this.api = axios.create({
      baseURL: credentials.server,
      timeout: 10000,
    })
  }

  async login(): Promise<string> {
    try {
      const response = await this.api.get<LoginResponse>('/StandardApiAction_login.action', {
        params: {
          account: this.credentials.account,
          password: this.credentials.password,
        },
      })

      if (response.data.result === 0 && response.data.jsession) {
        this.session = response.data.jsession
        return this.session
      }

      throw new Error('Login failed')
    } catch (error) {
      console.error('GPS808 Login Error:', error)
      throw error
    }
  }

  async getVehicles(): Promise<VehicleResponse> {
    if (!this.session) {
      await this.login()
    }

    const response = await this.api.get<VehicleResponse>('/StandardApiAction_queryUserVehicle.action', {
      params: {
        jsession: this.session,
      },
    })

    return response.data
  }

  async getVehicleStatus(deviceId: string): Promise<StatusResponse> {
    if (!this.session) {
      await this.login()
    }

    const response = await this.api.get<StatusResponse>('/StandardApiAction_getDeviceStatus.action', {
      params: {
        jsession: this.session,
        devIdno: deviceId,
      },
    })

    return response.data
  }

  async getVehicleStatusBatch(deviceIds: string[]): Promise<StatusResponse> {
    if (!this.session) {
      await this.login()
    }

    const response = await this.api.get<StatusResponse>('/StandardApiAction_getDeviceStatus.action', {
      params: {
        jsession: this.session,
        devIdno: deviceIds.join(','),
      },
    })

    return response.data
  }

  async logout(): Promise<void> {
    if (this.session) {
      await this.api.get('/StandardApiAction_logout.action', {
        params: {
          jsession: this.session,
        },
      })
      this.session = null
    }
  }

  getSession(): string | null {
    return this.session
  }
}

// Singleton instance
let gpsClient: GPS808Client | null = null

export function getGPSClient(): GPS808Client {
  if (!gpsClient) {
    gpsClient = new GPS808Client({
      server: process.env.GPS_API_SERVER || 'http://120.79.58.1:8088',
      account: process.env.GPS_API_ACCOUNT || 'ULVschool',
      password: process.env.GPS_API_PASSWORD || '11223344',
    })
  }
  return gpsClient
}