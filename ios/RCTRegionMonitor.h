//
//  RCTRegionMonitor.h
//  Walkabout
//
//  Created by Kyle Warren on 5/25/21.
//

#ifndef RCTRegionMonitor_h
#define RCTRegionMonitor_h


#endif /* RCTRegionMonitor_h */

#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>
#import <CoreLocation/CoreLocation.h>

@interface RCTRegionMonitor : RCTEventEmitter <RCTBridgeModule, CLLocationManagerDelegate>

@property (nonatomic, strong) CLLocationManager* locationManager;
@property (nonatomic, strong) NSMutableDictionary* pendingRegions;
@property (nonatomic, strong) NSMutableDictionary* unknownRegions;
@property (nonatomic, strong) NSMutableArray* pendingAuthorizations;
@property (nonatomic, assign) BOOL isRequestingAuthorization;
@property (nonatomic, assign) BOOL isQueueingEvents;
@property (nonatomic, strong) NSMutableArray* queuedRegionEvents;

@end
