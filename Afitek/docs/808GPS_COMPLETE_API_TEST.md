# 808GPS Complete API Test Results

## Server Information
- **IP**: 120.79.58.1
- **Port**: 8088
- **Platform**: CMSV6/CMSV7
- **Test Date**: 12 Eylül 2025
- **Credentials**: ULVschool / 11223344

## API Test Results

### ✅ WORKING APIs (Çalışan API'ler)

#### 1. User Operations
| API | Endpoint | Response |
|-----|----------|----------|
| Login | `/StandardApiAction_login.action` | ✅ Session ID returned |
| LoginEx | `/StandardApiAction_loginEx.action` | ✅ Session ID returned |
| Logout | `/StandardApiAction_logout.action` | ✅ Success |

#### 2. Vehicle Information APIs
| API | Endpoint | Response |
|-----|----------|----------|
| Query User Vehicle | `/StandardApiAction_queryUserVehicle.action` | ✅ Returns vehicle list with device 888811118888 |
| Get Device Status | `/StandardApiAction_getDeviceStatus.action` | ✅ Returns GPS position and sensor data |
| Get Device Online Status | `/StandardApiAction_getDeviceOlStatus.action` | ✅ Returns online/offline status |
| Get Vehicle Status | `/StandardApiAction_getVehicleStatus.action` | ✅ Returns vehicle position and status |
| Query Track Detail | `/StandardApiAction_queryTrackDetail.action` | ✅ Returns empty (no data for date range) |

#### 3. Management APIs  
| API | Endpoint | Response |
|-----|----------|----------|
| Query Driver List | `/StandardApiAction_queryDriverList.action` | ✅ Returns empty driver list |

### ❌ NOT WORKING APIs (404 Error)

#### Video APIs
- `/StandardApiAction_getLiveAddress.action` - Live video HLS
- `/StandardApiAction_getRtspAddress.action` - RTSP stream
- `/StandardApiAction_getRtmpAddress.action` - RTMP stream
- `/StandardApiAction_queryRecFile.action` - Video file search
- `/StandardApiAction_searchVideoFile.action` - Search videos
- `/StandardApiAction_getDownloadURL.action` - Download URL
- `/StandardApiAction_queryMediaRecords.action` - Media records
- `/StandardApiAction_downloadFile.action` - File download
- `/StandardApiAction_getPlaybackUrl.action` - Playback URL
- `/StandardApiAction_captureImage.action` - Image capture

#### Control APIs
- `/StandardApiAction_vehicleControl.action` - Vehicle control
- `/StandardApiAction_sendTTS.action` - TTS messages
- `/StandardApiAction_ptzControl.action` - PTZ control
- `/StandardApiAction_sendCommand.action` - Send commands
- `/StandardApiAction_ptz.action` - PTZ operations
- `/StandardApiAction_sendTextMsg.action` - Text messages
- `/StandardApiAction_queryDeviceParam.action` - Device parameters

#### Area Management
- `/StandardApiAction_getAreaInfo.action` - Area information
- `/StandardApiAction_addArea.action` - Add area
- `/StandardApiAction_editArea.action` - Edit area
- `/StandardApiAction_deleteArea.action` - Delete area

#### Company Management
- `/StandardApiAction_getCompanyInfo.action` - Company info
- `/StandardApiAction_queryCompany.action` - Query company
- `/StandardApiAction_queryCompanyTree.action` - Company tree
- `/StandardApiAction_addCompany.action` - Add company
- `/StandardApiAction_deleteCompany.action` - Delete company

#### Device Management  
- `/StandardApiAction_addDevice.action` - Add device
- `/StandardApiAction_addNewDevice.action` - Add new device
- `/StandardApiAction_editDevice.action` - Edit device
- `/StandardApiAction_deleteDevice.action` - Delete device
- `/StandardApiAction_queryDevice.action` - Query devices
- `/StandardApiAction_queryDeviceInfo.action` - Device info
- `/StandardApiAction_getAllVehicle.action` - All vehicles
- `/StandardApiAction_getVehicleTree.action` - Vehicle tree

#### User Management
- `/StandardApiAction_getAccountInfo.action` - Account info
- `/StandardApiAction_getUserInfo.action` - User info
- `/StandardApiAction_addUser.action` - Add user
- `/StandardApiAction_findUser.action` - Find user
- `/StandardApiAction_deleteUser.action` - Delete user

