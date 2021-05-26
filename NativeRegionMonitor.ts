import {NativeModules, NativeEventEmitter} from 'react-native';
const {RegionMonitor} = NativeModules;

const RegionMonitorEventEmitter = new NativeEventEmitter(RegionMonitor);

export interface LatLong {
  latitude: number;
  longitude: number;
}

export interface RegionChangeEvent {
  didEnter: boolean;
  didExit: boolean;
  region: {
    identifier: string;
  };
}

export interface ReactNativeRegionMonitorStatic {
  addCircularRegion(
    center: LatLong,
    radius: number,
    identifier: string,
  ): Promise<void>;
  removeCircularRegion(identifier: string): Promise<void>;
  clearRegions(): Promise<void>;
  onRegionChange(callback: (event: RegionChangeEvent) => unknown): () => void;
  requestAuthorization(): Promise<void>;
  checkRegion(identifier: string, coordinate: LatLong): Promise<boolean>;
  checkRegionsForCoordinate(coordinate: LatLong): Promise<Array<string>>;
  monitoredRegions(): Promise<Array<string>>;
}

export default {
  ...RegionMonitor,
  onRegionChange: callback => {
    const subscription = RegionMonitorEventEmitter.addListener(
      RegionMonitor.regionMonitorDidChangeRegion,
      callback,
    );

    return function off() {
      subscription.remove();
    };
  },
} as ReactNativeRegionMonitorStatic;
