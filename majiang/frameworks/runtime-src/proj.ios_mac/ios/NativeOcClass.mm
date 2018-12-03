//
//  NativeOcClass.m
//  majiang
//
//  Created by meiyang on 2016/11/21.
//
//
#include "NativeOcClass.h"
#import <Foundation/Foundation.h>
#import <UIKit/UIKit.h>
#import "../WeSdk/WXApi.h"
#import "AppController.h"
#import "WXApiManager.h"
#include "../IOSPay.h"
#include "YVTool.h"
#include "cocos2d.h"
#import "scripting/js-bindings/manual/ScriptingCore.h"
#import "GaodeManager.h"

@implementation NativeOcClass

+(BOOL)LoginWx {
    if([WXApi isWXAppInstalled]){
        // 检测openid
        SendAuthReq* req = [[[SendAuthReq alloc] init] autorelease];
        req.scope = @"snsapi_message,snsapi_userinfo,snsapi_friend,snsapi_contact";
        req.state = @"what state";
        
        
        [WXApi sendAuthReq:req viewController:0 delegate:[WXApiManager sharedManager]];

    }else{
       
        std::string str = "gameclass.mod_platform.guestlogin(\"\")";
        ScriptingCore* engine = (ScriptingCore*)cocos2d::ScriptEngineManager::getInstance()->getScriptEngine();
        engine->evalString(str.c_str());
    }

    return true;
}


+(BOOL)Buy{
    IOSPay::Pay();
    return true;
}


+(BOOL)Invite:(NSString*)txt Roomid:(NSString*)roomId Title:(NSString*)title{
    WXMediaMessage* msg = [WXMediaMessage message];
    
    msg.title = title;
    msg.description = txt;
    [msg setThumbImage:[UIImage imageNamed:@"res/icon.png"]];
    msg.mediaTagName = nil;
    
    
    Byte* pBuffer = (Byte *)malloc(1024);
    memset(pBuffer, 0, 1024);
    NSData* data = [NSData dataWithBytes:pBuffer length:1024];
    free(pBuffer);
    WXAppExtendObject *ext = [WXAppExtendObject object];
    ext.extInfo = roomId;
    ext.url = @"www.baidu.com";
    ext.fileData = data;
    msg.mediaObject = ext;
    
    SendMessageToWXReq* req = SendMessageToWXReq.alloc.init;
    req.message = msg;
    req.bText = false;
    req.scene = WXSceneSession;
    [WXApi sendReq:req];
    return true;
}

+(void)Share:(NSString*) pic
{
    WXMediaMessage* msg = [WXMediaMessage message];
    msg.title = @"悠悠扑克";
    //msg.description = @"这是我的总成绩哦!";
    //msg.mediaTagName = nil;
    
    WXImageObject* img = [WXImageObject object];
    
    UIImage* image = [UIImage imageNamed:pic];
    NSData* imageData = UIImageJPEGRepresentation(image, 0.3);
    
    UIImage* sourceImage = [UIImage imageWithData:imageData];
    CGSize imageSize = sourceImage.size;
    CGFloat width = imageSize.width;
    CGFloat height = imageSize.height;
    CGFloat targetWidth = 480;
    CGFloat targetHeight = (targetWidth / width) * height;
    UIGraphicsBeginImageContext(CGSizeMake(targetWidth, targetHeight));
    [sourceImage drawInRect:CGRectMake(0,0,targetWidth, targetHeight)];
    UIImage* newImage = UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    
    img.imageData = imageData;
    msg.mediaObject = img;
    [msg setThumbImage:newImage];
    
    
    SendMessageToWXReq* req = SendMessageToWXReq.alloc.init;
    req.message = msg;
    req.bText = false;
    req.scene = WXSceneSession;
    [WXApi sendReq:req];
}

+(void)Playurl:(NSString*) url{
    
    std::string str = [url UTF8String];
    YVSDK::YVTool::getInstance()->playFromUrl(str);
}

+(BOOL)BegMic{
    YVSDK::YVTool::getInstance()->startRecord(cocos2d::FileUtils::getInstance()->getWritablePath() + "hehe.amr");
    return true;
}

+(BOOL)EndMic{
    YVSDK::YVTool::getInstance()->stopRecord();
    
    /*std::string str = [response.code UTF8String];
    str = "gameclass.mod_platform.onlogin(\"" + str + "\")";
    ScriptingCore* engine = (ScriptingCore*)cocos2d::ScriptEngineManager::getInstance()->getScriptEngine();
    engine->evalString(str.c_str());*/
    return true;
}

+(BOOL)CancelMic{
    YVSDK::YVTool::getInstance()->stopRecord();
    return true;
}

+(BOOL)Pertocpp{
    YVSDK::YVTool::getInstance()->dispatchMsg(1);
    return true;
}

+(BOOL)OnIos{
    if([WXApi isWXAppInstalled]){
        std::string str = "game.uimgr.showui(\"gameclass.loginui\");";
        ScriptingCore* engine = (ScriptingCore*)cocos2d::ScriptEngineManager::getInstance()->getScriptEngine();
        engine->evalString(str.c_str());
    }else{
        std::string str = "game.uimgr.showui(\"gameclass.loginui\");";
        str += "game.uimgr.uis[\"gameclass.loginui\"].showGuest();";
        ScriptingCore* engine = (ScriptingCore*)cocos2d::ScriptEngineManager::getInstance()->getScriptEngine();
        engine->evalString(str.c_str());
    }
    return true;
}

+(BOOL)StartMap{
    //启动高德地图类
    [GaodeManager getInstance];
    return true;
}

+(NSString*)getMapInfo{
    return [[GaodeManager getInstance] getMapInfo];
}

@end
