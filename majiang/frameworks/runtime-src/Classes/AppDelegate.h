//
//  GCTestAppDelegate.h
//  GCTest
//
//  Created by Rohan Kuruvilla on 06/08/2012.
//  Copyright __MyCompanyName__ 2012. All rights reserved.
//

#ifndef  _APP_DELEGATE_H_
#define  _APP_DELEGATE_H_

#include "platform/CCApplication.h"

#if CC_TARGET_PLATFORM == CC_PLATFORM_IOS
#include "yvListern.h"
#endif 
/**
 @brief    The cocos2d Application.
 
 Private inheritance here hides part of interface from Director.
 */
class  AppDelegate : private cocos2d::Application
#if CC_TARGET_PLATFORM == CC_PLATFORM_IOS
, public YVSDK::YVListern::YVStopRecordListern
, public YVSDK::YVListern::YVRecordVoiceListern
, public YVSDK::YVListern::YVUpLoadFileListern
, public YVSDK::YVListern::YVFinishPlayListern
#endif
{
public:
    AppDelegate();
    virtual ~AppDelegate();
    
    void initGLContextAttrs() override;
    
    /**
     @brief    Implement Director and Scene init code here.
     @return true    Initialize success, app continue.
     @return false   Initialize failed, app terminate.
     */
    virtual bool applicationDidFinishLaunching();
    
    /**
     @brief  Called when the application moves to the background
     @param  the pointer of the application
     */
    virtual void applicationDidEnterBackground();
    
    /**
     @brief  Called when the application reenters the foreground
     @param  the pointer of the application
     */
    virtual void applicationWillEnterForeground();
 
#if CC_TARGET_PLATFORM == CC_PLATFORM_IOS
    // 语音接口
    virtual void onStopRecordListern(YVSDK::RecordStopNotify*);
    virtual void onRecordVoiceListern(YVSDK::RecordVoiceNotify*);
    virtual void onUpLoadFileListern(YVSDK::UpLoadFileRespond*);
    virtual void onFinishPlayListern(YVSDK::StartPlayVoiceRespond*);
#endif

};

#endif // _APP_DELEGATE_H_

