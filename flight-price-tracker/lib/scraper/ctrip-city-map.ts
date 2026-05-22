export interface CtripCityInfo {
  ctripCode: string
  cityName: string
}

const CTRIP_CITY_MAP: Record<string, CtripCityInfo> = {
  PEK: { ctripCode: 'BJS', cityName: '北京' },
  SHA: { ctripCode: 'SHA', cityName: '上海' },
  CAN: { ctripCode: 'CAN', cityName: '广州' },
  CTU: { ctripCode: 'CTU', cityName: '成都' },
  SZX: { ctripCode: 'SZX', cityName: '深圳' },
  HGH: { ctripCode: 'HGH', cityName: '杭州' },
  CKG: { ctripCode: 'CKG', cityName: '重庆' },
  WUH: { ctripCode: 'WUH', cityName: '武汉' },
  XIY: { ctripCode: 'SIA', cityName: '西安' },
  KMG: { ctripCode: 'KMG', cityName: '昆明' },
  NKG: { ctripCode: 'NKG', cityName: '南京' },
  CSX: { ctripCode: 'CSX', cityName: '长沙' },
  TSN: { ctripCode: 'TSN', cityName: '天津' },
  FOC: { ctripCode: 'FOC', cityName: '福州' },
  XMN: { ctripCode: 'XMN', cityName: '厦门' },
  DLC: { ctripCode: 'DLC', cityName: '大连' },
  HRB: { ctripCode: 'HRB', cityName: '哈尔滨' },
  SYX: { ctripCode: 'SYX', cityName: '三亚' },
  KWL: { ctripCode: 'KWL', cityName: '桂林' },
  URC: { ctripCode: 'URC', cityName: '乌鲁木齐' },
  TAO: { ctripCode: 'TAO', cityName: '青岛' },
  TNA: { ctripCode: 'TNA', cityName: '济南' },
  SHE: { ctripCode: 'SHE', cityName: '沈阳' },
  HAK: { ctripCode: 'HAK', cityName: '海口' },
  NNG: { ctripCode: 'NNG', cityName: '南宁' },
  CGO: { ctripCode: 'CGO', cityName: '郑州' },
  TYN: { ctripCode: 'TYN', cityName: '太原' },
  HET: { ctripCode: 'HET', cityName: '呼和浩特' },
  LHW: { ctripCode: 'LHW', cityName: '兰州' },
  XNN: { ctripCode: 'XNN', cityName: '西宁' },
  INC: { ctripCode: 'INC', cityName: '银川' },
  NGB: { ctripCode: 'NGB', cityName: '宁波' },
  WNZ: { ctripCode: 'WNZ', cityName: '温州' },
  ZUH: { ctripCode: 'ZUH', cityName: '珠海' },
  SWA: { ctripCode: 'SWA', cityName: '揭阳' },
  WUX: { ctripCode: 'WUX', cityName: '无锡' },
}

export function toCtripCity(iataCode: string): CtripCityInfo | null {
  return CTRIP_CITY_MAP[iataCode] ?? null
}
