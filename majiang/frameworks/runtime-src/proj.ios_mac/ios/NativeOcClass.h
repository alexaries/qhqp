//
//  NativeOcClass.h
//  majiang
//
//  Created by meiyang on 2016/11/21.
//
//

#ifndef NativeOcClass_h
#define NativeOcClass_h

#include <string>
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
//#include <string>

@interface NativeOcClass :NSObject
+(BOOL)LoginWx;
+(BOOL)Buy;
+(BOOL)Invite:(NSString*)txt Roomid:(NSString*)roomId Title:(NSString*)title;
+(void)Share:(NSString*) pic;
+(void)Playurl:(NSString*) url;

+(BOOL)BegMic;
+(BOOL)EndMic;
+(BOOL)CancelMic;
+(BOOL)Pertocpp;
+(BOOL)OnIos;
+(NSString*)getMapInfo;

@end

#endif /* NativeOcClass_h */