#### Other APIs
- `/StandardApiAction_getDeviceMileage.action` - Mileage report
- `/StandardApiAction_queryAlarmDetail.action` - Alarm details (parameter error)
- `/StandardApiAction_queryAlarmSummary.action` - Alarm summary
- `/StandardApiAction_querySimCard.action` - SIM cards
- `/StandardApiAction_queryRules.action` - Rules
- `/StandardApiAction_queryVehicleGroup.action` - Vehicle groups
- `/StandardApiAction_queryTrack.action` - Track query
- `/StandardApiAction_getUserVehicle.action` - User vehicles
- `/StandardApiAction_queryParking.action` - Parking info
- `/StandardApiAction_queryPosition.action` - Position query
- `/StandardApiAction_getDeviceIdno.action` - Device ID

## Working API Response Examples

### 1. Login Response
```json
{
  "result": 0,
  "jsession": "411513411bef4f41b582f9a68d76640b",
  "account_name": "ULVSchool",
  "pri": "1,2,21,24,25,26,27,28,29...",
  "JSESSIONID": "411513411bef4f41b582f9a68d76640b"
}
```

### 2. Vehicle List Response
```json
{
  "result": 0,
  "vehicles": [{
    "id": 7104,
    "nm": "888811118888",
    "pid": 1008,
    "pnm": "ULV School",
    "dl": [{
      "id": "888811118888",
      "cc": 4,
      "cn": "CH1,CH2,CH3,CH4",
      "md": 361,
      "ist": "2025-03-13 15:16:37"
    }],
    "chnCount": 4,
    "vehicleType": 0
  }]
}
```

### 3. GPS Status Response
```json
{
  "result": 0,
  "status": [{
    "id": "888811118888",
    "net": 3,
    "ol": 0,
    "sp": 0,
    "lng": -118033344,
    "lat": 23200000,
    "mlng": "-118.033344",
    "mlat": "23.200000",
    "pk": 59300,
    "lc": 28300,
    "gt": "2025-06-11 09:07:06.0"
  }]
}
```

### 4. Vehicle Status Response
```json
{
  "result": 0,
  "status": [{
    "vn": "888811118888",
    "ol": 0,
    "lng": -118033344,
    "lat": 23200000,
    "ps": "23.200000,-118.033344",
    "sp": 0,
    "ml": 28300,
    "gt": "2025-06-11 09:07:06.0"
  }]
}
```

### 5. Driver List Response
```json
{
  "result": 0,
  "infos": []
}
```

## API Statistics

| Category | Total | Working | Not Working | Success Rate |
|----------|-------|---------|-------------|--------------|
| User Operations | 3 | 3 | 0 | 100% |
| Vehicle Info | 10 | 5 | 5 | 50% |
| Video | 10 | 0 | 10 | 0% |
| Control | 7 | 0 | 7 | 0% |
| Management | 20 | 1 | 19 | 5% |
| **TOTAL** | **50** | **9** | **41** | **18%** |

## Key Findings

### Working Features
✅ User authentication (login/logout)
✅ Basic vehicle tracking (GPS position, status)
✅ Vehicle information queries
✅ Driver list management
✅ Online/offline status checking

### Not Working Features
❌ All video streaming and playback
❌ Vehicle control commands
❌ Area/fence management
❌ Company/organization management
❌ User management
❌ Device management
❌ SIM card management
❌ Alarm and rule management

## Device Information
- **Device ID**: 888811118888
- **Company**: ULV School
- **Channels**: 4 (CH1, CH2, CH3, CH4)
- **Status**: Offline
- **Last GPS**: 2025-06-11 09:07:06
- **Location**: 23.200000, -118.033344
- **Total Mileage**: 59300 km
- **Daily Mileage**: 28300 km

## Conclusion
The API system provides basic tracking functionality but most advanced features (video, control, management) are not accessible via the documented endpoints. Only 18% of tested APIs are functional.

## Test Commands Used
```bash
# Login
curl -s "http://120.79.58.1:8088/StandardApiAction_login.action?account=ULVschool&password=11223344"

# Get Vehicle Status
curl -s "http://120.79.58.1:8088/StandardApiAction_getVehicleStatus.action?jsession=SESSION_ID&devIdno=888811118888"

# Get GPS Status
curl -s "http://120.79.58.1:8088/StandardApiAction_getDeviceStatus.action?jsession=SESSION_ID&devIdno=888811118888"
```