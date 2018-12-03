/****************************************************************************
 Copyright (c) 2010-2011 cocos2d-x.org
 Copyright (c) 2010      Ricardo Quesada
 
 http://www.cocos2d-x.org
 
 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:
 
 The above copyright notice and this permission notice shall be included in
 all copies or substantial portions of the Software.
 
 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 THE SOFTWARE.
 ****************************************************************************/

#import "RootViewController.h"
#import "cocos2d.h"
#import "platform/ios/CCEAGLView-ios.h"
#import "WXApiManager.h"
#import "scripting/js-bindings/manual/ScriptingCore.h"

@interface RootViewController ()<WXApiManagerDelegate,UITextViewDelegate>

@end

@implementation RootViewController

/*
 // The designated initializer.  Override if you create the controller programmatically and want to perform customization that is not appropriate for viewDidLoad.
- (id)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil {
    if ((self = [super initWithNibName:nibNameOrNil bundle:nibBundleOrNil])) {
        // Custom initialization
    }
    return self;
}
*/

/*
// Implement loadView to create a view hierarchy programmatically, without using a nib.
- (void)loadView {
}
*/

/*
// Implement viewDidLoad to do additional setup after loading the view, typically from a nib.
- (void)viewDidLoad {
    [super viewDidLoad];
}
 
*/
// Override to allow orientations other than the default portrait orientation.
// This method is deprecated on ios6
- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation {
    return UIInterfaceOrientationIsLandscape( interfaceOrientation );
}

// For ios6, use supportedInterfaceOrientations & shouldAutorotate instead
- (NSUInteger) supportedInterfaceOrientations{
#ifdef __IPHONE_6_0
    return UIInterfaceOrientationMaskAllButUpsideDown;
#endif
}

- (BOOL) shouldAutorotate {
    return YES;
}

- (void)didRotateFromInterfaceOrientation:(UIInterfaceOrientation)fromInterfaceOrientation {
    [super didRotateFromInterfaceOrientation:fromInterfaceOrientation];

    cocos2d::GLView *glview = cocos2d::Director::getInstance()->getOpenGLView();
    if (glview)
    {
        cocos2d::CCEGLView *eaglview = (cocos2d::CCEGLView*) glview->getEAGLView();
        
        if (eaglview)
        {
            CGSize s = CGSizeMake([eaglview getWidth], [eaglview getHeight]);
            cocos2d::Application::getInstance()->applicationScreenSizeChanged((int) s.width, (int) s.height);
        }
    }
}

//fix not hide status on ios7
- (BOOL)prefersStatusBarHidden
{
    return YES;
}

- (void)didReceiveMemoryWarning {
    // Releases the view if it doesn't have a superview.
    [super didReceiveMemoryWarning];
    
    // Release any cached data, images, etc that aren't in use.
}

- (void)viewDidUnload {
    [super viewDidUnload];
    // Release any retained subviews of the main view.
    // e.g. self.myOutlet = nil;
}

- (void)viewWillAppear:(BOOL)animated {
    [super viewWillAppear:animated];
    [WXApiManager sharedManager].delegate = self;
    
}


- (void)dealloc {
    [super dealloc];
}

#pragma mark - WXApiManagerDelegate
- (void)managerDidRecvGetMessageReq:(GetMessageFromWXReq *)req {
    // 微信请求App提供内容， 需要app提供内容后使用sendRsp返回
    
}

- (void)managerDidRecvShowMessageReq:(ShowMessageFromWXReq *)req {
    //    WXMediaMessage *msg = req.message;
    //显示微信传过来的内容
    if (req.message.mediaObject != nil)
    {
        WXAppExtendObject* obj = [req.message.mediaObject isKindOfClass:[WXAppExtendObject class]] ? (WXAppExtendObject*)req.message.mediaObject : nil;
        if (obj != nil && obj.extInfo != nil)
        {
            std::string *str = new std::string([obj.extInfo UTF8String]);
            *str = "g_func_joinRoom(\"" + *str + "\")";
            ScriptingCore* engine = (ScriptingCore*)cocos2d::ScriptEngineManager::getInstance()->getScriptEngine();
            engine->evalString((*str).c_str());
        }
    }
}

- (void)managerDidRecvLaunchFromWXReq:(LaunchFromWXReq *)req {
    //    WXMediaMessage *msg = req.message;
    
    //从微信启动App
}

- (void)managerDidRecvMessageResponse:(SendMessageToWXResp *)response {
    
}

- (void)managerDidRecvAddCardResponse:(AddCardToWXCardPackageResp *)response {
    
}

- (void)managerDidRecvAuthResponse:(SendAuthResp *)response {
    //    NSString *strTitle = [NSString stringWithFormat:@"Auth结果"];
    //    NSString *strMsg = [NSString stringWithFormat:@"code:%@,state:%@,errcode:%d", response.code, response.state, response.errCode];
    //
    //    UIAlertView *alert = [[UIAlertView alloc] initWithTitle:strTitle
    //                                                    message:strMsg
    //                                                   delegate:self
    //                                          cancelButtonTitle:@"OK"
    //                                          otherButtonTitles:nil, nil];
    //    [alert show];
    //    [alert release];
    // 设置账户信息
    if (nil == response.code)
        return;
    /*ThirdPartyAccount::GetInstance()->SetAccountInfo("Code", [response.code UTF8String]);
    // 隐藏按钮，进入正式登录流程
    UIManager::GetInstance()->RealLogin();*/
    std::string str = [response.code UTF8String];
    str = "gameclass.mod_platform.onlogin(\"" + str + "\")";
    ScriptingCore* engine = (ScriptingCore*)cocos2d::ScriptEngineManager::getInstance()->getScriptEngine();
    engine->evalString(str.c_str());
}


@end
