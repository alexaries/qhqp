//
//  NSObject+GaodeManager.m
//  majiang
//
//  Created by mac on 2017/1/14.
//
//

#import "GaodeManager.h"
@implementation GaodeManager
static GaodeManager *g_gaodeManager = nil;
+(id)getInstance{

    if(g_gaodeManager == nil){
        g_gaodeManager = [[GaodeManager alloc] init];
    
    }
    
    return g_gaodeManager;
}
-(NSString*)getMapInfo{

    return self.MapInfoStr;
}
-(id)init{
    
    if(self = [super init]){
        [AMapServices sharedServices].apiKey = @"f4cfd3151e8077732e8c0a01cd77fe24";
        [self configLocationManager];
        [self getLocation];
        //self.MapInfoStr = nil;
    }
    return self;
}

-(void)configLocationManager{

    self.locationManager =  [[AMapLocationManager alloc] init];
    //设置代理
    [self.locationManager setDelegate:self];
    //设置期望精度
    [self.locationManager setDesiredAccuracy:kCLLocationAccuracyHundredMeters];
    //设置不允许系统暂停
    [self.locationManager setPausesLocationUpdatesAutomatically:NO];
    //设置允许后台
    [self.locationManager setAllowsBackgroundLocationUpdates:NO];
    
    [self.locationManager setLocationTimeout:6];
    [self.locationManager setReGeocodeTimeout:6];

}

-(void)stopUpLocation{

    [self.locationManager stopUpdatingLocation];
    [self.locationManager setDelegate:nil];
    
}
-(void)getLocation{

    [self.locationManager requestLocationWithReGeocode:YES completionBlock:^(CLLocation *location, AMapLocationReGeocode *regeocode, NSError *error) {
        
        if(error){
            NSLog(@"locError:{%ld - %@};",(long)error.code , error.localizedDescription);
            return;
        }
        if(location){
            NSMutableDictionary* dic = [NSMutableDictionary dictionary];
            NSString *latitude = [NSString stringWithFormat:@"%f",location.coordinate.latitude];
            NSString *longitude = [NSString stringWithFormat:@"%f",location.coordinate.longitude];            
            [dic setObject:latitude forKey:@"latitude"];
            [dic setObject:longitude forKey:@"longitude"];
            if(regeocode){
                //[dic setObject:regeocode.formattedAddress forKey:@"formattedAddress"];
                if(regeocode.country) {
                    [dic setObject:regeocode.country forKey:@"country"];
                }
                if(regeocode.province) {
                    [dic setObject:regeocode.province forKey:@"province"];
                }
                if(regeocode.city) {
                    [dic setObject:regeocode.city forKey:@"city"];
                }
                if(regeocode.district) {
                    [dic setObject:regeocode.district forKey:@"district"];
                }
                if(regeocode.citycode) {
                    [dic setObject:regeocode.citycode forKey:@"citycode"];
                }
                if(regeocode.adcode) {
                    [dic setObject:regeocode.adcode forKey:@"adcode"];
                }
                if(regeocode.formattedAddress) {
                    [dic setObject:regeocode.formattedAddress forKey:@"address"];
                }
            }
            NSData * jsonData = [NSJSONSerialization dataWithJSONObject:dic options:NSJSONWritingPrettyPrinted error:nil];
            self.MapInfoStr = [[NSString alloc] initWithData:jsonData encoding:NSUTF8StringEncoding];
        }
    }];
}

-(void)amapLocationManager:(AMapLocationManager *)manager didFailWithError:(NSError *)error{

}
-(void)amapLocationManager:(AMapLocationManager *)manager didUpdateLocation:(CLLocation *)location reGeocode:(AMapLocationReGeocode *)reGeocode
{
}


@end
