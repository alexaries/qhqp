//
//  NSObject+GaodeManager.h
//  majiang
//
//  Created by mac on 2017/1/14.
//
//

#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import <MapKit/MapKit.h>
#import <AMapLocationKit/AMapLocationKit.h>
#import <AMapFoundationKit/AMapFoundationKit.h>
@interface GaodeManager : NSObject<MKMapViewDelegate,AMapLocationManagerDelegate>
@property (nonatomic,strong) AMapLocationManager *locationManager;
@property (nonatomic,strong) AMapLocatingCompletionBlock completionBlock;
@property (nonatomic,strong) NSString *MapInfoStr;
+(id)getInstance;
-(NSString*)getMapInfo;
@end
