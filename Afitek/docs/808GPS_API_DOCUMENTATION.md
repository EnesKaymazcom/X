# 808GPS API Documentation

## Base Information
- **API URL**: `http://120.79.58.1:8088/808gps/`
- **Protocol**: HTTP/HTTPS
- **Response Format**: JSON/JSONP
- **Character Encoding**: UTF-8
- **Default Port**: 
  - HTTP: 6605 (Login Server), 6603 (User Server)
  - HTTPS: 16605 (Login Server), 16603 (User Server)

## 1. General Rules

### 1.1 Parameter Encoding
- All parameters must be URL encoded
- Two encoding methods supported:
  1. **URL Direct Encoding**: `encodeURI(encodeURI(URIstring))`
  2. **Ajax Encoding** (Recommended): `encodeURI(URIstring)`

### 1.2 HTTP MIME Types
- **JSON**: `Content-type: application/json;charset=utf-8`
- **JSONP**: `Content-type: text/javascript; charset=utf-8`

### 1.3 Common Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID obtained after login |
| callback | string | No | JSONP callback function name |

### 1.4 Common Response Fields
| Field | Type | Description |
|-------|------|-------------|
| result | number | 0 = Success, Other = Error code |
| callback | string | JSONP callback function name if specified |

## 2. Error Codes

### Web Error Codes
| Code | Description |
|------|-------------|
| 1 | Incorrect account or password |
| 2 | Incorrect account or password |
| 3 | User deactivated |
| 4 | User expired |
| 5 | Session does not exist |
| 6 | Exception |
| 7 | Required parameter missing |
| 8 | Operation not permitted |
| 9 | Query time range error |
| 10 | Query time exceeds allowed range |
| 11 | Download task already exists |
| 12 | Account already exists |
| 13 | Account forbidden |
| 14 | Device limit reached |
| 15 | Device already exists |
| 16 | Vehicle already exists |
| 17 | Device in use |
| 18 | Vehicle does not exist |
| 19 | Device does not exist |
| 20 | Device does not belong to current company |
| 21 | Device registration mismatch |
| 24 | Network exception |
| 25 | Rule name already exists |
| 26 | Rule name does not exist |
| 27 | Information does not exist |
| 28 | User session exists |
| 29 | Company does not exist |
| 32 | Device offline |
| 34 | Login error |

### Server Error Codes
| Code | Description |
|------|-------------|
| 2 | User no permission |
| 3 | Required parameter missing |
| 4 | SQL error |
| 5 | Information does not exist |
| 6 | Unknown error |
| 7 | Name already exists |
| 21 | Device does not exist |
| 22 | No response from device |
| 23 | Device offline |
| 26 | Device connection error |
| 27 | Unknown storage |

## 3. User Operations

### 3.1 User Login
**URL**: `/StandardApiAction_loginEx.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| account | string | Yes | User account |
| password | string | Yes | MD5 encrypted password |

**Response Example**:
```json
{
  "result": 0,
  "jsession": "session_id_here",
  "userInfo": {
    "accountID": 1,
    "account": "admin",
    "name": "Administrator"
  }
}
```

### 3.2 User Logout
**URL**: `/StandardApiAction_logout.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |

## 4. Vehicle Information

### 4.1 Get User Authorized Vehicles
**URL**: `/StandardApiAction_getDeviceInfo.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |

**Response Example**:
```json
{
  "result": 0,
  "vehicles": [
    {
      "devIdno": "device001",
      "vehiIdno": "11111",
      "online": 1,
      "gpsTime": "2025-01-01 12:00:00",
      "latitude": 39.9042,
      "longitude": 116.4074,
      "speed": 60,
      "direction": 90
    }
  ]
}
```

### 4.2 Get Device Status
**URL**: `/StandardApiAction_getDeviceOlStatus.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| devIdno | string | Yes | Device number |

### 4.3 Get Device GPS Status
**URL**: `/StandardApiAction_getDeviceStatus.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| devIdno | string | Yes | Device number |

### 4.4 Get Device Track
**URL**: `/StandardApiAction_queryTrackDetail.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| devIdno | string | Yes | Device number |
| begintime | string | Yes | Start time (yyyy-MM-dd HH:mm:ss) |
| endtime | string | Yes | End time (yyyy-MM-dd HH:mm:ss) |
| pagination | number | No | Current page (default 1) |
| pageRecords | number | No | Records per page (default 10) |

### 4.5 Get Real-time Alarms
**URL**: `/StandardApiAction_queryAlarmDetail.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| devIdno | string | No | Device number |
| begintime | string | Yes | Start time |
| endtime | string | Yes | End time |
| armType | string | No | Alarm type |

### 4.6 Get Vehicle Mileage
**URL**: `/StandardApiAction_getDeviceMileage.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| devIdno | string | Yes | Device number |
| begintime | string | Yes | Start time |
| endtime | string | Yes | End time |

## 5. Video Operations

### 5.1 Initialize Video Plugin (H5)
**URL**: `/808gps/open/js/cmsv6Player.js`  
**Description**: Initialize H5 video player (No IE support)

