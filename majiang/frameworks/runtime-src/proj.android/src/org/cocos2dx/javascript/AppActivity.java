/****************************************************************************
Copyright (c) 2008-2010 Ricardo Quesada
Copyright (c) 2010-2012 cocos2d-x.org
Copyright (c) 2011      Zynga Inc.
Copyright (c) 2013-2014 Chukong Technologies Inc.
 
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
package org.cocos2dx.javascript;
import android.app.AlertDialog;

import java.util.ArrayList;
import java.util.List;

import org.cocos2dx.*;
import org.cocos2dx.lib.Cocos2dxActivity;
import org.cocos2dx.lib.Cocos2dxGLSurfaceView;
import org.cocos2dx.lib.Cocos2dxJavascriptJavaBridge;

import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.content.pm.PackageManager.NameNotFoundException;
import android.os.Environment;
import android.os.Handler;
import android.os.Message;
import android.util.Log;
import android.widget.Toast;
import android.content.ClipboardManager; 
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;

import com.tencent.mm.sdk.openapi.IWXAPI;
import com.tencent.mm.sdk.openapi.WXAPIFactory;
import com.yaya.gson.Gson;
import com.yunva.im.sdk.lib.core.YunvaImSdk;
import com.yunva.im.sdk.lib.event.MessageEvent;
import com.yunva.im.sdk.lib.event.MessageEventListener;
import com.yunva.im.sdk.lib.event.MessageEventSource;
import com.yunva.im.sdk.lib.event.RespInfo;
import com.yunva.im.sdk.lib.event.msgtype.MessageType;
import com.yunva.im.sdk.lib.model.tool.ImAudioRecognizeResp;
import com.yunva.im.sdk.lib.model.tool.ImAudioRecordResp;
import com.yunva.im.sdk.lib.model.tool.ImUploadFileResp;
import com.floure.core.lib.CoreService;

import android.os.Bundle;
import android.os.PowerManager;  
import android.os.PowerManager.WakeLock;  
import android.os.Bundle;

import android.content.BroadcastReceiver;
import android.os.BatteryManager;
import android.location.LocationManager;
import android.net.ConnectivityManager;
import android.net.NetworkInfo;
import android.telephony.PhoneStateListener;
import android.telephony.SignalStrength;
import android.telephony.TelephonyManager;
import android.net.wifi.WifiInfo;  
import android.net.wifi.WifiManager;  


public class AppActivity extends Cocos2dxActivity implements  MessageEventListener{
	
	public static AppActivity g_this;
	public static final String APP_ID = "wxb37c53f05f4b70d4";
	public static IWXAPI wxApi;
	public static YunvaImSdk yunvaImSdk;
	public static final String path = Environment.getExternalStorageDirectory().toString() + "/yunva_sdk_lite";
	public static final String voice_path = path + "/voice";
	/**
     * 世界频道
     */
    public static final String channel_word_wildcard = "0x001";
    /**
     * 当前频道
     */
    public static final String channel_now_wildcard = "0x002";
    /**
     * 帮派频道
     */
    public static final String channel_gang_wildcard = "0x003";
    private List<String> channelList;
	public static String baidu_map = "";
	private MapLocation m_maplocation;
	//电池
	BatteryBroadcast bb;
	public static int curLevel;
	public static int curState;
	//信号监听
    TelephonyManager        Tel;  
    MyPhoneStateListener    MyListener; 
    public static int singnalLevel;
	//Wifi监听
    private static WifiInfo wifiInfo = null;
    private static WifiManager wifiManager = null; 
    public static int wifiLevel;
	
	//获取网络
	public static final int NETLEVEL_STRENGTH_NONE_OR_UNKNOWN = 0;
    public static final int NETLEVEL_STRENGTH_POOR = 1;
    public static final int NETLEVEL_STRENGTH_MODERATE = 2;
    public static final int NETLEVEL_STRENGTH_GOOD = 3;
    public static final int NETLEVEL_STRENGTH_GREAT = 4;
	
	PowerManager powerManager = null;  
	WakeLock wakeLock = null;
	
    @Override
    public Cocos2dxGLSurfaceView onCreateView() {
        Cocos2dxGLSurfaceView glSurfaceView = new Cocos2dxGLSurfaceView(this);
        // TestCpp should create stencil buffer
        glSurfaceView.setEGLConfigChooser(5, 6, 5, 0, 16, 8);

        g_this = this;

     // api init
        wxApi = WXAPIFactory.createWXAPI(this, APP_ID, true);
        wxApi.registerApp(APP_ID);
        
		Thread thread1 = new Thread(new Runnable() {
			@Override
			public void run() {
		
				String appVersion = "";
				PackageManager manager = g_this.getPackageManager();
				try {
					PackageInfo info = manager.getPackageInfo(g_this.getPackageName(), 0);
					appVersion = info.versionName;   //版本名
				 } catch (NameNotFoundException e) {
				 // TODO Auto-generated catch block
				 e.printStackTrace();
				}
				
				com.yunva.im.sdk.lib.YvLoginInit.context=g_this;
				String tt="{\"uid\":\""+"1000012"+"\",\"nickname\":\""+"yunwa"+"\"}";
				channelList = new ArrayList<String>();
				//添加世界频道
				channelList.add(channel_word_wildcard);
				//添加当前频道
				channelList.add(channel_now_wildcard);
				//添加帮派频道
				channelList.add(channel_gang_wildcard);
				YunvaImSdk.getInstance().Binding(tt, "1", channelList);
				//String path = DemoApplication.getVoiceFolder();
				// 第一步：初始化获得imsdk 实例  ,一定要先调用init()  
				YunvaImSdk.getInstance().init(g_this, "1000785", "", false,false);
				
				YunvaImSdk.getInstance().setAppVesion(appVersion);
						
				yunvaImSdk= YunvaImSdk.getInstance();
				
				yunvaImSdk.setRecordMaxDuration(60, false);
		
		    }
		});
		
		thread1.start();
		thread1.interrupt();
	
		//注册响应事件:重连
		MessageEventSource.getSingleton().addLinstener(MessageType.IM_RECONNECTION_NOTIFY, this);    
		
		MessageEventSource.getSingleton().addLinstener(MessageType.IM_RECORD_STOP_RESP, this);
		MessageEventSource.getSingleton().addLinstener(MessageType.IM_RECORD_FINISHPLAY_RESP, this);
		MessageEventSource.getSingleton().addLinstener(MessageType.IM_SPEECH_STOP_RESP, this);
		MessageEventSource.getSingleton().addLinstener(MessageType.IM_NET_STATE_NOTIFY, this);
		MessageEventSource.getSingleton().addLinstener(MessageType.IM_UPLOAD_FILE_RESP, this);
		
        m_maplocation = MapLocation.getInstance(this.getApplicationContext());
		
		//屏幕常亮
		powerManager = (PowerManager)this.getSystemService(this.POWER_SERVICE);  
		wakeLock = this.powerManager.newWakeLock(PowerManager.FULL_WAKE_LOCK, "My Lock"); 
		wakeLock.acquire();
		//IntentFilter filter = new IntentFilter(Intent.ACTION_BATTERY_CHANGED);
		//registerReceiver(DeviceInfo.getInstance(), filter); 
		
        return glSurfaceView;
    }
	protected void onCreate(Bundle savedInstanceState){
		super.onCreate(savedInstanceState);
		//setContentView(glSurfaceView);
		
		bb = new BatteryBroadcast();
		// 创建意图对象
		IntentFilter iFilter = new IntentFilter();
		// 添加电池改变的活动
		iFilter.addAction(Intent.ACTION_BATTERY_CHANGED);
		registerReceiver(bb, iFilter);
		
		//添加手机信号监听
		 MyListener = new MyPhoneStateListener();
        Tel = (TelephonyManager)getSystemService(Context.TELEPHONY_SERVICE);
        Tel.listen(MyListener, PhoneStateListener.LISTEN_SIGNAL_STRENGTHS);
        //添加wifi强度监听
        wifiManager = (WifiManager)getSystemService(WIFI_SERVICE);
	}
	protected void copyActivity(String str){
		 ClipboardManager cm = (ClipboardManager)getSystemService(Context.CLIPBOARD_SERVICE);
        // 将文本内容放到系统剪贴板里。
		 cm.setText(str);
         Toast.makeText(this, "复制成功，可以发给朋友们了。", Toast.LENGTH_LONG).show();
	}
	protected void onResume() {
        super.onResume();
        Tel.listen(MyListener, PhoneStateListener.LISTEN_SIGNAL_STRENGTHS);
    }
	protected void onPause() {
        super.onPause();
        Tel.listen(MyListener, PhoneStateListener.LISTEN_NONE);
    }
    protected void onDestory() {
    	super.onDestroy();
    	com.yunva.im.sdk.lib.YvLoginInit.release();
		//注销电池监听
		unregisterReceiver(bb);
    }
	/**
	 * 监听网络
	 */
    private class MyPhoneStateListener extends PhoneStateListener  
    {  
      @Override  
      public void onSignalStrengthsChanged(SignalStrength signalStrength)  
      {  
         
         int asu = signalStrength.getGsmSignalStrength();
		 Log.e("asu:", asu+"");
		 int dbm = -113 + 2 * asu;//-120~0 弱~强
		 Log.e("dbm:", dbm+"");
         if (dbm >= 0) singnalLevel = NETLEVEL_STRENGTH_NONE_OR_UNKNOWN;
         else if (dbm >= -30) singnalLevel = NETLEVEL_STRENGTH_GREAT;
         else if (dbm >= -60)  singnalLevel = NETLEVEL_STRENGTH_GOOD;
         else if (dbm >= -90)  singnalLevel = NETLEVEL_STRENGTH_MODERATE;
         else singnalLevel = NETLEVEL_STRENGTH_POOR;
		 
		 super.onSignalStrengthsChanged(signalStrength);  
      }  
    };
	/**
	 * 监控电池的广播
	 */
	public class BatteryBroadcast extends BroadcastReceiver {

		/**
		 * 当电池电量发生改变时会执行此方法
		 */
		@Override
		public void onReceive(Context context/* 触发广播的Activity */, Intent intent/* 触发广播的意图 */) {
			Bundle extras = intent.getExtras();//获取意图中所有的附加信息
			//获取当前电量，总电量
			int level = extras.getInt(BatteryManager.EXTRA_LEVEL/*当前电量*/, 0);
			int total = extras.getInt(BatteryManager.EXTRA_SCALE/*总电量*/, 100);
			
			
			
			//电池温度温度
			int temperature = extras.getInt(BatteryManager.EXTRA_TEMPERATURE/*电池温度*/);
			
			Log.d("温度", temperature+"");
			Log.e("电量", level+"");
			Log.wtf("电量", total+"");
		
		    curLevel = level;
			
			//电池状态
			int status = extras.getInt(BatteryManager.EXTRA_STATUS/*电池状态*/);
			switch (status) {
			case BatteryManager.BATTERY_STATUS_CHARGING://充电
			curState = 1;
				break;
			case BatteryManager.BATTERY_STATUS_DISCHARGING://放电
			curState = 2;
				break;
				
			case BatteryManager.BATTERY_STATUS_FULL://充满
			curState = 3;
				break;
			//BatteryManager.BATTERY_STATUS_NOT_CHARGING，未充电，包括放电和充满
			//BATTERY_STATUS_UNKNOWN：未知状态
			default:
				break;
			}
			
			//电池健康程度
			int health = extras.getInt(BatteryManager.EXTRA_HEALTH);
			switch (health) {
			case BatteryManager.BATTERY_HEALTH_GOOD://健康状态
				break;
			case BatteryManager.BATTERY_HEALTH_OVERHEAT://过热
				break;
			case BatteryManager.BATTERY_HEALTH_COLD://过冷
				break;
			case BatteryManager.BATTERY_HEALTH_OVER_VOLTAGE://电压过高
				break;
			default://其他三个放在default中。dead、unknown、unspecial failure
				break;
			}
		}
	}
	
	//获取信号强度
    public static int getSingnalLevel() {
         return singnalLevel;
    }
	
	//获取wifi强度
    public static int getWifiLevel() {
        wifiInfo = wifiManager.getConnectionInfo();
        int wifiStrength = wifiInfo.getRssi();
        if (wifiStrength <= 0 && wifiStrength >= -50) {  
            wifiLevel = NETLEVEL_STRENGTH_GREAT;
        } else if (wifiStrength < -50 && wifiStrength >= -70) {  
            wifiLevel = NETLEVEL_STRENGTH_GOOD; 
        } else if (wifiStrength < -70 && wifiStrength >= -80) {  
            wifiLevel = NETLEVEL_STRENGTH_MODERATE;
        } else if (wifiStrength < -80 && wifiStrength >= -100) {  
            wifiLevel = NETLEVEL_STRENGTH_POOR; 
        } else {  
            wifiLevel = NETLEVEL_STRENGTH_NONE_OR_UNKNOWN; 
        } 
        return wifiLevel;
    }
    
    @Override
	public void handleMessageEvent(MessageEvent event) {
		RespInfo  msg=event.getMessage();
		Message chatmsg=new Message();
		switch (event.getbCode()) {
		case MessageType.IM_RECORD_STOP_RESP:
			chatmsg.what=event.getbCode();
			chatmsg.obj=msg.getResultBody();
			chatmsg.arg1=msg.getResultCode();
			myHandler.sendMessage(chatmsg);
			break;
		case MessageType.IM_SPEECH_STOP_RESP:
			chatmsg.what=event.getbCode();
			chatmsg.obj=msg.getResultBody();
			chatmsg.arg1=msg.getResultCode();
			myHandler.sendMessage(chatmsg);
			break;
		case MessageType.IM_NET_STATE_NOTIFY:
			chatmsg.what=event.getbCode();
			chatmsg.obj=msg.getResultBody();
			chatmsg.arg1=msg.getResultCode();
			myHandler.sendMessage(chatmsg);
			break;
		case MessageType.IM_UPLOAD_FILE_RESP:
			chatmsg.what=event.getbCode();
			chatmsg.obj=msg.getResultBody();
			chatmsg.arg1=msg.getResultCode();
			myHandler.sendMessage(chatmsg);
			break;
		default:
			break;
		}
	}
	private int last_time;
	private	Handler myHandler=new  Handler(){
		public void handleMessage(Message msg) {
			getLooper();	int code=msg.arg1 ;
			switch (msg.what) {
			
			case MessageType.IM_RECORD_STOP_RESP:
				ImAudioRecordResp imAudioRecordResp = (ImAudioRecordResp) msg.obj;
				
				if(imAudioRecordResp.getExt().equals("lite")){

					last_time=imAudioRecordResp.getTime();//临时保存语音录制时间
					if(imAudioRecordResp.getTime() >= 1000){
						yunvaImSdk.uploadFile(imAudioRecordResp.getStrfilepath(),"");
					}else{
						//Toast.makeText(context, "你说话的时间太短了，请重新输入语音！", 1).show();
					}
				}
				break;
			case MessageType.IM_UPLOAD_FILE_RESP:
				
				ImUploadFileResp imUploadFileResp = (ImUploadFileResp) msg.obj;
				
				if(imUploadFileResp.getPercent() >= 100){
					final String strurl = imUploadFileResp.getFileUrl();
					AppActivity.g_this.runOnGLThread(new Runnable() {
			            @Override
			            public void run() {
							String rStr = "gameclass.mod_platform.upsoundok(\"" + strurl + "\")";
			                Cocos2dxJavascriptJavaBridge.evalString(rStr);
			            }
			        });	
				}
				break;
			}
		}
	};
	
	static
    {
    	System.loadLibrary("YvImSdk"); 
    }
}