### 5.2 Live Video (HLS)
**URL**: `/StandardApiAction_getLiveAddress.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| devIdno | string | Yes | Device number |
| channel | number | Yes | Channel number |
| streamType | number | No | Stream type (0=main, 1=sub) |

### 5.3 Live Video RTSP
**URL**: `/StandardApiAction_getRtspAddress.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| devIdno | string | Yes | Device number |
| channel | number | Yes | Channel number |

### 5.4 Live Video RTMP
**URL**: `/StandardApiAction_getRtmpAddress.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| devIdno | string | Yes | Device number |
| channel | number | Yes | Channel number |

## 6. Video Recording & Playback

### 6.1 Search Video Files
**URL**: `/StandardApiAction_queryRecFile.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| devIdno | string | Yes | Device number |
| begintime | string | Yes | Start time |
| endtime | string | Yes | End time |
| channel | number | No | Channel number |
| fileType | number | No | File type (1=normal, 2=alarm) |

### 6.2 Download Video
**URL**: `/StandardApiAction_downloadFile.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| devIdno | string | Yes | Device number |
| fileName | string | Yes | File name |
| channel | number | Yes | Channel number |

### 6.3 Remote Playback
**URL**: `/StandardApiAction_getPlaybackUrl.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| devIdno | string | Yes | Device number |
| fileName | string | Yes | File name |
| channel | number | Yes | Channel number |

### 6.4 Image Capture
**URL**: `/StandardApiAction_captureImage.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| devIdno | string | Yes | Device number |
| channel | number | Yes | Channel number |

## 7. Vehicle Control

### 7.1 Vehicle Control Commands
**URL**: `/StandardApiAction_vehicleControl.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| devIdno | string | Yes | Device number |
| cmdType | number | Yes | Command type |
| cmdParam | string | No | Command parameters |

**Command Types**:
- 1: Door lock control
- 2: Engine control
- 3: Speed limit
- 4: Oil/power control

### 7.2 TTS Voice Broadcast
**URL**: `/StandardApiAction_sendTTS.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| devIdno | string | Yes | Device number |
| content | string | Yes | TTS content |
| flag | number | No | Emergency flag (0=normal, 1=emergency) |

### 7.3 PTZ Control
**URL**: `/StandardApiAction_ptzControl.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| devIdno | string | Yes | Device number |
| channel | number | Yes | Channel number |
| command | number | Yes | PTZ command |
| speed | number | No | Speed (1-255) |

**PTZ Commands**:
- 0: Stop
- 1: Up
- 2: Down
- 3: Left
- 4: Right
- 5: Zoom in
- 6: Zoom out

## 8. Device Management

### 8.1 Add Device
**URL**: `/StandardApiAction_addDevice.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| devIdno | string | Yes | Device number |
| simCard | string | No | SIM card number |
| devType | number | No | Device type |

### 8.2 Edit Device
**URL**: `/StandardApiAction_editDevice.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| devIdno | string | Yes | Device number |
| simCard | string | No | SIM card number |
| devType | number | No | Device type |

### 8.3 Delete Device
**URL**: `/StandardApiAction_deleteDevice.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| devIdno | string | Yes | Device number |

### 8.4 Add Vehicle
**URL**: `/StandardApiAction_addVehicle.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| vehiIdno | string | Yes | Vehicle number/plate |
| devIdno | string | No | Device number to bind |
| vehiType | number | No | Vehicle type |

### 8.5 Delete Vehicle
**URL**: `/StandardApiAction_deleteVehicle.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| vehiIdno | string | Yes | Vehicle number |

## 9. Area Management

### 9.1 Get Area Information
**URL**: `/StandardApiAction_getAreaInfo.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |

### 9.2 Add Area
**URL**: `/StandardApiAction_addArea.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| areaName | string | Yes | Area name |
| areaType | number | Yes | Area type (1=circle, 2=rectangle, 3=polygon) |
| areaData | string | Yes | Area coordinates (JSON) |

### 9.3 Edit Area
**URL**: `/StandardApiAction_editArea.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| areaId | number | Yes | Area ID |
| areaName | string | No | Area name |
| areaData | string | No | Area coordinates |

### 9.4 Delete Area
**URL**: `/StandardApiAction_deleteArea.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| areaId | number | Yes | Area ID |

## 10. Organization Management

### 10.1 Add Organization
**URL**: `/StandardApiAction_addCompany.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| companyName | string | Yes | Company name |
| parentId | number | No | Parent company ID |

### 10.2 Find Organization
**URL**: `/StandardApiAction_findCompany.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| companyId | number | No | Company ID |

### 10.3 Delete Organization
**URL**: `/StandardApiAction_deleteCompany.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| companyId | number | Yes | Company ID |

## 11. Role Management

### 11.1 Add Role
**URL**: `/StandardApiAction_addRole.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| roleName | string | Yes | Role name |
| permissions | string | Yes | Permissions (comma separated) |

### 11.2 Find Role
**URL**: `/StandardApiAction_findRole.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| roleId | number | No | Role ID |

### 11.3 Delete Role
**URL**: `/StandardApiAction_deleteRole.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| roleId | number | Yes | Role ID |

## 12. User Account Management

### 12.1 Add User
**URL**: `/StandardApiAction_addUser.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| account | string | Yes | User account |
| password | string | Yes | MD5 encrypted password |
| name | string | Yes | User name |
| roleId | number | Yes | Role ID |

### 12.2 Find User
**URL**: `/StandardApiAction_findUser.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| userId | number | No | User ID |

### 12.3 Delete User
**URL**: `/StandardApiAction_deleteUser.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| userId | number | Yes | User ID |

## 13. Driver Management

### 13.1 Find Driver by Device ID
**URL**: `/StandardApiAction_findDriverByDevice.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| devIdno | string | Yes | Device number |

### 13.2 Add Driver
**URL**: `/StandardApiAction_addDriver.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| driverName | string | Yes | Driver name |
| licenseNo | string | Yes | License number |
| phone | string | No | Phone number |

### 13.3 Delete Driver
**URL**: `/StandardApiAction_deleteDriver.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| driverId | number | Yes | Driver ID |

## 14. SIM Card Management

### 14.1 Add SIM Card
**URL**: `/StandardApiAction_addSimCard.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| simNumber | string | Yes | SIM card number |
| operator | string | No | Operator name |

### 14.2 Find SIM Card
**URL**: `/StandardApiAction_findSimCard.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| simId | number | No | SIM card ID |

### 14.3 Delete SIM Card
**URL**: `/StandardApiAction_deleteSimCard.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| simId | number | Yes | SIM card ID |

## 15. Statistical Reports

### 15.1 Passenger Flow Summary
**URL**: `/StandardApiAction_passengerFlowSummary.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| begintime | string | Yes | Start time |
| endtime | string | Yes | End time |
| devIdno | string | No | Device number |

### 15.2 Passenger Flow Details
**URL**: `/StandardApiAction_passengerFlowDetail.action`  
**Method**: GET/POST  
**Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| jsession | string | Yes | Session ID |
| begintime | string | Yes | Start time |
| endtime | string | Yes | End time |
| devIdno | string | Yes | Device number |

## Example Code

### JavaScript/jQuery Login Example
```javascript
// MD5 encrypt password
var password = hex_md5("your_password");

// Login request
$.ajax({
    url: 'http://120.79.58.1:8088/808gps/StandardApiAction_loginEx.action',
    type: 'POST',
    data: {
        account: 'your_account',
        password: password
    },
    cache: false,
    dataType: 'json',
    success: function(json) {
        if(json.result == 0) {
            // Save session for subsequent requests
            var jsession = json.jsession;
            console.log('Login successful');
        } else {
            console.log('Login failed: ' + json.result);
        }
    },
    error: function(xhr, status, error) {
        console.error('Request failed');
    }
});
```

### Get Vehicle Location Example
```javascript
// After login, use jsession for other requests
$.ajax({
    url: 'http://120.79.58.1:8088/808gps/StandardApiAction_getDeviceStatus.action',
    type: 'POST',
    data: {
        jsession: jsession,  // From login response
        devIdno: 'device001'
    },
    cache: false,
    dataType: 'json',
    success: function(json) {
        if(json.result == 0) {
            console.log('Device Status:', json.status);
            console.log('Location:', json.latitude, json.longitude);
            console.log('Speed:', json.speed);
        }
    }
});
```

### JSONP Cross-Domain Example
```javascript
$.ajax({
    url: 'http://120.79.58.1:8088/808gps/StandardApiAction_loginEx.action',
    type: 'POST',
    data: {
        account: 'your_account',
        password: password,
        callback: 'handleLogin'
    },
    cache: false,
    dataType: 'jsonp',
    jsonpCallback: 'handleLogin',
    success: function(data) {
        if(data.result == 0) {
            console.log('Login successful');
        }
    }
});
```

## Notes

1. **Session Management**: The `jsession` parameter is required for all API calls except login. It expires after a period of inactivity.

2. **Time Format**: All time parameters should be in format: `yyyy-MM-dd HH:mm:ss`

3. **Device Number**: The `devIdno` parameter refers to the unique device identifier, not the vehicle plate number.

4. **Encoding**: When passing Chinese or special characters, use `encodeURI()` for proper encoding.

5. **Pagination**: For APIs that return large datasets, use `pagination` and `pageRecords` parameters for pagination.

6. **Video Streaming**: Different protocols (HLS, RTSP, RTMP) are available for different client requirements:
   - HLS: Best for web browsers
   - RTSP: For professional video clients
   - RTMP: For Flash-based players

7. **Permissions**: Some APIs require specific user permissions. Contact administrator for permission issues.

8. **Rate Limiting**: Avoid excessive API calls. Implement proper caching and throttling in your application.

## Support

For technical support and additional documentation, contact the system administrator or refer to the web interface examples at:
- Web API Examples: `http://120.79.58.1:8088/808gps/open/webApi.html`
- Mobile API Examples: `http://120.79.58.1:8088/808gps/open/appApi.html`